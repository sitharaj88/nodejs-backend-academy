---
title: Environment, Config, Docker, and Containers
slug: learning/devops/environment-config-docker-containers
description: Learn environment separation, configuration discipline, Docker basics, and why containerization changes backend delivery workflow.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Intermediate" duration="28 min" track="DevOps" prerequisites="Node.js, shell basics, what a process is" />

Most "works on my machine" bugs are not code bugs. They are **configuration** bugs — a missing env var, a different Node version, a host path that does not exist, a timezone the CI runner silently set. This page teaches you to package a Node.js service so one image runs everywhere, and to inject config at the edge instead of baking it into the artifact.

<Objectives>
- Apply the 12-factor config rule: config in environment, never in code
- Write a multi-stage Dockerfile that produces a small, non-root, reproducible image
- Pin Node versions, dependency versions, and base images by digest
- Wire a local stack with docker-compose — app, Postgres, Redis, healthchecks
- Inject secrets without leaking them into layers, logs, or process listings
</Objectives>

## Mental model: artifact once, config at the edge

<Diagram caption="One build produces one image. Config is injected at run time for every environment.">
  <svg viewBox="0 0 640 220" role="img" aria-label="One artifact, many environments">
    <defs>
      <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="30" y="80" width="160" height="60" rx="6" fill="#dff5e5" stroke="#2f8f46" stroke-width="1.5" />
      <text x="110" y="105" text-anchor="middle" font-weight="800">git commit</text>
      <text x="110" y="125" text-anchor="middle" font-size="11" fill="#596579">source of truth</text>

      <rect x="240" y="80" width="160" height="60" rx="6" fill="#e9f4fb" stroke="#087ea4" stroke-width="1.5" />
      <text x="320" y="105" text-anchor="middle" font-weight="800">one image</text>
      <text x="320" y="125" text-anchor="middle" font-size="11" fill="#596579">api:abc123 (sha-pinned)</text>

      <rect x="460" y="20" width="150" height="50" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="535" y="42" text-anchor="middle" font-weight="700">dev</text>
      <text x="535" y="58" text-anchor="middle" font-size="11" fill="#596579">NODE_ENV=dev</text>

      <rect x="460" y="90" width="150" height="50" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="535" y="112" text-anchor="middle" font-weight="700">staging</text>
      <text x="535" y="128" text-anchor="middle" font-size="11" fill="#596579">real secrets, fake data</text>

      <rect x="460" y="160" width="150" height="50" rx="6" fill="#fde4e1" stroke="#b42318" />
      <text x="535" y="182" text-anchor="middle" font-weight="700">production</text>
      <text x="535" y="198" text-anchor="middle" font-size="11" fill="#596579">real secrets, real data</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#arr)">
        <path d="M190 110 L240 110" />
        <path d="M400 100 Q 430 70 460 45" />
        <path d="M400 110 L460 115" />
        <path d="M400 120 Q 430 150 460 185" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Build once, run many">
The image is immutable. The environment is not. If you change anything in the image to differ between staging and production — a config file baked into a layer, a secret copied during build — you have thrown away the whole point of containers.
</KeyConcept>

## Configuration: twelve-factor, minus the dogma

