---
title: Queues, Jobs, Webhooks, and Event-Driven Flows
slug: learning/realtime/queues-jobs-webhooks-and-event-driven-flows
description: Learn background jobs, message queues, webhook processing, retry thinking, and event-driven coordination in backend systems.
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

<LessonMeta level="Intermediate" duration="28 min" track="Real-Time & Advanced APIs" prerequisites="Node.js, Redis or Postgres, HTTP basics" />

Most "real-time" systems are really coordination systems with asynchronous boundaries. A user clicks "pay"; two seconds later an invoice is paid, a course is unlocked, a receipt is emailed, and a Slack channel is updated. None of that needs to block the HTTP response, and if any of it fails, none of it should silently vanish. This page is about the boring plumbing that turns eventual into reliable.

<Objectives>
- Move work off the request path with BullMQ and write jobs that survive retries and restarts
- Process webhooks with signature verification, idempotency, and sane retry semantics
- Design the outbox pattern so domain writes and events commit or fail together
- Reason about delivery guarantees and why "exactly-once" is a lie you tell juniors
</Objectives>

## Mental model

<Diagram caption="Synchronous HTTP returns fast; the queue and outbox do the durable work; the DLQ is the safety net.">
  <svg viewBox="0 0 640 240" role="img" aria-label="Queue and outbox flow">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="30" width="120" height="40" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="80" y="55" text-anchor="middle" font-weight="800">HTTP handler</text>

      <rect x="170" y="30" width="130" height="40" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="235" y="55" text-anchor="middle" font-weight="800">DB + outbox</text>

      <rect x="330" y="30" width="120" height="40" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="390" y="55" text-anchor="middle" font-weight="800">Relay worker</text>

      <rect x="480" y="30" width="140" height="40" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="550" y="55" text-anchor="middle" font-weight="800">Queue (BullMQ)</text>

      <rect x="170" y="130" width="130" height="40" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="235" y="155" text-anchor="middle" font-weight="800">Job worker</text>

      <rect x="330" y="130" width="120" height="40" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="390" y="155" text-anchor="middle" font-weight="800">Side effect</text>

      <rect x="480" y="130" width="140" height="40" rx="6" fill="#fde4e1" stroke="#b42318" />
      <text x="550" y="155" text-anchor="middle" font-weight="800">DLQ</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#a2)">
        <defs>
          <marker id="a2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
          </marker>
        </defs>
        <path d="M140 50 L170 50" />
        <path d="M300 50 L330 50" />
        <path d="M450 50 L480 50" />
        <path d="M550 70 L550 130" />
        <path d="M480 150 L300 150" />
        <path d="M300 150 L330 150" />
        <path d="M235 90 L235 130" />
        <path d="M450 155 L480 155" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Deliver at least once; process at most once">
Any networked queue worth using guarantees at-least-once delivery — duplicates happen, period. Your job handlers must be idempotent: processing the same job twice yields the same result. That is the only property that makes the rest of the system survivable.
</KeyConcept>

## BullMQ — the default Node.js queue

BullMQ is built on Redis streams, supports delayed jobs, rate limits, priorities, repeatable jobs, and flow (parent/child dependencies). The API is small and direct.

```ts
// src/queues/emails.ts
import { Queue } from 'bullmq'

export const emailsQueue = new Queue('emails', {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1_000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
})

export async function enqueueWelcome(userId: string, email: string) {
  await emailsQueue.add(
    'send-welcome',
    { userId, email },
    { jobId: `welcome:${userId}` }, // dedup key
  )
}
```

```ts
// src/workers/emails.worker.ts
import { Worker, UnrecoverableError } from 'bullmq'
import { logger } from '../logger'

new Worker(
  'emails',
  async (job) => {
    const { userId, email } = job.data
    try {
      await smtp.sendWelcome(email)
    } catch (e: any) {
      // Permanent errors must not retry
      if (e.code === 'INVALID_RECIPIENT') throw new UnrecoverableError('INVALID_RECIPIENT')
      throw e // transient: BullMQ will back off and retry
    }
  },
  { connection: { url: process.env.REDIS_URL }, concurrency: 10 },
).on('failed', (job, err) => {
  logger.error({ id: job?.id, err }, 'email.failed')
})
```

<Callout type="tip" title="A `jobId` turns the queue into a dedup store">
Without `jobId`, double-clicking "resend welcome" enqueues two jobs. With `jobId: welcome:${userId}`, BullMQ refuses the second add. Use stable, meaningful ids; never `Date.now()`.
</Callout>

## Idempotency — the non-negotiable property

A job runs twice because the network blipped, a worker crashed after side-effect but before acknowledgement, a retry fired before the success was recorded. Your handler must tolerate it.

