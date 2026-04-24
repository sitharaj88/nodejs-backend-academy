---
title: Layered Architecture and Boundaries
slug: learning/architecture/layered-architecture-and-boundaries
description: Learn layered backend architecture, boundary placement, DTO and domain separation, and how to keep responsibilities clear in growing services.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Intermediate" duration="24 min" track="Architecture" prerequisites="Express, TypeScript, a relational database" />

Layered architecture is the first maintainable step beyond route-handler sprawl. Done well, it is boring in the best way: every new feature lands in the same three or four files, reviewers know exactly where to look, and you can swap a database or a framework without rewriting your business rules. Done badly, it is cement — thin pass-through classes, DTOs that mirror tables, and a "service layer" that is really just a second controller.

<Objectives>
- Identify the four canonical layers and what each one is allowed to import
- Separate request DTOs from domain models with intent
- Wire dependencies through constructors, not module-level globals
- Spot anaemic services and leaky abstractions in code review
</Objectives>

## Mental model

<Diagram caption="Each layer depends only on the layer directly below. Requests flow down; results flow back up.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Layered architecture">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="40" y="20" width="560" height="36" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="60" y="43" font-weight="800">Transport (Express routes, validators, serializers)</text>
      <text x="580" y="43" text-anchor="end" font-size="11" fill="#596579">HTTP, JSON, Zod</text>

      <rect x="40" y="66" width="560" height="36" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="60" y="89" font-weight="800">Application / Use cases (services, orchestration)</text>
      <text x="580" y="89" text-anchor="end" font-size="11" fill="#596579">pure workflow</text>

      <rect x="40" y="112" width="560" height="36" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="60" y="135" font-weight="800">Domain (entities, value objects, invariants)</text>
      <text x="580" y="135" text-anchor="end" font-size="11" fill="#596579">no I/O</text>

      <rect x="40" y="158" width="560" height="36" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="60" y="181" font-weight="800">Infrastructure (repos, clients, queues, email)</text>
      <text x="580" y="181" text-anchor="end" font-size="11" fill="#596579">drivers</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="The layer is defined by what it is allowed to import">
Transport imports application. Application imports domain. Domain imports **nothing** from the other three. Infrastructure implements interfaces the domain or application layer declared. If a file in `/domain` does `import { Pool } from 'pg'`, the layering is already broken.
</KeyConcept>

## A small slice, layer by layer

One feature, four files, honest contracts at every seam. Stack: Node.js + TypeScript + Express + Postgres.

### Domain

```ts
// src/users/domain/user.ts
export type UserId = string & { readonly __brand: 'UserId' }

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly email: string,
    public readonly createdAt: Date,
  ) {}

  static create(input: { id: UserId; email: string; now: Date }): User {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
      throw new DomainError('INVALID_EMAIL')
    }
    return new User(input.id, input.email.toLowerCase(), input.now)
  }
}

export class DomainError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code)
  }
}
```

The domain module imports `Date`. That is it. No Express, no `pg`, no Zod.

### Application

```ts
// src/users/application/register-user.ts
import { randomUUID } from 'node:crypto'
import { User, UserId, DomainError } from '../domain/user'

export interface UsersRepo {
  findByEmail(email: string): Promise<User | null>
  insert(user: User): Promise<void>
}

export interface Clock { now(): Date }
export interface Emailer { sendWelcome(email: string): Promise<void> }

export class EmailTakenError extends Error { code = 'EMAIL_TAKEN' }

export class RegisterUser {
  constructor(private repo: UsersRepo, private clock: Clock, private emailer: Emailer) {}

  async run(input: { email: string }): Promise<User> {
    const existing = await this.repo.findByEmail(input.email)
    if (existing) throw new EmailTakenError()
    const user = User.create({
      id: randomUUID() as UserId,
      email: input.email,
      now: this.clock.now(),
    })
    await this.repo.insert(user)
    // Fire-and-forget is a choice — prefer an outbox in production.
    this.emailer.sendWelcome(user.email).catch(() => {})
    return user
  }
}
```

The use case declares its own ports (`UsersRepo`, `Clock`, `Emailer`). It does not import `pg` or `nodemailer` — those are infrastructure details the caller injects.

### Infrastructure

