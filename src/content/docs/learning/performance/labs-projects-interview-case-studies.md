---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/performance/labs-projects-interview-case-studies
description: Practical depth page for the performance track, including profiling labs, caching projects, interview tradeoffs, and production case studies.
---

This page adds hands-on depth to the performance and caching track.

## Code Labs

- Measure the impact of a blocking CPU loop on a simple Node.js API and explain the event-loop effect.
- Add caching to a read-heavy endpoint, then discuss invalidation and stale-data tradeoffs.
- Compare a buffered file-processing route with a streamed version and document the runtime differences.

## Mini Projects

- Build a small dashboard API and optimize it through profiling, query reduction, and response-shape discipline.
- Add layered caching to a training app and document where freshness guarantees become weaker.

## Interview Questions

- What does it mean to block the event loop?
- When does caching help, and when can it make behavior worse?
- Why should optimization follow measurement?
- What are the tradeoffs between latency and consistency?
- What is the difference between scaling and optimization?
- How do background jobs help performance under load?

## Production Case Studies

### Case Study 1: Event-Loop Blocking in a Request Path

A report-generation endpoint performed heavy synchronous processing during requests. Latency for unrelated traffic increased because the process could not respond smoothly under load.

### Case Study 2: Cache Without Invalidation Plan

Caching improved benchmarks quickly, but production users received stale data because invalidation and freshness expectations were never defined.

### Case Study 3: Scaling the Wrong Tier

The team increased application instances while the real bottleneck was a slow database query with poor indexing and repeated downstream calls.

## Teaching Advice

- Use measurements and before-or-after comparisons in labs.
- Make students explain the cost of every performance decision.
- Keep consistency and correctness visible in caching discussions.
