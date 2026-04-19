---
title: Runtime Validation and Node.js Integration
slug: learning/typescript/runtime-validation-nodejs-integration
description: Learn where TypeScript stops, how runtime validation works, and how to use TypeScript safely with Node.js APIs, environment variables, HTTP requests, databases, and external input.
---

This page covers one of the most important truths in TypeScript:

TypeScript does not validate runtime data by itself.

If a request body, environment variable, database record, or third-party API response is wrong, the compiler cannot save you at runtime.

## Compile-Time Versus Runtime

TypeScript checks your code before execution.

Runtime validation checks incoming values while the application is running.

You need both in real backend work.

## `JSON.parse()` Returns Unknown Reality

```ts
const raw = '{"name":"Ravi"}'
const parsed = JSON.parse(raw)
```

Even if the code compiles, the runtime data might not match the shape you expect.

## Safer Boundary Thinking

Treat these as unsafe boundaries:

- HTTP request bodies
- query parameters
- headers
- environment variables
- database results from untrusted sources
- message queues
- file input
- third-party APIs

## Parsing `unknown`

```ts
type StudentInput = {
  name: string
  batch: number
}

function isStudentInput(value: unknown): value is StudentInput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'batch' in value
  )
}
```

The pattern is simple:

1. accept `unknown`
2. validate it
3. continue with a trusted type

## Environment Variables

Environment variables are strings or undefined.

```ts
const port = Number(process.env.PORT ?? '3000')
```

Teach learners to validate configuration early during startup instead of scattering assumptions across the app.

## Express Request Typing

```ts
type CreateCourseBody = {
  title: string
  durationWeeks: number
}
```

Typing a request body is useful, but the body still needs runtime validation before business logic trusts it.

## DTOs and Domain Models

Separate:

- transport shapes
- validation shapes
- domain models
- persistence models

This keeps applications easier to reason about.

## Database Results

A database client may have TypeScript support, but the data can still be incomplete, migrated incorrectly, or inconsistent with business assumptions.

TypeScript helps represent expectations. Validation and business rules protect reality.

## Runtime Schemas

In real projects, learners will often use schema validation libraries. Even without choosing a specific library here, they should understand the workflow:

- define runtime validation rules
- derive or align static types
- reject bad input early

## Async Error Handling

TypeScript types do not prevent network timeouts, rejected promises, or external system failures.

Error handling remains a design responsibility.

## Node.js Built-In APIs

TypeScript works well with:

- `fs`
- `path`
- `http`
- streams
- timers
- `process`

But the type safety is only as useful as the assumptions around actual file paths, environment setup, and incoming data.

## API Client Example

```ts
type CourseDto = {
  id: string
  title: string
}

async function fetchCourses(): Promise<CourseDto[]> {
  const response = await fetch('https://example.com/api/courses')
  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('Expected an array response')
  }

  return data as CourseDto[]
}
```

This example teaches an important point: the `as CourseDto[]` is only safe if the preceding validation truly proves it.

## Common Mistakes

- trusting request bodies because the handler is typed
- assuming environment variables already have the right shape
- asserting external data without validating it
- mixing DTOs, domain models, and database shapes carelessly
- believing TypeScript eliminates runtime error handling

## Practice Ideas

- validate environment config during startup
- model an unsafe API response as `unknown` and narrow it safely
- separate request DTO types from domain entity types
- add typed request-body handling to one Express route and pair it with validation

## What To Remember

- TypeScript is not runtime validation
- untrusted input should begin as `unknown`
- typed handlers still need real validation
- environment variables deserve explicit parsing
- backend safety comes from combining types, validation, and error handling
