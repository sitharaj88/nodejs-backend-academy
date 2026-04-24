---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/architecture/labs-projects-interview-case-studies
description: Practical depth page for the architecture track, including refactoring labs, mini-projects, interview prompts, and real-world design case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="25 min" track="Architecture" />

Architecture is learned on real code under real pressure. These labs, projects, and case studies come from repositories that grew past their original design and had to be reshaped while the business kept moving.

## Code labs

<Lab title="Four-layer refactor of a 300-line route file" duration="90 min" difficulty="Medium" stack="Node.js, TypeScript, Express, Postgres, Vitest">
Take the provided handler that mixes Zod validation, raw SQL, Stripe calls, and response shaping. Split it into `transport`, `application`, `domain`, and `infrastructure`. Write a unit test for the use case that does not touch Postgres or Stripe.

**Success criteria**: domain folder has zero third-party imports; use-case unit test runs in under 50 ms; the route file is under 40 lines; swapping `PgUsersRepo` for `InMemoryUsersRepo` only changes `main.ts`.
</Lab>

<Lab title="Invert Stripe — one use case, three transports" duration="90 min" difficulty="Medium" stack="Node.js, TypeScript, Express, BullMQ">
Start from a `payInvoice` function that hard-codes `stripe.paymentIntents.create`. Introduce a `PaymentGateway` port in the application layer, a `StripeGateway` adapter in infrastructure, and expose the use case through HTTP, a CLI, and a BullMQ consumer. A fake gateway in tests must never make a network call.

**Success criteria**: `grep -r "from 'stripe'" src/billing/application src/billing/domain` returns nothing; adding a `MockGateway` takes one file; failure paths are covered by unit tests.
</Lab>

<Lab title="Split a ball of mud into a modular monolith" duration="2 h" difficulty="Hard" stack="Node.js, TypeScript, Express, ESLint, Postgres">
Given a 2,000-line Express app where `users`, `billing`, and `courses` share a single `services/` folder, reshape the repo into `src/modules/{users,billing,courses}`, each with its own layered structure and an `index.ts` public surface. Introduce one internal event (`invoice.paid` → `courses.unlock`) and enforce boundaries with `eslint-plugin-boundaries`.

**Success criteria**: `madge` shows clean module seams; ESLint fails on cross-module internal imports; deleting the `courses` module still lets `users` and `billing` compile; one passing unit test for each module.
</Lab>

<Lab title="Introduce an outbox" duration="75 min" difficulty="Hard" stack="Node.js, TypeScript, Postgres, pg, BullMQ">
Move from in-process `bus.publish(event)` to a transactional outbox. Writes insert into `outbox(id, type, payload, created_at)` in the same transaction as the domain change; a worker polls and publishes to BullMQ. Verify atomicity by killing the process between the domain commit and the publish: the event must still be delivered on restart.

**Success criteria**: integration test proves exactly-once-ish delivery across a forced crash; no events are lost and no duplicates reach consumers that check the outbox id; worker lag stays under one second.
</Lab>

## Mini projects

- **Course-management modular monolith**: build an end-to-end app with three modules (`users`, `billing`, `courses`). One internal event unlocks a course when an invoice is paid. Ship with boundary ESLint rules and a single-command dev setup (`docker compose up` + `pnpm dev`).
- **Architecture improvement proposal**: take an intentionally messy training repo. Produce a five-page RFC with: current import graph (via `madge`), proposed target, a phased migration plan that never breaks `main`, and a measurable success metric (e.g., "cross-module imports drop from 47 to 0").
- **Hex template for your team**: produce a minimal starter kit with one module, four layers, a fake adapter in tests, and an enforced boundary ruleset. Document what goes where in under two pages.

## Interview questions

