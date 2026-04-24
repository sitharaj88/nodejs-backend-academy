---
title: HTTP Server, APIs, and Express
slug: learning/nodejs/http-server-apis-express
description: Learn how Node.js handles HTTP servers, request and response lifecycles, API design fundamentals, and how that foundation leads into a deeper Express learning path.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner to Intermediate" duration="20 min" track="Node.js" prerequisites="Runtime fundamentals, JSON, async/await" />

One of the most common reasons people learn Node.js is to build HTTP APIs.

This page is the runtime-level foundation. After this, the site continues into a dedicated multi-page Express learning path.

<Objectives>
- Build a minimal HTTP server with only `node:http` and explain every line
- Map the request lifecycle to where a framework adds value
- Design consistent JSON success and error shapes across routes
- Add timeouts so slow clients cannot monopolize the server
</Objectives>

## The Native `http` Module

Node.js can create servers without frameworks.

```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ ok: true }))
})

server.listen(3000)
```

This is worth teaching because it reveals the real request and response lifecycle under frameworks.

## What Happens During a Request

At a high level:

1. a socket connection arrives
2. Node parses the HTTP request
3. your handler receives request and response objects
4. your code reads input, performs work, and writes output
5. the response is sent and the connection may close or stay alive

This is the runtime-level picture behind every higher-level web framework.

<KeyConcept title="Express is routing and middleware over `req`/`res`">
The objects your Express handler gets are still Node's `http.IncomingMessage` and `http.ServerResponse`. Frameworks add routing, parsing, and error flow — they do not replace the underlying I/O model.
</KeyConcept>

## Why Frameworks Exist

<Compare badLabel="Everything by hand" goodLabel="Framework for the boring bits">
<Fragment slot="bad">
```js
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/courses') {
    let body = ''
    for await (const chunk of req) body += chunk
    const parsed = JSON.parse(body) // throws? validate? size limit?
    res.writeHead(201, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ id: 1, ...parsed }))
    return
  }
  res.writeHead(404).end('not found')
})
```
Every route re-implements parsing, errors, and matching.
</Fragment>
<Fragment slot="good">
```js
const app = express()
app.use(express.json({ limit: '100kb' }))

app.post('/courses', (req, res) => {
  res.status(201).json({ id: 1, ...req.body })
})

app.use((_req, res) => res.status(404).json({ error: 'not found' }))
```
Framework handles routing, parsing, and fallbacks.
</Fragment>
</Compare>

Frameworks like Express solve repetitive problems:

- routing
- middleware
- body parsing
- error forwarding
- reusable HTTP conventions

The point of this page is to understand why those abstractions are useful before relying on them everywhere.

## Express Basics

```js
import express from 'express'

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(3000)
```

Express is still valuable for teaching because it is simple and widely understood.

For broader Express coverage, continue to:

1. [Express Overview](/learning/nodejs/express/overview/)
2. [Setup, Routing, and Request-Response Flow](/learning/nodejs/express/setup-routing-request-response/)
3. [Middleware and Request Lifecycle](/learning/nodejs/express/middleware-request-lifecycle/)
4. [Validation and Error Handling](/learning/nodejs/express/validation-error-handling/)
5. [Auth, Security, and API Hardening](/learning/nodejs/express/auth-security-api-hardening/)
6. [Files, Static Content, and Response Patterns](/learning/nodejs/express/files-static-content-response-patterns/)
7. [Architecture and Testing](/learning/nodejs/express/architecture-and-testing/)
8. [Performance and Production Delivery](/learning/nodejs/express/performance-and-production-delivery/)
9. [Modern Express Coverage](/learning/nodejs/express/modern-express-coverage/)

## Middleware Thinking

Middleware is one of the most important Express ideas, and it is expanded in the dedicated Express section.

Typical middleware responsibilities:

- logging
- authentication
- validation
- request timing
- error shaping

### Teaching point

Middleware should be compositional and purposeful. It should not become a dumping ground for unrelated side effects.

## Route Design

Good API design includes:

- clear resource naming
- correct status codes
- predictable JSON shapes
- explicit validation
- meaningful error messages

## Request Bodies and Validation

Even when using TypeScript, request bodies must be validated at runtime.

Framework code should never trust incoming JSON automatically.

