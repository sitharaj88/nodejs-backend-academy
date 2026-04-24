---
title: Tools and Technologies
description: The complete tooling map for the academy — languages, runtimes, frameworks, data stores, security tools, testing stack, DevOps platforms, observability, and workstation setup.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Reference" track="Program" />

Every tool on this page maps to at least one lesson, one lab, and one capstone use. Treat it as a checklist — if something feels unfamiliar, that's your next reading.

## Languages and runtime

- **JavaScript** — modern ES2022+ features, async/await, modules, iterators
- **TypeScript** — strict mode, generics, narrowing, runtime validation with Zod
- **Node.js 20+** — event loop, streams, `node:`-prefixed built-ins, native fetch
- **npm / pnpm / bun** — package management, workspaces, scripts
- **Bash / shell basics** — scripting that ships with the repo, not just `run.sh`

## API and framework layer

- **Express 4/5** — the default; understood deeply
- **Fastify** — when throughput matters or schema-first is preferred
- **Hono** — edge / serverless runtimes
- **Zod / Valibot** — runtime validation + OpenAPI generation
- **OpenAPI 3.1 + Redoc / Scalar** — documented contracts
- **GraphQL (Apollo, Yoga, Pothos)** — for graph-shaped APIs
- **gRPC (`@grpc/grpc-js`, Connect)** — for service-to-service calls
- **tRPC** — when client and server share TypeScript
- **Socket.IO / native `ws`** — WebSocket transport
- **Server-Sent Events** — simpler push where bidirectional isn't needed

## Data stores

- **PostgreSQL** — primary relational store
- **MongoDB** — document modeling, nested data
- **SQLite** — local / test / small services
- **Redis** — cache, rate limiting, queues, pub/sub
- **pgbouncer** — connection pooling for Postgres
- **ClickHouse / Timescale** — when analytics workload appears

### Data-access libraries

- **Prisma** — typed ORM with migrations
- **Drizzle** — lightweight, TypeScript-native
- **Kysely** — typesafe query builder
- **Mongoose** — MongoDB ODM
- **Knex** — legacy-friendly query builder
- **node-postgres (`pg`)** — low-level when you need it

## Auth and security

- **argon2id** (via `@node-rs/argon2` or `argon2`) — password hashing
- **`jose`** — JWT sign/verify with a modern, auditable API
- **Passport** or **better-auth** — full auth stacks
- **OAuth 2.1 + PKCE + OIDC** — identity protocols
- **Helmet** — secure default headers
- **express-rate-limit / rate-limit-redis** — rate limiting
- **CSRF tokens / SameSite cookies** — browser-side protection
- **OWASP ZAP / Nuclei** — external security scanning

## Testing

- **Vitest** — default test runner
- **node:test** — zero-dep for libraries
- **Supertest** — HTTP-level testing
- **Testcontainers** — real DB/queue/cache in tests
- **MSW** — outbound HTTP mocking
- **Pact** — consumer-driven contracts
- **Playwright** — API + browser E2E
- **k6 / autocannon** — load testing

## Observability

- **pino** — structured logs
- **OpenTelemetry** — traces + metrics, vendor-neutral
- **Prometheus + Grafana** — self-hosted metrics
- **Datadog / New Relic / Honeycomb** — hosted observability
- **Sentry** — error tracking
- **node --cpu-prof / clinic.js** — profiling

## DevOps and delivery

- **Git + GitHub** — PR flow, branch protection, required checks
- **GitHub Actions** — CI/CD
- **Docker + BuildKit** — containerization; multi-stage, non-root, distroless
- **docker-compose** — local orchestration
- **Kubernetes (awareness)** — managed via Fly, Render, Railway, Cloud Run, or EKS
- **Nginx / Caddy** — reverse proxy, TLS termination
- **pgbouncer** — connection pooling
- **Fly.io / Render / Railway / Cloud Run** — modern Node-friendly PaaS
- **Terraform / OpenTofu** — infrastructure as code
- **Argo CD / Flux** — GitOps for Kubernetes

## Messaging and jobs

- **BullMQ** — Redis-backed queues
- **NATS JetStream** — persistent messaging
- **Kafka / Redpanda** — event streaming
- **Temporal** — durable workflows

## Developer workflow

- **VS Code** — with ESLint, Prettier, Vitest, Error Lens, GitLens
- **tsx** — run TypeScript directly in dev
- **pnpm** — package manager of choice
- **Bruno / Postman / HTTPie** — API client
- **DBeaver / pgAdmin / mongo-compass** — DB GUI
- **ngrok / Cloudflare Tunnel** — expose local services for webhooks

## Where these tools appear in the roadmap

| Phase | Primary additions |
| --- | --- |
| Phase 1 | JavaScript, TypeScript, Node.js, npm/pnpm, tsx, ESLint, Prettier, Vitest, Git |
| Phase 2 | Express, Zod, Postgres + Prisma/Drizzle, MongoDB + Mongoose, JWT (`jose`), argon2, Helmet |
| Phase 3 | Redis, Socket.IO, GraphQL, gRPC, BullMQ, Testcontainers, Pact, k6, clinic.js |
| Phase 4 | Docker, GitHub Actions, Fly/Render/Railway, OpenTelemetry, Prometheus, Grafana, Sentry |

## Recommended student workstation

- **Editor**: VS Code (with the extensions listed above)
- **Runtime**: Node.js 20 LTS via `fnm` or `volta`
- **Shell**: zsh or bash with `starship` or similar prompt
- **Container runtime**: Docker Desktop, Colima, or OrbStack
- **API client**: Bruno or Postman
- **DB GUI**: DBeaver (universal) or per-DB tools
- **Terminal multiplexer**: tmux or a modern terminal with tabs

<Callout type="tip" title="Calibrate your toolbelt quarterly">
Tools shift. Every quarter, spend an hour surveying the space. If a new tool saves meaningful time, try it on a small project before you adopt it on a serious one.
</Callout>

This reference pairs with the [Program Overview](/start-here/program-overview/) and the [Capstone Projects](/projects/capstone-projects/) page. If you're unsure where to start, begin with the [Learning Overview](/learning/overview/).
