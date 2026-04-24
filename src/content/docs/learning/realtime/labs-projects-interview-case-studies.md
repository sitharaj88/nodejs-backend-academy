---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/realtime/labs-projects-interview-case-studies
description: Practical depth page for the real-time and advanced APIs track, including connection labs, queue projects, interview questions, and production case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="25 min" track="Real-Time & Advanced APIs" />

Real-time and async systems fail in the boring places: a missed heartbeat, a retried webhook, a rolling restart that drops a single socket at the wrong moment. These labs and case studies are drawn from the bugs that actually take production down.

## Code labs

<Lab title="Chat with rooms, presence, and Redis backplane" duration="2 h" difficulty="Medium" stack="Socket.IO, Redis, Node.js, nginx">
Build a two-pod chat where a message from pod A is delivered to clients connected to pod B. Add presence (online/offline within 2 seconds of disconnect), conversation rooms with authorization checks, and a graceful `server:drain` on SIGTERM.

**Success criteria**: broadcast latency p99 under 50 ms locally; rolling restart loses no messages; presence updates within 2 seconds; load test with 500 concurrent sockets keeps event-loop lag p99 under 10 ms.
</Lab>

<Lab title="Reliable Stripe webhook processor" duration="2 h" difficulty="Hard" stack="Express, BullMQ, Redis, Postgres">
Accept Stripe webhooks, verify signatures against the raw body, dedupe by event id in Postgres, and enqueue processing. The worker sends receipts idempotently and surfaces permanent failures via `UnrecoverableError` into a DLQ with alerting.

**Success criteria**: 10 duplicate deliveries of the same event produce exactly one side effect; worker crash mid-job recovers cleanly; SMTP down for 2 minutes: all receipts eventually arrive, none twice; endpoint p99 under 100 ms.
</Lab>

<Lab title="gRPC service with deadline propagation" duration="90 min" difficulty="Medium" stack="grpc-js, TypeScript, proto-loader">
Define a `Billing` service in `billing.proto` with `PayInvoice` and `StreamInvoiceEvents`. Generate a Node.js server and client. Wire a downstream call from `PayInvoice` to a fake `NotificationService` and verify that the caller's deadline propagates — when the caller cancels at 500 ms, both calls stop.

**Success criteria**: cancellation from the client aborts both RPCs within 50 ms; load test via `ghz` at 500 rps shows p99 under 30 ms locally; payload size at least 30% smaller than JSON equivalent.
</Lab>

<Lab title="GraphQL schema evolution without breaking clients" duration="75 min" difficulty="Medium" stack="graphql-yoga, Pothos, DataLoader, TypeScript">
Start with a schema containing `User.name`. Evolve it to split into `givenName` and `familyName` without breaking a deployed client. Add DataLoader to a `User.orders` resolver and prove the N+1 is gone. Add depth limiting and query complexity to prevent `users { orders { items { product { reviews { user {...} } } } } }` from melting the DB.

**Success criteria**: deprecation documented with `@deprecated`; old clients keep working; a complexity-above-threshold query is rejected; query logs show one DB call per relationship, not N.
</Lab>

## Mini projects

- **Live collaboration demo**: two browsers editing the same document in near-real-time with operational transforms or CRDT, Socket.IO for transport, Redis for persistence and presence. Ship with a "try it in two tabs" README.
- **Notification system with replay**: per-user stream via SSE, events persisted in Postgres, `Last-Event-ID` replay on reconnect, back-pressure handling when a client cannot keep up.
- **Outbox + BullMQ relay**: a small e-commerce module where writes commit to Postgres and drop an outbox row atomically; a relay publishes to BullMQ; a consumer sends the receipt. Kill the relay mid-flight and prove nothing is lost.
- **gRPC service mesh, local**: two Node.js services calling each other via gRPC with deadline propagation, OpenTelemetry traces exported to Jaeger, and `ghz` for load.

## Interview questions

