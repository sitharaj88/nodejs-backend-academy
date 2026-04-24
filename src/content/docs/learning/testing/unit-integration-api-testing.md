---
title: Unit, Integration, and API Testing
slug: learning/testing/unit-integration-api-testing
description: Learn what each testing layer proves, when to write which, and how to build a layered suite that survives refactors without becoming cement.
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

<LessonMeta level="Intermediate" duration="22 min" track="Testing" prerequisites="Express, async/await, Jest or Vitest basics" />

Different tests answer different questions. The fastest way to build a suite you trust — and can change later — is to understand exactly which question each layer answers and stop trying to make one layer do the others' jobs.

<Objectives>
- Distinguish unit, integration, and API tests by **what** they verify, not by tool
- Choose the right layer for a given behavior in under 30 seconds
- Write a layered suite for a small Express resource
- Recognise and delete tests that lock in implementation rather than behavior
</Objectives>

## Mental model: the testing pyramid, honest edition

<Diagram caption="Each layer costs more to run, but verifies a wider slice of reality.">
  <svg viewBox="0 0 520 260" role="img" aria-label="Testing pyramid">
    <defs>
      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#2f8f46" stop-opacity=".2" />
        <stop offset="1" stop-color="#2f8f46" stop-opacity=".55" />
      </linearGradient>
    </defs>
    <polygon points="260,20 460,230 60,230" fill="url(#g1)" stroke="#2f8f46" stroke-width="1.5" />
    <line x1="110" y1="180" x2="410" y2="180" stroke="#2f8f46" stroke-dasharray="4 4" stroke-opacity=".55" />
    <line x1="170" y1="120" x2="350" y2="120" stroke="#2f8f46" stroke-dasharray="4 4" stroke-opacity=".55" />
    <text x="260" y="65" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="14" fill="#0d1220">E2E / API</text>
    <text x="260" y="82" text-anchor="middle" font-family="Manrope" font-size="11" fill="#596579">few, broad, slow, honest</text>
    <text x="260" y="150" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="14" fill="#0d1220">Integration</text>
    <text x="260" y="167" text-anchor="middle" font-family="Manrope" font-size="11" fill="#596579">seams between modules, real DB</text>
    <text x="260" y="210" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="14" fill="#0d1220">Unit</text>
    <text x="260" y="226" text-anchor="middle" font-family="Manrope" font-size="11" fill="#596579">many, fast, pure logic</text>
  </svg>
</Diagram>

<KeyConcept title="The layer is defined by the boundary it crosses, not the tool">
A test is a **unit test** when it runs a pure function or a small module in isolation.<br/>
A test is an **integration test** when it crosses a real boundary — database, file system, another service — under your control.<br/>
A test is an **API test** when it exercises your HTTP surface the way a real client would.
</KeyConcept>

## Unit tests — fast feedback on logic

Unit tests run in milliseconds and target pieces of logic whose behavior you can state as "given inputs, produce outputs."

```ts
// src/pricing.ts
export function applyDiscount(subtotal: number, code: string | null): number {
  if (!code) return subtotal
  if (code === 'WELCOME10') return Math.round(subtotal * 0.9 * 100) / 100
  if (code.startsWith('STAFF')) return Math.round(subtotal * 0.5 * 100) / 100
  return subtotal
}
```

```ts
// src/pricing.test.ts
import { describe, it, expect } from 'vitest'
import { applyDiscount } from './pricing'

describe('applyDiscount', () => {
  it('returns subtotal when no code is provided', () => {
    expect(applyDiscount(100, null)).toBe(100)
  })

  it('applies 10% for WELCOME10', () => {
    expect(applyDiscount(100, 'WELCOME10')).toBe(90)
  })

  it('applies 50% for any STAFF-prefixed code', () => {
    expect(applyDiscount(200, 'STAFF-JAN')).toBe(100)
  })

  it('rounds to two decimals', () => {
    expect(applyDiscount(19.99, 'WELCOME10')).toBe(17.99)
  })
})
```

<Callout type="tip" title="If a test needs a mocked dependency, it is probably not a unit test">
A real unit test has **no** collaborators to fake. If you find yourself injecting a fake database into a pure-logic test, split the logic out so the unit layer stays pure.
</Callout>

## Integration tests — verifying seams with real components

Integration tests plug two or three modules together and use a real instance of anything they own — the database, the cache, a queue. They catch the bugs that live in **between** the pieces: wrong column types, missing indexes, wrong transaction scope, inconsistent error shapes.

```ts
// src/users/users.repo.int.test.ts
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import { Pool } from 'pg'
import { UsersRepo } from './users.repo'

let pool: Pool
let repo: UsersRepo

beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  await pool.query(`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      created_at timestamptz not null default now()
    )
  `)
  repo = new UsersRepo(pool)
})

afterAll(() => pool.end())

beforeEach(() => pool.query('truncate users'))

it('rejects duplicate emails with a domain error', async () => {
  await repo.create({ email: 'ada@example.com' })
  await expect(repo.create({ email: 'ada@example.com' })).rejects.toMatchObject({
    code: 'EMAIL_TAKEN',
  })
})
```

