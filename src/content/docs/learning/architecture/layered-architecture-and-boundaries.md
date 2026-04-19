---
title: Layered Architecture and Boundaries
slug: learning/architecture/layered-architecture-and-boundaries
description: Learn layered backend architecture, boundary placement, DTO and domain separation, and how to keep responsibilities clear in growing services.
---

Layered architecture is often the first maintainable step beyond route-handler sprawl.

## Typical Layers

Common layers include:

- transport or controller layer
- application or service layer
- repository or persistence layer
- external integration layer

## Why Boundaries Matter

Boundaries help prevent:

- framework leakage everywhere
- duplicated business rules
- direct coupling between request objects and domain logic

## DTOs Versus Domain Models

Students should separate request DTOs from domain entities whenever the shapes have different purposes.

## Common Mistakes

- putting all logic in controllers
- making layers so thin they add no value
- letting request objects leak into deep business logic

## What To Remember

- layers exist to separate responsibility
- boundaries should make the code easier to reason about
- transport concerns and domain concerns are not the same
