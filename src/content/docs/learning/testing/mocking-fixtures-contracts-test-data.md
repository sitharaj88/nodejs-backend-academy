---
title: Mocking, Fixtures, Contracts, and Test Data
slug: learning/testing/mocking-fixtures-contracts-test-data
description: Design fakes and fixtures that protect real confidence, verify contracts across service boundaries, and build test data that mirrors the shape of production.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="20 min" track="Testing" prerequisites="Unit vs integration layers" />

Bad test data lies to you in green. This page is about the three disciplines that keep your suite honest when you start faking things: **mocks** (stand-ins for dependencies), **fixtures** (the seed data your tests read), and **contracts** (the agreement between services).

<Objectives>
- Know the three kinds of test doubles and when each is correct
- Build fixtures that reflect production shape without copying production data
- Use consumer-driven contracts to catch breaking changes across services
- Generate realistic data without letting randomness break tests
</Objectives>

## The three kinds of test doubles

<KeyConcept title="Stub, fake, mock — they are not synonyms">
A **stub** returns canned data so a test can run. A **fake** is a working replacement with simplified internals (for example, an in-memory repository). A **mock** is a stub with expectations attached: the test fails if the wrong call is made.
</KeyConcept>

```ts
// Stub — returns a fixed value, no expectations
const stubRepo = { findById: async () => ({ id: '1', email: 'ada@example.com' }) }

// Fake — works end-to-end in memory
class InMemoryUsersRepo {
  private store = new Map<string, User>()
  create(u: User) { this.store.set(u.id, u); return u }
  findById(id: string) { return this.store.get(id) ?? null }
}

// Mock — records calls and checks them
const emailer = { send: vi.fn().mockResolvedValue(undefined) }
await service.register({ email: 'ada@example.com' })
expect(emailer.send).toHaveBeenCalledWith(expect.objectContaining({
  to: 'ada@example.com',
  template: 'welcome',
}))
```

<Callout type="tip" title="Prefer fakes over mocks for multi-step tests">
If a test calls the same collaborator three times, a chain of mocks grows brittle. A small fake keeps the test focused on outcomes.
</Callout>

## When mocking is the right answer

Mocking is appropriate for dependencies that are **external and uncontrollable** — a payment provider, an SMS gateway, a third-party identity service — or when the cost of the real thing makes the feedback loop worthless.

It is almost never the right answer for code you own. Your own database, your own Redis, your own queue: run the real thing in a container.

<Compare badLabel="Mocking what you own" goodLabel="Real instance, disposable data">
<Fragment slot="bad">
```ts
vi.mock('./db', () => ({
  db: { query: vi.fn().mockResolvedValue({ rows: [{ id: '1' }] }) },
}))
```
Tests pass even when the real SQL is broken.
</Fragment>
<Fragment slot="good">
```ts
import { PostgreSqlContainer } from '@testcontainers/postgresql'

const pg = await new PostgreSqlContainer().start()
process.env.DATABASE_URL = pg.getConnectionUri()
```
Each run spins a real Postgres — real errors, real constraints.
</Fragment>
</Compare>

## Fixtures — seed data that matches real shape

A fixture is the minimal data your test needs to exercise a behavior. The goal is **readable** and **representative** — not complete.

```ts
// test/fixtures/users.ts
export const alice = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'alice@example.com',
  role: 'admin' as const,
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

export const bob = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'bob@example.com',
  role: 'member' as const,
  createdAt: new Date('2024-01-02T00:00:00Z'),
}
```

<Callout type="info" title="Use factories for edge cases, fixtures for named characters">
Named fixtures (`alice`, `bob`) make tests read like stories. Factories (`makeUser({ role: 'admin' })`) cover combinatorial cases. Both belong in the same repo, same `test/factories` folder.
</Callout>

```ts
// test/factories/users.ts
import { randomUUID } from 'node:crypto'
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    email: `${randomUUID()}@test.local`,
    role: 'member',
    createdAt: new Date(),
    ...overrides,
  }
}
```

## Deterministic randomness

Randomness in test data is fine when it makes combinatorial space larger. It becomes a bug when a green run today becomes red tomorrow because the seed changed.

