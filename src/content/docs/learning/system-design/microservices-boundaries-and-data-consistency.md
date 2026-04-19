---
title: Microservices Boundaries and Data Consistency
slug: learning/system-design/microservices-boundaries-and-data-consistency
description: Learn when microservices are justified, how to draw boundaries, and how consistency becomes more complex once services split.
---

Microservices are not a maturity badge. They are a tradeoff.

## Boundary Thinking

Students should define boundaries using:

- domain ownership
- team ownership
- change patterns
- operational independence

## Data Consistency

Once services split, consistency becomes harder:

- data duplication appears
- synchronous dependency chains appear
- cross-service workflows become more complex

## Common Mistakes

- splitting by technical layer instead of domain capability
- creating services before a modular monolith is healthy
- ignoring consistency costs

## What To Remember

- service boundaries should reflect real ownership
- microservices increase coordination cost
- consistency tradeoffs are central to the decision
