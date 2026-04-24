---
title: Project Setup, Scripts, and Configuration
slug: learning/tooling/project-setup-scripts-configuration
description: Lay out a Node.js + TypeScript project so a new engineer can clone, run, and ship within 15 minutes — with scripts that compose, config that validates at boot, and no hidden assumptions.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="22 min" track="Tooling" prerequisites="package.json basics" />

Project setup is the first impression your service makes on the next engineer to touch it. A 15-minute onboarding is a design decision. This page is the decisions that produce it.

<Objectives>
- Design a directory tree that signals intent without ceremony
- Write scripts that compose rather than duplicate
- Validate environment configuration at boot so problems fail fast
- Wire ESM / TypeScript / path aliases with no surprises
</Objectives>

## Directory structure (small services)

```
.
├── src/
│   ├── config.ts          # validated env → typed config
│   ├── server.ts          # process lifecycle, listen, shutdown
│   ├── app.ts             # createApp() returns Express app
│   ├── logger.ts
│   ├── middleware/
│   ├── modules/
│   │   └── users/
│   │       ├── users.routes.ts
│   │       ├── users.service.ts
│   │       ├── users.repo.ts
│   │       └── users.schema.ts
│   └── shared/
├── test/
│   ├── factories/
│   ├── fixtures/
│   └── setup.ts
├── scripts/
│   └── migrate.ts
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

<KeyConcept title="Feature modules, not technical layers at the top">
Group by what the system does (`users/`, `orders/`), not by technical role (`controllers/`, `services/`, `repositories/`). A feature-first tree stays readable as the service grows; a role-first tree turns into soup.
</KeyConcept>

## Scripts that compose

Scripts are the team's workflow made executable. They should read like a menu.

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",

    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "test": "vitest run",
    "test:watch": "vitest",
    "test:int": "vitest run --config vitest.int.config.ts",

    "check": "npm run typecheck && npm run lint && npm run format:check && npm run test",
    "db:migrate": "tsx scripts/migrate.ts"
  }
}
```

<Callout type="tip" title="Every repo should expose `check`">
One command to run everything CI runs. Local `pnpm check` must match the CI pipeline — if they drift, CI flakes no one can reproduce.
</Callout>

## Validated config at boot

Reading `process.env.DATABASE_URL` from random files is a recipe for &ldquo;works on my laptop&rdquo;. Validate once, at startup, with a schema. Fail loudly if something is missing.

```ts
// src/config.ts
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  FEATURE_BETA_PAYMENTS: z.coerce.boolean().default(false),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = Object.freeze(parsed.data)
export type Config = typeof config
```

```ts
// .env.example — commit this, never a real .env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-to-at-least-32-chars-please
FEATURE_BETA_PAYMENTS=false
```

## Process lifecycle

Production Node services should shut down cleanly. Kubernetes sends `SIGTERM`; you have roughly 30 seconds to finish in-flight work and close connections.

```ts
// src/server.ts
import { createApp } from './app'
import { config } from './config'
import { logger } from './logger'
import { db } from './db'

const app = createApp()
const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'server.started')
})

async function shutdown(signal: string) {
  logger.info({ signal }, 'server.shutdown')
  server.close(async () => {
    await db.end()
    process.exit(0)
  })
  setTimeout(() => {
    logger.error('force.exit')
    process.exit(1)
  }, 25_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

## `tsconfig` for Node services

```json
// tsconfig.json — base
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "test", "scripts"]
}
```

```json
// tsconfig.build.json — emit only
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src"]
}
```

<Callout type="warn" title="Path aliases and runtime">
TypeScript knows about `@/foo`. Node does not. Either transpile with `tsc`/`tsc-alias`, run with `tsx` (handles aliases), or stick to relative paths. Don't ship `@/` through `node dist/...` without `tsc-alias` or the Node will throw `MODULE_NOT_FOUND` at runtime.
</Callout>

## ESM vs CommonJS

Pick one and commit. New projects use ESM (`"type": "module"`). A few things to remember:

- Import specifiers need extensions: `import { x } from './users/users.service.js'` (yes, `.js` even in TS source).
- `__dirname` / `__filename` are gone — use `import.meta.url` + `new URL(...)`.
- Some older libraries only ship CJS. They can still be imported, but beware default-export quirks.

<Compare badLabel="CJS quirks in ESM" goodLabel="Explicit named">
<Fragment slot="bad">
```ts
import express from 'express'
// Works, but TS might complain depending on settings
```
</Fragment>
<Fragment slot="good">
```ts
// In tsconfig: "esModuleInterop": true  (already set above)
import express from 'express'
// or, when the library officially exports named:
import { Router } from 'express'
```
</Fragment>
</Compare>

## Pitfalls

<Pitfall title="`dotenv` in production">
`dotenv` is a dev convenience. In production, your platform (Fly, Render, Railway, Kubernetes) injects env vars. Shipping `dotenv.config()` unconditionally hides the fact that the platform was misconfigured. **Fix:** load `.env` only when `NODE_ENV !== 'production'`, or not at all in the build.
</Pitfall>

<Pitfall title="Reading `process.env` deep in the codebase">
A middleware reads `process.env.STRIPE_KEY`. A test forgets to set it. The test crashes on line 47 of an unrelated file. **Fix:** read env **once**, at boot, into `config.ts`. Everywhere else imports `config`.
</Pitfall>

<Pitfall title="`npm start` that's really the dev command">
`"start": "nodemon src/server.ts"` — then production runs `nodemon` for no reason. **Fix:** `"start": "node dist/server.js"`. Dev is `dev`. Start is start.
</Pitfall>

## Lab

<Lab title="Bootstrap a 15-minute-onboardable service" duration="60 min" difficulty="Easy" stack="Node.js, pnpm, TypeScript, Express">

### Goal
Build a new repo that a stranger can clone, run, and hit with curl in under 15 minutes.

### Steps
1. Initialize with pnpm, `type: module`, Node 20 engines.
2. Add `src/config.ts` with Zod validation (PORT, DATABASE_URL, REDIS_URL, JWT_SECRET).
3. Add `src/app.ts` exporting `createApp()`, `src/server.ts` that owns lifecycle and SIGTERM.
4. Wire scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `test`, `check`.
5. Commit `.env.example` with every required var and a sensible default.
6. Write a 10-line README: what it does, how to run it, how to test it.

### Success criteria
- `pnpm install --frozen-lockfile && pnpm check` passes on a fresh clone
- Missing env var produces a readable error and exits non-zero
- `curl localhost:3000/health` returns `{ "status": "ok" }` within 2 s of `pnpm dev`
- `pnpm build && node dist/server.js` serves the same endpoint
- README covers running locally and adding a new env var

</Lab>

## Checkpoint

<Checkpoint>
1. Where should `process.env` be read in a well-designed service?
2. Why do ESM imports in TypeScript use `.js` extensions on source files?
3. Name one reason to split `tsconfig.json` and `tsconfig.build.json`.
4. Your service leaks connections on deploy. Where do you look first?
5. A new env var is added. What four places in a repo must update?
</Checkpoint>

## Further reading

- [Code Quality, Builds, and Test Workflow](/learning/tooling/code-quality-builds-test-workflow/)
- [Modern Tooling Coverage](/learning/tooling/modern-tooling-coverage/)
- [DevOps: environment, config, Docker](/learning/devops/environment-config-docker-containers/)
