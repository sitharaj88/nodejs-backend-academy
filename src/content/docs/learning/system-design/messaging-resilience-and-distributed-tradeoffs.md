---
title: Messaging, Resilience, and Distributed Tradeoffs
slug: learning/system-design/messaging-resilience-and-distributed-tradeoffs
description: Learn messaging patterns, retries, resilience, idempotency, eventual consistency, and the tradeoffs that appear in distributed backend systems.
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

<LessonMeta level="Advanced" duration="28 min" track="System Design" prerequisites="Microservices boundaries, basic queue concepts" />

Messaging is where "distributed" stops being an adjective and starts being a runtime. Queues, streams, and pub/sub solve real coupling and scale problems — and introduce delivery semantics, idempotency requirements, and backpressure problems you cannot ignore. This page teaches you which pattern matches which need, what "exactly-once" actually means, and how to choose between consistency and availability without pretending you are getting both.

<Objectives>
- Distinguish pub/sub, work queue, and event stream by the problem each solves
- Compare at-most-once, at-least-once, and "effectively exactly-once" delivery honestly
- Make any consumer idempotent with a deduplication key
- Apply CAP and PACELC to decide what your system gives up under partition and under normal operation
- Handle backpressure instead of letting it handle you
</Objectives>

## Mental model: three messaging shapes

<Diagram caption="Pub/sub fan-outs events. Work queues distribute tasks. Streams persist an ordered log.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Three messaging shapes">
    <defs>
      <marker id="msgarr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <text x="105" y="22" text-anchor="middle" font-weight="800" font-size="12">pub/sub (fan-out)</text>
      <rect x="30" y="40" width="60" height="30" rx="4" fill="#dff5e5" stroke="#2f8f46" />
      <text x="60" y="59" text-anchor="middle">P</text>
      <rect x="120" y="40" width="60" height="30" rx="4" fill="#dff5e5" stroke="#2f8f46" />
      <text x="150" y="59" text-anchor="middle">C1</text>
      <rect x="120" y="80" width="60" height="30" rx="4" fill="#dff5e5" stroke="#2f8f46" />
      <text x="150" y="99" text-anchor="middle">C2</text>
      <rect x="120" y="120" width="60" height="30" rx="4" fill="#dff5e5" stroke="#2f8f46" />
      <text x="150" y="139" text-anchor="middle">C3</text>
      <g stroke="#2f8f46" stroke-width="1.3" fill="none" marker-end="url(#msgarr)">
        <path d="M90 55 L120 55" /><path d="M90 60 Q 105 80 120 95" /><path d="M90 65 Q 105 110 120 135" />
      </g>

      <text x="315" y="22" text-anchor="middle" font-weight="800" font-size="12">work queue</text>
      <rect x="235" y="40" width="60" height="30" rx="4" fill="#e9f4fb" stroke="#087ea4" />
      <text x="265" y="59" text-anchor="middle">P</text>
      <rect x="325" y="70" width="80" height="30" rx="4" fill="#e9f4fb" stroke="#087ea4" />
      <text x="365" y="89" text-anchor="middle">queue</text>
      <rect x="435" y="40" width="55" height="30" rx="4" fill="#e9f4fb" stroke="#087ea4" />
      <text x="462" y="59" text-anchor="middle">W1</text>
      <rect x="435" y="80" width="55" height="30" rx="4" fill="#e9f4fb" stroke="#087ea4" />
      <text x="462" y="99" text-anchor="middle">W2</text>
      <rect x="435" y="120" width="55" height="30" rx="4" fill="#e9f4fb" stroke="#087ea4" />
      <text x="462" y="139" text-anchor="middle">W3</text>
      <g stroke="#087ea4" stroke-width="1.3" fill="none" marker-end="url(#msgarr)">
        <path d="M295 55 L325 78" />
        <path d="M405 80 L435 55" /><path d="M405 90 L435 95" /><path d="M405 100 Q 420 120 435 135" />
      </g>

      <text x="320" y="175" text-anchor="middle" font-weight="800" font-size="12">event stream (log)</text>
      <rect x="120" y="185" width="400" height="26" rx="4" fill="#fef3d7" stroke="#b7791f" />
      <g stroke="#b7791f" stroke-width="0.8">
        <line x1="170" y1="185" x2="170" y2="211" />
        <line x1="220" y1="185" x2="220" y2="211" />
        <line x1="270" y1="185" x2="270" y2="211" />
        <line x1="320" y1="185" x2="320" y2="211" />
        <line x1="370" y1="185" x2="370" y2="211" />
        <line x1="420" y1="185" x2="420" y2="211" />
        <line x1="470" y1="185" x2="470" y2="211" />
      </g>
      <text x="145" y="203" font-size="10">0</text>
      <text x="195" y="203" font-size="10">1</text>
      <text x="245" y="203" font-size="10">2</text>
      <text x="295" y="203" font-size="10">3</text>
      <text x="345" y="203" font-size="10">4</text>
      <text x="395" y="203" font-size="10">5</text>
      <text x="445" y="203" font-size="10">6</text>
      <text x="495" y="203" font-size="10">...</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Pick the shape, then the tool">
