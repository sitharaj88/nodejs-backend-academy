---
title: Module 09 - Performance, Caching, and Scalability
description: Profiling, Redis-style caching, batching, background work, event-loop safety, and scale-aware backend patterns.
---

**Duration:** 2 weeks

This module helps students understand that backend quality includes speed and stability. Optimization is taught as measurement plus design, not random micro-tuning.

## What Learners Cover

- profiling bottlenecks and measuring API performance
- caching concepts with Redis
- compression, rate limiting, and request optimization
- pagination, batching, and background processing
- cluster and worker thread awareness
- memory leaks, event-loop blocking, and horizontal scaling concepts

## Suggested Teaching Sequence

1. Measure baseline performance before optimizing.
2. Add caching where repeated reads justify it.
3. Compare synchronous heavy work with offloaded or batched work.
4. Introduce scaling concepts only after local bottlenecks are understood.

## Live Examples

- timing an endpoint before and after caching
- paginating a large list route
- identifying blocking code in a request handler
- using a queue-like design for background jobs

## Practical Labs

- cache a read-heavy endpoint
- profile and improve a slow handler
- design a rate-limited endpoint for a public API

## Exit Outcomes

- students understand where performance gains usually come from
- students can identify obvious scalability mistakes
- students can explain why some optimization ideas are worth doing and others are not
