---
title: System Design Fundamentals and Scalability
slug: learning/system-design/system-design-fundamentals-and-scalability
description: Learn core system design thinking, scale dimensions, latency, throughput, bottlenecks, and how to reason about backend architecture beyond individual functions.
---

System design begins when students stop seeing an application as one process and start seeing it as a set of cooperating concerns.

## Core Dimensions

Important concepts include:

- latency
- throughput
- concurrency
- availability
- consistency
- fault tolerance

## Bottlenecks

Students should learn to ask:

- where does the system slow down first
- which dependency limits scale
- what happens during spikes

## Common Mistakes

- describing components without explaining tradeoffs
- ignoring latency budgets
- treating scale as only an app-server count problem

## What To Remember

- system design is about tradeoffs
- bottlenecks define real scale limits
- backend design should be discussed in terms of constraints
