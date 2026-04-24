---
title: Middleware and Request Lifecycle
slug: learning/nodejs/express/middleware-request-lifecycle
description: Learn Express middleware order, request lifecycle behavior, app-level and router-level middleware, and how to design middleware clearly.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner to Intermediate" duration="20 min" track="Express" prerequisites="Express setup, routing basics, async/await" />

Middleware is the core mental model of Express.

If learners understand middleware deeply, they understand most of the framework's power and most of its common mistakes.

<Objectives>
- Write middleware that does one thing and terminates correctly
- Predict the execution order of app-level, router-level, and error middleware
- Wrap async handlers so thrown errors reach the error pipeline
- Identify middleware-order bugs in existing code
</Objectives>

## What Middleware Is

Middleware is a function that can:

- inspect the request
- modify the request
- modify the response
- end the response
- pass control to the next middleware

```js
app.use((req, _res, next) => {
  console.log(req.method, req.url)
  next()
})
```

<KeyConcept title="Every middleware either calls `next()` or ends the response — never both, never neither">
Forgetting `next()` hangs the request. Calling `next()` after `res.json()` hits `ERR_HTTP_HEADERS_SENT`. The contract is simple: yield or respond, not both.
</KeyConcept>

## Middleware Order Matters

Express processes middleware in registration order.

This means:

- logging before routes sees every request
- auth before protected routes can block access
- error handlers must appear later in the chain

### Teaching point

Many Express bugs are really middleware-order bugs.

<Compare badLabel="Order hides behavior" goodLabel="Order reflects behavior">
<Fragment slot="bad">
```js
app.use('/admin', adminRouter)
app.use(requireAuth)            // too late
app.use(express.json())         // too late
app.use(errorHandler)
```
Admin routes bypass auth; JSON body parsing happens after the route has already run.
</Fragment>
<Fragment slot="good">
```js
app.use(express.json())         // 1. parse
app.use(requestLogger)          // 2. log
app.use(requireAuth)            // 3. auth (where applicable)
app.use('/admin', adminRouter)  // 4. routes
app.use(notFoundHandler)        // 5. 404
app.use(errorHandler)           // 6. last, 4 arg
```
Reading top to bottom tells you exactly what happens.
</Fragment>
</Compare>

## App-Level Middleware

App-level middleware applies broadly.

Use it for:

- logging
- JSON parsing
- CORS
- request IDs
- global auth gates when appropriate

## Router-Level Middleware

Router-level middleware applies only to a route group.

```js
courseRouter.use((req, _res, next) => {
  req.resourceName = 'course'
  next()
})
```

This is useful when route groups share behavior.

## Middleware That Ends the Response

Not every middleware calls `next()`.

```js
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Missing token' })
  }

  next()
})
```

Learners should understand the difference between "continue" and "finish now."

## Async Middleware

Modern Express code often uses async functions.

```js
app.get('/profile', async (req, res) => {
  const profile = await loadProfile()
  res.json(profile)
})
```

Async behavior makes error handling and wrapper strategy more important.

<Callout type="warn" title="Express 4 does not forward async errors automatically">
A thrown error inside an `async` handler in Express 4 becomes an unhandled rejection unless you `.catch(next)` explicitly or use a wrapper. Express 5 fixes this — know which one you are on.
</Callout>

<Callout type="tip" title="One-line async wrapper">
`const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)`. Wrap your async handlers with it and stop writing `try/catch/next(err)` on every route.
</Callout>

## Request Lifecycle Thinking

A request often passes through:

1. transport-level parsing
2. global middleware
3. router selection
4. route-specific middleware
5. handler logic
6. response writing
7. error flow if something fails

That lifecycle should be visible in the learner's mind.

## Good Middleware Design

Good middleware is:

- focused
- predictable
- composable
- side-effect aware
- easy to test

## Bad Middleware Design

Bad middleware often:

- mixes too many responsibilities
- mutates request state without documentation
- depends on hidden global assumptions
- logs too noisily
- swallows errors

## Common Pitfalls

<Pitfall title="Calling `next()` after `res.json()`">
A handler returns JSON, then falls through to `next()`. Express tries to continue the chain and hits `ERR_HTTP_HEADERS_SENT`. **Fix:** `return res.json(...)` — early return is idiomatic in handlers.
</Pitfall>

<Pitfall title="Error middleware with three arguments">
`app.use((err, req, res) => {...})` is not an error middleware — Express recognizes error middleware only with *four* parameters. **Fix:** always declare `(err, req, res, next)` even if `next` is unused.
</Pitfall>

<Pitfall title="Mutating `req` in undocumented ways">
Middleware A adds `req.user`. Middleware B adds `req.userId`. Middleware C assumes `req.user.id` exists and crashes when order changes. **Fix:** pick one shape and document it; consider `AsyncLocalStorage` instead of `req` mutation for cross-cutting context.
</Pitfall>

## Common Mistakes

- forgetting that registration order changes behavior
- calling `next()` after already sending a response
- hiding business logic inside middleware layers
- mutating request objects carelessly
- making middleware too generic to understand

## Practice Ideas

- build logging, timing, and auth middleware separately
- demonstrate how moving one middleware changes behavior
- create router-level middleware for a protected route group
- identify where middleware should stop and service logic should begin

## Lab

<Lab title="Compose a middleware stack" duration="45 min" difficulty="Medium" stack="Node.js 22+, Express 4 or 5, supertest">

### Goal
Build a middleware stack — request ID, timing, auth, async wrapper, error middleware — and prove each layer runs in the right order with tests.

### Steps
1. Write `requestId` middleware that sets `req.id` from the incoming `X-Request-Id` header or generates a UUID.
2. Write `timing` middleware that logs `{ id, method, url, ms }` on `res.on('finish')`.
3. Write `requireAuth` that rejects with `401` when `Authorization` is missing.
4. Wrap one async handler with `asyncHandler` and throw on purpose; confirm the error middleware formats it.
5. Write supertest cases that assert (a) every response includes `X-Request-Id`, (b) reordering middleware breaks a test, (c) thrown async errors reach the error middleware.

### Success criteria
- The stack order in `app.js` reads top-to-bottom like the lifecycle diagram
- Removing `asyncHandler` breaks test (c) with a clear failure
- The error middleware never leaks a stack trace to the client
- Every handler returns after writing its response

</Lab>

## Checkpoint

<Checkpoint>
1. Why does Express treat a function with four parameters as error middleware?
2. You swap the order of `express.json()` and your route — what breaks?
3. An async handler throws. Under Express 4, what happens if you do not wrap it?
4. Name one good use of router-level middleware and one abuse of it.
5. Two middlewares both add `req.user` with different shapes. What is the cleanest long-term fix?
</Checkpoint>

## Further reading

- [Setup, Routing, and Request-Response Flow](/learning/nodejs/express/setup-routing-request-response/)
- [Validation and Error Handling](/learning/nodejs/express/validation-error-handling/)
- [Architecture and Testing](/learning/nodejs/express/architecture-and-testing/)
