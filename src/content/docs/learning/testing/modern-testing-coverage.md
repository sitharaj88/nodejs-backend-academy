---
title: Modern Testing Coverage
slug: learning/testing/modern-testing-coverage
description: Modern testing stack for Node.js services — Vitest, the built-in node:test runner, Testcontainers, Playwright, Pact, and MSW. What to pick, and when.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'
import Compare from '../../../../components/Compare.astro'

<LessonMeta level="Intermediate" duration="14 min" track="Testing" prerequisites="Test layers" />

The testing landscape for Node.js has settled. This page is a reality-check of the tools that matter right now, with opinionated picks and the cases where each one earns its place.

## Test runners

| Tool | Best for | Why |
| --- | --- | --- |
| **Vitest** | Most apps | Fast, TypeScript-first, ESM-native, great watch mode, Jest-compatible API. |
| **`node:test`** | Zero-dep, libraries | Ships with Node.js 20+. Perfect for tools you publish to npm. |
| **Jest** | Legacy code bases | Still solid; move to Vitest for new work. |

```ts
// Vitest — config sharing with Vite is the killer feature
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./test/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
```

```ts
// node:test — no dependency, good for library authors
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('sum', () => {
  assert.equal(1 + 1, 2)
})
```

## HTTP testing

- **Supertest** — the mainstay for Express/Koa/Fastify. Binds to an ephemeral port, makes real HTTP calls in-process.
- **Undici `MockAgent`** — mock outbound HTTP in unit tests when you cannot hit the real service.
- **MSW (`msw/node`)** — record-and-replay outbound requests; excellent for testing a client library.

```ts
// MSW example
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('https://api.stripe.com/v1/customers/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, object: 'customer' }),
  ),
)
beforeAll(() => server.listen()); afterAll(() => server.close())
```

## Real dependencies in tests

- **Testcontainers** — spin ephemeral Postgres, Redis, Mongo, Kafka, LocalStack for each run.
- **docker-compose test profile** — shared containers for the whole suite, good for CI.
- **pg-mem / mongodb-memory-server** — useful for unit-level queries, but skip subtle SQL features (extensions, GIN indexes). Prefer real containers.

```ts
import { PostgreSqlContainer } from '@testcontainers/postgresql'

const pg = await new PostgreSqlContainer('postgres:16-alpine')
  .withInitScript('test/sql/schema.sql')
  .start()
process.env.DATABASE_URL = pg.getConnectionUri()
```

## Contract and consumer tests

- **Pact** — consumer-driven contracts for REST and message brokers.
- **OpenAPI + Dredd / schemathesis** — fuzz your API against its own spec; great for REST.
- **`zod-to-openapi`** — generate the spec from the schemas you already validate with.

## Browser / end-to-end

Most backend suites do **not** need a browser. For admin UIs or SPA integration, reach for **Playwright** — multi-browser, great trace viewer, a single runner for web and API.

```ts
// Playwright API-only
import { test, expect } from '@playwright/test'

test('login then fetch profile', async ({ request }) => {
  const login = await request.post('/auth/login', {
    data: { email: 'ada@example.com', password: 'correct-horse-battery' },
  })
  expect(login.ok()).toBeTruthy()
  const profile = await request.get('/me')
  expect(await profile.json()).toMatchObject({ email: 'ada@example.com' })
})
```

## Static analysis belongs in the suite

- `tsc --noEmit` — catches entire classes of bugs before tests run.
- `eslint` with `@typescript-eslint` — prevent patterns your tests would let through.
- `zod` / `valibot` — runtime validation doubles as documentation.

<Callout type="tip" title="Run types, lint, and tests as peers">
CI should run `tsc && lint && test` as separate parallel jobs. A failing type check is a failing build, not a warning you trip over later.
</Callout>

## Picking a stack (opinionated)

<Compare badLabel="Default to everything" goodLabel="Pick four">
<Fragment slot="bad">
- Jest + Mocha + Tap + node:test
- Testcontainers + pg-mem + sqlite in-memory
- Cypress + Playwright + Puppeteer
- Pact + Dredd + schemathesis
</Fragment>
<Fragment slot="good">
- **Vitest** as the runner
- **Supertest** for HTTP
- **Testcontainers** for real deps
- **Pact** at service boundaries you don't own
</Fragment>
</Compare>

## Coverage is a diagnostic, not a target

Coverage numbers measure what ran, not what mattered. A 95%-covered codebase can be untrustworthy if the 5% is payment logic, and a 60%-covered codebase can be solid if the covered part is all the mutation paths.

Use coverage to **find gaps** in critical paths, then decide case by case. Never gate merges on a global percentage — it pushes people to write tests that execute code without asserting anything useful.

## Further reading

- [Unit, Integration, API Testing](/learning/testing/unit-integration-api-testing/)
- [Mocking, Fixtures, Contracts](/learning/testing/mocking-fixtures-contracts-test-data/)
- [Labs, Projects, Interviews, Case Studies](/learning/testing/labs-projects-interview-case-studies/)
