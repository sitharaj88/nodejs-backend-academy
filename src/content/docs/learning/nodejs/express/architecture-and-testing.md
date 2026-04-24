---
title: Architecture and Testing
slug: learning/nodejs/express/architecture-and-testing
description: Learn clean Express architecture, controller-service boundaries, dependency flow, test strategy, and how to keep APIs maintainable as they grow.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="Express" prerequisites="Routing, middleware, validation, DB basics" />

Many Express applications start simple and become messy because the structure never matures.

This page focuses on how to keep an Express codebase understandable as it grows.

<Objectives>
- Split responsibilities across router, controller, service, and repository
- Keep services callable without `req` and `res`
- Pick the right test layer for each behavior
- Recognise when structure is helping and when it is ceremony
</Objectives>

## Avoid Route-Handler God Functions

A route handler should usually coordinate, not contain the entire system.

Separate:

- routing concerns
- validation concerns
- business logic
- persistence logic
- response formatting when appropriate

<Compare badLabel="God handler" goodLabel="Layered">
<Fragment slot="bad">
```js
app.post('/courses', async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'no title' })
  const existing = await db.query('select ... where title = $1', [req.body.title])
  if (existing.rows.length) return res.status(409).json({ error: 'dup' })
  const slug = slugify(req.body.title)
  await db.query('insert into courses ...', [req.body.title, slug])
  await emailer.send('new-course', { title: req.body.title })
  return res.status(201).json({ title: req.body.title, slug })
})
```
Validation, persistence, domain logic, and side effects all tangled; untestable without an HTTP stack.
</Fragment>
<Fragment slot="good">
```js
// router
router.post('/courses', validate(CreateCourse), asyncHandler(controller.create))

// controller
export const create = async (req, res) => {
  const course = await coursesService.create(req.body)
  res.status(201).json(course)
}

// service (no req/res)
export const create = async (dto) => {
  if (await repo.findByTitle(dto.title)) throw new ConflictError('TITLE_TAKEN')
  const course = await repo.insert({ ...dto, slug: slugify(dto.title) })
  await emailer.send('new-course', course)
  return { id: course.id, title: course.title, slug: course.slug }
}
```
Each layer tests in isolation; service is a pure async function of DTO + dependencies.
</Fragment>
</Compare>

## Controller and Service Thinking

A common pattern is:

- router maps URLs to handlers
- controller coordinates request and response
- service contains business logic
- repository or data layer handles persistence

### Teaching point

This pattern is useful when it adds clarity. It should not become ceremony for tiny apps.

<KeyConcept title="Framework in, framework out; domain in the middle">
The outermost layer knows about Express. The innermost layer knows about SQL. Your domain logic — the thing you get paid for — knows neither. When Express or Postgres change, your domain code should not.
</KeyConcept>

## Dependency Flow

Dependencies should generally flow inward toward domain logic rather than scattering framework-specific objects everywhere.

For example, service layers should not need to know about `req` and `res`.

## Example Shape

Instead of:

- validate in controller
- query database in controller
- build domain rules in controller
- format response in controller

Prefer:

- controller reads validated input
- service applies domain logic
- repository handles persistence
- controller returns the result

## Testing Strategy

Express apps benefit from multiple testing layers:

- unit tests for pure services
- integration tests for routes and middleware
- API tests for full request-response behavior

## What to Test in Express

Important behaviors include:

- route success paths
- validation failures
- auth failures
- not found cases
- service errors
- response shape consistency

<Callout type="tip" title="Build the app with a factory">
Export `createApp({ db, logger, ... })`. Tests create a fresh app with test doubles; production creates one with real dependencies. This is the single biggest lever for testable Express code.
</Callout>

## Test-Friendly Design

Applications become easier to test when:

- services are separate from Express objects
- middleware is focused
- side effects are isolated
- configuration is injectable

## Common Pitfalls

<Pitfall title="Service layer depends on `req`">
`ordersService.create(req)` pulls body, user, and headers out of `req`. The service is untestable without a fake `req`, and coupled to HTTP. **Fix:** accept a plain DTO; let the controller extract from `req` once.
</Pitfall>

<Pitfall title="Over-mocked API tests">
Every API test mocks `db`, `cache`, `emailer`, `clock`. Tests pass; wrong SQL ships. **Fix:** keep API tests against a real test database (container or in-memory) and reserve mocks for outbound HTTP services.
</Pitfall>

<Pitfall title="Structure theatre">
A 150-line app gets router + controller + service + repository + mapper + DTO + schema for each endpoint. Devs disappear into folders looking for a `SELECT`. **Fix:** start with one file per feature. Add layers only when the feature grows.
</Pitfall>

## Common Mistakes

- packing all business logic into route handlers
- tying service layers directly to `req` and `res`
- writing only happy-path route tests
- creating structure so abstract that small changes feel heavy
- over-mocking until real behavior is never tested

## Practice Ideas

- refactor one large route into router, controller, service, and repository responsibilities
- write integration tests for validation and auth failures
- compare a tightly coupled Express design with a more testable one
- explain which parts of the code should remain framework-agnostic

## Lab

<Lab title="Layered refactor with three test layers" duration="75 min" difficulty="Medium" stack="Node.js 22+, Express, Vitest or node:test, Postgres (Testcontainers or local)">

### Goal
Refactor one god-handler route into router + controller + service + repository, and prove each layer with its own test.

### Steps
1. Pick a monolithic handler (or write one). Identify the validation, domain, and persistence concerns.
2. Extract a `repo` with only data access; extract a `service` that accepts a DTO and returns a plain object.
3. Add a `createApp({ service })` factory so tests inject fakes.
4. Write one unit test for the service (no DB), one integration test for the repo (real DB), one API test for the route (supertest + real DB).
5. Delete any code in the controller that is not "read validated input, call service, format response."

### Success criteria
- Service has no import of `express`, `req`, or `res`
- Repo has no import of `express`
- Removing validation middleware fails the API test but not the unit test
- Each test layer finishes in its own time budget: unit < 1s, integration seconds, API seconds

</Lab>

## Checkpoint

<Checkpoint>
1. What does a service layer gain by not importing from `express`?
2. Which test layer should catch a wrong column name in a `SELECT`?
3. Name a symptom of over-layered Express code. Name a symptom of under-layered Express code.
4. Why is `createApp({ deps })` more useful than importing a singleton `app`?
5. A teammate proposes mocking the DB in API tests to speed CI. What do you push back with?
</Checkpoint>

## Further reading

- [Testing, Debugging, and Error Handling](/learning/nodejs/testing-debugging-error-handling/)
- [Unit, Integration, and API Testing](/learning/testing/unit-integration-api-testing/)
- [Performance and Production Delivery](/learning/nodejs/express/performance-and-production-delivery/)
