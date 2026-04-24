---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/system-design/labs-projects-interview-case-studies
description: Practical depth page for the system design track, including design labs, mini-project prompts, interview questions, and production case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Advanced" duration="25 min" track="System Design" />

System design gets real when you have to defend a drawing. The drills below are the four classics, modelled the way they actually come up at work, with numbers attached. Run each one end to end. Disagree with a teammate. Revise.

## Design drills

<Lab title="URL shortener at 100M redirects/day" duration="75 min" difficulty="Medium" stack="Whiteboard, Node.js, Postgres, Redis, CDN">
Design the full path for `POST /shorten` and `GET /:code`. Start from numbers (rps, storage/year, peak ratio), pick partitioning for the code→url map, pick a cache layer and justify the TTL, and describe the read path end to end including CDN behavior. Then extend: how does the design change at 10× load? What changes to support 99.99% availability vs 99.9%?

**Success criteria**: back-of-envelope math is visible, cache hit-rate target is defended, the read path fits in a p99 budget of 80 ms at peak, and the first three bottlenecks beyond 100M/day are named with the change that addresses each.
</Lab>

<Lab title="Distributed rate limiter for a public API" duration="75 min" difficulty="Hard" stack="Node.js, Redis, Lua or Redis functions, k6">
Design a rate limiter that enforces "100 rps per API key" across 40 stateless app pods. Compare three algorithms (token bucket, sliding window log, sliding window counter) on accuracy, memory, and Redis RTT cost. Implement one. Load-test with `k6` at 5× the allowed rate; prove that no single key exceeds its budget and that the overhead per request stays under 2 ms at p99.

**Success criteria**: algorithm choice is defended with a numeric tradeoff, the Redis implementation is atomic (one round-trip or one Lua script), `k6` results show rejected excess traffic and stable p99 for compliant callers.
</Lab>

<Lab title="Realtime chat for 50k concurrent users" duration="120 min" difficulty="Hard" stack="Node.js, WebSocket (ws or uWebSockets.js), Redis pub/sub, NATS, Postgres">
Design the architecture for a group chat app: WebSocket ingest, message fanout, history, read receipts. Reason about concurrent connections per pod (OS file descriptor limits, memory per socket), horizontal fanout via Redis or NATS pub/sub, and history retention. Identify the single-writer-per-room pattern and how you shard rooms across pods with consistent hashing. Extend: what changes at 500k concurrent? At 5M?

**Success criteria**: a single diagram that shows connections, fanout, and storage; capacity math for concurrent connections; a decision on ordering guarantees per room (and how you enforce them); a rollout plan for the sticky-routing scheme.
</Lab>

<Lab title="Notifications pipeline with exactly-once user-visible effect" duration="120 min" difficulty="Hard" stack="Node.js, NATS JetStream (or Kafka), Postgres outbox, BullMQ, toxiproxy">
Design a system that delivers transactional notifications (email + push) triggered by events from other services. Requirements: no duplicate emails ever sent, no email lost, p99 delivery under 30 s. Implement the outbox in the publisher, idempotent consumers in the worker, dedupe per channel (one email per `(userId, eventId)` pair), and a DLQ with alert. Induce a broker outage with `toxiproxy` during load and verify behaviour.

**Success criteria**: after induced outages, a reconciliation script reports zero duplicates and zero misses; DLQ depth alert fires and replay is clean; end-to-end latency is reported with p50/p95/p99 under normal and degraded conditions; the whole design is explainable on a single page.
</Lab>

## Mini projects

- **Capacity study**: take a real service you have access to (or a public one with an API). Measure rps, p50/p99, DB QPS, cache hit rate. Produce a one-page memo on the next bottleneck with numbers.
- **Monolith-to-services cut**: pick a module in a real codebase and write the extraction plan (new service name, owned tables, published events, consumed events, sync calls, rollback plan). Even if you never execute it, the document exposes the hidden couplings.
- **SLO-driven redesign**: given current SLO misses on a service, propose two architectural changes, each with an expected SLO impact. Defend the cost.
- **Architecture review kit**: create a checklist for reviewing a system-design document (SLOs, capacity math, failure modes, consistency window, rollback path). Run three reviews with it and iterate.

