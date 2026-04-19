---
title: Scaling, Reliability, and Capacity
slug: learning/performance/scaling-reliability-and-capacity
description: Learn horizontal scaling, capacity thinking, connection reuse, background work, and how reliability and performance interact in backend systems.
---

Performance and reliability are closely connected.

## Horizontal Scaling

Students should understand why stateless services are easier to scale behind load balancers.

## Capacity Thinking

Capacity questions include:

- how many requests can the service handle
- what downstream systems limit throughput
- where are the saturation points

## Background Work

Not all tasks belong in the request path.

Moving work out of the critical path often improves both speed and reliability.

## Common Mistakes

- scaling the app layer while ignoring the database bottleneck
- doing long-running work in request handlers
- confusing burst handling with real sustained capacity

## What To Remember

- scaling is not only adding more instances
- reliability depends on identifying bottlenecks
- capacity planning starts with understanding constraints