```ts
// src/users/infrastructure/users.repo.pg.ts
import { Pool } from 'pg'
import { User, UserId } from '../domain/user'
import type { UsersRepo } from '../application/register-user'

export class PgUsersRepo implements UsersRepo {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'select id, email, created_at from users where email = $1',
      [email.toLowerCase()],
    )
    if (!rows[0]) return null
    return rehydrate(rows[0])
  }

  async insert(user: User): Promise<void> {
    await this.pool.query(
      'insert into users (id, email, created_at) values ($1, $2, $3)',
      [user.id, user.email, user.createdAt],
    )
  }
}

function rehydrate(row: { id: string; email: string; created_at: Date }): User {
  // Bypass User.create — we trust the row; invariants were enforced on write.
  return Object.assign(Object.create(User.prototype), {
    id: row.id as UserId,
    email: row.email,
    createdAt: row.created_at,
  })
}
```

### Transport

```ts
// src/users/transport/users.routes.ts
import { Router } from 'express'
import { z } from 'zod'
import { RegisterUser, EmailTakenError } from '../application/register-user'
import { DomainError } from '../domain/user'

const Body = z.object({ email: z.string().email() })

export function usersRouter(deps: { register: RegisterUser }) {
  const r = Router()
  r.post('/users', async (req, res, next) => {
    const parsed = Body.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({ error: 'VALIDATION_FAILED', details: parsed.error.issues })
    }
    try {
      const user = await deps.register.run(parsed.data)
      res.status(201).json({ id: user.id, email: user.email })
    } catch (e) {
      if (e instanceof EmailTakenError) return res.status(409).json({ error: e.code })
      if (e instanceof DomainError) return res.status(422).json({ error: e.code })
      next(e)
    }
  })
  return r
}
```

### Composition root

```ts
// src/main.ts
import express from 'express'
import { Pool } from 'pg'
import { PgUsersRepo } from './users/infrastructure/users.repo.pg'
import { RegisterUser } from './users/application/register-user'
import { usersRouter } from './users/transport/users.routes'
import { SmtpEmailer } from './shared/infrastructure/emailer.smtp'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const repo = new PgUsersRepo(pool)
const register = new RegisterUser(repo, { now: () => new Date() }, new SmtpEmailer())

const app = express().use(express.json())
app.use(usersRouter({ register }))
app.listen(3000)
```

One file — `main.ts` — knows about every concrete implementation. Everything else depends on interfaces.

## DTO vs domain model

A DTO is shaped by a wire protocol. A domain entity is shaped by the invariants you must protect. Merging them means one of them is lying.

<Compare badLabel="Same type in wire and domain" goodLabel="Separate shapes, explicit mapping">
<Fragment slot="bad">
```ts
// Shared everywhere, including the request body
export interface User {
  id: string
  email: string
  password_hash: string // leaks to clients by accident
  createdAt: string     // string because JSON
}
app.post('/users', async (req, res) => {
  const user: User = req.body // trust, but why?
  await repo.insert(user)
})
```
Now every serializer, validator, and UI component shares one type. Rename a column and the UI breaks.
</Fragment>
<Fragment slot="good">
```ts
// Wire
const RegisterBody = z.object({ email: z.string().email() })
export type RegisterBody = z.infer<typeof RegisterBody>

// Domain
export class User { /* as above, password_hash is private */ }

// Mapping is explicit, one place
function toResponse(u: User) {
  return { id: u.id, email: u.email, createdAt: u.createdAt.toISOString() }
}
```
Changing the table does not break the UI. Changing the UI does not reach the domain.
</Fragment>
</Compare>

## Dependency injection without a framework

You do not need InversifyJS or tsyringe. You need constructors.

<Compare badLabel="Module-level singletons" goodLabel="Injected collaborators">
<Fragment slot="bad">
```ts
// src/users/application/register-user.ts
import { pool } from '../../db' // module-level
import { sendWelcome } from '../../emailer'

export async function registerUser(email: string) {
  const existing = await pool.query('...', [email])
  if (existing.rowCount) throw new Error('taken')
  await pool.query('insert ...', [email])
  await sendWelcome(email)
}
```
Untestable without a real Postgres; impossible to swap `sendWelcome` for a fake.
</Fragment>
<Fragment slot="good">
```ts
export class RegisterUser {
  constructor(private repo: UsersRepo, private emailer: Emailer) {}
  async run(input: { email: string }) { /* ... */ }
}
```
Tests pass fakes. The real wiring happens once, in `main.ts`.
</Fragment>
</Compare>

