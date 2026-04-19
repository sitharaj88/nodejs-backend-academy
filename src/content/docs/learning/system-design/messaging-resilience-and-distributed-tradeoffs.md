---
title: Messaging, Resilience, and Distributed Tradeoffs
slug: learning/system-design/messaging-resilience-and-distributed-tradeoffs
description: Learn messaging patterns, retries, resilience, idempotency, eventual consistency, and the tradeoffs that appear in distributed backend systems.
---

Distributed systems introduce failure modes that single-process applications can often ignore.

## Messaging

Messaging is useful for:

- decoupling
- asynchronous workflows
- retries
- event distribution

## Resilience Thinking

Students should know the purpose of:

- retries
- backoff
- timeouts
- circuit breaker awareness
- idempotency

## Eventual Consistency

Many distributed systems accept temporary inconsistency in exchange for scalability or resilience.

Students should understand when that is acceptable and when it is dangerous.

## What To Remember

- messaging solves some problems while adding others
- resilience patterns exist because distributed failure is normal
- idempotency is critical in retry-heavy systems
