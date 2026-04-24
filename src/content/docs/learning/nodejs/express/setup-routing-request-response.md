---
title: Setup, Routing, and Request-Response Flow
slug: learning/nodejs/express/setup-routing-request-response
description: Learn Express app setup, routers, route params, query strings, request bodies, and response helpers.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'
import Diagram from '../../../../../components/Diagram.astro'

<LessonMeta level="Beginner" duration="20 min" track="Express" prerequisites="Node.js HTTP basics, JSON, async/await" />

Express becomes much easier when learners understand that it is fundamentally a thin routing and middleware layer over the Node.js HTTP server model.

<Objectives>
- Set up an Express app with JSON parsing and a body-size limit
- Use route params, query strings, and bodies without assuming their types
- Split a monolithic app into routers without changing behavior
- Pick the right response helper (`json`, `send`, `sendFile`, `redirect`) for each case
</Objectives>

## The request lifecycle

<Diagram caption="A request flows through transport parsing, global and router-level middleware, handler logic, and a response — or into the error pipeline if something throws.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Express request lifecycle">
    <defs>
      <marker id="ex-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <g text-anchor="middle">
        <rect x="10" y="80" width="96" height="40" rx="6" fill="#e9f4fb" stroke="#087ea4" />
        <text x="58" y="96" font-weight="700">socket</text>
        <text x="58" y="112" font-size="10" fill="#596579">HTTP parse</text>

        <rect x="126" y="80" width="110" height="40" rx="6" fill="#dff5e5" stroke="#2f8f46" />
        <text x="181" y="96" font-weight="700">global mw</text>
        <text x="181" y="112" font-size="10" fill="#596579">json, cors, log</text>

        <rect x="256" y="80" width="110" height="40" rx="6" fill="#dff5e5" stroke="#2f8f46" />
        <text x="311" y="96" font-weight="700">router mw</text>
        <text x="311" y="112" font-size="10" fill="#596579">auth, validate</text>

        <rect x="386" y="80" width="110" height="40" rx="6" fill="#fef3d7" stroke="#b7791f" />
        <text x="441" y="96" font-weight="700">handler</text>
        <text x="441" y="112" font-size="10" fill="#596579">domain work</text>

        <rect x="516" y="80" width="110" height="40" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
        <text x="571" y="96" font-weight="700">response</text>
        <text x="571" y="112" font-size="10" fill="#596579">status + body</text>

        <rect x="256" y="170" width="240" height="40" rx="6" fill="#fde4e1" stroke="#b42318" />
        <text x="376" y="186" font-weight="700">error middleware</text>
        <text x="376" y="202" font-size="10" fill="#596579">(err, req, res, next) =&gt; json</text>
      </g>
      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#ex-arrow)">
        <path d="M106 100 L126 100" />
        <path d="M236 100 L256 100" />
        <path d="M366 100 L386 100" />
        <path d="M496 100 L516 100" />
        <path d="M311 120 L311 170" stroke="#b42318" stroke-dasharray="4 3" />
        <path d="M441 120 L441 170" stroke="#b42318" stroke-dasharray="4 3" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Routing is middleware with a shape">
`app.get('/users', handler)` is just a middleware that runs when the method and path match. Everything else — `app.use`, `router.use`, error middleware — follows the same `(req, res, next)` contract.
</KeyConcept>

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

<Callout type="warn" title="`req.query` is not typed input">
`req.query.page` is a `string | string[] | undefined`. Treating it as `number` silently produces `NaN`. Parse explicitly, or better, validate with a schema.
</Callout>

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

<Compare badLabel="One big `app.js`" goodLabel="Routers per resource">
<Fragment slot="bad">
```js
// app.js
app.get('/courses', ...)
app.post('/courses', ...)
app.get('/courses/:id', ...)
app.get('/users', ...)
app.post('/users', ...)
// ... 300 lines later ...
app.post('/users/:id/enrollments', ...)
```
Merges are painful, auth rules leak across resources, testing is all-or-nothing.
</Fragment>
<Fragment slot="good">
```js
// routes/courses.js
const router = Router()
router.get('/', list)
router.post('/', create)
router.get('/:id', detail)
export default router

// app.js
app.use('/courses', coursesRouter)
app.use('/users', usersRouter)
```
Each resource owns its routes, its middleware, and its tests.
</Fragment>
</Compare>

This supports modular API organization.

## URL Design

Good route design usually favors:

- nouns over vague verbs
- consistent pluralization
- stable resource identifiers
- clear nesting only when it adds meaning

## Common Pitfalls

<Pitfall title="`parseInt(req.params.id)` with no validation">
A request for `/courses/abc` gives you `NaN` as an id and a weird SQL error downstream. **Fix:** validate param types at the router edge — either with a schema or with a `Number.isInteger` guard that returns `400` on miss.
</Pitfall>

<Pitfall title="Forgetting a body-size limit">
`app.use(express.json())` uses the default 100 kB. A forgotten limit on an upload endpoint accepts 50 MB of JSON and pins memory. **Fix:** set `express.json({ limit: '100kb' })` explicitly and pick per-route limits where justified.
</Pitfall>

<Pitfall title="Mounting a router at the wrong path">
`app.use(coursesRouter)` (missing `/courses`) routes `GET /` to `list`, not `GET /courses`. **Fix:** always mount routers at a path prefix; keep the prefix string next to the import for readability.
</Pitfall>

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

## Lab

<Lab title="Build a `/courses` router" duration="45 min" difficulty="Easy" stack="Node.js 22+, Express 4, supertest">

### Goal
Ship a small resource API (`/courses`) split into a router, with typed param handling and a consistent response shape.

### Steps
1. Create `src/routes/courses.js` exporting a `Router` with `list`, `create`, `detail`, `update`, and `remove` endpoints.
2. Mount at `app.use('/courses', coursesRouter)`. Keep `app.js` under 30 lines.
3. Parse `:courseId` as an integer; reject non-integers with `400 { error: 'INVALID_ID' }`.
4. Apply `express.json({ limit: '50kb' })` app-wide; return `413` consistently when oversized.
5. Write supertest cases for: list empty, create valid, create invalid (missing title), detail not found, oversized body rejected.

### Success criteria
- Every route returns JSON with a documented shape
- Invalid params never reach business logic
- Oversized bodies return `413`, not `500`
- The router file is testable in isolation

</Lab>

## Checkpoint

<Checkpoint>
1. What type is `req.params.userId` by default? What happens if you pass it straight into a DB query expecting an integer?
2. You add `app.use('/api', router)` and `router.get('/users')`. What URL serves the handler?
3. Give two reasons to split routes into `Router` objects instead of a single file.
4. When should you prefer `res.send` over `res.json`?
5. A client sends a 10 MB JSON body to your signup endpoint. What status does Express return by default, and what status do you *want*?
</Checkpoint>

## Further reading

- [Middleware and Request Lifecycle](/learning/nodejs/express/middleware-request-lifecycle/)
- [Validation and Error Handling](/learning/nodejs/express/validation-error-handling/)
- [HTTP Server, APIs, and Express](/learning/nodejs/http-server-apis-express/)
