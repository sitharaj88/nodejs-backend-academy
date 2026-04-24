---
title: Module 12 - System Design and Microservices Basics
description: Scalable backend design, queues, brokers, service communication, retries, idempotency, and monolith versus microservices trade-offs.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Advanced" duration="2 weeks" track="Module 12" prerequisites="Modules 07 and 11" />

This module gives learners the language and mental models to discuss larger backend systems professionally, even if they are still building monoliths. The point is not to ship microservices. The point is to argue about them correctly.

<Objectives>
- Describe queues, retries, idempotency, and fault tolerance with concrete examples
- Compare monolith, modular monolith, and microservices with honest trade-offs
- Sketch service boundaries for a real product and defend them
- Reason about where an event-driven pattern helps and where it complicates things
</Objectives>

## What this module covers

- designing scalable backend systems
- queues, message brokers, and asynchronous processing concepts
- microservices basics and service communication
- API gateways, service discovery, and trade-offs
- idempotency, retries, and fault tolerance
- event-driven architecture overview
- choosing monolith versus microservices

## Teaching sequence

1. Start from a monolith students already understand.
2. Identify growth pressures that lead to new architecture decisions.
3. Explain queues, retries, and idempotency with concrete product examples.
4. Compare the cost of microservices with the cost of staying monolithic.

## Live examples

- order processing flow modeled as synchronous versus queued work
- retry-safe webhook or payment callback thinking
- architecture sketch for a growing SaaS platform

## Labs

- draw system boundaries for a capstone project
- explain where a queue helps and where it complicates things
- write an idempotency strategy note for a critical endpoint

## Exit outcomes

- students can discuss backend architecture with clearer trade-off awareness
- students stop assuming microservices are automatically better
- students can explain reliability concepts at an interview level

<Callout type="tip" title="Defend the monolith first">
Have each student argue for keeping the system a monolith before they are allowed to propose splitting it. Microservices architectures that start from "because we should" produce distributed monoliths. Microservices architectures that start from a specific scaling, team, or deployment pressure actually solve problems.
</Callout>

## Cross-links

- Deep-study path: [Learning / System Design](/learning/system-design/overview/) — scalability, microservices, messaging, and resilience.
- Next module: [Module 13 — Collaboration & Career Readiness](/modules/module-13-collaboration-career-readiness/).
