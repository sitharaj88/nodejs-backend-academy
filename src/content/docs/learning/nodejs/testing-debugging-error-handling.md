---
title: Testing, Debugging, and Error Handling
slug: learning/nodejs/testing-debugging-error-handling
description: Learn modern Node.js testing, the built-in test runner, debugging practices, structured logging, and error handling strategies for reliable backend systems.
---

Reliable Node.js systems are not built by hoping the happy path works. They are built by testing behavior, debugging clearly, and handling failure intentionally.

## Testing Layers

Learners should understand the difference between:

- unit tests
- integration tests
- API tests
- end-to-end tests

Each layer answers different questions.

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

Mocking is useful, but too much mocking can create fake confidence.

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

## Logging

Logs should help answer:

- what happened
- when it happened
- which request or job it affected
- how severe it was

Structured logging is much more useful than random `console.log()` noise in production systems.

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

## What To Remember

- good backend code assumes failure will happen
- modern Node.js has a built-in test runner worth teaching
- errors need categories, not one generic response
- structured logging makes debugging and operations far easier
- testing and debugging should feed each other
