---
title: Microservices Boundaries and Data Consistency
slug: learning/system-design/microservices-boundaries-and-data-consistency
description: Learn when microservices are justified, how to draw boundaries, and how consistency becomes more complex once services split.
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

<LessonMeta level="Advanced" duration="28 min" track="System Design" prerequisites="System Design Fundamentals, transactions, REST/HTTP" />

Microservices are not a rite of passage and they are not a rescue plan for a bad monolith. They are a way of paying latency and consistency costs in exchange for independent deploys and team autonomy. This page teaches you to decide whether the trade is worth it, how to draw the cuts, and how to keep data coherent after you have cut.

<Objectives>
- Apply Conway's law on purpose, not by accident
- Draw service boundaries along bounded contexts, never along ORM tables
- Explain why 2PC across services is almost always the wrong answer
- Implement the transactional outbox pattern for reliable event publishing
- Reason about consistency in human terms: "how long can the user see a stale view?"
</Objectives>

## Mental model: a microservice is a unit of independent change

<Diagram caption="A good service boundary owns its data, its deploy cycle, and its on-call rotation.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Service boundaries">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="30" y="30" width="180" height="160" rx="8" fill="#dff5e5" stroke="#2f8f46" stroke-width="1.5" />
      <text x="120" y="55" text-anchor="middle" font-weight="800">Orders</text>
      <text x="120" y="80" text-anchor="middle" font-size="11">own DB</text>
      <text x="120" y="98" text-anchor="middle" font-size="11">own deploy</text>
      <text x="120" y="116" text-anchor="middle" font-size="11">own on-call</text>
      <text x="120" y="150" text-anchor="middle" font-size="10" fill="#596579">publishes OrderPlaced</text>
      <text x="120" y="168" text-anchor="middle" font-size="10" fill="#596579">consumes PaymentSettled</text>

      <rect x="230" y="30" width="180" height="160" rx="8" fill="#e9f4fb" stroke="#087ea4" stroke-width="1.5" />
      <text x="320" y="55" text-anchor="middle" font-weight="800">Payments</text>
      <text x="320" y="80" text-anchor="middle" font-size="11">own DB</text>
      <text x="320" y="98" text-anchor="middle" font-size="11">own deploy</text>
      <text x="320" y="116" text-anchor="middle" font-size="11">own on-call</text>
      <text x="320" y="150" text-anchor="middle" font-size="10" fill="#596579">publishes PaymentSettled</text>
      <text x="320" y="168" text-anchor="middle" font-size="10" fill="#596579">consumes OrderPlaced</text>

      <rect x="430" y="30" width="180" height="160" rx="8" fill="#fef3d7" stroke="#b7791f" stroke-width="1.5" />
      <text x="520" y="55" text-anchor="middle" font-weight="800">Inventory</text>
      <text x="520" y="80" text-anchor="middle" font-size="11">own DB</text>
      <text x="520" y="98" text-anchor="middle" font-size="11">own deploy</text>
      <text x="520" y="116" text-anchor="middle" font-size="11">own on-call</text>
      <text x="520" y="150" text-anchor="middle" font-size="10" fill="#596579">publishes StockReserved</text>
      <text x="520" y="168" text-anchor="middle" font-size="10" fill="#596579">consumes OrderPlaced</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Conway's law, used deliberately">
"Organizations design systems that mirror their communication structure." This is not a warning — it is a lever. If you want a service to be independently owned, give one team its code, its data, and its pager. If two teams share a service, you will get a monolith with extra ceremony. If you have one team for three services, you will get a distributed monolith.
</KeyConcept>

## When microservices are the right answer

All three should be true:

1. **Deploy independence is valuable.** Your teams are blocked on each other's releases today, and the blockage costs real money.
2. **The domain has clear seams.** You can point at bounded contexts with distinct vocabularies — "order", "payment", "shipment" — not "frontend", "backend", "database."
3. **You can afford the operational tax.** Each service needs its own observability, on-call, deploy pipeline, and failure analysis. Four services is roughly four times the ops work of one.

<Compare badLabel="Splitting too early" goodLabel="Modular monolith first">
<Fragment slot="bad">
Three engineers, 800 rps, one business domain, split into 9 services. Every feature touches 4 services, every deploy needs a coordinated release, the team drowns in infra.
</Fragment>
<Fragment slot="good">
Same three engineers ship a modular monolith with strict internal boundaries (domain packages, no cross-domain imports, one owner per package). Extract a service only when a specific module needs independent scale, deploy, or ownership.
</Fragment>
</Compare>