<Callout type="info" title="Interfaces live with the consumer, not the provider">
`UsersRepo` belongs in `application/`, not `infrastructure/`. The use case declares what it needs; the adapter conforms. This is the "dependency inversion" half of SOLID — the D — and it is the single most useful layering rule.
</Callout>

## Error shapes at boundaries

A clean layer translates errors; it does not leak them.

```ts
// Bad: pg error bubbles to HTTP
try { await repo.insert(user) } catch (e) { res.status(500).json(e) }

// Good: domain errors are typed; infra errors are logged and hidden
try {
  await register.run({ email })
} catch (e) {
  if (e instanceof EmailTakenError) return res.status(409).json({ error: e.code })
  if (e instanceof DomainError) return res.status(422).json({ error: e.code })
  req.log.error({ err: e }, 'register.failed')
  return res.status(500).json({ error: 'INTERNAL' })
}
```

<Callout type="tip" title="Errors are part of the contract">
Document your error codes in one file. `EMAIL_TAKEN`, `VALIDATION_FAILED`, `UNAUTHENTICATED`. The UI and your SDK depend on these strings. Change them with the same care you would change a URL.
</Callout>

## Common pitfalls

<Pitfall title="Anaemic service layer">
Controllers that just call `service.doX(req.body)` and services that just call `repo.doX(body)`. Three files of indirection that add no behaviour. **Fix:** either the service holds real orchestration (validation, multiple repos, events) or it does not exist.
</Pitfall>

<Pitfall title="Leaking ORM types upward">
`getUsers(): Promise<Prisma.UserGetPayload<...>>` in your service signature. Now every caller transitively depends on Prisma. **Fix:** return domain types or plain objects; convert at the infrastructure edge.
</Pitfall>

<Pitfall title="Transactions spanning layers invisibly">
A service calls two repos, each opening its own connection. A half-successful write corrupts state. **Fix:** pass a `UnitOfWork` or transaction handle explicitly: `repo.insert(user, tx)`. The application layer owns the boundary.
</Pitfall>

<Pitfall title="Request object used as a parameter type">
`function register(req: Request)` in the application layer. Framework change = full rewrite. **Fix:** application takes plain `{ email: string }`. Transport parses and forwards.
</Pitfall>

## Lab

<Lab title="Refactor a route-handler monolith into four layers" duration="75 min" difficulty="Medium" stack="Node.js, TypeScript, Express, Postgres, Vitest">

### Goal
Take a provided 300-line `routes.ts` file that contains validation, SQL, email sending, and business rules in one handler. Split it into `transport/`, `application/`, `domain/`, and `infrastructure/`, with unit tests that do not touch Postgres.

### Steps
1. Identify every external dependency the handler uses (`pool`, `sendgrid`, `stripe`, `req.body`).
2. Create a `domain/` module with the core entities and invariants. No I/O.
3. Extract the workflow into an application class that takes its collaborators as constructor arguments.
4. Move the raw SQL and third-party SDK calls into `infrastructure/` adapters that implement ports declared in `application/`.
5. Thin the Express route to: parse body, call the use case, map errors to status codes, serialize response.
6. Write two tests: a unit test for the use case with in-memory fakes, and an API test that hits the route.

### Success criteria
- `grep -r "from 'pg'" src/domain src/application` returns nothing
- Unit test for the use case runs in under 50 ms
- The route file is under 40 lines
- Swapping `PgUsersRepo` for an `InMemoryUsersRepo` requires changing only `main.ts`

</Lab>

## Checkpoint

<Checkpoint>
1. In layered architecture, which direction do dependencies point, and why does that direction matter for testability?
2. You see `import { Pool } from 'pg'` inside `src/domain/order.ts`. Name two problems this causes before the code even runs.
3. Your service returns a Prisma `User` type. A colleague wants to replace Prisma with Drizzle. What changes?
4. When is a three-line service method the right thing, and when is it pure noise?
5. Where should the interface `PaymentGateway` live — next to the Stripe adapter, or next to the `CheckoutUseCase` that consumes it? Why?
</Checkpoint>

## Further reading

- [Clean Architecture and Dependency Flow](/learning/architecture/clean-architecture-and-dependency-flow/) — inverting the arrows completely
- [Modular Monolith Patterns and Pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/) — when layers meet features
- [Unit, Integration, and API Testing](/learning/testing/unit-integration-api-testing/) — what each layer enables