<Compare badLabel="Non-idempotent handler" goodLabel="Idempotent handler">
<Fragment slot="bad">
```ts
async function chargeCard(job) {
  await stripe.charges.create({ amount: job.data.amount, customer: job.data.customerId })
  await db.orders.update({ where: { id: job.data.orderId }, data: { status: 'paid' } })
}
```
Retry = double-charge the customer.
</Fragment>
<Fragment slot="good">
```ts
async function chargeCard(job) {
  const key = `charge:${job.data.orderId}` // idempotency key
  const result = await stripe.charges.create(
    { amount: job.data.amount, customer: job.data.customerId },
    { idempotencyKey: key },
  )
  // Stripe returns the original charge on retry — same id, no duplicate.
  await db.orders.update({
    where: { id: job.data.orderId, status: 'pending' },
    data: { status: 'paid', chargeId: result.id },
  })
}
```
Retry = same charge, same row update, no duplicates. Stripe's `Idempotency-Key` header is there for exactly this reason.
</Fragment>
</Compare>

## Retries, backoff, and the DLQ

Retrying immediately is how you turn a transient outage into a self-inflicted DDoS.

```ts
// Exponential with jitter
const attempts = 6
const baseMs = 1_000
const retryIn = (n: number) => Math.min(60_000, baseMs * 2 ** n) * (0.5 + Math.random())
```

BullMQ does this for you via `backoff: { type: 'exponential', delay }`. After the final attempt fails, the job moves to the failed set — your dead-letter queue.

```ts
// src/workers/dlq.monitor.ts
import { QueueEvents } from 'bullmq'

const events = new QueueEvents('emails', { connection: { url: process.env.REDIS_URL } })
events.on('failed', async ({ jobId, failedReason }) => {
  await alerting.page({ title: `Job failed permanently: ${jobId}`, reason: failedReason })
})
```

<Callout type="warn" title="A DLQ is not an archive — it is a queue of bugs">
Every item in your DLQ is either code that must be fixed or a condition that should not have reached production. Dashboards that show "5,000 items in DLQ" where nobody looks are worse than no DLQ. Alert on rate of entry, not absolute size.
</Callout>

## Webhooks — the inbound trust boundary

Stripe, GitHub, Shopify, Twilio: they all send you HTTP POSTs and expect a 2xx in a few seconds. Three rules:

### 1. Verify the signature before you read the body

```ts
import crypto from 'node:crypto'

// Use raw body middleware so the signature verifies
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.get('stripe-signature')!
  const [tPair, v1Pair] = sig.split(',')
  const t = tPair.slice(2)
  const v1 = v1Pair.slice(3)
  const signed = `${t}.${req.body.toString('utf8')}`
  const expected = crypto.createHmac('sha256', process.env.STRIPE_WH_SECRET!).update(signed).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))) {
    return res.status(400).send('invalid signature')
  }
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return res.status(400).send('stale')
  // now it is safe to parse
  const event = JSON.parse(req.body.toString('utf8'))
  // ...
})
```

`timingSafeEqual` matters: a string comparison leaks timing information that attackers can exploit to forge signatures.

### 2. Deduplicate by event id

External providers retry. Your endpoint will see the same event more than once.

```ts
async function handleStripeEvent(event: { id: string; type: string; data: unknown }) {
  const { rowCount } = await db.query(
    'insert into processed_events (id, received_at) values ($1, now()) on conflict do nothing',
    [event.id],
  )
  if (rowCount === 0) return // duplicate, ignore
  // dispatch the event only on first insert
}
```

### 3. Acknowledge quickly; process async

Providers time out webhooks at 5–30 seconds. If you process in-request and a downstream is slow, they retry, you re-process, bugs compound.

```ts
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  verifySignature(req) // throws on failure
  const event = JSON.parse(req.body.toString('utf8'))
  await stripeEventsQueue.add('process', event, { jobId: event.id }) // dedup key
  res.status(200).end() // ack within 50 ms
})
```

The worker handles the actual business logic with the idempotency guarantees above.

<Compare badLabel="Process webhook in-request" goodLabel="Ack fast, process async">
<Fragment slot="bad">
```ts
app.post('/webhooks/stripe', async (req, res) => {
  await syncToCRM(req.body)     // 8 s
  await unlockUser(req.body)    // 3 s
  await sendReceipt(req.body)   // 2 s
  res.status(200).end()
})
```
13-second response. Stripe retries at 10 s. Now you run everything twice, some of it concurrently with itself.
</Fragment>
<Fragment slot="good">
```ts
app.post('/webhooks/stripe', async (req, res) => {
  verifySignature(req)
  await stripeEventsQueue.add('process', parse(req.body), { jobId: eventId(req.body) })
  res.status(200).end()
})
```
Response in 50 ms. Processing retries are contained inside your queue with your chosen backoff.
</Fragment>
</Compare>

## The outbox pattern

Problem: your HTTP handler writes to Postgres and publishes to a queue. If the publish fails after the commit, the event is lost. If the publish succeeds but the commit fails, the event is a lie.

Solution: write the event into a table in the **same transaction** as the domain change. A relay worker reads the table and publishes to the real broker.

```sql
create table outbox (
  id           bigserial primary key,
  aggregate_id text not null,
  type         text not null,
  payload      jsonb not null,
  created_at   timestamptz not null default now(),
  published_at timestamptz
);
create index on outbox (published_at) where published_at is null;
```