<Callout type="info" title="Real dependencies, disposable data">
Use [Testcontainers](https://node.testcontainers.org/) or a docker-compose `test` profile to give each test run an isolated Postgres, Redis, or Mongo. Truncate tables in `beforeEach` — never rely on test order.
</Callout>

## API tests — proving the service behaves as a client will see it

API tests go through your HTTP router. They are the last honest check that routing, validation, auth, serialization, and error contracts all line up.

```ts
// src/app.api.test.ts
import request from 'supertest'
import { createApp } from './app'

const app = createApp()

it('POST /users validates payload before touching the database', async () => {
  const res = await request(app).post('/users').send({ email: 'not-an-email' })
  expect(res.status).toBe(422)
  expect(res.body).toMatchObject({
    error: 'VALIDATION_FAILED',
    details: [{ field: 'email', rule: 'email' }],
  })
})

it('GET /users/:id returns 404 with stable error shape', async () => {
  const res = await request(app).get('/users/00000000-0000-0000-0000-000000000000')
  expect(res.status).toBe(404)
  expect(res.body).toEqual({ error: 'USER_NOT_FOUND' })
})
```

<KeyConcept title="Contract, not implementation">
An API test should be writable by someone who has never opened your repo, using only the documented HTTP contract. If you need to peek at internals to write the assertion, the test belongs at a lower layer.
</KeyConcept>

## How to choose a layer

<Compare badLabel="Wrong layer" goodLabel="Right layer">
<Fragment slot="bad">
**Testing auth middleware with a unit test** that mocks `req`, `res`, and the token verifier.

```ts
it('calls next on valid token', () => {
  const req: any = { headers: { authorization: 'Bearer fake' } }
  const next = vi.fn()
  vi.mock('./verify', () => ({ verify: () => ({ sub: '1' }) }))
  middleware(req, {} as any, next)
  expect(next).toHaveBeenCalled()
})
```

This passes even if the middleware is wired to the wrong route.
</Fragment>
<Fragment slot="good">
**Testing auth middleware with an API test** that hits a protected route with a real token.

```ts
const token = signTestToken({ sub: 'u1' })
const res = await request(app)
  .get('/me')
  .set('Authorization', `Bearer ${token}`)
expect(res.status).toBe(200)
expect(res.body.id).toBe('u1')
```

This fails if middleware isn't mounted, if the token format changes, or if the route forgets to use `req.user`.
</Fragment>
</Compare>

## Common pitfalls

<Pitfall title="All-green suite, broken feature">
A team writes 200 unit tests that all pass. A production user reports that `POST /orders` returns 500. The unit tests mock the database, so the broken SQL query was never executed in tests. **Fix:** require at least one integration test per persistence module.
</Pitfall>

<Pitfall title="Over-integrated slow suite">
The team writes only end-to-end tests that spin up the full stack for each case. CI takes 25 minutes, flakes weekly, and developers stop running it locally. **Fix:** push assertions down. Unit-test pure logic, integration-test one seam, and keep end-to-end thin.
</Pitfall>

<Pitfall title="Tests that copy implementation">
A test asserts that `UserService.create` calls `repo.insert` exactly once and then `emailer.sendWelcome`. A week later the code legitimately batches inserts; the behavior is identical but the test breaks. **Fix:** test observable outcomes (the user exists, the welcome email is queued), not the private call graph.
</Pitfall>

## Lab

<Lab title="Build a three-layer suite for POST /users" duration="45 min" difficulty="Medium" stack="Node.js, Vitest, Supertest, Postgres">

### Goal
Cover the same feature — `POST /users` — with one unit test, one integration test, and one API test. Reason about what each one actually proves.

### Steps
1. Create `hashPassword(plain)` as a pure function and unit-test four cases: empty, short, normal, unicode.
2. Create `UsersRepo` against a real Postgres container. Integration-test duplicate-email rejection and correct row shape.
3. Wire the route with validation and a `POST /users` handler. API-test three cases: success (201), invalid email (422), duplicate email (409).
4. In your `package.json`, split scripts: `test:unit`, `test:int`, `test:api`. Make `test` run all three.

### Success criteria
- `npm run test:unit` finishes in under one second
- `test:int` is isolated: running it twice gives the same result
- Removing validation middleware fails the API test but not the unit test
- Each test's name names a behavior, not a method

</Lab>

## Checkpoint

<Checkpoint>
1. For a utility that computes total price with tax and rounding, which layer should cover it?
2. You change the password-hash algorithm. Which of your three tests must still pass unchanged?
3. A teammate proposes mocking the database in API tests "to keep them fast." Name two risks and one alternative.
4. Which layer is the right home for a test that proves `401` returns the exact body `{ "error": "UNAUTHENTICATED" }`?
5. When would you keep only an API test and skip the unit test entirely?
</Checkpoint>

## Further reading

- [Mocking, Fixtures, Contracts, and Test Data](/learning/testing/mocking-fixtures-contracts-test-data/) — how to keep fakes honest
- [Debugging, Logging, and Diagnostics](/learning/testing/debugging-logging-diagnostics/) — when a test reproduces a failure, what do you do next
- [Modern Testing Coverage](/learning/testing/modern-testing-coverage/) — Vitest, `node:test`, Testcontainers, Pact, Playwright
