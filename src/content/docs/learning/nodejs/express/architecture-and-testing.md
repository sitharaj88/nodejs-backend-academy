---
title: Architecture and Testing
slug: learning/nodejs/express/architecture-and-testing
description: Learn clean Express architecture, controller-service boundaries, dependency flow, test strategy, and how to keep APIs maintainable as they grow.
---

Many Express applications start simple and become messy because the structure never matures.

This page focuses on how to keep an Express codebase understandable as it grows.

## Avoid Route-Handler God Functions

A route handler should usually coordinate, not contain the entire system.

Separate:

- routing concerns
- validation concerns
- business logic
- persistence logic
- response formatting when appropriate

## Controller and Service Thinking

A common pattern is:

- router maps URLs to handlers
- controller coordinates request and response
- service contains business logic
- repository or data layer handles persistence

### Teaching point

This pattern is useful when it adds clarity. It should not become ceremony for tiny apps.

## Dependency Flow

Dependencies should generally flow inward toward domain logic rather than scattering framework-specific objects everywhere.

For example, service layers should not need to know about `req` and `res`.

## Example Shape

Instead of:

- validate in controller
- query database in controller
- build domain rules in controller
- format response in controller

Prefer:

- controller reads validated input
- service applies domain logic
- repository handles persistence
- controller returns the result

## Testing Strategy

Express apps benefit from multiple testing layers:

- unit tests for pure services
- integration tests for routes and middleware
- API tests for full request-response behavior

## What to Test in Express

Important behaviors include:

- route success paths
- validation failures
- auth failures
- not found cases
- service errors
- response shape consistency

## Test-Friendly Design

Applications become easier to test when:

- services are separate from Express objects
- middleware is focused
- side effects are isolated
- configuration is injectable

## Common Mistakes

- packing all business logic into route handlers
- tying service layers directly to `req` and `res`
- writing only happy-path route tests
- creating structure so abstract that small changes feel heavy
- over-mocking until real behavior is never tested

## Practice Ideas

- refactor one large route into router, controller, service, and repository responsibilities
- write integration tests for validation and auth failures
- compare a tightly coupled Express design with a more testable one
- explain which parts of the code should remain framework-agnostic

## What To Remember

- Express structure should get cleaner as the app grows
- controllers should coordinate, not become the whole system
- services should stay mostly framework-agnostic
- testing quality improves when architecture is clear
- maintainability is a teaching goal, not just a production concern
