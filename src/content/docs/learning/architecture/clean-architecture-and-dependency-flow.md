---
title: Clean Architecture and Dependency Flow
slug: learning/architecture/clean-architecture-and-dependency-flow
description: Learn clean architecture ideas, inward dependency flow, use-case thinking, and how to apply these patterns pragmatically in Node.js systems.
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

<LessonMeta level="Intermediate" duration="26 min" track="Architecture" prerequisites="Layered architecture, TypeScript interfaces, Express" />

Clean architecture is not a folder layout. It is one rule: **source code dependencies point inward, toward policy, never outward toward detail.** Everything else — ports, adapters, use cases, hexagons — is vocabulary built on top of that rule. Learn the rule first; the templates are optional.

<Objectives>
- State the dependency rule and apply it to a concrete Node.js feature
- Design ports (interfaces) that belong to the inner layer and adapters that conform
- Write a use case that is the same file whether the transport is HTTP, CLI, or a queue consumer
- Decide when to invert a dependency and when inversion is costing you clarity
</Objectives>

## The one rule, drawn

<Diagram caption="Dependencies cross the circles only inward. Inner layers know nothing about outer layers.">
  <svg viewBox="0 0 640 260" role="img" aria-label="Clean architecture circles">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <circle cx="320" cy="130" r="110" fill="#fde4e1" stroke="#b42318" />
      <circle cx="320" cy="130" r="82"  fill="#fef3d7" stroke="#b7791f" />
      <circle cx="320" cy="130" r="54"  fill="#dff5e5" stroke="#2f8f46" />
      <circle cx="320" cy="130" r="26"  fill="#e9f4fb" stroke="#087ea4" />

      <text x="320" y="134" text-anchor="middle" font-weight="800">Entities</text>
      <text x="320" y="86"  text-anchor="middle" font-weight="800">Use cases</text>
      <text x="320" y="58"  text-anchor="middle" font-weight="800">Interface adapters</text>
      <text x="320" y="30"  text-anchor="middle" font-weight="800">Frameworks &amp; drivers</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#arrow)">
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
          </marker>
        </defs>
        <path d="M560 130 L450 130" />
        <path d="M450 130 L402 130" />
        <path d="M402 130 L374 130" />
        <path d="M374 130 L346 130" />
      </g>
      <text x="495" y="120" font-size="11" fill="#596579">dependencies flow inward</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="The dependency rule">
An entity knows nothing about use cases. A use case knows nothing about HTTP, Postgres, or Stripe. Adapters know about both their driver (Stripe SDK) and the inner port they implement. Frameworks know about adapters. If an import crosses a circle in the wrong direction, the design is broken — regardless of how clean the folder names look.
</KeyConcept>

## Ports and adapters — a concrete example

We will build "charge a customer" three ways — HTTP, CLI, queue consumer — reusing the same use case because the use case depends on nothing at the edges.

### Entity (innermost)

```ts
// src/billing/domain/invoice.ts
export type Money = { amountMinor: number; currency: 'USD' | 'EUR' }

export class Invoice {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly total: Money,
    public status: 'pending' | 'paid' | 'failed',
  ) {}

  static rehydrate(row: { id: string; customerId: string; total: Money; status: Invoice['status'] }): Invoice {
    return new Invoice(row.id, row.customerId, row.total, row.status)
  }

  markPaid(): void {
    if (this.status === 'paid') return
    if (this.status === 'failed') throw new Error('INVOICE_ALREADY_FAILED')
    this.status = 'paid'
  }

  markFailed(): void {
    if (this.status === 'paid') throw new Error('INVOICE_ALREADY_PAID')
    this.status = 'failed'
  }
}
```

No framework. No I/O. Pure state and invariants.

### Ports (declared by the use case, implemented by the outside)

```ts
// src/billing/application/ports.ts
import type { Invoice, Money } from '../domain/invoice'

export interface InvoiceRepo {
  byId(id: string): Promise<Invoice | null>
  save(invoice: Invoice): Promise<void>
}

export interface PaymentGateway {
  charge(params: { customerId: string; amount: Money }): Promise<{ ok: true; reference: string } | { ok: false; reason: string }>
}

export interface EventBus {
  publish(event: { type: string; payload: unknown }): Promise<void>
}
```

The **use case** owns these shapes. The Stripe SDK does not define `PaymentGateway` — our inner policy does, and Stripe's adapter conforms to it.

### Use case

