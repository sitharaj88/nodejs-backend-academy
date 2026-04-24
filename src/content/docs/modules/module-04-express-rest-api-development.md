---
title: Module 04 - Express.js and REST API Development
description: Express fundamentals, routing, middleware, validation, CRUD APIs, and OpenAPI basics.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="3 weeks" track="Module 04" prerequisites="Modules 01-03" />

This module is the bridge from runtime knowledge to product-facing backend work. Students learn how requests move through an API and how to design endpoints that teams can actually maintain — not just endpoints that return 200.

<Objectives>
- Build a multi-route Express API with consistent request/response shape
- Compose middleware chains with predictable ordering and error flow
- Validate input at the edge before it reaches services or the database
- Produce an OpenAPI-style contract alongside the code
</Objectives>

## What this module covers

- Express application setup and router architecture
- request and response lifecycle and HTTP basics
- route params, query params, and body parsing
- middleware chain, custom middleware, and error middleware
- REST naming conventions and status code discipline
- input validation and sanitization
- CRUD APIs with separation of concerns
- Swagger or OpenAPI basics

## Teaching sequence

1. Start with an API that only has routes and handlers.
2. Add middleware to show request flow and cross-cutting behavior.
3. Refactor route logic into controller and service boundaries.
4. Introduce validation before persistence.
5. Generate or document the API contract.

## Live examples

- route grouping with `express.Router()`
- custom request logger middleware
- centralized error handler
- validation failure responses for bad request payloads

## Labs

- build a products or tasks API with CRUD operations
- add validation to `POST` and `PATCH` routes
- document the API with a small OpenAPI specification

## Exit outcomes

- students can create consistent REST endpoints
- students understand middleware ordering and why it matters
- students are ready to persist API data cleanly in the next module

<Callout type="tip" title="Make the error shape a rule, not a reflex">
Pick a single error response shape (`{ error: { code, message, details } }`, or similar) on day one of this module and enforce it across every route. Every later module assumes errors are uniform. Students who improvise error shapes per route produce APIs that are genuinely harder to test and consume.
</Callout>

## Cross-links

- Deep-study path: [Learning / Node.js / Express](/learning/nodejs/express/overview/) — middleware, routing, validation, and contract design in depth.
- Next module: [Module 05 — Databases & Data Modeling](/modules/module-05-databases-data-modeling/).