## Bounded contexts, not database tables

Domain-Driven Design's bounded context is the honest cut: a slice of the business where one team's vocabulary applies. Your `User` in "Billing" has `payment_method`, `tax_id`, `invoicing_email`. Your `User` in "Support" has `tier`, `open_ticket_count`, `last_contact_at`. These are **different entities that share an id**. A monolithic `users` table that pretends they are one entity is a shared-database microservice waiting to happen.

```ts
// billing/domain/customer.ts
export type BillingCustomer = {
  id: string
  paymentMethodId: string | null
  taxId: string | null
  invoicingEmail: string
}

// support/domain/customer.ts
export type SupportCustomer = {
  id: string
  tier: 'free' | 'pro' | 'enterprise'
  openTickets: number
  lastContactAt: Date | null
}
```

Each context owns its own storage. The shared id is a **reference**, not a foreign key across services.

<Callout type="info" title="One service, one database. Always.">
The moment two services share a database, you have one application with extra network calls. A schema change becomes a multi-team coordination problem; a bad query from one team takes out the other. "Shared database microservices" is an anti-pattern with its own name for a reason.
</Callout>

## Synchronous vs asynchronous between services

Synchronous HTTP or gRPC is fine when the caller must have the answer before responding to the user. Asynchronous events are right when you can tell the user "received" and do the rest later.

<Compare badLabel="Sync chain of four" goodLabel="One sync, events for the rest">
<Fragment slot="bad">
```
POST /orders → Orders
  → POST /reserve (Inventory)    (80 ms)
  → POST /charge (Payments)      (300 ms)
  → POST /notify (Notifications) (50 ms)
total user latency: 430 ms
availability: 0.99 × 0.99 × 0.99 × 0.99 ≈ 96%
```
Any downstream failure fails the user's request.
</Fragment>
<Fragment slot="good">
```
POST /orders → Orders (writes order, emits OrderPlaced)
  respond 201 in ~40 ms
Inventory, Payments, Notifications consume OrderPlaced asynchronously.
```
User sees 40 ms latency. Availability of the user-facing path is Orders alone: 99.9%.
</Fragment>
</Compare>

## Distributed data: the hard part

The first time you ship two services that need to agree on something, you discover that database transactions do not cross process boundaries.

### Why 2PC is almost never the answer

Two-phase commit (prepare → commit) gives you atomicity across resource managers. In theory. In practice:

- The coordinator is a single point of failure. When it crashes mid-transaction, participants sit locked.
- It holds locks across network RTTs. Your throughput collapses.
- It is not supported by modern message brokers or most NoSQL stores.
- Recovery is painful; the ops cost dwarfs any consistency benefit.

Use 2PC for two tables inside one Postgres. Do not use it across services.

### The transactional outbox

The usual problem: "I need to update the DB **and** emit an event, atomically." If you publish first and the DB update fails, you lied about an event. If you update first and the publish fails, you hid a real event.

```sql
-- one table inside the orders database
create table outbox (
  id          uuid primary key default gen_random_uuid(),
  aggregate   text not null,
  event_type  text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now(),
  published_at timestamptz
);
create index on outbox (published_at) where published_at is null;
```

```ts
// application code — same transaction as the business write
await db.tx(async (t) => {
  const order = await t.orders.insert({ userId, total, status: 'pending' })
  await t.outbox.insert({
    aggregate: 'order',
    event_type: 'OrderPlaced',
    payload: { id: order.id, userId, total },
  })
})
```

A separate **relay** process polls unpublished rows, publishes to the broker, marks them published. Because the business write and the outbox insert are one transaction, the event is emitted **exactly once from the database's perspective**. The relay may publish twice on retry; that is the broker's at-least-once delivery, which consumers must handle via idempotency keys.

```ts
// outbox-relay.ts (runs as its own process)
setInterval(async () => {
  const rows = await db.query(`
    select id, event_type, payload from outbox
    where published_at is null
    order by created_at
    limit 100 for update skip locked
  `)
  for (const r of rows.rows) {
    await broker.publish(r.event_type, r.payload, { messageId: r.id })
    await db.query('update outbox set published_at = now() where id = $1', [r.id])
  }
}, 500).unref()
```

<Callout type="tip" title="Change data capture is the other valid answer">
Tools like Debezium tail Postgres WAL and emit events from committed rows, no outbox table needed. Lower app-side code, but a bigger operational surface. Pick outbox if your team does not want to run Debezium.
</Callout>

### Sagas: multi-service workflows without distributed transactions

