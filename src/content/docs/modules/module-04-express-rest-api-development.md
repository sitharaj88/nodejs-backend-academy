---
title: Module 04 - Express.js and REST API Development
description: Express fundamentals, routing, middleware, validation, CRUD APIs, and OpenAPI basics.
---

**Duration:** 3 weeks

This module is the bridge from runtime knowledge to product-facing backend work. Students learn how requests move through an API and how to design endpoints that teams can actually maintain.

## What Learners Cover

- Express application setup and router architecture
- request or response lifecycle and HTTP basics
- route params, query params, and body parsing
- middleware chain, custom middleware, and error middleware
- REST naming conventions and status code discipline
- input validation and sanitization
- CRUD APIs with separation of concerns
- Swagger or OpenAPI basics

## Suggested Teaching Sequence

1. Start with an API that only has routes and handlers.
2. Add middleware to show request flow and cross-cutting behavior.
3. Refactor route logic into controller and service boundaries.
4. Introduce validation before persistence.
5. Generate or document the API contract.

## Live Examples

- route grouping with `express.Router()`
- custom request logger middleware
- centralized error handler
- validation failure responses for bad request payloads

## Practical Labs

- build a products or tasks API with CRUD operations
- add validation to `POST` and `PATCH` routes
- document the API with a small OpenAPI specification

## Exit Outcomes

- students can create consistent REST endpoints
- students understand middleware ordering and why it matters
- students are ready to persist API data cleanly in the next module