**Pub/sub** is for broadcast: every subscriber wants every message. **Work queue** is for distribution: each task goes to exactly one worker. **Event stream** is for history: a durable log that new consumers can replay from the beginning. Kafka, NATS JetStream, and RabbitMQ can each do more than one shape — but the decision you make first is which shape fits the problem.
</KeyConcept>

## Delivery semantics

The three advertised modes:

- **At-most-once** — fire and forget. The broker delivers the message at most once; it may deliver zero times. Use for metrics, logs, best-effort notifications.
- **At-least-once** — guaranteed delivery, possibly duplicates. Use for business events where loss is unacceptable and consumers can dedupe.
- **Exactly-once** — a controversial phrase. True end-to-end exactly-once requires the broker, producer, and consumer to all participate in a transactional protocol (Kafka EOS, Temporal). In practice, most systems are **at-least-once + idempotent consumer = effectively exactly-once**.

<Compare badLabel="Pretending exactly-once" goodLabel="At-least-once with idempotency">
<Fragment slot="bad">
```ts
// "I just won't retry" — the message can still be delivered twice by the broker
queue.on('order.placed', async (msg) => {
  await db.orders.insert(msg.payload)          // unique violation the second time
  await stripe.charge(msg.payload)             // double charge if the second run got further
})
```
Works 99.9% of the time. The 0.1% are the calls your CEO remembers.
</Fragment>
<Fragment slot="good">
```ts
queue.on('order.placed', async (msg) => {
  await db.tx(async (t) => {
    const inserted = await t.dedupe.insert({ id: msg.id })  // unique constraint on msg.id
    if (!inserted) return
    await t.orders.insert(msg.payload)
    await t.outbox.insert({ event_type: 'OrderStored', payload: msg.payload })
  })
})
```
Second delivery is a no-op; all side effects are one transaction.
</Fragment>
</Compare>

## Idempotency: the cost of admission

Once you accept at-least-once delivery, every consumer must be idempotent. The pattern:

```ts
// idempotency-key.ts
export async function idempotent<T>(
  key: string,
  op: () => Promise<T>,
  db: DB,
): Promise<T> {
  const existing = await db.idempotency.find(key)
  if (existing) return existing.result as T

  const result = await op()
  await db.idempotency.insert({
    key,
    result,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
  })
  return result
}
```

This works for HTTP `POST` with an `Idempotency-Key` header, for message-queue consumers with a `messageId`, and for retry-heavy outbound calls (Stripe uses this pattern for payments).

<Callout type="tip" title="Pick the idempotency key at the top of the stack">
Generate it at the edge (the client, the load balancer, or the first handler that touches the request) and pass it all the way down. Generating it inside a helper means different helpers use different keys, and you are back to duplicates.
</Callout>

## Backpressure

