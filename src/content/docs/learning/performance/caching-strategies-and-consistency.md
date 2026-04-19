---
title: Caching Strategies and Consistency
slug: learning/performance/caching-strategies-and-consistency
description: Learn in-memory caching, distributed caching, HTTP caching awareness, invalidation tradeoffs, and consistency thinking in backend systems.
---

Caching is a performance tool and a correctness tradeoff at the same time.

## Cache Levels

Common cache locations:

- in-memory
- distributed cache
- HTTP layer
- database-side caching

## Invalidation

Invalidation is where much of the complexity lives.

Students should learn to ask:

- when does cached data become stale
- who updates it
- how critical is freshness

## Common Mistakes

- adding cache without understanding consistency requirements
- caching everything
- using stale data without clear business acceptance

## What To Remember

- cache strategy depends on access patterns
- invalidation is a core design problem
- performance wins should not silently damage correctness
