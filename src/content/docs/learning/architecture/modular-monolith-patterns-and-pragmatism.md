---
title: Modular Monolith Patterns and Pragmatism
slug: learning/architecture/modular-monolith-patterns-and-pragmatism
description: Learn modular monolith design, internal boundaries, package-level separation, and why many systems should stay monolithic before splitting into services.
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

<LessonMeta level="Intermediate" duration="24 min" track="Architecture" prerequisites="Layered architecture, basic Node.js workspaces" />

A modular monolith is a single deployable that you could split up — but do not, yet, because the cost of distribution is higher than the cost of one more well-named folder. It is usually the correct answer for small and mid-sized teams. This page is how to build one that will not rot, and how to know when a module has earned the right to become a service.

<Objectives>
- Organise code by feature or capability, not by technical layer alone
- Enforce module boundaries with tooling, not goodwill
- Communicate between modules with internal events and typed contracts
- Extract a module to a service only when the seams are already clean
</Objectives>

## Mental model

<Diagram caption="Each module is internally layered; modules talk via a narrow public surface and an internal event bus.">
  <svg viewBox="0 0 640 240" role="img" aria-label="Modular monolith">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="20" width="180" height="200" rx="10" fill="#dff5e5" stroke="#2f8f46" />
      <text x="110" y="44" text-anchor="middle" font-weight="800">users</text>
      <text x="110" y="64" text-anchor="middle" font-size="11" fill="#596579">domain · app · infra</text>

      <rect x="230" y="20" width="180" height="200" rx="10" fill="#e9f4fb" stroke="#087ea4" />
      <text x="320" y="44" text-anchor="middle" font-weight="800">billing</text>
      <text x="320" y="64" text-anchor="middle" font-size="11" fill="#596579">domain · app · infra</text>

      <rect x="440" y="20" width="180" height="200" rx="10" fill="#fef3d7" stroke="#b7791f" />
      <text x="530" y="44" text-anchor="middle" font-weight="800">courses</text>
      <text x="530" y="64" text-anchor="middle" font-size="11" fill="#596579">domain · app · infra</text>

      <rect x="60" y="160" width="520" height="40" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="320" y="185" text-anchor="middle" font-weight="800">internal event bus (in-process, typed)</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="A module is a unit of meaning, not a unit of code">
If `users`, `billing`, and `courses` each have their own domain language, owners, and lifecycle, they are modules. If they share all three, they are one module wearing three folders. Boundaries follow meaning; folders follow boundaries.
</KeyConcept>

## Folder shape

```
src/
  modules/
    users/
      domain/
      application/
      infrastructure/
      transport/
      index.ts            # the public surface — the only thing other modules may import
    billing/
      domain/
      application/
      infrastructure/
      transport/
      index.ts
    courses/
      ...
  shared/
    kernel/               # ids, money, result types — stable across modules
    events/               # the typed event bus
    http/                 # error-handling middleware, auth middleware
  main.ts                 # composition root
```

Each module's `index.ts` re-exports exactly what others may use — usually a handful of query functions, event types, and maybe one or two use-case classes for orchestration.

```ts
// src/modules/billing/index.ts
export { PayInvoice } from './application/pay-invoice'
export type { InvoicePaid, PaymentFailed } from './domain/events'
// intentionally NOT exporting InvoicesRepo, SQL, or Stripe adapters
```

## The shared kernel

Things every module can depend on without coupling: ids, money, result types, time, logging interfaces. Keep the shared kernel thin — it has gravity. Anything that grows there becomes impossible to change later.

```ts
// src/shared/kernel/money.ts
export type Currency = 'USD' | 'EUR' | 'GBP'
export type Money = { amountMinor: number; currency: Currency }

export const Money = {
  add(a: Money, b: Money): Money {
    if (a.currency !== b.currency) throw new Error('CURRENCY_MISMATCH')
    return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency }
  },
}
```

<Callout type="warn" title="The shared kernel is not a junk drawer">
If every module imports from `shared/`, the "monolith" is one module with folders. Resist the urge to extract helpers that are only used twice. Three uses is the threshold, and even then the extraction must have a name a stranger understands.
</Callout>

## Inter-module communication

Three options, in order of preference.

### 1. Public functions (typed, synchronous)

For queries that the calling module needs an answer to right now.

