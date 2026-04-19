---
title: Phase 2 - API Engineering, Data, and Security
description: Phase 2 roadmap for Express.js, REST API development, databases, authentication, and API security.
---

**Duration:** Weeks 7-14

This is where learners become backend developers in a visible way. They move from scripts and runtime concepts into APIs, persistent storage, secure access, and clean request handling.

## Modules In This Phase

- [Module 04: Express.js & REST APIs](/modules/module-04-express-rest-api-development/)
- [Module 05: Databases & Data Modeling](/modules/module-05-databases-data-modeling/)
- [Module 06: Auth, Authorization & Security](/modules/module-06-auth-authorization-security/)

## Phase Outcomes

- Build multi-route REST APIs with clear middleware chains and consistent response behavior
- Model and query data in MongoDB and understand when SQL is the better choice
- Apply hashing, JWTs, cookies, sessions, and role checks safely
- Protect APIs using validation, CORS, rate limiting, and secure configuration

## Weekly Plan

| Week | Focus |
| --- | --- |
| 7 | Express fundamentals, routers, middleware, and request lifecycle |
| 8 | CRUD APIs, status codes, validation, and API documentation |
| 9 | MongoDB fundamentals, schemas, models, and document thinking |
| 10 | SQL basics, relations, indexing, pagination, and repository patterns |
| 11 | Password flows, JWTs, session strategies, and refresh token thinking |
| 12 | RBAC, OAuth concepts, Helmet, CORS, validation, and hardening |
| 13 | API project consolidation and review |
| 14 | Security review, cleanup, and phase milestone |

## Live Examples To Teach

- A route with validation and centralized error middleware
- A Mongoose schema with custom validation and hooks
- Pagination endpoints and query building
- JWT issue and verify flow
- Protected admin route with role-based access control

## Lab Work

- Build a student management or task management API with CRUD endpoints
- Add user registration, login, and protected routes
- Compare MongoDB and SQL schema design for the same domain
- Create a security checklist for the API project

## Assessment Gate

Students should be able to:

- create a secure resource API without mixing all logic in route files
- model core entities with sensible validation rules
- explain token lifecycle trade-offs
- identify obvious backend security failures before shipping

Proceed to [Phase 3: Architecture, Quality, and Scale](/roadmap/phase-3-architecture-quality-scale/).
