---
title: Modular Monolith Patterns and Pragmatism
slug: learning/architecture/modular-monolith-patterns-and-pragmatism
description: Learn modular monolith design, internal boundaries, package-level separation, and why many systems should stay monolithic before splitting into services.
---

Many systems should become good modular monoliths before anyone talks about microservices.

## Modular Monolith Thinking

A modular monolith:

- keeps deployment simple
- keeps code boundaries explicit
- reduces distributed-system overhead

## Internal Modules

Students should learn to organize by domain or capability, not just by file type.

Examples:

- users
- billing
- courses
- reporting

## Pragmatism

Architecture should match:

- team size
- complexity
- change rate
- operational maturity

## Common Mistakes

- splitting too early
- using microservice language to avoid fixing monolith structure
- forcing patterns without understanding their costs

## What To Remember

- modular monoliths solve many real product needs well
- internal boundaries matter before network boundaries
- simpler deployment is a real advantage
