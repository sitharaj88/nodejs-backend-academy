---
title: System Design Overview
slug: learning/system-design/overview
description: Overview for the system design and microservices learning track, covering scalability, service boundaries, messaging, resilience, and distributed tradeoffs.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="7 min" track="System Design" prerequisites="Node.js, HTTP, at least one production incident" />

System design is the discipline of turning "make it fast and reliable" into specific numbers, specific components, and specific tradeoffs. This track is not a gallery of famous architectures. It is a working vocabulary — latency, throughput, partitioning, consistency, idempotency, backpressure — that lets you reason about any backend and argue for the one you are building.

<Objectives>
- Reason about capacity with back-of-envelope math and Little's Law
- Draw service boundaries by bounded context, not by Jira epic
- Pick messaging patterns that match your delivery guarantees
- Apply CAP and PACELC to real decisions instead of reciting them
- Defend every "microservice" with a concrete benefit over a module
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Foundations', title: 'Fundamentals & Scalability', description: 'Latency, throughput, load balancing, partitioning, replication, capacity math.', href: '/learning/system-design/system-design-fundamentals-and-scalability/' },
  { eyebrow: 'Boundaries', title: 'Microservices & Consistency', description: "Conway's law, bounded contexts, sagas, outbox, 2PC why-not.", href: '/learning/system-design/microservices-boundaries-and-data-consistency/' },
  { eyebrow: 'Distribution', title: 'Messaging & Resilience', description: 'Pub/sub, work queues, event streams, delivery semantics, CAP, backpressure.', href: '/learning/system-design/messaging-resilience-and-distributed-tradeoffs/' },
  { eyebrow: 'Ecosystem', title: 'Modern Coverage', description: 'NATS JetStream, Kafka, RabbitMQ, Temporal, gRPC, event-driven, SLSA.', href: '/learning/system-design/modern-system-design-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'URL shortener, rate limiter, chat, notifications — design and defend.', href: '/learning/system-design/labs-projects-interview-case-studies/' },
]} />

## The vocabulary changes the decisions

When you know that "eventually consistent" means "the read replica lags the primary by 50–400 ms," you stop using it as a magic word and start asking "is 400 ms okay for this screen?" When you know Little's Law is `L = λW`, you stop arguing about thread counts and start asking "what is `W`?"

<Callout type="tip" title="How to study this track">
Pick one real system you use — a URL shortener, a chat app, a ride dispatch. As you move through the pages, sketch its design at three scales: 1k users, 1M users, 100M users. Write down every tradeoff you made. The pages will keep reframing those tradeoffs until you can defend them.
</Callout>

## Recommended path

1. [System Design Fundamentals and Scalability](/learning/system-design/system-design-fundamentals-and-scalability/)
2. [Microservices Boundaries and Data Consistency](/learning/system-design/microservices-boundaries-and-data-consistency/)
3. [Messaging, Resilience, and Distributed Tradeoffs](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/)
4. [Modern System Design Coverage](/learning/system-design/modern-system-design-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/system-design/labs-projects-interview-case-studies/)

## What "good" looks like

An engineer who has worked through this track, asked to design a system:

- States the SLOs up front — latency, availability, durability — before drawing a single box.
- Does capacity math out loud. "5k rps × 120 ms = 600 concurrent; on 12 cores that is 50 per core; comfortable."
- Names the failure modes of each component before the happy path is finished.
- Draws service boundaries around stable business capabilities, not around team sizes of the moment.
- Prefers a well-boxed monolith to three microservices that share a database.
- Justifies every use of "eventual consistency" by naming the user-visible window and the reconciliation path.

<Callout type="info" title="This is not a LeetCode stack for interviews">
System design interview practice is useful; it is not the point. The point is to design systems you can operate. Interview questions are a sparring partner. Production is the tournament.
</Callout>

## Outcomes

By the end of this track you can defend a backend architecture to a skeptical senior engineer. You can also read an existing one and predict its next three failure modes before they happen. Most importantly, you can tell the difference between a real tradeoff and a tooling preference dressed up as one.
