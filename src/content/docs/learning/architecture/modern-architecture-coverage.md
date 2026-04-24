---
title: Modern Architecture Coverage
slug: learning/architecture/modern-architecture-coverage
description: Coverage map for the architecture and clean design learning track, including layers, dependency flow, modularity, and practical tradeoffs.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'

<LessonMeta level="Intermediate" duration="10 min" track="Architecture" prerequisites="Layered and clean architecture basics" />

The architecture vocabulary is wide and half of it is marketing. This page is a tour of the patterns you will see in Node.js job descriptions and RFCs, what each one actually means, when it earns its keep, and when it is astronautics. Treat it as a lookup table, not a syllabus.

<Objectives>
- Read an architecture RFC without being bluffed by vocabulary
- Pick the lightest pattern that solves the problem in front of you
- Recognise the Node.js ecosystem equivalents (Nx, Turborepo, NestJS, tRPC)
- Know which patterns are load-bearing and which are folder names
</Objectives>

## The map

### Layered architecture

Four layers, arrows down. Covered in depth on [Layered Architecture and Boundaries](/learning/architecture/layered-architecture-and-boundaries/). The right default for 80% of services.

### Clean / hexagonal / onion

Same idea, different vocabulary: dependencies point inward. See [Clean Architecture and Dependency Flow](/learning/architecture/clean-architecture-and-dependency-flow/). Useful when you genuinely swap infrastructure (tests, multiple transports, vendor change on the horizon).

### Modular monolith

Feature modules in one deployable, narrow public surfaces, internal events. See [Modular Monolith Patterns and Pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/). The right step before microservices for most teams.

### Domain-Driven Design, lite

The useful 20% of DDD without the rituals:

- **Ubiquitous language** — the same word means the same thing in code, UI, and meetings. `Invoice.total`, not `price`, `cost`, and `amount_due` in three files.
- **Bounded context** — a module's language is local. `User` in `billing` and `User` in `courses` can be different types.
- **Entity vs value object** — entities have identity, value objects are compared by their fields. `Money`, `Address`, and `DateRange` are value objects.
- **Aggregate** — a cluster of entities mutated through a single root. `Order` owns `OrderLine`; you never save a line without its order.

<Callout type="info" title="Skip the tactical patterns until you feel the pain">
Repositories, specifications, domain services, factories — learn them as answers to problems you already have. Introducing them prophylactically produces code that is hard to read and adds no behaviour.
</Callout>

### Vertical slices

Organise by feature first, then by layer inside the feature. The folder tree looks like:

```
features/
  register-user/
    route.ts
    use-case.ts
    repo.ts
    test.ts
  pay-invoice/
    route.ts
    use-case.ts
    gateway.ts
    test.ts
```

Great for small teams and fast-moving codebases: the blast radius of a change is one folder. Tends to drift unless you promote shared rules into a proper domain layer when two slices start copying the same invariant.

### Event-driven architecture

Modules (or services) communicate by publishing facts rather than calling each other. Variants:

- **Choreography** — everyone subscribes to events they care about. Low coupling, high complexity to debug end-to-end flows.
- **Orchestration** — one saga coordinates multiple services via commands and events. Easier to reason about, reintroduces coupling in the orchestrator.

Nodes of the ecosystem: in-process bus (cheap, see modular monolith page), BullMQ (jobs + events over Redis), NATS (subjects, at-most-once or JetStream at-least-once), Kafka (log-structured, replay, high throughput). See [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/).

### CQRS-lite

Command Query Responsibility Segregation, without the full event-sourced version:

- Writes go through use cases that enforce invariants and emit events.
- Reads are served by denormalised projections (a separate read model, often a view or a cache) optimised for the UI's query shape.
- You do **not** need event sourcing to get value. Even just "the write side owns the domain, the read side owns response shapes" is enough to unblock a team.

<Pitfall title="Full CQRS + event sourcing is a commitment, not a pattern">
Event sourcing changes how you back up, how you migrate schemas, how you debug production, how you onboard new engineers. Adopt it when you have a compelling audit, reversibility, or temporal-query requirement — not for aesthetics.
</Pitfall>

### Microservices

A deployment choice, not an architecture. Each service owns its schema, releases independently, talks over the network. Earns its cost when:

- Teams are large enough that coordination across one repo is more expensive than coordination across APIs.
- Parts of the system have fundamentally different scaling, availability, or compliance needs.
- You have the operational muscle (tracing, centralised logging, on-call, service catalogue) to survive them.

### Serverless / functions

Each endpoint is a function, the platform handles scale-to-zero and autoscaling. Good for spiky, stateless workloads and glue code (webhook processors, scheduled tasks). Bad for stateful workloads, long-running jobs, anything sensitive to cold starts. See AWS Lambda + API Gateway, Vercel, Cloudflare Workers (different runtime, V8 isolates rather than Node.js).

### Backend-for-frontend (BFF)

A thin service per frontend (web, iOS, Android) that composes calls to internal services and shapes the response for that specific UI. Eliminates the "one API for every client" dilemma. Becomes a leaky abstraction if the BFF starts holding business rules — keep it to composition and translation.

## Monorepo vs polyrepo

Modern Node.js teams default to monorepos — not for philosophy, but because the tooling finally works.

- **Nx** — opinionated task graph, generators, affected-only builds, strong at enforcing module boundaries with `@nx/enforce-module-boundaries`.
- **Turborepo** — minimal, fast, remote caching. Good for teams that already know what they want.
- **pnpm workspaces** — the package manager layer; pairs with either of the above or works alone for smaller repos.

<Callout type="tip" title="Boundaries live in the same repo as the code">
A monorepo with enforced module boundaries gives you most of the benefit of polyrepos (clear ownership, fast feedback on violations) without the coordination tax. Use `eslint-plugin-boundaries`, Nx tags, or path-based CODEOWNERS to make the rules real.
</Callout>

## Node.js-specific opinionated frameworks

- **NestJS** — Angular-style decorators, DI container, modules. Removes the "how do I structure this?" question by giving you an answer. Good for teams that want opinions; adds its own mental model you must teach everyone.
- **tRPC** — fully typed client-server calls without a schema language. Feels like calling local functions. Excellent for full-stack TypeScript monorepos; see [GraphQL, gRPC, and Advanced API Shapes](/learning/realtime/graphql-grpc-and-advanced-api-shapes/).
- **Hono / Fastify / Koa** — smaller routers than Express. The architectural decisions are still yours.

## How to pick

1. Start with layered architecture in a modular monolith. This is correct for almost everyone starting out.
2. Add clean/hex dependency inversion at the seams where you genuinely need testability or optionality.
3. Add events between modules when cross-module orchestration starts to dominate your calendar.
4. Adopt CQRS-lite when read and write shapes diverge so far that one model is slowing both down.
5. Extract services only when a module has earned it (see the monolith page's three criteria).

## Bottom line

The architecture you can maintain for three years beats the architecture that looks impressive in a diagram today. Every pattern above has a cost; choose the ones whose cost you are willing to pay.
