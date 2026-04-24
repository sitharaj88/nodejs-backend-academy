---
title: Runtime Validation and Node.js Integration
slug: learning/typescript/runtime-validation-nodejs-integration
description: Learn where TypeScript stops, how runtime validation works, and how to use TypeScript safely with Node.js APIs, environment variables, HTTP requests, databases, and external input.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="24 min" track="TypeScript" prerequisites="Unions & Narrowing, Node.js basics, Express or Fastify" />

This page covers one of the most important truths in TypeScript:

TypeScript does not validate runtime data by itself.

If a request body, environment variable, database record, or third-party API response is wrong, the compiler cannot save you at runtime.

<Objectives>
- Draw the line between compile-time types and runtime validation for every inbound boundary
- Accept external data as `unknown`, narrow once, and hand a trusted type to the rest of the system
- Parse and validate environment variables at startup, not scattered through the app
- Separate transport shapes, validation shapes, domain models, and persistence rows
- Build an HTTP handler where typed DTOs and runtime schemas stay in sync
</Objectives>

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

<Callout type="tip" title="Fail fast at startup">
Parse the entire config object once at boot. If anything is missing or malformed, log a clear message and exit with code 1. A process that starts only to crash on the first request wastes an incident pager cycle.
</Callout>

<Compare badLabel="Trust the types, crash at runtime" goodLabel="Parse once, use a trusted object">
<Fragment slot="bad">
```ts
app.post('/users', async (req, res) => {
  const body = req.body as { email: string; age: number }
  await users.create(body) // body.age might be '30' from JSON
  res.json({ ok: true })
})
```
The cast lies; a string `age` silently breaks downstream comparisons.
</Fragment>
<Fragment slot="good">
```ts
function parseCreateUser(raw: unknown): { email: string; age: number } {
  if (!raw || typeof raw !== 'object') throw new ValidationError('body')
  const r = raw as Record<string, unknown>
  if (typeof r.email !== 'string' || !r.email.includes('@')) throw new ValidationError('email')
  if (typeof r.age !== 'number' || !Number.isInteger(r.age)) throw new ValidationError('age')
  return { email: r.email, age: r.age }
}

app.post('/users', async (req, res) => {
  const body = parseCreateUser(req.body)
  await users.create(body)
  res.json({ ok: true })
})
```
One choke point checks the payload; everything after it is a real object.
</Fragment>
</Compare>

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

## Pitfalls

<Pitfall title="`as` masquerading as validation">
`const user = JSON.parse(body) as User` compiles and crashes when `body` is `null`, a number, or an object missing `email`. **Fix:** start at `unknown`, run a real guard or schema parser (Zod, Valibot, ajv, typia), and only then hand the trusted object downstream.
</Pitfall>

<Pitfall title="Config objects built from scattered `process.env` reads">
`process.env.PORT` in one file, `process.env.PORT ?? '3000'` in another — two sources of truth drift. **Fix:** one `loadConfig()` function at boot, one `Config` object passed around as a dependency, no direct `process.env` reads elsewhere.
</Pitfall>

<Pitfall title="Trusting the database client's types blindly">
Prisma says `user.email` is `string`, but an older row has `null` because the column was later made required. **Fix:** treat legacy data as `unknown` at the read boundary; validate shapes before business logic relies on them.
</Pitfall>

<Callout type="info" title="Schema-first projects get types for free">
Libraries like Zod, Valibot, and typia let you define a runtime schema and derive the TypeScript type from it. One source of truth, always in sync, with a typed error on invalid input.
</Callout>

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

## Lab

<Lab title="Validate config, body, and third-party response" duration="50 min" difficulty="Medium" stack="Node.js, Express or Fastify, Zod (or a hand-written guard)">

### Goal
Take a service that trusts everything and add three validation seams: startup config, inbound request body, and outbound API response.

### Steps
1. Write `loadConfig(env: NodeJS.ProcessEnv): AppConfig` that validates `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV`. Fail fast if anything is missing.
2. Replace `req.body as CreateUser` on `POST /users` with a real parser that returns `CreateUser` or throws a `ValidationError`.
3. Wrap an external `fetchCourses()` call so the JSON is parsed from `unknown`, validated against a schema, and then handed back as `readonly Course[]`.
4. Add a unit test that pipes invalid JSON through each seam and confirms the error path, not a crash.
5. Log validation failures with the field name and rule — not the raw body — to avoid leaking secrets.

### Success criteria
- No `as` assertion in any of the three seams
- Missing `JWT_SECRET` exits the process at boot with a clear message
- A bad request body returns `422` with a structured error, not `500`
- The external API test can flip one field to the wrong type and the client raises a typed error

</Lab>

## Checkpoint

<Checkpoint>
1. Why is `const body = req.body as CreateUser` almost always wrong?
2. What does accepting external data as `unknown` force you to do that accepting it as `any` does not?
3. Name two kinds of data that look typed but should be treated as untrusted at read time.
4. Why is it better to validate environment variables at startup than lazily on first use?
5. When should a runtime validation library derive the TypeScript type, and when is a hand-written guard fine?
</Checkpoint>

## Further reading

- [Unions, Narrowing, and Type Guards](/learning/typescript/unions-narrowing-type-guards/) — the guards that back these boundaries
- [tsconfig, Modules, and Declaration Files](/learning/typescript/tsconfig-modules-declaration-files/) — the strict flags that surface unvalidated access
- [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/) — `Result<T, E>` to model validation outcomes explicitly
- [Modern TypeScript Coverage](/learning/typescript/modern-typescript-coverage/) — where runtime validation fits in the bigger picture