1. Your product needs server-to-client push only, a few updates per minute per user. Pick SSE vs Socket.IO and defend the choice.
2. You run Socket.IO on two pods behind a load balancer. Messages sent on pod A do not reach clients on pod B. Walk through the diagnosis.
3. A webhook endpoint is taking 8 seconds to respond. The provider retries at 10 s. Describe the concrete bugs that appear in the next week and how you rewrite the endpoint.
4. Explain at-least-once vs exactly-once delivery in one minute. Where does "exactly-once" actually live in your system?
5. A GraphQL query `users { orders { items } }` triggers 400 SQL queries. What do you add, and where?
6. You rename a gRPC field from `customerId` to `customer_id`. Safe or not? What about changing the field number?
7. Describe the outbox pattern. What failure mode does it prevent, and what does it cost you?
8. A BullMQ job has been retried 48 times over two days and is still failing. What do you do?
9. Your chat room of 20,000 subscribers broadcasts a message; event-loop lag spikes to 400 ms. Explain why and how you fix it.
10. A team proposes "let's use Kafka" for a greenfield app with 50 requests per second. What do you ask, and what do you propose instead?

## Production case studies

### Case 1 — Presence that lied

A dashboard showed "Alice is online" for hours after Alice closed her laptop. The WebSocket server relied on the TCP `close` event to remove her from the presence set; middleboxes silently dropped the connection without sending a FIN. Nothing told the server the socket was dead.

**Lesson:** persistent connections require application-level heartbeats. Ping every 30 seconds, remove anyone who missed two pongs. TCP is not enough.

### Case 2 — The Stripe double-charge

A checkout endpoint called `stripe.charges.create` inside the webhook handler that confirmed the order. Stripe's default webhook retry kicked in after a 10-second timeout; the code processed both deliveries; the customer saw two charges. Support tickets piled up for a week before engineering noticed.

**Lesson:** any call with money or an external side effect needs an idempotency key. Stripe ships the feature for this exact reason. Process webhooks async behind a queue with dedup keys; the HTTP endpoint only validates and enqueues.

### Case 3 — The queue without a dashboard

A team added BullMQ and celebrated faster response times. Six months later, customers reported missing welcome emails. The DLQ had 80,000 items, many months old. There were no alerts, no dashboards, and the team did not even know BullMQ had a "failed" concept.

**Lesson:** a queue without observability is a trash compactor. Day-one setup: a Grafana/BullBoard dashboard, an alert on `failed` rate, and a runbook for replaying items.

### Case 4 — The GraphQL query that DoS'd Postgres

A public GraphQL endpoint had no depth or complexity limits. A bored user issued `users(first: 1000) { orders(first: 1000) { items(first: 1000) { product { reviews(first: 1000) { user { ... } } } } } }`. 10^12 resolver calls. The database froze, the Kubernetes pod OOM-killed, all other services sharing the DB failed.

**Lesson:** public GraphQL requires depth limits (typically 7–10), cost analysis, persisted queries, or all three. Private internal GraphQL can be laxer, but document the assumption.

### Case 5 — The gRPC deadline that did not propagate

Service A called service B with a 2-second deadline. Service B called service C with no deadline. When service C slowed down, service B piled up requests that service A had already abandoned; B ran out of connections; the outage cascaded.

**Lesson:** always propagate the caller's deadline. In `@grpc/grpc-js`, pass the incoming `call.getDeadline()` or a derived deadline to outbound calls. Better: a middleware that does it by default.

### Case 6 — The outbox that was not atomic

A team "implemented the outbox" by inserting the event row just after the domain update, same function, no transaction. When the DB commit succeeded but the process crashed before the outbox insert, the event was lost. It took weeks to diagnose because it happened in less than 0.1% of requests.

**Lesson:** the outbox only works inside the same transaction as the domain write. If your ORM hides the transaction, make the transaction explicit in the use case.

<Callout type="tip" title="Every case study is a failure mode checklist">
Turn each case into an acceptance criterion for the next feature. "A crash between write and publish must not lose the event." "A retried webhook must not produce a duplicate side effect." Add them to code-review prompts; they are how juniors graduate.
</Callout>

<KeyConcept title="Reliability is the product of small, specific disciplines">
Heartbeats, idempotency keys, dedup tables, bounded retries, dead-letter queues, deadline propagation, outbox writes. None of them are exciting; each one prevents a specific incident. Real-time systems stay up because teams implement all seven, not because they picked the right library.
</KeyConcept>

## Teaching tips

- Always run the failure case in the lab, not only the happy path. "Kill the worker, now what?" teaches more than an hour of diagrams.
- Require an idempotency key in every job-queuing exercise, even trivial ones.
- When a student proposes "we need real-time," force them to define latency (sub-200 ms?) and volume (one event per user per minute?) before choosing a transport.
- Pair a WebSocket lab with a load test — persistent connections fail quietly until they fail loudly.
