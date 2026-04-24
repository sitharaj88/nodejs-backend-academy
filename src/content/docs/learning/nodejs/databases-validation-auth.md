---
title: Databases, Validation, and Auth
slug: learning/nodejs/databases-validation-auth
description: Learn how Node.js applications interact with databases, validate input, model service boundaries, and implement authentication and authorization safely.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="Node.js" prerequisites="HTTP basics, Express fundamentals, async/await" />

Node.js applications rarely exist in isolation. They sit between clients, data stores, and identity systems.

<Objectives>
- Put database access behind a repository boundary instead of into route handlers
- Validate request bodies at runtime, separately from TypeScript types
- Distinguish authentication, authorization, and ownership checks
- Hash passwords correctly and design token lifecycles that tolerate theft
</Objectives>

## Database Access Is a Boundary

Database code should not be treated as a detail hidden under random route handlers.

A healthy structure separates:

- request handling
- validation
- domain logic
- data access

<KeyConcept title="Types protect the code; validation protects the runtime">
TypeScript types are erased at runtime. A request body is `any` until you prove otherwise. Validation produces a typed, safe value — it is the gate that turns untrusted input into trusted data.
</KeyConcept>

## Common Database Patterns

Node.js backends often work with:

- SQL databases
- document databases
- caches
- queues and event stores

The precise database is less important here than the boundary discipline.

## Input Validation

Validation should happen before business logic trusts user input.

Check:

- required fields
- types and formats
- ranges and limits
- domain rules

### Teaching point

Validation is not the same as typing. Types help your code. Validation protects your runtime from outside data.

## DTOs Versus Domain Models

Students should learn to distinguish:

- request DTOs
- response DTOs
- domain entities
- persistence models

This separation prevents data-layer assumptions from leaking everywhere.

<Compare badLabel="One shape leaks everywhere" goodLabel="Distinct shapes per layer">
<Fragment slot="bad">
```ts
app.post('/users', async (req, res) => {
  const user = await db.users.insert(req.body) // any -> row
  res.json(user) // leaks `password_hash`, `created_at` ints, etc.
})
```
Request, domain, and persistence are all the same object. Accidental leaks are a feature.
</Fragment>
<Fragment slot="good">
```ts
const CreateUser = z.object({ email: z.string().email(), password: z.string().min(12) })

app.post('/users', async (req, res) => {
  const dto = CreateUser.parse(req.body)                  // request DTO
  const user = await users.create(dto)                    // domain entity
  res.status(201).json({ id: user.id, email: user.email }) // response DTO
})
```
Each layer shapes its own data. No field leaks by accident.
</Fragment>
</Compare>

## Authentication

Authentication answers: who is this user?

Common mechanisms include:

- sessions
- JWT-based systems
- OAuth-backed identity flows

Teach the difference between proving identity and authorizing actions.

## Authorization

Authorization answers: what may this user do?

Examples:

- admin can manage cohorts
- trainer can publish lessons
- student can only access enrolled course content

Role checks alone are often not enough. Real applications usually need ownership and resource-level rules too.

## Password Handling

Never store raw passwords.

Students should understand:

- hashing
- salting
- credential verification
- account lockout and rate-limiting awareness

<Callout type="warn" title="`bcrypt.hashSync` blocks the loop">
A 120 ms `bcrypt.hashSync` inside a signup handler freezes every in-flight request on the same process. Use an async variant — or better, `argon2` — and let the work run on libuv's thread pool.
</Callout>

## Secure Session and Token Thinking

Learners should recognize the operational concerns around:

- token expiry
- refresh logic
- secure cookie configuration
- replay and theft risk

<Callout type="info" title="Short-lived access, long-lived refresh, rotating on use">
A common, defensible pattern: 15-minute access tokens, 30-day refresh tokens, refresh tokens rotated on every use with reuse-detection. A stolen refresh token is usable once before the legitimate user's next refresh invalidates it.
</Callout>

## Query Discipline

Database code should be deliberate about:

- parameterization
- transactions
- pagination
- indexing awareness
- avoiding N+1 query patterns

## Error Boundaries

Database failures, auth failures, and validation failures should not all look identical.

A well-designed backend returns consistent but meaningful error categories.

## Common Pitfalls

<Pitfall title="SQL string concatenation">
A repository builds `SELECT ... WHERE email = '${email}'`. A crafted email like `' OR 1=1 --` dumps the users table. **Fix:** always use parameterized queries — placeholders via the driver, never string interpolation.
</Pitfall>

<Pitfall title="403 where 404 should be">
An authenticated user sees `403 Forbidden` for a resource they do not own. They now know the resource exists. **Fix:** for sensitive resources, return `404 Not Found` regardless of whether the record exists but belongs to someone else.
</Pitfall>

<Pitfall title="Storing JWTs in `localStorage`">
An XSS bug in one React route exfiltrates every user's token. **Fix:** prefer `HttpOnly`, `Secure`, `SameSite=Lax` cookies for session tokens, and keep CSRF protection on state-changing routes.
</Pitfall>

## Common Mistakes

- doing database work directly inside route handlers without service boundaries
- treating TypeScript types as a substitute for runtime validation
- storing passwords incorrectly
- collapsing authentication and authorization into one vague concept
- returning raw database errors to clients

## Practice Ideas

- design a request DTO and a separate domain model for course enrollment
- implement validation before a fake persistence layer call
- model role-based and ownership-based authorization checks
- compare a bad route handler with a layered service approach

## Lab

<Lab title="Layered `POST /courses/:id/enrollments`" duration="60 min" difficulty="Medium" stack="Node.js 22+, Express, zod, Postgres or SQLite">

### Goal
Build one endpoint with explicit layers: validation, domain service, repository, and auth — then prove each layer catches its own class of bug.

### Steps
1. Define a zod schema for the request body and reject invalid payloads with `422` and a structured details array.
2. Write an `EnrollmentsRepo` with a parameterized `insert` and a unique constraint on `(courseId, userId)`.
3. Write an `EnrollmentsService` that checks course publishing state and user ownership before calling the repo.
4. Add auth middleware that populates `req.user`; add an authorization check that rejects enrolling for a different user with `404` (not `403`).
5. Write three tests: invalid payload, duplicate enrollment (expect 409), cross-user enrollment (expect 404).

### Success criteria
- Each error case returns the right status and a consistent body shape
- The service layer is callable without `req`/`res`
- SQL for the repo uses parameters only; string interpolation on user data fails review
- Hashing and token work does not run synchronously on the loop

</Lab>

## Checkpoint

<Checkpoint>
1. Why are TypeScript types alone insufficient to protect a backend from a malicious request body?
2. An admin can edit any user; a regular user can only edit themselves. Which layer enforces which rule?
3. Why might returning `404` be safer than `403` for an unauthorized read?
4. Name two problems `bcrypt.hashSync` causes in a busy API and one replacement.
5. A refresh-token rotation scheme detects that the same token was used twice. What action should the server take, and why?
</Checkpoint>

## Further reading

- [Express Validation and Error Handling](/learning/nodejs/express/validation-error-handling/)
- [Express Auth, Security, and API Hardening](/learning/nodejs/express/auth-security-api-hardening/)
- [Testing, Debugging, and Error Handling](/learning/nodejs/testing-debugging-error-handling/)