## Interview questions

1. Design a URL shortener. Do the capacity math before drawing a box.
2. Your service is at 70% CPU at 1,000 rps. Walk through three ways to double throughput without adding hardware.
3. How would you split a monolith into services? Name the first two services and the first data you would carve out.
4. Explain CAP in two sentences and PACELC in one more. Give a concrete example of PACELC in a system you use.
5. What does "exactly-once" mean in practice? What does it require from the broker, the producer, and the consumer?
6. You need a cross-service workflow that must not lose money. Describe two designs (orchestrated and choreographed) and pick.
7. A downstream slows to 2 seconds per call during a spike. Design the retry and timeout policy that does not make it worse.
8. When would you choose DynamoDB over Postgres? When the reverse?
9. Design a feature flag service with targeting, 1ms p99 reads, and global distribution.
10. A user reports a missing notification. Trace the possible failure modes from event emission to push delivery and name the log line or metric you would check at each hop.
11. You have 500 rps of writes on one Postgres primary; the primary is at 80% IO. Options?
12. Draw a notification pipeline with deduplication. Where does the dedupe key come from?
13. What is the transactional outbox and what problem does it solve?
14. When is a service mesh worth adopting? What does it cost?
15. Explain the strangler-fig pattern with a concrete migration example.

## Production case studies

### Case 1 — The premature split

A team of five split a 30-rps monolith into eight services "to prepare for scale." Each feature now touched four services. Release velocity dropped by 60% for two quarters. Most services shared a database because carving data was too hard.

**Lesson:** microservices pay for themselves only when team autonomy and deploy independence are real constraints today. Modular monolith first; extract by necessity, not by aspiration.

### Case 2 — The shared database that wasn't

Two services "owned" their own schemas in one Postgres instance. Over a year, one schema grew read-only access from the other, then a foreign key, then a nightly ETL. When the DB needed a major-version upgrade, both teams had to coordinate, and the "independent" services turned out to have a hidden joint deploy.

**Lesson:** one service, one database process. If you cannot afford that operationally, do not claim to have microservices; you have a monolith with extra hops.

### Case 3 — Retry storm during a degradation

A downstream slowed from 80 ms to 1.5 s during a cache warmup. Upstream retried on timeout with no jitter and no budget. Retry traffic tripled the downstream load, which pushed it past 3 s, which caused every call to timeout and retry. The outage lasted 22 minutes after the original cause cleared.

**Lesson:** every retry policy needs exponential backoff, jitter, a retry budget, and an upstream circuit breaker. Without them, retry logic turns a 30-second blip into a half-hour outage.

### Case 4 — Exactly-once that wasn't

A team built a notification pipeline with "exactly-once delivery" by trusting the broker's EOS flag. During a broker restart, consumers were re-assigned; the dedupe state lived in the old consumer's memory. A subset of users received the same email twice. Customer trust took months to recover.

**Lesson:** idempotency must live in durable storage keyed on a client-chosen id, not in the broker or consumer memory. The broker's guarantees cover the broker, not your side effects.

### Case 5 — The CAP decision nobody made

A team built a multi-region ledger on an AP store ("it has replication"). Under a network partition, two regions accepted concurrent writes for the same account. Reconciliation took 9 days and required manual adjustments. The correct store had always been CP.

**Lesson:** choose AP or CP on purpose. If money or identity is in the data, you almost always want CP; accept the latency and availability cost. Read the store's documentation on partition behaviour before, not after, the partition.

<Callout type="tip" title="Archaeology beats lecture">
For each case study, have learners reconstruct the on-call timeline from the symptoms. What alert fires first? Which dashboard do you open? What command do you run? The discipline of "what would you have done at minute 3?" is the whole point of system design.
</Callout>

## Teaching tips

- Require numbers on every whiteboard. "Fast" is not a number; "p99 under 200 ms at 5k rps" is.
- For every design, demand three failure modes and one rollback plan.
- Call out tooling preferences disguised as tradeoffs. "Kafka is better" is not a tradeoff; "replayability vs ops burden" is.
- Pair every interview-style drill with a 10-minute critique afterwards. The critique is where the learning happens.
