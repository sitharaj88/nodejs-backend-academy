---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/realtime/labs-projects-interview-case-studies
description: Practical depth page for the real-time and advanced APIs track, including connection labs, queue projects, interview questions, and production case studies.
---

This page adds practical depth to the real-time and advanced APIs track.

## Code Labs

- Build a small WebSocket or Socket.IO presence demo and document connection lifecycle events.
- Process an inbound webhook with signature verification, idempotency protection, and retry awareness.
- Move a slow email or report task into a background queue and compare the request-path behavior before and after.

## Mini Projects

- Build a live notification system using event-driven delivery and document how reconnect or missed events should be handled.
- Create a job-processing demo with webhooks, retries, and a dead-letter or failure-handling strategy.

## Interview Questions

- When would you choose WebSockets over SSE?
- Why are webhooks a security and idempotency concern?
- What problems do queues solve in backend systems?
- How does GraphQL differ from REST operationally, not only syntactically?
- What are the delivery tradeoffs in event-driven systems?
- Why can persistent connections create scaling challenges?

## Production Case Studies

### Case Study 1: Real-Time Feature Without Reconnect Strategy

The app worked during happy-path live updates, but users lost state after temporary disconnects because the delivery model had no recovery design.

### Case Study 2: Duplicate Webhook Processing

An external provider retried webhook delivery, and the backend handled the same business event multiple times because idempotency was never implemented.

### Case Study 3: Queue Added Without Observability

Background jobs removed pressure from the request path, but failures became invisible because the queue flow had no clear metrics, logging, or retry visibility.

## Teaching Advice

- Include delivery guarantees and retry behavior in practical exercises.
- Push learners to compare patterns instead of memorizing libraries.
- Treat state and connection lifecycle as first-class design concerns.