The useful parts of the [twelve-factor app](https://12factor.net/) for Node services are three rules:

1. **Config lives in the environment.** Never in committed files. `.env.example` documents the shape; `.env` is local and gitignored.
2. **No default secrets.** Fail to start if a required secret is missing. Silent fallbacks ship prod traffic to your laptop.
3. **Config is flat and typed.** Parse it once at boot, expose a frozen object. Nothing else reads `process.env` at runtime.

```ts
// src/config.ts
import { z } from 'zod'

const Schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const parsed = Schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid configuration:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = Object.freeze(parsed.data)
```

<Compare badLabel="Config scattered across code" goodLabel="Single boot-time parse">
<Fragment slot="bad">
```ts
// 14 files, each reading process.env directly
const port = Number(process.env.PORT) || 3000
const url = process.env.DATABASE_URL
if (!url) console.warn('no DB url, using localhost')
const pool = new Pool({ connectionString: url ?? 'postgres://localhost/app' })
```
Silent fallbacks, type coercion in random places, impossible to audit.
</Fragment>
<Fragment slot="good">
```ts
import { config } from './config'
const pool = new Pool({ connectionString: config.DATABASE_URL })
```
One parse, one source of truth, fails loudly at boot with a specific error.
</Fragment>
</Compare>

## The Dockerfile

A production Node.js image should be **small, layered, non-root, and reproducible**. Here is a multi-stage Dockerfile that hits all four.

```dockerfile
# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
FROM node:22.11.0-bookworm-slim@sha256:xxxxxxxx AS build
WORKDIR /app

# Copy manifests first so dependency install is cached across code changes
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---------- runtime stage ----------
FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:yyyyyyyy
WORKDIR /app

# Distroless ships no shell, no package manager, no user-writable fs.
# The nonroot image runs as uid 65532 by default.
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps"

COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/dist ./dist
COPY --from=build --chown=nonroot:nonroot /app/package.json ./package.json

EXPOSE 3000
USER nonroot
CMD ["dist/server.js"]
```

A `.dockerignore` is not optional — without it, you ship your `.git` folder, `node_modules`, and local `.env`:

```
node_modules
dist
.git
.env
.env.*
!.env.example
coverage
*.log
.DS_Store
```

<Callout type="tip" title="Pin base images by digest, not tag">
`node:22-slim` moves. `node:22.11.0-bookworm-slim@sha256:...` does not. Pinning by digest makes your build reproducible even when Docker Hub re-tags. Use `docker buildx imagetools inspect` or Dependabot to bump digests deliberately.
</Callout>

### Why multi-stage

<Compare badLabel="Single stage" goodLabel="Multi-stage">
<Fragment slot="bad">
```dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/server.js"]
```
Ships the full Debian base, dev dependencies, tsconfig, tests, `.git` if you forgot `.dockerignore`. Image ~1.2 GB, runs as root.
</Fragment>
<Fragment slot="good">
```dockerfile
FROM node:22-slim AS build
# ... install, build, prune

FROM gcr.io/distroless/nodejs22-debian12:nonroot
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER nonroot
CMD ["dist/server.js"]
```
~150 MB, no shell for an attacker to land in, runs as uid 65532.
</Fragment>
</Compare>

### Healthchecks belong in the orchestrator, not the Dockerfile

Kubernetes, ECS, and Fly ignore `HEALTHCHECK` in the Dockerfile. Expose real endpoints and let the platform probe them:

```ts
// src/health.ts
app.get('/livez', (_req, res) => res.status(200).send('ok'))

app.get('/readyz', async (_req, res) => {
  try {
    await pool.query('select 1')
    await redis.ping()
    res.status(200).send('ready')
  } catch {
    res.status(503).send('not ready')
  }
})
```

- **liveness** — "is the process alive?" Never check dependencies here. If liveness fails, the platform kills the pod. A flaky DB should not trigger restarts.
- **readiness** — "is the process ready to serve traffic?" Check dependencies here. If readiness fails, the platform removes the pod from the load balancer, then adds it back when it recovers.

## Local stack with docker-compose

```yaml
# docker-compose.yml
name: node-api-stack

services:
  api:
    build:
      context: .
      target: build  # dev uses the build stage so we get hot-reload tools
    command: npm run dev
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgres://app:app@postgres:5432/app
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-do-not-use-in-prod-32chars
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16.4-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 3s
      timeout: 3s
      retries: 10

  redis:
    image: redis:7.4-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 3s
      timeout: 3s
      retries: 10

volumes:
  pgdata:
```

Run it:

```bash
docker compose up --build
docker compose exec api npm run migrate
docker compose logs -f api
```

<Callout type="info" title="Compose profiles for optional services">
Use `profiles: ["tracing"]` on a Jaeger or OTEL collector service so `docker compose up` stays fast for the 90% of work that does not need it. Developers who want traces run `docker compose --profile tracing up`.
</Callout>

## Secrets

Rule one: secrets never appear in `docker build`. A secret copied into a layer is **public forever**, even if you delete it in the next layer — it is still in the image history.

<Compare badLabel="Baking secrets" goodLabel="Injecting secrets">
<Fragment slot="bad">
```dockerfile
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY .env /app/.env
```
Any colleague who pulls this image gets your production DB credentials.
</Fragment>
<Fragment slot="good">
```dockerfile
# Build-time secrets via BuildKit (never persisted in the image)
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN="$(cat /run/secrets/npm_token)" npm ci
```
```bash
docker buildx build --secret id=npm_token,env=NPM_TOKEN -t api:dev .
```
And at runtime, inject via Kubernetes Secret, AWS Secrets Manager, Doppler, or similar. The image never sees production values.
</Fragment>
</Compare>

## Pitfalls

<Pitfall title="Running as root inside the container">
The default `node` image runs as uid 0. A container breakout or RCE bug then runs as root on the host mount. **Fix:** use distroless `:nonroot`, or `USER node` on the official image, or `USER 10001` with a matching group — but pick one and never override it in your entrypoint.
</Pitfall>

<Pitfall title="Copying `node_modules` from the host">
`COPY . .` in a single-stage build includes your host `node_modules`, which were installed for your OS and CPU. The image starts, then fails on a native module mismatch at runtime. **Fix:** `.dockerignore node_modules` and install fresh inside the image.
</Pitfall>

<Pitfall title="Different Node between CI, local, and prod">
Your laptop runs Node 22, CI runs Node 20, the production image runs 18. A syntax feature works locally and CI, crashes in prod. **Fix:** pin in one place — an `.nvmrc` / `package.json` `engines` field read by both the Dockerfile's `FROM` and CI's `actions/setup-node`.
</Pitfall>

## Lab

<Lab title="Containerize a Node service end to end" duration="75 min" difficulty="Medium" stack="Node.js 22, Docker, docker-compose, Postgres, Redis">

### Goal
Take a plain Node.js Express service (with Postgres + Redis) and ship a reproducible, non-root, multi-stage image that boots from `docker compose up` with zero manual steps.

### Steps
1. Introduce `src/config.ts` with `zod` validation. Make the process exit 1 on any missing/invalid env var.
2. Write a `.dockerignore` that excludes `node_modules`, `.git`, `.env`, `dist`, and logs.
3. Author a multi-stage `Dockerfile`: build stage on `node:22-slim`, runtime on a distroless nonroot image.
4. Expose `/livez` (no deps) and `/readyz` (pings Postgres + Redis).
5. Write `docker-compose.yml` with app, Postgres, Redis, and proper `healthcheck` + `depends_on: condition: service_healthy`.
6. Verify: run `docker build`, check the image size with `docker images`, check the user with `docker run --rm IMG id`.
7. Kill Postgres (`docker compose stop postgres`) and confirm `/readyz` returns 503 while `/livez` stays 200.

### Success criteria
- Final runtime image is under 200 MB and `id` reports a non-root uid
- `docker compose up` brings the stack from cold to healthy in under 30 seconds
- Removing any required env var (`JWT_SECRET`, `DATABASE_URL`) makes the app exit 1 at startup with a specific, helpful error
- Stopping Postgres flips `/readyz` to 503 within the readiness probe interval; liveness stays 200
- `git grep -E '(process\\.env|getenv)'` returns exactly one file: `src/config.ts`

</Lab>

## Checkpoint

<Checkpoint>
1. Why should `/livez` *not* check the database, while `/readyz` should?
2. You set `ENV DATABASE_URL=...` in the Dockerfile to "help local dev." Name two things that goes wrong in production.
3. What is the difference between `npm ci` and `npm install`, and which belongs in a Dockerfile?
4. Your image size is 1.4 GB. Give three changes that together take it below 200 MB.
5. Why does "pin by digest" matter if you already pin by version (`node:22.11.0`)?
</Checkpoint>

## Further reading

- [CI, CD, Release Flow, and Deployment](/learning/devops/ci-cd-release-flow-and-deployment/) — how this image gets promoted to production
- [Observability, Runtime Operations, and Runbooks](/learning/devops/observability-runtime-operations-and-runbooks/) — what to watch once it is running
- [Modern DevOps Coverage](/learning/devops/modern-devops-coverage/) — the rest of the ecosystem
