---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/architecture/labs-projects-interview-case-studies
description: Practical depth page for the architecture track, including refactoring labs, mini-projects, interview prompts, and real-world design case studies.
---

This page adds practical design depth to the architecture track.

## Code Labs

- Refactor a controller-heavy route file into layered responsibilities and explain what moved where and why.
- Take a tightly coupled service and redesign the dependency flow so business logic can be tested without framework objects.
- Convert a flat feature set into a modular monolith structure organized around domain boundaries.

## Mini Projects

- Build a small modular monolith for course management with clear internal boundaries between users, courses, and billing.
- Take an intentionally messy training codebase and produce an architecture improvement proposal with a revised folder and dependency structure.

## Interview Questions

- What problem does layered architecture solve?
- When does clean architecture help, and when does it become overengineering?
- Why is dependency direction important?
- What is the difference between a modular monolith and microservices?
- Why should service logic usually avoid depending directly on `req` and `res`?
- How do DTOs help preserve boundaries?

## Production Case Studies

### Case Study 1: Controller-Layer Collapse

Business rules, database calls, and response formatting all lived in route handlers. Feature velocity slowed because every change touched framework-heavy code.

### Case Study 2: Overengineered Clean Architecture

A small service adopted many abstractions with no real boundary benefit. The team spent more time navigating indirection than solving product problems.

### Case Study 3: Monolith Without Internal Boundaries

The application was a monolith, but the real problem was weak module separation. Teams blamed the deployment model when the real issue was code organization.

## Teaching Advice

- Push learners to explain tradeoffs, not only draw boxes.
- Use refactoring exercises, not only greenfield design.
- Reward clarity over pattern vocabulary.
