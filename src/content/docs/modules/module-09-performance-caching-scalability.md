---
title: Module 09 - Performance, Caching, and Scalability
description: Profiling, Redis-style caching, batching, background work, event-loop safety, and scale-aware backend patterns.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="2 weeks" track="Module 09" prerequisites="Module 08 — Testing" />

This module helps students understand that backend quality includes speed and stability. Optimization is taught as measurement plus design, not random micro-tuning — and scaling is taught as a last resort, not a first instinct.

<Objectives>
- Profile a slow endpoint and name the bottleneck before changing code
- Apply caching where repeated reads justify it, with an eviction and staleness plan
- Recognize event-loop blocking, memory leaks, and runaway concurrency
- Decide when to batch, queue, or offload work — and when not to
</Objectives>

## What this module covers

- profiling bottlenecks and measuring API performance
- caching concepts with Redis
- compression, rate limiting, and request optimization
- pagination, batching, and background processing
- cluster and worker thread awareness
- memory leaks, event-loop blocking, and horizontal scaling concepts

## Teaching sequence

1. Measure baseline performance before optimizing.
2. Add caching where repeated reads justify it.
3. Compare synchronous heavy work with offloaded or batched work.
4. Introduce scaling concepts only after local bottlenecks are understood.

## Live examples

- timing an endpoint before and after caching
- paginating a large list route
- identifying blocking code in a request handler
- using a queue-like design for background jobs

## Labs

- cache a read-heavy endpoint
- profile and improve a slow handler
- design a rate-limited endpoint for a public API

## Exit outcomes

- students understand where performance gains usually come from
- students can identify obvious scalability mistakes
- students can explain why some optimization ideas are worth doing and others are not

<Callout type="tip" title="Numbers or it did not happen">
No performance change lands without a before and after number — p50 and p95 latency, or queries per request, or memory in MB. Students who optimize by intuition ship regressions. Students who measure first ship real improvements and defensible reviews.
</Callout>

## Cross-links

- Deep-study path: [Learning / Performance](/learning/performance/overview/) — event loop, profiling, caching, scaling, and capacity.
- Next module: [Module 10 — Real-Time & Advanced APIs](/modules/module-10-realtime-advanced-apis/).
