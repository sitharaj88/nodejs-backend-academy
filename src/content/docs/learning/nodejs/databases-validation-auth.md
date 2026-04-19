---
title: Databases, Validation, and Auth
slug: learning/nodejs/databases-validation-auth
description: Learn how Node.js applications interact with databases, validate input, model service boundaries, and implement authentication and authorization safely.
---

Node.js applications rarely exist in isolation. They sit between clients, data stores, and identity systems.

## Database Access Is a Boundary

Database code should not be treated as a detail hidden under random route handlers.

A healthy structure separates:

- request handling
- validation
- domain logic
- data access

## Common Database Patterns

Node.js backends often work with:

- SQL databases
- document databases
- caches
- queues and event stores

The precise database is less important here than the boundary discipline.

## Input Validation

Validation should happen before business logic trusts user input.

Check:

- required fields
- types and formats
- ranges and limits
- domain rules

### Teaching point

Validation is not the same as typing. Types help your code. Validation protects your runtime from outside data.

## DTOs Versus Domain Models

Students should learn to distinguish:

- request DTOs
- response DTOs
- domain entities
- persistence models

This separation prevents data-layer assumptions from leaking everywhere.

## Authentication

Authentication answers: who is this user?

Common mechanisms include:

- sessions
- JWT-based systems
- OAuth-backed identity flows

Teach the difference between proving identity and authorizing actions.

## Authorization

Authorization answers: what may this user do?

Examples:

- admin can manage cohorts
- trainer can publish lessons
- student can only access enrolled course content

Role checks alone are often not enough. Real applications usually need ownership and resource-level rules too.

## Password Handling

Never store raw passwords.

Students should understand:

- hashing
- salting
- credential verification
- account lockout and rate-limiting awareness

## Secure Session and Token Thinking

Learners should recognize the operational concerns around:

- token expiry
- refresh logic
- secure cookie configuration
- replay and theft risk

## Query Discipline

Database code should be deliberate about:

- parameterization
- transactions
- pagination
- indexing awareness
- avoiding N+1 query patterns

## Error Boundaries

Database failures, auth failures, and validation failures should not all look identical.

A well-designed backend returns consistent but meaningful error categories.

## Common Mistakes

- doing database work directly inside route handlers without service boundaries
- treating TypeScript types as a substitute for runtime validation
- storing passwords incorrectly
- collapsing authentication and authorization into one vague concept
- returning raw database errors to clients

## Practice Ideas

- design a request DTO and a separate domain model for course enrollment
- implement validation before a fake persistence layer call
- model role-based and ownership-based authorization checks
- compare a bad route handler with a layered service approach

## What To Remember

- database and auth logic live at critical trust boundaries
- validation protects incoming data
- authentication and authorization are different concerns
- layered architecture improves safety and maintainability
- error responses should be consistent without leaking internals
