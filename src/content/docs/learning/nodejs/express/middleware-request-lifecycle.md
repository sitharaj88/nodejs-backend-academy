---
title: Middleware and Request Lifecycle
slug: learning/nodejs/express/middleware-request-lifecycle
description: Learn Express middleware order, request lifecycle behavior, app-level and router-level middleware, and how to design middleware clearly.
---

Middleware is the core mental model of Express.

If learners understand middleware deeply, they understand most of the framework’s power and most of its common mistakes.

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

## Middleware Order Matters

Express processes middleware in registration order.

This means:

- logging before routes sees every request
- auth before protected routes can block access
- error handlers must appear later in the chain

### Teaching point

Many Express bugs are really middleware-order bugs.

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

Learners should understand the difference between “continue” and “finish now.”

## Async Middleware

Modern Express code often uses async functions.

```js
app.get('/profile', async (req, res) => {
  const profile = await loadProfile()
  res.json(profile)
})
```

Async behavior makes error handling and wrapper strategy more important.

## Request Lifecycle Thinking

A request often passes through:

1. transport-level parsing
2. global middleware
3. router selection
4. route-specific middleware
5. handler logic
6. response writing
7. error flow if something fails

That lifecycle should be visible in the learner’s mind.

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

## What To Remember

- middleware is the core Express execution model
- order is behavior, not a cosmetic detail
- good middleware should do one clear job
- request lifecycle thinking prevents many bugs
- async middleware requires deliberate error handling design
