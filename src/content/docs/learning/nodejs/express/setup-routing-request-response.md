---
title: Setup, Routing, and Request-Response Flow
slug: learning/nodejs/express/setup-routing-request-response
description: Learn Express app setup, routers, route params, query strings, request bodies, response helpers, and the full request-response flow.
---

Express becomes much easier when learners understand that it is fundamentally a thin routing and middleware layer over the Node.js HTTP server model.

## Basic App Setup

```js
import express from 'express'

const app = express()
app.use(express.json())

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

This small example already teaches:

- app creation
- middleware registration
- server startup

## Route Methods

Common route methods include:

- `app.get()`
- `app.post()`
- `app.put()`
- `app.patch()`
- `app.delete()`

```js
app.get('/courses', (_req, res) => {
  res.json([{ id: 1, title: 'Node.js' }])
})
```

## Route Parameters

```js
app.get('/courses/:courseId', (req, res) => {
  res.json({ courseId: req.params.courseId })
})
```

Teach learners to think carefully about:

- naming params clearly
- validating params
- converting params to numbers only when appropriate

## Query Parameters

```js
app.get('/search', (req, res) => {
  res.json({ q: req.query.q, page: req.query.page })
})
```

Query values often arrive as strings. Students should not assume typed values automatically.

## Request Body Parsing

```js
app.post('/courses', (req, res) => {
  res.status(201).json({ received: req.body })
})
```

`express.json()` parses JSON request bodies, but parsing is not validation.

## Response Helpers

Express provides helpers like:

- `res.json()`
- `res.send()`
- `res.status()`
- `res.sendFile()`
- `res.redirect()`

### Teaching point

Students should understand the behavior of each helper rather than using them interchangeably.

## Routers

Routers help structure applications.

```js
import { Router } from 'express'

const courseRouter = Router()

courseRouter.get('/', (_req, res) => {
  res.json([])
})
```

This supports modular API organization.

## URL Design

Good route design usually favors:

- nouns over vague verbs
- consistent pluralization
- stable resource identifiers
- clear nesting only when it adds meaning

## Common Mistakes

- putting too much work directly in route handlers
- assuming query or param values are already the right type
- skipping router structure until the codebase becomes messy
- mixing response helpers without understanding content behavior
- treating parsed JSON as validated input

## Practice Ideas

- build a course router with list, detail, create, update, and delete routes
- compare route params and query params in a search API
- create one route that returns JSON and one that returns plain text
- refactor a large app file into multiple routers

## What To Remember

- Express routing is simple, but it should still stay disciplined
- request params, query values, and bodies must be treated carefully
- routers are a structure tool, not just a style preference
- response helpers should be used intentionally
- routing is only the start of application design
