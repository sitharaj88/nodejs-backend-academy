---
title: Testing, Debugging, and Error Handling
slug: learning/nodejs/testing-debugging-error-handling
description: Learn modern Node.js testing, the built-in test runner, debugging practices, structured logging, and error handling strategies for reliable backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="Node.js" prerequisites="Express basics, async/await, simple HTTP APIs" />

Reliable Node.js systems are not built by hoping the happy path works. They are built by testing behavior, debugging clearly, and handling failure intentionally.

<Objectives>
- Pick the right test layer for a given behavior in under 30 seconds
- Use the built-in `node:test` runner without extra framework ceremony
- Structure logs so an incident can be reconstructed from them
- Categorize errors as operational versus programmer and handle each correctly
</Objectives>

## Testing Layers

Learners should understand the difference between:

- unit tests
- integration tests
- API tests
- end-to-end tests

Each layer answers different questions.

<KeyConcept title="The layer is defined by the boundary it crosses">
Unit tests exercise pure logic with no collaborators. Integration tests cross a real seam — database, filesystem, downstream service. API tests call your HTTP surface the way a client does. Tool choice does not decide the layer; the boundary does.
</KeyConcept>

## Node.js Built-In Test Runner

Modern Node.js includes a built-in test runner.

```js
import test from 'node:test'
import assert from 'node:assert/strict'

test('adds numbers', () => {
  assert.equal(2 + 2, 4)
})
```

This is a major improvement over older training material that assumes third-party test tooling is the only starting point.

## What to Test

Serious backend tests should cover:

- business rules
- validation behavior
- edge cases
- failure paths
- integration boundaries

## Mocking with Discipline

<Compare badLabel="Over-mocked unit test" goodLabel="Focused layer">
<Fragment slot="bad">
```js
// "unit test" that mocks the database, the emailer, and the clock
t.mock.method(db, 'insert', async () => ({ id: 1 }))
t.mock.method(emailer, 'send', async () => {})
t.mock.method(clock, 'now', () => new Date('2026-01-01'))
assert.equal((await createUser(...)).id, 1)
```
Passes even if the SQL is wrong, the email body is wrong, or the clock is wrong.
</Fragment>
<Fragment slot="good">
```js
// integration test against a real Postgres container, real clock
await db.query('truncate users')
const user = await createUser({ email: 'a@b.c' })
assert.equal(user.email, 'a@b.c')
await assert.rejects(() => createUser({ email: 'a@b.c' }), /EMAIL_TAKEN/)
```
Exercises the actual seam; catches SQL-level bugs.
</Fragment>
</Compare>

Teach learners to prefer:

- pure logic tests where possible
- real integration tests for important boundaries
- minimal mocking for genuinely expensive or external dependencies

## Error Handling Philosophy

A backend should not treat all errors the same way.

Useful categories:

- validation errors
- authentication errors
- authorization errors
- not found errors
- conflict errors
- infrastructure errors
- programmer errors

## Operational Versus Programmer Errors

This distinction matters:

- operational errors are expected failure modes such as a timeout or invalid input
- programmer errors indicate bugs such as undefined access or violated assumptions

The handling strategy is not identical.

<Callout type="info" title="Operational errors get handled; programmer errors crash">
For operational errors, return a clean response and keep serving. For programmer errors — `undefined is not a function`, assertions — log richly and let the process exit; a supervisor restarts it into a clean state.
</Callout>

## Logging

Logs should help answer:

- what happened
- when it happened
- which request or job it affected
- how severe it was

Structured logging is much more useful than random `console.log()` noise in production systems.

<Callout type="tip" title="Include a request ID on every log line">
Attach a generated `requestId` (or the inbound `traceparent`) to a context object, log it on every line, and echo it in the response. When a customer reports "my request failed at 14:02," you find everything with one grep.
</Callout>

## Debugging

Students should learn a practical debugging flow:

1. reproduce the issue
2. isolate the boundary
3. inspect inputs and outputs
4. confirm assumptions with logs or debugger tools
5. write or update a test to prevent regression

## Stack Traces and Async Errors

Node.js async code can make debugging harder if errors are swallowed or rethrown carelessly.

Teach students to preserve error context instead of replacing useful stack information with vague messages.

## Unhandled Rejections and Process Stability

Unhandled promise failures are not harmless warnings. They indicate a reliability problem.

Students should understand:

- rejected promises must be awaited or handled
- error boundaries should be explicit
- process-level handlers are a last line of defense, not the main design strategy

## Common Pitfalls

<Pitfall title="`catch (e) { console.log(e.message) }`">
The stack trace disappears. You see `"Cannot read properties of undefined"` with no file, no line, no async context. **Fix:** log the error object itself (`logger.error({ err }, 'context')`), not just the message; preserve `cause` when rethrowing.
</Pitfall>

<Pitfall title="`try/catch` around synchronous `.then()` chains">
`try/catch` does not catch rejections from promises you do not `await`. **Fix:** `await` the chain, or attach `.catch` explicitly. Enable `--unhandled-rejections=strict` in development to surface the gap loudly.
</Pitfall>

<Pitfall title="Flaky test hiding a real race">
A test passes 9 times out of 10 and gets re-run by CI until green. The underlying race eventually causes a production incident. **Fix:** never retry a flaky test — treat flakiness as a bug and either serialize the race or fix the shared state.
</Pitfall>

## Common Mistakes

- testing only the happy path
- using mocks so heavily that real integration behavior is never tested
- swallowing errors and losing context
- logging too little in production or too noisily to be useful
- treating debugging as trial-and-error instead of structured investigation

## Practice Ideas

- write unit and integration tests for one service
- test a validation failure and an authorization failure
- compare noisy logs with structured request-aware logs
- intentionally trigger an unhandled rejection and explain why it is dangerous

## Lab

<Lab title="Three tests, one feature, `node:test`" duration="50 min" difficulty="Medium" stack="Node.js 22+, node:test, supertest, SQLite or Postgres">

### Goal
Cover one Express feature — `POST /users` — with a unit test, an integration test, and an API test using only the built-in test runner.

### Steps
1. Extract `validateCreateUser(input)` as a pure function and write unit tests for four branches: valid, missing email, short password, unicode email.
2. Write an integration test for `UsersRepo.create` against a real database. Cover happy path and duplicate-email rejection.
3. Write an API test using `supertest` for the full route: 201 on success, 422 on invalid payload, 409 on duplicate.
4. Add a request-ID logging middleware and assert in one API test that the response echoes the request ID header.

### Success criteria
- `node --test` runs all three layers in under 10 seconds
- The unit tests do not touch the database
- The API test fails if you remove the validation middleware
- Every log line during a request carries the same request ID

</Lab>

## Checkpoint

<Checkpoint>
1. Which layer catches a bug in SQL column names: unit, integration, or API? Why?
2. A teammate says "we can mock the DB in API tests so they are fast." What risks does this introduce?
3. What is the practical difference between an operational error and a programmer error in terms of handling?
4. Why does `logger.error(err.message)` lose debugging power compared to `logger.error({ err })`?
5. A test passes locally and fails in CI intermittently. What is the worst response, and what is the right one?
</Checkpoint>

## Further reading

- [Unit, Integration, and API Testing](/learning/testing/unit-integration-api-testing/)
- [Debugging, Logging, and Diagnostics](/learning/testing/debugging-logging-diagnostics/)
- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
