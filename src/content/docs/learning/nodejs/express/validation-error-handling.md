---
title: Validation and Error Handling
slug: learning/nodejs/express/validation-error-handling
description: Learn request validation, DTO boundaries, async error handling, custom errors, and consistent error response design in Express applications.
---

Validation and error handling are where an Express API becomes either reliable or chaotic.

## Validation Is a Boundary

Incoming requests are untrusted.

Validation should check:

- required fields
- types and formats
- lengths and ranges
- domain-specific rules

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

## Async Error Flow

Async route handlers need a clear strategy.

If errors are thrown inside async handlers, the application design must ensure they reach the error middleware consistently.

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

## What To Remember

- validation is a trust boundary
- parsing JSON is not the same as validating it
- custom errors improve clarity
- central error middleware should create consistency
- error handling must be designed, not improvised