Producers faster than consumers is the default distributed-systems state. Without explicit backpressure, one of four things breaks: memory, the broker, the consumer, or correctness.

<Compare badLabel="Unbounded in-memory buffer" goodLabel="Bounded queue with pause">
<Fragment slot="bad">
```ts
// Node stream with no highWaterMark, consumer slower than producer
source.on('data', (chunk) => {
  buffer.push(chunk)           // grows forever
  expensiveAsync(chunk)        // never awaited
})
```
RSS climbs, eventually OOM.
</Fragment>
<Fragment slot="good">
```ts
import { pipeline } from 'node:stream/promises'
await pipeline(
  source,
  new Transform({
    highWaterMark: 64,
    transform(chunk, _enc, cb) {
      expensiveAsync(chunk).then(() => cb(null, chunk), cb)
    },
  }),
  sink,
)
```
Node's stream backpressure pauses the source when the transform is full.
</Fragment>
</Compare>

For a message broker:

- **Pull-based consumers** (Kafka, NATS JetStream with pull) naturally only fetch what they can process.
- **Push-based consumers** (AMQP default) need `prefetch` limits so the broker does not flood them.
- **Queue depth as a signal** — monitor it. If it grows, you are adding latency to the pipeline; if it does not drain, you have an outage.

```ts
// RabbitMQ / amqplib prefetch
await channel.prefetch(16) // each consumer gets at most 16 unacked messages
```

## CAP and PACELC, used in real arguments

**CAP**: during a network partition, a system can guarantee either consistency (all nodes see the same data) or availability (every request gets a response), not both. In practice, every distributed store picks one.

- **CP** (sacrifice availability under partition): Etcd, MongoDB (by default), Postgres with sync replication, HBase.
- **AP** (sacrifice consistency under partition): DynamoDB, Cassandra, Riak, many Redis cluster configs.

**PACELC** extends CAP: even when **P**artitioned you pick A or C; **E**lse (no partition) you pick between **L**atency and **C**onsistency.

<KeyConcept title="CAP is about what you give up when, not what you always have">
Every system is CP **under partition** or AP **under partition**. Normal days, both are available and both are consistent. CAP only matters when the network breaks. The interesting question for your system is: how often does that happen, how bad is it when it does, and which side of A/C do your users care about?
</KeyConcept>

### Concrete decisions

- **Money**: always C. A duplicated charge is worse than a 503.
- **Likes/views on a post**: A. Approximate numbers are fine; a 503 is worse than "the count is 2 off."
- **User profile after login**: C for credentials, A for settings. Route reads accordingly.

## Retry policy that does not make things worse

A retry without jitter is a thundering herd. A retry without an upper bound is a DDoS you wrote yourself.

```ts
async function withRetry<T>(op: () => Promise<T>, opts = { attempts: 5 }) {
  let lastErr: unknown
  for (let i = 0; i < opts.attempts; i++) {
    try {
      return await op()
    } catch (err) {
      lastErr = err
      if (!isRetriable(err)) throw err
      const backoff = Math.min(30_000, 100 * 2 ** i)
      const jitter = Math.random() * backoff
      await new Promise((r) => setTimeout(r, backoff + jitter))
    }
  }
  throw lastErr
}
```

- **Exponential backoff** spreads retries across time.
- **Jitter** prevents synchronised retries after a downstream recovers.
- **Bounded attempts** let the request actually fail eventually.
- **Retry budgets** (e.g., "at most 10% of traffic is retry") prevent a recovering downstream from being immediately re-overloaded.

<Callout type="info" title="Retry only idempotent operations">
A retry of a non-idempotent POST is a duplicated side effect. Put every retried call behind an idempotency key; refuse to retry calls that are not idempotent end-to-end.
</Callout>

## Dead-letter queues

When retries run out, the message goes somewhere you can see it — a dead-letter queue (DLQ). Without a DLQ, you either drop failing messages silently or loop forever with the same poison pill.

