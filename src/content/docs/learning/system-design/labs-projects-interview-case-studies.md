---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/system-design/labs-projects-interview-case-studies
description: Practical depth page for the system design track, including design labs, mini-project prompts, interview questions, and production case studies.
---

This page turns the system design track into a better teaching and discussion resource.

## Design Labs

- Design a course platform backend for growth from one cohort to many, then identify the first scaling bottleneck you expect.
- Take a modular monolith design and propose which capability, if any, should be split first and why.
- Model a cross-service workflow and explain how you would handle retries, timeouts, and duplicate messages.

## Mini Projects

- Produce a system-design document for a live class platform with chat, scheduling, recordings, and notifications.
- Create a service-boundary proposal for a commerce or LMS system and justify why it should remain monolithic or move toward service separation.

## Interview Questions

- What are the most important dimensions of system scale?
- When are microservices justified, and when are they a bad trade?
- Why does messaging add both decoupling and complexity?
- What is eventual consistency, and when is it acceptable?
- What makes a service boundary good or bad?
- Why is idempotency important in distributed systems?

## Production Case Studies

### Case Study 1: Premature Service Split

The team split a system into services before internal module boundaries were healthy. Operational complexity increased while product delivery slowed.

### Case Study 2: Shared Database Across “Independent” Services

Services were presented as independent, but a shared database made change coordination brittle and blurred ownership boundaries.

### Case Study 3: Retry Storm Under Partial Failure

During a downstream outage, aggressive retries multiplied load and worsened the incident because backoff and idempotency were not designed carefully.

## Teaching Advice

- Run design reviews as structured tradeoff discussions, not architecture theater.
- Ask learners to defend both benefits and costs of distributed choices.
- Tie every system design decision back to a real constraint or business need.