```ts
// src/billing/application/pay-invoice.ts
import type { InvoiceRepo, PaymentGateway, EventBus } from './ports'

export class InvoiceNotFound extends Error { code = 'INVOICE_NOT_FOUND' }
export class PaymentDeclined extends Error {
  code = 'PAYMENT_DECLINED'
  constructor(public reason: string) { super(reason) }
}

export class PayInvoice {
  constructor(private invoices: InvoiceRepo, private gateway: PaymentGateway, private bus: EventBus) {}

  async run(input: { invoiceId: string }): Promise<{ reference: string }> {
    const invoice = await this.invoices.byId(input.invoiceId)
    if (!invoice) throw new InvoiceNotFound()

    const result = await this.gateway.charge({ customerId: invoice.customerId, amount: invoice.total })
    if (!result.ok) {
      invoice.markFailed()
      await this.invoices.save(invoice)
      await this.bus.publish({ type: 'invoice.payment_failed', payload: { id: invoice.id, reason: result.reason } })
      throw new PaymentDeclined(result.reason)
    }

    invoice.markPaid()
    await this.invoices.save(invoice)
    await this.bus.publish({ type: 'invoice.paid', payload: { id: invoice.id, reference: result.reference } })
    return { reference: result.reference }
  }
}
```

This class will be the same tomorrow, whether you use Express or Fastify, Stripe or Adyen, Postgres or DynamoDB.

### Adapters (outer ring)

```ts
// src/billing/infrastructure/stripe.gateway.ts
import Stripe from 'stripe'
import type { PaymentGateway } from '../application/ports'

export class StripeGateway implements PaymentGateway {
  constructor(private stripe: Stripe) {}

  async charge({ customerId, amount }: Parameters<PaymentGateway['charge']>[0]) {
    try {
      const intent = await this.stripe.paymentIntents.create({
        customer: customerId,
        amount: amount.amountMinor,
        currency: amount.currency.toLowerCase(),
        confirm: true,
        off_session: true,
      })
      return { ok: true as const, reference: intent.id }
    } catch (e: any) {
      return { ok: false as const, reason: e?.code ?? 'UNKNOWN' }
    }
  }
}
```

```ts
// src/billing/transport/http.ts
import { Router } from 'express'
import { PayInvoice, InvoiceNotFound, PaymentDeclined } from '../application/pay-invoice'

export function billingRouter(deps: { pay: PayInvoice }) {
  const r = Router()
  r.post('/invoices/:id/pay', async (req, res, next) => {
    try {
      const out = await deps.pay.run({ invoiceId: req.params.id })
      res.json(out)
    } catch (e) {
      if (e instanceof InvoiceNotFound) return res.status(404).json({ error: e.code })
      if (e instanceof PaymentDeclined) return res.status(402).json({ error: e.code, reason: e.reason })
      next(e)
    }
  })
  return r
}
```

```ts
// src/billing/transport/cli.ts
import { PayInvoice } from '../application/pay-invoice'

export async function payInvoiceCli(pay: PayInvoice, argv: string[]) {
  const [, , id] = argv
  const out = await pay.run({ invoiceId: id })
  console.log(JSON.stringify(out))
}
```

```ts
// src/billing/transport/queue.ts
import { PayInvoice } from '../application/pay-invoice'

export function payInvoiceConsumer(pay: PayInvoice) {
  return async (job: { data: { invoiceId: string } }) => {
    await pay.run(job.data) // queue framework handles retries
  }
}
```

Three drivers, one use case. That is the payoff.

## Why invert? The testing case

<Compare badLabel="Use case depends on Stripe" goodLabel="Use case depends on a port">
<Fragment slot="bad">
```ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE!)

export async function payInvoice(id: string) {
  const invoice = await db.invoice.findUnique({ where: { id } })
  const res = await stripe.paymentIntents.create({ /* ... */ })
  // ...
}
```
Testing this requires `nock`, a sandbox key, or a full Stripe mock. The test is slow and brittle. Swapping gateways means rewriting the use case.
</Fragment>
<Fragment slot="good">
```ts
const fakeGateway: PaymentGateway = {
  charge: async () => ({ ok: true, reference: 'ref_test' }),
}
const useCase = new PayInvoice(fakeRepo, fakeGateway, fakeBus)
await useCase.run({ invoiceId: 'inv_1' })
```
Test runs in a millisecond. Swapping Stripe for Adyen means writing a new adapter — the use case does not change.
</Fragment>
</Compare>

## Why invert? The reuse case

<Compare badLabel="One HTTP handler holds the logic" goodLabel="Use case reused across transports">
<Fragment slot="bad">
Express route contains 80 lines: parse, validate, charge, update invoice, publish event, serialize response. Later, the team needs the same behaviour in a nightly cron and a retry queue. Two more copies appear, drift begins, bug fixes land in one place but not the others.
</Fragment>
<Fragment slot="good">
One `PayInvoice.run(input)` powers the HTTP route, the cron job, and the BullMQ worker. The invariant that "a failed invoice cannot be marked paid" lives in one entity method, guarded by one use case.
</Fragment>
</Compare>

