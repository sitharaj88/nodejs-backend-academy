---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/performance/labs-projects-interview-case-studies
description: Profiling labs, caching mini-projects, scaling drills, interview questions with model answers, and production outage case studies for the performance track.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="20 min" track="Performance" />

## Labs

<Lab title="Profile, fix, re-measure" duration="60 min" difficulty="Medium" stack="Node.js, clinic, autocannon">
Pick a real endpoint (or use the starter). Baseline p50/p95/p99 at 500 rps. Capture a flame graph. Identify the largest block. Ship the smallest fix. Re-measure.

**Success criteria:** p99 drops ≥60%, event-loop p99 < 10 ms, diff ≤ 20 lines, commit includes before/after numbers.
</Lab>

<Lab title="Cache with a freshness contract" duration="60 min" difficulty="Medium" stack="Express, Redis, autocannon">
Add a look-aside cache to a slow read path. Document the TTL **reason**. Add stampede protection. Invalidate on write with a version key.

**Success criteria:** DB QPS drops ≥90% under load, stampede test produces 1 DB query not 500, post-write read returns new version within 1 s.
</Lab>

<Lab title="Survive a broken dependency" duration="75 min" difficulty="Hard" stack="Node.js, opossum, toxiproxy, BullMQ">
Make the service stay up at 80% functionality while a dependency is hard-down. Timeouts, circuit breaker, load shedding, queue-for-later.

**Success criteria:** 95% of writes return 202 within 500 ms during the outage, queued work completes after recovery, unrelated endpoints unaffected.
</Lab>

<Lab title="Offload CPU to a worker pool" duration="45 min" difficulty="Medium" stack="Node.js, piscina">
You have a `POST /reports` handler that hashes and transforms a 5 MB payload synchronously. Move the work to a `worker_threads` pool and keep the API responsive at 200 rps.

**Success criteria:** event-loop p99 stays under 15 ms, request p99 under 250 ms, pool size tuned and justified.
</Lab>

## Mini projects

- **Dashboard API with latency budget**: build a `/dashboard` endpoint that aggregates 6 data sources in parallel. Enforce a 400 ms p99 budget using timeouts, fallbacks, and SLO-monitored metrics.
- **Cache hierarchy**: add browser cache (ETag), CDN TTL, in-process LRU, and Redis tiers to the same read. Measure the hit rate at each tier under a realistic access pattern.
- **Canary performance gate**: instrument CI to run a 60-second k6 test on every PR. Fail the build if p99 regresses &gt;10% vs main.

## Interview questions

1. Explain the Node.js event loop to a senior backend engineer. What does &ldquo;blocking the loop&rdquo; actually mean?
2. p50 is healthy but p99 is bad. Name three causes and how you would differentiate them.
3. You add caching and latency drops — but users report stale data. What did you forget?
4. A service has 8 CPU cores. You run 1 Node process. When do you care and what are the options?
5. Define a cache stampede and three ways to prevent one.
6. Why can `bcrypt.hash` ruin throughput while `argon2.hash` does not?
7. What is Little's Law and how would you apply it to size a connection pool?
8. When should you use `worker_threads` vs a queue + worker process?
9. Your downstream is 99.9% available. You call it in every request. What is the ceiling on **your** availability?
10. Describe SLO-driven performance work in 60 seconds.

### Model answer — question 3

Caching almost certainly dropped latency. The stale-data problem means there is no agreed **freshness contract**. Options: shorten TTL (simple, may lose the win), invalidate on write (correct, requires writer awareness), or version the key on write (no delete step, always consistent on read). Pick based on who writes and how often.

## Production case studies

### Case 1 — The sync hash

A signup endpoint used `bcrypt.hashSync(pw, 12)`. At 80 signups/second, the loop was blocked for 120 ms per signup — mean latency for *everything* jumped to 700 ms. Switching to `argon2` (async) dropped p99 of **unrelated** endpoints by 4×. The signup endpoint itself was unchanged; freeing the loop fixed the fan-out.

**Lesson:** CPU cost in the request path is everyone's problem.

### Case 2 — The unpatrolled cache

A team cached the `isFeatureFlagOn(userId, key)` result for 60 s. When a marketing flag was changed mid-campaign, users continued to see the old treatment for up to 60 s. A support ticket storm followed. The TTL was not picked with a business reason; the team had copied it from a blog post.

**Lesson:** pick TTLs with a written rationale. "60 seconds" is not a rationale.

### Case 3 — Scaling the wrong tier

On Black Friday, the team doubled app pods when latency rose. Latency got **worse** because the connection pool filled Postgres past its limit. Query queueing ballooned. Rolling back pods and adding pgbouncer + read replicas fixed it.

**Lesson:** bottlenecks live where the queue grows. If CPU is idle and latency is high, you're waiting on something downstream.

### Case 4 — Missing timeouts

The payments API hung during a partial outage. Our service had no timeouts on outbound HTTP and held 10,000 sockets open. Health checks timed out. Kubernetes killed the pods. New pods inherited the same problem. Adding 800 ms timeouts and a circuit breaker turned a 40-minute incident into a clean 2-minute degrade.

**Lesson:** every outbound call has a timeout. Period.

### Case 5 — The flame-graph surprise

A team assumed a slow endpoint was the database. A flame graph showed 60% of CPU in `JSON.stringify` on a response that embedded the whole user graph. Trimming the response to the fields the client actually used dropped p99 by 70% with no DB changes.

**Lesson:** guess after the graph, not before.

<Callout type="tip" title="Always measure before and after">
Every performance PR in this program must include numbers. &ldquo;Faster&rdquo; is not a claim — `p99 240 ms → 85 ms at 500 rps` is.
</Callout>

## Teaching tips

- Start every lesson with a measurement, not a suggestion.
- Treat performance like correctness: write the failing measurement first, ship the fix, re-measure.
- Keep cache freshness visible in reviews. Any cache entry must have a stated maximum staleness and a path back to the source.
- Tie capacity math to on-call: if the team can't size the connection pool on a whiteboard, they will size it wrong in an outage.