```ts
// BullMQ example
const queue = new Queue('emails', { connection })
const worker = new Worker('emails', sendEmail, {
  connection,
  limiter: { max: 100, duration: 1000 },
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
})

worker.on('failed', (job, err) => {
  if (job.attemptsMade >= 5) {
    deadLetters.add('dlq', { jobId: job.id, err: String(err), data: job.data })
  }
})
```

DLQs need an owner: a dashboard, an alert when depth > 0, and a replay tool.

## Pitfalls

<Pitfall title="Unbounded retry of a non-idempotent call">
A payment call times out; the service retries with the same card token. The downstream processed the first call. The customer is charged twice. **Fix:** `Idempotency-Key` on every outbound payment call; never retry without one.
</Pitfall>

<Pitfall title="Queue as a worst-of-both-worlds API">
Service A enqueues, Service B processes, A polls for the result. You rebuilt synchronous HTTP with extra latency and no timeout semantics. **Fix:** if the caller must wait, use a sync call with proper timeouts. Use the queue when the caller genuinely does not need the result now.
</Pitfall>

<Pitfall title="Ignoring DLQ depth">
DLQ starts filling with one poison message, silently. A month later, 40k messages rot there and no one noticed the feature was broken. **Fix:** page on DLQ depth > 0 for more than N minutes; assign an owner per queue.
</Pitfall>

## Lab

<Lab title="Build a resilient event-driven pipeline end to end" duration="120 min" difficulty="Hard" stack="Node.js, NATS JetStream (or Kafka), Postgres, BullMQ, toxiproxy">

### Goal
Wire a producer that writes to Postgres + outbox, a relay that publishes to a stream, and two competing consumers that each update their own derived store. The system must handle producer retries, consumer crashes, and broker unavailability without duplicating effects or losing events.

### Steps
1. Create the `orders` service with an outbox table. On `POST /orders`, insert order + outbox row in one transaction.
2. Write a relay worker that `SELECT ... FOR UPDATE SKIP LOCKED` unpublished rows, publishes to a NATS JetStream stream, and marks them published.
3. Create two consumers: `search-indexer` (updates an Elasticsearch/Meili index) and `analytics-rollup` (updates a Postgres materialized counter). Each consumer has its own durable subscription.
4. Make both consumers idempotent using the outbox row id as the deduplication key (store processed ids per consumer in its own table).
5. Introduce `toxiproxy` between the services and the broker. During load (200 rps of `POST /orders`), kill the broker for 10 s. Confirm no events are lost and no effects are duplicated.
6. Add a DLQ for messages that fail 5 times. Wire an alert and a replay script.
7. Report the end-to-end latency distribution under normal and degraded conditions.

### Success criteria
- After an induced broker outage, derived stores catch up to the source of truth with zero discrepancies
- Running the load test twice produces the same derived store content (no duplicate counters)
- DLQ depth alert fires within 1 minute of a poison message; the replay script empties it after the bug is fixed
- End-to-end latency from `POST /orders` to "search index updated" is stated with p50, p95, p99 under both conditions
- A consumer can be deleted and rebuilt from the stream's beginning; it produces the same derived state

</Lab>

## Checkpoint

<Checkpoint>
1. Given at-least-once delivery, what property must every consumer have? How do you enforce it?
2. Your payment service needs to ensure no duplicate charges despite retries. Describe the full mechanism end to end.
3. A team proposes Kafka for every inter-service call "for reliability." Name two places that is the wrong shape.
4. Under PACELC, what does DynamoDB choose under partition and under normal operation? Why?
5. Your DLQ has 400 messages. Walk through your process for draining it without re-introducing the bug that filled it.
</Checkpoint>

## Further reading

- [Microservices Boundaries and Data Consistency](/learning/system-design/microservices-boundaries-and-data-consistency/)
- [Modern System Design Coverage](/learning/system-design/modern-system-design-coverage/)
- [Performance: scaling, reliability, and capacity](/learning/performance/scaling-reliability-and-capacity/)