## When inversion is wrong

<Callout type="warn" title="Do not invert what you do not intend to replace">
If you have one database and will always have one database, a `UsersRepo` interface with one implementation is harmless ceremony. The moment a second implementation exists — an in-memory fake for tests, a read replica wrapper, a future migration target — the interface earns its keep. Add the interface when you feel the second implementation coming, not "just in case."
</Callout>

<Callout type="info" title="Ports belong to the inner layer">
`PaymentGateway` lives in `application/`. `StripeGateway` lives in `infrastructure/`. Reversing this — putting the interface next to Stripe — reintroduces the outward dependency you were trying to remove.
</Callout>

## Clean vs hexagonal vs onion

They are the same idea with different vocabulary. The table below is enough to read the literature.

| Name | Inner thing | Boundary thing | Outer thing |
|------|-------------|----------------|-------------|
| Clean | Entities, use cases | Interface adapters | Frameworks, drivers |
| Hexagonal | Application core | Ports | Adapters |
| Onion | Domain model | Domain services | Infrastructure |

If a style war breaks out on your team, rename the folders `core/`, `ports/`, `adapters/` and move on.

## Common pitfalls

<Pitfall title="Folder cosplay">
A team renames `services/` to `useCases/` and `db/` to `adapters/`, then continues to `import { PrismaClient } from '@prisma/client'` inside the use cases. The folders are clean; the dependency graph is not. **Fix:** enforce imports with ESLint's `no-restricted-imports` or `eslint-plugin-boundaries`.
</Pitfall>

<Pitfall title="Interfaces with one method per SQL query">
`findActiveUserById`, `findActiveUserByEmail`, `findActiveUserByOrgAndEmail`. The port leaks the repository's shape. **Fix:** design ports around the use case's questions, not the database's answers.
</Pitfall>

<Pitfall title="Use cases that know about HTTP status codes">
`throw new HttpError(404, 'not found')` from a use case. The next transport (queue worker) now has to translate HTTP back out. **Fix:** use cases throw domain errors; transports map them.
</Pitfall>

<Pitfall title="Entity with zero behaviour">
A `User` class with only public fields and getters, while every rule lives in a service. This is not an entity; it is a DTO with class syntax. **Fix:** move the invariants inside. If there are truly no invariants, use a plain type — and be honest about it.
</Pitfall>

## Lab

<Lab title="Drive one use case from three transports" duration="90 min" difficulty="Medium" stack="Node.js, TypeScript, Express, BullMQ, Vitest">

### Goal
Implement a `SendInvitation` use case that works identically whether triggered by an HTTP request, a CLI command, or a BullMQ job.

### Steps
1. Model an `Invitation` entity with an invariant (cannot invite an email that belongs to an active user).
2. Declare ports `InvitationRepo`, `UsersRepo`, `Emailer`, `Clock`. Keep them in `application/`.
3. Write `SendInvitation.run({ email, invitedBy })` that uses only those ports.
4. Write adapters for Postgres, a real SMTP server (Mailhog locally), and the system clock.
5. Wire three transports: `POST /invitations`, `node cli.js invite alice@example.com`, and a BullMQ consumer on `invitations.send`.
6. Write one unit test using fakes — it must exercise the "email already registered" branch.

### Success criteria
- `grep -r "express\|stripe\|pg\|nodemailer" src/billing/application src/billing/domain` returns nothing
- The unit test runs in under 20 ms
- Adding a fourth transport (a GraphQL mutation) requires zero changes to the use case
- An ESLint boundary rule fails the build if someone imports an adapter from a use case

</Lab>

## Checkpoint

<Checkpoint>
1. State the dependency rule in one sentence. Which direction must imports flow?
2. Why does `PaymentGateway` belong in `application/` and `StripeGateway` in `infrastructure/`?
3. You see a use case throwing `new HttpError(404)`. What is the concrete harm, and what is the fix?
4. Give one situation where introducing a port and adapter is premature and adds noise.
5. Your team wants to migrate from Postgres to a document store. Which files should change, and which must not?
</Checkpoint>

## Further reading

- [Layered Architecture and Boundaries](/learning/architecture/layered-architecture-and-boundaries/) — the simpler starting point
- [Modular Monolith Patterns and Pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/) — applying the rule per feature
- [Modern Architecture Coverage](/learning/architecture/modern-architecture-coverage/) — DDD-lite, CQRS, vertical slices
