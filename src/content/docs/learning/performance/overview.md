---
title: Performance and Caching Overview
slug: learning/performance/overview
description: The performance track — profiling the event loop, caching strategies that stay correct, and scaling tactics that do not break correctness under load.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Performance" prerequisites="Node.js event loop, basic Express" />

Performance is not a vibe. It is a measurement, a target, and a budget you defend in code review. This track teaches you to profile honestly, cache without creating stale truth, and scale without breaking invariants.

<Objectives>
- Read a flame graph and identify the real bottleneck
- Measure event-loop latency and act on the numbers
- Choose the right caching layer and invalidation strategy
- Plan capacity with back-of-envelope math rather than hope
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Measure', title: 'Profiling & the Event Loop', description: 'Flame graphs, CPU profiling, lag, and what slows Node.js.', href: '/learning/performance/performance-profiling-event-loop/' },
  { eyebrow: 'Cache', title: 'Caching Strategies', description: 'Look-aside, write-through, TTLs, stampedes, and invalidation.', href: '/learning/performance/caching-strategies-and-consistency/' },
  { eyebrow: 'Scale', title: 'Scaling, Reliability, Capacity', description: 'Cluster, workers, load shedding, bulkheads, and capacity math.', href: '/learning/performance/scaling-reliability-and-capacity/' },
  { eyebrow: 'Ecosystem', title: 'Modern Performance Coverage', description: 'clinic, 0x, autocannon, k6, p99, and instrumentation.', href: '/learning/performance/modern-performance-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Profile, cache, scale, and reason about outages.', href: '/learning/performance/labs-projects-interview-case-studies/' },
]} />

<Callout type="tip" title="Measure before you tune">
Every performance decision in this track starts with a number. &ldquo;It feels slow&rdquo; is not a finding. `p99=820ms at 1k rps` is.
</Callout>

## Outcomes

By the end of the track, you can take a warm production service, measure p50/p95/p99 under realistic load, explain where each millisecond goes, and plan the smallest change that meets an SLO without making the system less reliable.