```ts
import { faker } from '@faker-js/faker'
faker.seed(42) // same value every run

export function makeProduct() {
  return {
    sku: faker.string.alphanumeric(8),
    name: faker.commerce.productName(),
    priceCents: faker.number.int({ min: 100, max: 9999 }),
  }
}
```

## Contracts — agreements across service boundaries

When your service calls another, the real bug you fear is: **the other service changed its shape and you didn't notice.** Contract testing flips the check: the consumer writes the contract, the producer verifies it in CI.

```ts
// Consumer (your service) — using Pact
import { PactV3, MatchersV3 } from '@pact-foundation/pact'

const provider = new PactV3({ consumer: 'orders', provider: 'payments' })

it('charges a card and returns a confirmation id', async () => {
  provider
    .uponReceiving('a charge request')
    .withRequest({
      method: 'POST',
      path: '/charges',
      body: { amount: 1500, currency: 'USD', token: 'tok_test' },
    })
    .willRespondWith({
      status: 200,
      body: { id: MatchersV3.like('ch_123'), status: 'succeeded' },
    })

  await provider.executeTest(async (mock) => {
    const result = await chargeCard({ baseUrl: mock.url, amount: 1500 })
    expect(result.status).toBe('succeeded')
  })
})
```

<KeyConcept title="Consumer-driven contracts stop schema drift">
The producer's CI pipeline runs every consumer's contract against the real code. If the producer breaks the shape, the producer's build goes red — **before** the consumer ever calls production.
</KeyConcept>

## Pitfalls to avoid

<Pitfall title="Mock everything, mean nothing">
When every dependency is a mock, tests only verify the shape of your fakes. A team once mocked a payment client to return `{ ok: true }` on every call — for two years — while the real integration returned `{ success: true }`. The webhook handler had been silently broken from day one.
</Pitfall>

<Pitfall title="Shared mutable fixtures">
Two tests modify the same `users` fixture array. One reorders. The other asserts on order. You get a flaky test that fails once a week. **Fix:** freeze fixtures (`Object.freeze`) and return fresh copies from factories.
</Pitfall>

<Pitfall title="Fixtures drifting from production shape">
Tests seed users without a `lastLoginAt` field. Production users have it. Your new query assumes it exists and crashes. **Fix:** derive fixtures from the same schema / validator as the real code (e.g., a `zod` schema), or generate them with a factory that uses the schema's defaults.
</Pitfall>

## Lab

<Lab title="Replace four mocks with one fake and one real container" duration="50 min" difficulty="Medium" stack="Node.js, Vitest, Testcontainers, Pact">

### Goal
Identify four lazy mocks in an existing codebase (one per dependency: database, cache, queue, email). Replace each with the right tool.

### Steps
1. Clone the starter: a tiny Express service with `register`, `verifyEmail`, `resetPassword`, and a Jest/Vitest suite that mocks everything.
2. Replace the database mock with a Postgres `Testcontainer` and delete all `vi.mock('./db')` calls.
3. Replace the cache mock with an in-memory fake object that implements `get`, `set`, and `del`.
4. Replace the email mock with a recording fake — it should collect sends into an array so tests can assert content.
5. Add a Pact contract test against the payment provider with two interactions: successful charge and declined card.

### Success criteria
- `npm test` still passes and finishes in under 30 seconds
- Breaking the SQL in `users.repo.ts` causes at least one test to fail
- `grep -c "vi.mock" src` returns `0`
- A breaking change in the Pact producer fails CI before a real API call

</Lab>

## Checkpoint

<Checkpoint>
1. Name one case where a mock is the right tool and one where a fake is better.
2. Why does using the real database in tests usually **improve** speed of development even though individual tests run slower?
3. A teammate wants deterministic fake emails for thousands of users. What two lines of code make that safe?
4. What problem does consumer-driven contract testing solve that no amount of unit testing will?
5. You see `expect(dbMock.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id=$1', ['abc'])`. What's wrong with this assertion?
</Checkpoint>

## Further reading

- [Debugging, Logging, and Diagnostics](/learning/testing/debugging-logging-diagnostics/)
- [Modern Testing Coverage](/learning/testing/modern-testing-coverage/) — Pact, MSW, Testcontainers
- [Architecture: layered boundaries](/learning/architecture/layered-architecture-and-boundaries/)