```ts
// src/modules/billing/application/pay-invoice.ts
import { usersApi } from '../../users' // the public surface

export class PayInvoice {
  async run(input: { invoiceId: string }) {
    const customer = await usersApi.billingProfile(input.invoiceId)
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND')
    // ...
  }
}
```

`usersApi` is a curated object exported from `users/index.ts`, not a direct import of an internal service. Rename the internal service tomorrow; the contract holds.

### 2. Internal events (async, fire-and-forget)

For notifications where the publisher does not care who listens.

```ts
// src/shared/events/bus.ts
export type DomainEvent =
  | { type: 'user.registered'; payload: { id: string; email: string; at: Date } }
  | { type: 'invoice.paid'; payload: { id: string; customerId: string; at: Date } }
  | { type: 'invoice.payment_failed'; payload: { id: string; reason: string } }

export interface EventBus {
  publish<E extends DomainEvent>(event: E): Promise<void>
  subscribe<T extends DomainEvent['type']>(
    type: T,
    handler: (event: Extract<DomainEvent, { type: T }>) => Promise<void>,
  ): void
}

export class InProcessBus implements EventBus {
  private handlers = new Map<string, Array<(e: any) => Promise<void>>>()
  subscribe(type: string, handler: any) {
    const list = this.handlers.get(type) ?? []
    list.push(handler)
    this.handlers.set(type, list)
  }
  async publish(event: DomainEvent) {
    const list = this.handlers.get(event.type) ?? []
    await Promise.allSettled(list.map((h) => h(event)))
  }
}
```

```ts
// src/modules/courses/infrastructure/subscriptions.ts
import type { EventBus } from '../../../shared/events/bus'

export function wireCoursesSubscriptions(bus: EventBus, deps: { unlockCourse: UnlockCourse }) {
  bus.subscribe('invoice.paid', async (e) => {
    await deps.unlockCourse.run({ customerId: e.payload.customerId })
  })
}
```

`courses` learns that billing happened without `billing` knowing `courses` exists.

### 3. Direct import of another module's internals

Never. This is how monoliths rot.

<Compare badLabel="Modules import each other's internals" goodLabel="Modules talk through a narrow surface">
<Fragment slot="bad">
```ts
// src/modules/billing/application/pay-invoice.ts
import { UsersRepo } from '../../users/infrastructure/users.repo.pg'
// Billing now depends on users' persistence details.
// Changing the users table breaks billing.
```
</Fragment>
<Fragment slot="good">
```ts
// src/modules/billing/application/pay-invoice.ts
import { usersApi } from '../../users'
// The users module chooses what to expose and how.
```
</Fragment>
</Compare>

## Enforce the boundary with tooling

Good intentions do not survive a busy sprint. Tooling does.

```js
// eslint.config.js (flat)
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'module',   pattern: 'src/modules/*',            mode: 'folder' },
        { type: 'internal', pattern: 'src/modules/*/**',         mode: 'file' },
        { type: 'shared',   pattern: 'src/shared/**',            mode: 'file' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // anything can import from shared
          { from: ['*'], allow: ['shared'] },
          // a module's internal files may import from the same module
          { from: ['internal'], allow: ['internal'], importKind: 'sameElement' },
          // cross-module imports must target the module's public index
          { from: ['internal'], allow: ['module'] },
        ],
      }],
    },
  },
]
```

Pair with `"paths"` in `tsconfig.json` so cross-module imports look like `import { usersApi } from '@/modules/users'` — a subtle signal that you are crossing a boundary.

## The outbox pattern for reliable events

In-process events are lossy on crashes. For events that matter — "invoice paid" must eventually lead to "course unlocked" — write them in the same transaction as the state change.

```ts
// src/modules/billing/application/pay-invoice.ts
async run(input: { invoiceId: string }) {
  await this.uow.run(async (tx) => {
    const invoice = await this.invoices.byId(input.invoiceId, tx)
    // ... charge, mark paid ...
    await this.invoices.save(invoice, tx)
    await this.outbox.enqueue(tx, { type: 'invoice.paid', payload: { /* ... */ } })
  })
}
```

A background worker polls the outbox table and publishes to the in-process bus (or a real broker when you later extract). The key property: if the database commits, the event will be published, eventually. If the database rolls back, the event never existed. See [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/) for details.

## When to extract a service

A module has earned extraction when three things are true:

