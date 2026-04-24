---
title: Validation and Error Handling
slug: learning/nodejs/express/validation-error-handling
description: Learn request validation, DTO boundaries, async error handling, custom errors, and consistent error response design in Express applications.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="20 min" track="Express" prerequisites="Middleware, async/await, JSON" />

Validation and error handling are where an Express API becomes either reliable or chaotic.

<Objectives>
- Validate request bodies with a schema before any business logic sees them
- Design one consistent error response shape for the whole API
- Throw typed domain errors and let central middleware format them
- Ensure async errors reach error middleware even on Express 4
</Objectives>

## Validation Is a Boundary

Incoming requests are untrusted.

Validation should check:

- required fields
- types and formats
- lengths and ranges
- domain-specific rules

<KeyConcept title="Validation transforms `any` into a typed, safe value">
A good schema validator (zod, valibot, joi) both rejects invalid input *and* returns a typed, narrowed object. After the validation boundary, your code works with trusted data — not `req.body`.
</KeyConcept>

## DTO Thinking

Students should separate:

- raw request input
- validated DTOs
- domain models
- persistence models

This keeps route code cleaner and prevents accidental coupling.

## Validation Middleware Example

```js
function validateCreateCourse(req, res, next) {
  const { title, durationWeeks } = req.body

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' })
  }

  if (typeof durationWeeks !== 'number') {
    return res.status(400).json({ error: 'durationWeeks must be a number' })
  }

  next()
}
```

## Why Parsing Is Not Validation

`express.json()` only gives you a JavaScript object. It does not prove that the object is structurally correct or safe for domain logic.

<Compare badLabel="Inline, ad-hoc checks" goodLabel="Schema at the edge">
<Fragment slot="bad">
```js
app.post('/courses', async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'no title' })
  if (req.body.title.length > 200) return res.status(400).json({ error: 'too long' })
  if (typeof req.body.durationWeeks !== 'number') return res.status(400).json({ error: 'bad weeks' })
  // ... now the real work
})
```
Every route reinvents the wheel; error shapes drift; nothing reusable.
</Fragment>
<Fragment slot="good">
```js
const CreateCourse = z.object({
  title: z.string().min(1).max(200),
  durationWeeks: z.number().int().positive(),
})

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return next(new ValidationError(result.error.issues))
  req.body = result.data
  next()
}

app.post('/courses', validate(CreateCourse), asyncHandler(createCourse))
```
One pattern, one error shape, typed data downstream.
</Fragment>
</Compare>

## Error Categories

Useful categories include:

- validation errors
- authentication errors
- authorization errors
- not found errors
- conflict errors
- infrastructure errors
- programmer errors

## Custom Error Classes

```js
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}
```

Custom errors make error intent clearer than raw `Error` objects everywhere.

## Central Error Middleware

```js
app.use((err, _req, res, _next) => {
  const status = err.statusCode ?? 500
  res.status(status).json({
    error: err.message ?? 'Internal server error',
  })
})
```

This creates one consistent boundary for failure formatting.

<Callout type="info" title="One shape, forever">
Settle on `{ error: <CODE>, message?: string, details?: unknown }` on day one. Clients build retry logic around it; changing it later is a breaking API change.
</Callout>

## Async Error Flow

Async route handlers need a clear strategy.

If errors are thrown inside async handlers, the application design must ensure they reach the error middleware consistently.

<Callout type="warn" title="Express 4 async gotcha">
In Express 4, an unhandled rejection inside an `async` handler never reaches your error middleware — it becomes a process-level unhandled rejection. Use a `Promise.resolve(fn(...)).catch(next)` wrapper or upgrade to Express 5.
</Callout>

## Avoid Leaking Internals

Clients should get useful error messages, but not raw stack traces, SQL details, or internal infrastructure secrets.

## Error Response Consistency

Good APIs use a predictable error shape.

For example:

```json
{
  "error": "title is required"
}
```

or a slightly richer structure when needed.

## Common Pitfalls

<Pitfall title="Validation after a DB hit">
A route queries the DB with `req.body.userId`, then validates. A malformed body triggers a SQL error with an ugly 500. **Fix:** put validation *before* any I/O. No DB call should see unvalidated input.
</Pitfall>

<Pitfall title="Different error shape per route">
`/users` returns `{ error: '...' }`, `/orders` returns `{ message: '...' }`, `/auth` returns `{ code, error }`. Client code grows branches for every shape. **Fix:** one central error middleware; individual handlers throw typed errors, never format.
</Pitfall>

<Pitfall title="Leaking stack traces in production">
A SQL error propagates, your error middleware sends `err.stack`. The response reveals schema names and library versions. **Fix:** send a sanitized message in production; log the full error server-side with the request ID.
</Pitfall>

## Common Mistakes

- trusting request bodies too early
- mixing validation logic with persistence logic
- returning different error shapes from different routes
- exposing raw internal error details to clients
- swallowing async errors or handling them inconsistently

## Practice Ideas

- build validation middleware for a course creation route
- add custom `NotFoundError` and `ValidationError` classes
- centralize error formatting for the whole app
- compare a route with inline validation versus one using middleware and services

## Lab

<Lab title="One error shape for the whole API" duration="50 min" difficulty="Medium" stack="Node.js 22+, Express, zod, supertest">

### Goal
Take an Express API with inconsistent error handling and refactor it to use schema validation at the edge plus one central error middleware.

### Steps
1. Install zod. Define `CreateUser`, `CreateCourse`, and `CreateEnrollment` schemas.
2. Write a `validate(schema)` middleware that replaces `req.body` with parsed data on success, or calls `next(new ValidationError(issues))` on failure.
3. Define `ValidationError`, `NotFoundError`, `ConflictError`, `AuthError` with a `code` and `statusCode`.
4. Add one error middleware that formats every error into `{ error: code, message, details? }`. In production, omit stack traces.
5. Write supertest cases: 422 with field-level details, 404 with `NOT_FOUND`, 409 with `CONFLICT`, 500 with no internal details leaked.

### Success criteria
- Every error response matches one documented shape
- Validation never happens after I/O
- Production responses do not contain stack traces or SQL text
- Tests fail loudly if a route bypasses validation

</Lab>

## Checkpoint

<Checkpoint>
1. Why is `express.json()` not validation, even for well-behaved clients?
2. You see a route that queries the DB and then checks `if (!req.body.email)`. Name two concrete risks.
3. What is the minimum signature for error middleware in Express, and why does the signature matter?
4. How do you make sure an async handler's thrown error reaches the error middleware on Express 4?
5. A client asks to rely on `error.code` for retry logic. Why is that safer than relying on `error.message`?
</Checkpoint>

## Further reading

- [Middleware and Request Lifecycle](/learning/nodejs/express/middleware-request-lifecycle/)
- [Auth, Security, and API Hardening](/learning/nodejs/express/auth-security-api-hardening/)
- [Databases, Validation, and Auth](/learning/nodejs/databases-validation-auth/)