A saga is a sequence of local transactions, each with a compensating action, coordinated by choreography (events) or orchestration (a controller like Temporal).

```
Choreographed saga for "place order":

Orders     → OrderPlaced
Inventory  → StockReserved           (on failure: OrderCancelled)
Payments   → PaymentSettled          (on failure: StockReleased, OrderCancelled)
Shipping   → ShipmentCreated
```

Each step commits locally. Compensations are the logical reverse (refund, release stock, cancel). Critically: **every step must be idempotent** because at-least-once delivery will redeliver on crash.

```ts
// idempotent payment handler
async function handlePaymentSettled(event) {
  const existing = await db.payments.findByExternalId(event.id)
  if (existing) return // duplicate delivery, no-op
  await db.tx(async (t) => {
    await t.payments.insert({ externalId: event.id, orderId: event.orderId, amount: event.amount })
    await t.outbox.insert({ event_type: 'PaymentRecorded', payload: { orderId: event.orderId } })
  })
}
```

<KeyConcept title="Eventual consistency is a time bound">
"Eventually consistent" is meaningless unless you state the bound. Good answer: "The order summary on the profile page may be up to 2 seconds behind the authoritative order record; the saga completes within 30 seconds for 99% of orders." Bad answer: "It'll be eventually consistent."
</KeyConcept>

## Anti-patterns to name and avoid

<Pitfall title="Distributed monolith">
Ten services that must be released together because of shared code, shared DB, or tight sync call chains. You have the deploy cost of microservices and the coordination cost of a monolith — the worst of both. **Fix:** merge back to a modular monolith, extract services only when the benefit is specific and measurable.
</Pitfall>

<Pitfall title="Synchronous call chains four deep">
`gateway → orders → inventory → pricing → tax`. Latency adds. Availability multiplies down. One slow component makes all five look slow. **Fix:** cache what can be cached, parallelise siblings with `Promise.all`, push non-critical steps to async.
</Pitfall>

<Pitfall title="Event contracts that are not contracts">
Service A publishes `OrderPlaced` with field `total`. Service B reads it. Service A renames to `amount`. B breaks at 3am. **Fix:** schema registry (Avro, Protobuf, or JSON Schema with tooling), versioned event types, consumer-driven contract tests, and a deprecation window before removing fields.
</Pitfall>

## Lab

<Lab title="Extract one service from a modular monolith, correctly" duration="120 min" difficulty="Hard" stack="Node.js, Postgres, NATS or Kafka, a pre-existing monolith">

### Goal
Take a monolith with clear Orders and Payments modules. Extract Payments into its own service, with its own database, communicating via events. Data must remain coherent through an outage of either side.

### Steps
1. Sketch the bounded context for Payments: entities, events it publishes, events it consumes.
2. Create a new `payments` service with its own Postgres and an `outbox` table.
3. In the monolith, replace direct function calls into the payments module with `POST /charges` (for the synchronous step that must precede the 201) and event publication via outbox for the rest.
4. Implement the saga: `OrderPlaced` → reserve → charge → `PaymentSettled` → confirm. Each handler idempotent, each compensation defined.
5. Deploy both. Run an end-to-end test that kills the payments service mid-charge; confirm the order either completes after recovery or is compensated, never stuck.
6. Document the eventual-consistency window: "the user may see the order as `pending` for up to X seconds after checkout."

### Success criteria
- Payments has its own Postgres; zero queries from the monolith reference payment tables
- An outage of either service does not corrupt data; replays do not duplicate charges
- A specific, measurable consistency window is stated and tested under load
- Removing all shared code yields two repos that can be cloned and built independently
- A rollback plan is documented and realistic: either merge back, or keep the split

</Lab>

## Checkpoint

<Checkpoint>
1. Your team has 4 engineers, one business domain, and 500 rps. You are asked to split into 6 services. Name two questions you raise before agreeing.
2. Why is a shared Postgres across services an anti-pattern, even with "read-only" access for the other service?
3. Describe the transactional outbox in one sentence. Why is at-least-once delivery acceptable with it?
4. A saga fails at step 3 of 4. What must be true about step 1 and step 2 for the system to recover automatically?
5. Give a concrete example of a bounded context where the same concept (e.g., "User") has legitimately different shape on either side.
</Checkpoint>

## Further reading

- [System Design Fundamentals and Scalability](/learning/system-design/system-design-fundamentals-and-scalability/)
- [Messaging, Resilience, and Distributed Tradeoffs](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/)
- [Architecture: modular monolith patterns and pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/)
