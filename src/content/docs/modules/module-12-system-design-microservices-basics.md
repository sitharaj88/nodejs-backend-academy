---
title: Module 12 - System Design and Microservices Basics
description: Scalable backend design, queues, brokers, service communication, retries, idempotency, and monolith versus microservices trade-offs.
---

**Duration:** 2 weeks

This module gives learners the language and mental models to discuss larger backend systems professionally, even if they are still building monoliths.

## What Learners Cover

- designing scalable backend systems
- queues, message brokers, and asynchronous processing concepts
- microservices basics and service communication
- API gateways, service discovery, and trade-offs
- idempotency, retries, and fault tolerance
- event-driven architecture overview
- choosing monolith versus microservices

## Suggested Teaching Sequence

1. Start from a monolith students already understand.
2. Identify growth pressures that lead to new architecture decisions.
3. Explain queues, retries, and idempotency with concrete product examples.
4. Compare the cost of microservices with the cost of staying monolithic.

## Live Examples

- order processing flow modeled as synchronous versus queued work
- retry-safe webhook or payment callback thinking
- architecture sketch for a growing SaaS platform

## Practical Labs

- draw system boundaries for a capstone project
- explain where a queue helps and where it complicates things
- write an idempotency strategy note for a critical endpoint

## Exit Outcomes

- students can discuss backend architecture with clearer trade-off awareness
- students stop assuming microservices are automatically better
- students can explain reliability concepts at an interview level