<Callout type="warn" title="Parsing is not validation">
`express.json()` gives you an object. It does not prove the object has the fields you expect, the right types, or safe values. Validation is a separate step and belongs in its own layer.
</Callout>

## Status Codes

Learners should be comfortable with:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

## Error Handling in Express

Express uses a dedicated error flow.

```js
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})
```

Teaching students this early prevents a lot of messy controller code. The full patterns, including async error strategy and validation boundaries, are covered in the Express track.

## Modern Built-In HTTP Helpers

Modern Node.js also includes built-in `fetch`, which matters for server-to-server calls, proxies, and backend integrations.

## Timeouts and Slow Clients

Production APIs need explicit thinking around:

- request timeouts
- downstream timeouts
- slowloris-style behavior
- cancellation and cleanup

These topics are part of real backend engineering, not optional extras.

<Callout type="tip" title="Set `server.headersTimeout` and `server.requestTimeout`">
Modern Node gives you `server.headersTimeout` (default 60 s) and `server.requestTimeout` (default 300 s). Pick values that match your SLO. A server with no bounded timeouts is a DoS target waiting to happen.
</Callout>

## Common Pitfalls

<Pitfall title="Calling `res.send` twice in an async handler">
An async branch returns early, but a later `await` still runs and writes a second response. Node throws `ERR_HTTP_HEADERS_SENT`. **Fix:** return after any response write, and keep branches exhaustive.
</Pitfall>

<Pitfall title="No body size limit on JSON parser">
`app.use(express.json())` with no `limit` option accepts the default 100kb, but custom middleware often forgets. A 10 MB JSON upload parses, allocates, and may crash the process. **Fix:** set `express.json({ limit: '100kb' })` and reject oversized bodies at the edge.
</Pitfall>

<Pitfall title="Inconsistent error shape across routes">
`/users/:id` returns `{ message: 'not found' }` while `/courses/:id` returns `{ error: 'NOT_FOUND' }`. Clients add brittle `if`/`else` shims. **Fix:** one error middleware, one shape — typically `{ error: <CODE>, details?: [...] }`.
</Pitfall>

## Common Mistakes

- learning only the framework and not the underlying request lifecycle
- mixing validation, business logic, and formatting in one route handler
- returning inconsistent error shapes
- ignoring timeouts and cancellation
- treating Express middleware order as trivial

## Practice Ideas

- build a small API first with `http`, then with Express
- add logging and validation middleware
- design consistent JSON success and error responses
- compare a naive route handler with a service-layer structure

## Lab

<Lab title="From `node:http` to Express" duration="50 min" difficulty="Medium" stack="Node.js 22+, Express">

### Goal
Build the same small resource — `GET /users` and `POST /users` — twice, once with the built-in `http` module and once with Express, and compare line counts and failure modes.

### Steps
1. Implement `GET /users` and `POST /users` using `http.createServer`. Parse the body yourself, handle JSON errors, and enforce a 50 KB size limit.
2. Implement the same two routes with Express 4 using `express.json({ limit: '50kb' })` and an error middleware.
3. Use `curl` to send malformed JSON, an oversized body, and a missing content type to both implementations.
4. Configure `server.headersTimeout` and `server.requestTimeout` on both servers and prove a slow client gets disconnected.

### Success criteria
- Both implementations return the same status code and body for every test case
- The Express version is measurably shorter and the error paths are centralized
- Malformed JSON returns 400 with the shared error shape, not 500
- Slow clients are disconnected within your configured timeout

</Lab>

## Checkpoint

<Checkpoint>
1. What does `express.json()` actually do that plain `http.createServer` does not?
2. Why do we care about `server.headersTimeout` specifically, not just `server.requestTimeout`?
3. A route calls `res.json(...)` and then later `await`s a DB call that throws. What error does Node emit, and how do you prevent it?
4. Name three response behaviors that should be identical across every route in an API.
5. When would you deliberately skip Express and write a route against `node:http`?
</Checkpoint>

## Further reading

- [Express Overview](/learning/nodejs/express/overview/)
- [Databases, Validation, and Auth](/learning/nodejs/databases-validation-auth/)
- [Testing, Debugging, and Error Handling](/learning/nodejs/testing-debugging-error-handling/)