1. **Its events are the only way it talks outward.** Other modules do not call its public functions synchronously.
2. **Its data is not joined to another module's data at the database level.** No cross-module foreign keys, no cross-module SQL joins.
3. **Its scaling or availability needs differ.** Billing must stay up when courses is redeploying; reporting can lag by minutes.

<Callout type="tip" title="Distributed systems do not fix broken boundaries">
If your modules today cannot be imported independently, splitting them across a network will not solve that. It will add latency, partial failure, and deploy coordination on top of the original design problem. Fix the boundary in-process first; extraction becomes a mechanical change.
</Callout>

<Compare badLabel="Premature extraction" goodLabel="Pragmatic progression">
<Fragment slot="bad">
Team of six, one product, no production traffic. Splits the system into seven services on day one "for scalability." Spends three months on service discovery, auth between services, distributed tracing, and a new CI pipeline. Ships the first feature a quarter late.
</Fragment>
<Fragment slot="good">
Same team, modular monolith. One Postgres, one deploy. Features ship weekly. Two years in, the search module has 10× the write rate of everything else, so they extract it — a change that takes a week because the seam was already a public function plus two event subscriptions.
</Fragment>
</Compare>

## Common pitfalls

<Pitfall title="One database schema, everybody joins">
Every module reads every table. A migration that touches `users` breaks three other modules. **Fix:** per-module schemas (Postgres `CREATE SCHEMA billing`) and a rule that no module queries tables it does not own.
</Pitfall>

<Pitfall title="Shared services folder">
`src/services/` full of classes used by every module. There are no modules; there is one module with subfolders. **Fix:** give every service a home module, or admit it is infrastructure and move it to `shared/`.
</Pitfall>

<Pitfall title="Events that carry full entities">
`invoice.paid` carries the whole invoice including internal fields. Consumers depend on shapes they should not know about. **Fix:** events are narrow facts — `{ id, customerId, amount, at }` — not state transfer.
</Pitfall>

<Pitfall title="Circular module dependencies">
`users` subscribes to `billing.invoice.paid`, `billing` calls `usersApi.lookup`. Harmless until `courses` also joins and the dependency cycle is invisible. **Fix:** the boundaries plugin catches it. A sane rule: a module can depend on events from any module but may call functions on at most a small curated set (often zero).
</Pitfall>

## Lab

<Lab title="Split a bowl-of-spaghetti repo into modules" duration="2 h" difficulty="Hard" stack="Node.js, TypeScript, Express, Postgres, ESLint">

### Goal
Take a provided 2,000-line Express app where `users`, `courses`, and `billing` intermingle. Reshape it into a modular monolith with enforced boundaries and one internal event.

### Steps
1. Draw the current import graph (`madge --image graph.png src/`). Identify cross-feature imports.
2. Create `src/modules/users`, `src/modules/billing`, `src/modules/courses` with the four-layer skeleton each.
3. Move code in. Where a module needs data from another, expose it via `index.ts`.
4. Identify one workflow that is orchestration across modules (paying an invoice unlocks a course) and convert it to an event: `billing` publishes `invoice.paid`, `courses` subscribes.
5. Configure `eslint-plugin-boundaries` to fail the build on cross-module internal imports.
6. Run the full test suite; fix any breaks by widening a module's public surface, not by reaching into internals.

### Success criteria
- `madge` shows each module is a connected component with single-arrow edges only toward `index.ts` files
- Deleting `src/modules/courses` and its event subscription still lets `users` and `billing` compile
- The boundaries rule reports zero violations
- Test suite runs in under 60 seconds and all layers of `billing` can be unit-tested with in-memory fakes

</Lab>

## Checkpoint

<Checkpoint>
1. What is the one file in each module that other modules are allowed to import from, and why does it matter?
2. Give two questions you would ask before extracting a module into a separate service.
3. You notice `invoice.paid` event carries the full invoice object. Why is that a design smell and what is the minimum shape?
4. Module A calls a function in Module B synchronously; Module B emits an event that Module A subscribes to. Is this a circular dependency? Explain.
5. A teammate proposes a `src/services/` folder shared across features. What is the risk and when would you accept it?
</Checkpoint>

## Further reading

- [Clean Architecture and Dependency Flow](/learning/architecture/clean-architecture-and-dependency-flow/) — the rule inside each module
- [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/) — the outbox pattern in detail
- [Modern Architecture Coverage](/learning/architecture/modern-architecture-coverage/) — DDD-lite, vertical slices, CQRS-lite