1. Explain layered architecture in your own words. What problem does it solve that route handlers do not?
2. State the dependency rule from clean architecture. Give one situation where applying it is worth the ceremony and one where it is not.
3. Your service returns a Prisma `User` type from its public API. A colleague wants to swap Prisma for Drizzle. Walk through the blast radius and how layering would have changed it.
4. When would you introduce a `PaymentGateway` interface with only one implementation? Defend or reject the decision.
5. You inherit a codebase with `src/controllers/`, `src/services/`, `src/repositories/`, all organised by file type. A product manager wants a new "subscriptions" capability. How do you structure it?
6. What makes a modular monolith a monolith rather than a distributed system, and what makes it modular rather than a big ball of mud?
7. Give three signals that a module has earned extraction into a separate service. Give three signals that it has not.
8. DDD, hexagonal, onion, and clean architecture all describe the same core idea. What is it, and why do we have four names?
9. Describe the outbox pattern and the specific failure it prevents. What is the trade-off compared to a direct `bus.publish` call?
10. You see a use case that throws `new HttpError(404)`. What is the concrete harm? Rewrite it correctly.

## Production case studies

### Case 1 — Controller-layer collapse

A growing SaaS had every feature implemented as an Express handler with inline SQL, inline Stripe calls, and inline email. The team had 400 route handlers and no services. Adding MFA required editing 38 handlers; half were missed and shipped the old behaviour to production.

**Lesson:** duplication in handlers becomes silent drift. A thin application layer pays for itself the first time a cross-cutting change is needed. The fix was boring: extract use cases one handler at a time, behind a feature flag, tests first.

### Case 2 — Overengineered clean architecture

A four-person team adopted hexagonal architecture with ports, adapters, factories, and a DI container. Each new feature required changes in seven files. Onboarding new hires took weeks. They were a CRUD app with one database.

**Lesson:** ports pay off when you use them. With one implementation and no foreseeable swap, they are tax. The team deleted the interfaces, kept the layers, and velocity recovered in a sprint.

### Case 3 — Monolith without internal boundaries

A team blamed their monolithic deployment for slow delivery and spent six months splitting into nine services. Delivery got slower. The real problem: inside the monolith, `UsersService`, `CoursesService`, and `BillingService` all imported each other's internals. The network boundary inherited the same mess, with added latency and partial failures.

**Lesson:** boundaries are a code problem first, a deployment problem second. They folded three of the services back into a modular monolith, enforced boundaries with ESLint, and kept the two that had genuinely different scaling needs.

### Case 4 — The shared-kernel junk drawer

A `packages/shared/` directory started with `Money` and `Result`. Two years later it held 140 files: `shared/users/types`, `shared/billing/helpers`, `shared/courses/formatters`. Changing anything in `shared/` required approval from every team. Deploys froze.

**Lesson:** shared code has gravity. Set an explicit rule — "shared kernel holds types that mean the same thing in every module, with no behaviour that is likely to change" — and audit it quarterly. Move everything else back into its module.

### Case 5 — Event soup

A modular monolith introduced an internal event bus. A year later, paying an invoice triggered 14 handlers, five of which triggered their own events. Debugging a single user-visible action required reading eight files. Nobody could say what `invoice.paid` meant any more because every consumer interpreted it differently.

**Lesson:** events describe facts, not workflows. When a workflow needs to happen in a specific order with specific failure handling, write it as an explicit use case (orchestration) rather than leaving it to choreography. Keep event consumers shallow; when a consumer starts emitting events of its own, check that you have not built a hidden state machine.

<Callout type="tip" title="Pair every case study with a refactor, not a lecture">
Give learners the broken codebase, not just the story. A 30-minute pairing session with working tests teaches more than any slide deck.
</Callout>

<KeyConcept title="Architecture is the set of changes you did not need to make">
The value of a layer, a port, or a module boundary shows up when a requirement lands and you can say "one file, fifteen minutes." If every change in your codebase touches every folder, no amount of pattern vocabulary is saving you.
</KeyConcept>

## Teaching tips

- Always start from a real repo with real smells. Greenfield labs hide the only skill that matters: refactoring under constraints.
- Insist on measurable targets ("cross-module imports go from N to 0", "use-case unit test runs in under 50 ms").
- Reward clarity in code review, not pattern vocabulary. "Why is this interface here?" is a fair question for every interface.
- When a design debate stalls, write the next three user stories on the board and ask which shape makes them easiest.
