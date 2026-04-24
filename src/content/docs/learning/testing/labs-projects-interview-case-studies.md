---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/testing/labs-projects-interview-case-studies
description: Test-writing labs, debugging drills, mini-projects, interview questions, and real outage case studies for the testing and debugging track.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="20 min" track="Testing" />

Practice the craft on realistic code and real incidents.

## Code labs

<Lab title="Layered suite for /users" duration="45 min" difficulty="Medium" stack="Vitest, Supertest, Testcontainers">
Cover the same feature with unit, integration, and API tests. Identify one bug that only one layer can catch. Document what each layer actually proved.

**Success criteria**: three passing suites; deleting validation fails the API test only; running `test:int` twice is idempotent.
</Lab>

<Lab title="Plant a bug, reproduce it, kill it" duration="30 min" difficulty="Medium" stack="Express, pino, Vitest">
Pair up. Partner A introduces a subtle bug (race condition in cache invalidation, off-by-one in pagination, missing `await`). Partner B reproduces, isolates, and fixes using the five-step debugging loop. Commit history shows the repro test first, the fix second.
</Lab>

<Lab title="Replace four mocks" duration="50 min" difficulty="Medium" stack="Testcontainers, Pact">
Take a codebase that mocks everything. Swap the database mock for a Postgres container, the queue mock for an in-memory fake, and the payment-provider mock for a Pact contract. Delete every `vi.mock` that remains. Suite must still finish in under 30 seconds.
</Lab>

<Lab title="Observability kit" duration="40 min" difficulty="Medium" stack="pino, AsyncLocalStorage, OpenTelemetry">
Add structured logs with request id, user id, and tenant id to an existing Express service. Verify in a load test that every log from one request carries the same id. Export traces to a local Jaeger instance and confirm you can see the request across service boundaries.
</Lab>

## Mini projects

- **Test a legacy module**: take a 600-line service that has no tests and no type annotations. Add tests without modifying behavior, then refactor safely.
- **Debugging workshop**: create a workshop repo where each branch contains a different broken feature. Learners run `git checkout bug-03` and practice the debugging loop.
- **CI quality gate**: build a GitHub Action that runs unit, integration, and contract tests in parallel, reports coverage per directory, and fails PRs that drop coverage on critical paths.

## Interview questions

1. Explain the testing pyramid in your own words. When is an inverted pyramid acceptable?
2. Give a concrete example where mocking produced false confidence. How would you structure the test differently?
3. Walk me through how you would debug a production 500 that you cannot reproduce locally.
4. What fields belong in a structured log for an HTTP request in a multi-tenant app?
5. How do you test code that depends on `Date.now()` without freezing wall-clock time in a flaky way?
6. When would you prefer `node:test` over Vitest?
7. You inherit a suite with 95% coverage and lots of bugs in production. Where do you look first?
8. Describe consumer-driven contract testing in one sentence. What does it buy that schema validation does not?
9. A colleague proposes deleting the integration tests because they are slow. How do you reply?
10. How do you verify that your logs never contain secrets?

## Production case studies

### Case 1 — All-green happy path

A payment service had 450 unit tests and 90% coverage. After a deploy, every charge that involved an expired card returned 500. Root cause: the unit tests had mocked the Stripe SDK's error object with `{ message: 'failed' }`; the real SDK returned `{ type: 'card_error', decline_code: ... }`. The error handler looked for `decline_code`, found `undefined`, and crashed.

**Lesson:** integration-test at least one failure path per external dependency, using the real shape.

### Case 2 — The quiet over-mock

A team introduced a new cache layer in front of a Postgres read. Their unit tests mocked the cache with `{ get: () => null }` so all reads fell through. In production the cache returned stale serialized rows with dates as strings. The service crashed on `.getUTCFullYear is not a function`.

**Lesson:** mock the **shape** of real responses, not idealized ones. Serialize, deserialize, then assert.

### Case 3 — Logs that were useless

An outage lasted 40 minutes because nobody could correlate logs to user reports. The team had no request id, no user id, and the logger wrote unstructured text. Sampling the logs produced 12,000 lines per minute with no way to filter to one session.

**Lesson:** structured logs with request/user/tenant ids are not optional in production.

### Case 4 — Flaky test that hid a real race

A CI job failed once a week on an `afterEach` assertion about user count. Teams retried until it went green. Later, the same race shipped to production and double-charged a customer. The test was flaky because the code was racy — the flake was a signal.

**Lesson:** when a test is flaky, check the code before retrying. Flakes are often bugs.

### Case 5 — Coverage number that lied

A dashboard team celebrated hitting 95% coverage by writing tests that only asserted `toBeDefined()`. When a bug shipped, the "test" for the affected code existed but never asserted anything meaningful.

**Lesson:** audit tests periodically for empty assertions. Tools like `vitest-mock-extended` reports and `eslint-plugin-vitest` rules catch the worst offenders.

<Callout type="tip" title="Pair case studies with code reviews">
For each case study above, have learners do an archaeology exercise: given the symptoms, how would they reproduce, isolate, and fix? Then show the real fix.
</Callout>

## Teaching tips

- Treat debugging as its own workshop, not a footnote inside other lessons.
- Require every pull request to name the test that would fail without the change.
- When a test is flaky, track it like a bug. Don't retry and forget.
- Include at least one "write a test that proves the bug exists" drill per week.
