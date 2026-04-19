---
title: HTTP Server, APIs, and Express
slug: learning/nodejs/http-server-apis-express
description: Learn how Node.js handles HTTP servers, request and response lifecycles, API design fundamentals, and how that foundation leads into a deeper Express learning path.
---

One of the most common reasons people learn Node.js is to build HTTP APIs.

This page is the runtime-level foundation. After this, the site continues into a dedicated multi-page Express learning path.

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

## Why Frameworks Exist

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

## What To Remember

- frameworks sit on top of Node.js runtime behavior
- the native `http` module helps learners understand what frameworks abstract
- Express is useful for learning middleware and API structure, but it deserves broader study than one summary page
- validation and error shaping are mandatory for serious APIs
- modern backend design includes timeouts, cancellation, and consistent responses