```ts
// The domain write and the event are atomic.
await db.tx(async (tx) => {
  await tx.query('update invoices set status = $1 where id = $2', ['paid', id])
  await tx.query(
    'insert into outbox (aggregate_id, type, payload) values ($1, $2, $3)',
    [id, 'invoice.paid', { id, at: new Date() }],
  )
})
```

```ts
// Relay worker: poll unpublished rows, publish, mark.
setInterval(async () => {
  const { rows } = await db.query(
    `select id, type, payload from outbox where published_at is null order by id limit 100 for update skip locked`,
  )
  for (const row of rows) {
    await queue.add(row.type, row.payload, { jobId: String(row.id) })
    await db.query('update outbox set published_at = now() where id = $1', [row.id])
  }
}, 250).unref()
```

Properties:
- If the transaction rolls back, the event never existed.
- If the process crashes after commit but before publish, the next relay tick publishes.
- The `jobId = outbox.id` means the consumer queue also deduplicates.

## Delivery guarantees, honestly

- **At-most-once** — fire and forget. Metrics, clickstream. Loss is acceptable.
- **At-least-once** — what BullMQ, Kafka, SQS, NATS JetStream actually provide. Duplicates happen; you must be idempotent.
- **Exactly-once** — only exists as a marketing phrase or as at-least-once + idempotent consumers. Stripe's `Idempotency-Key`, your outbox `jobId`, and deduplication tables are how you implement it.

<Callout type="info" title="Ordering is per partition, not global">
Kafka, NATS JetStream, and Redis streams give you order within a partition/stream/key. Across keys, events can interleave. If you need "events for user U arrive in order," hash by user id to a single partition. If you need global order, you probably want a different data model.
</Callout>

## Common pitfalls

<Pitfall title="Publishing before committing">
```ts
await queue.add('order.placed', order)
await db.orders.insert(order) // crashes
```
Event says the order exists; database says it does not. Consumers build on a fiction. **Fix:** outbox. Always.
</Pitfall>

<Pitfall title="Non-idempotent jobs that charge money">
A flaky network causes a retry; the customer is charged twice. **Fix:** idempotency keys on every external call that has a side effect. Stripe, Paddle, Twilio, SendGrid all support them — use them.
</Pitfall>

<Pitfall title="Infinite retries on permanent failures">
A job retries 200 times because `email` is `undefined`. Your Redis grows, alerts fire at 3 a.m. **Fix:** classify errors. Permanent (bad input, invalid state) throws `UnrecoverableError`; transient (network, 5xx from a third party) uses exponential backoff with a cap.
</Pitfall>

<Pitfall title="Webhook signature verified on parsed body">
`express.json()` runs before your verifier; the body is re-serialized, whitespace differs, the signature fails. **Fix:** use `express.raw()` on the webhook route specifically. Verify the exact bytes the sender signed.
</Pitfall>

## Lab

<Lab title="Reliable webhook processor end-to-end" duration="2 h" difficulty="Hard" stack="Node.js, TypeScript, Express, BullMQ, Redis, Postgres">

### Goal
Accept Stripe webhooks, verify signatures, deduplicate by event id, enqueue for async processing, and guarantee every charge leads to exactly one receipt email — even if Stripe retries, your worker crashes, or SMTP is down for five minutes.

### Steps
1. Build the `POST /webhooks/stripe` endpoint with raw-body signature verification and a 300-second freshness check.
2. Persist every verified event id in a `processed_events` table; ignore duplicates.
3. Enqueue event processing in BullMQ with `jobId = event.id`.
4. Implement the worker with idempotent receipt-sending (Stripe's `Idempotency-Key` for the email API, or a dedupe table).
5. Add a DLQ monitor that pages when the failure rate exceeds 1% over 5 minutes.
6. Simulate failures: crash the worker mid-job, take SMTP offline for 2 minutes, replay the same webhook 10 times.

### Success criteria
- 10 duplicate deliveries of the same Stripe event produce exactly one email
- Worker crash mid-job produces exactly one email on restart
- SMTP down for 2 minutes: all emails eventually arrive, none more than once
- Webhook endpoint p99 latency under 100 ms
- DLQ alerts fire within 5 minutes of a real failure spike

</Lab>

## Checkpoint

<Checkpoint>
1. Why must a webhook endpoint verify the signature before parsing the JSON body?
2. You have an `at-least-once` queue. Give two concrete techniques that let the handler tolerate duplicates.
3. Describe the outbox pattern and the specific failure mode it prevents.
4. When is `UnrecoverableError` the right call, and when is retrying forever better than bailing out?
5. Your worker runs at 99% success. 1% of jobs retry to failure. What do you build to keep small issues from becoming incidents?
</Checkpoint>

## Further reading

- [WebSockets, Socket.IO, and Server-Sent Events](/learning/realtime/websockets-socketio-and-sse/) — the push counterpart
- [GraphQL, gRPC, and Advanced API Shapes](/learning/realtime/graphql-grpc-and-advanced-api-shapes/) — inter-service contracts
- [Modular Monolith Patterns and Pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/) — outbox inside a single deployable
