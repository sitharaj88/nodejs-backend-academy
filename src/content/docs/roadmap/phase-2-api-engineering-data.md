---
title: Phase 2 - API Engineering, Data, and Security
description: Phase 2 roadmap for Express.js, REST API development, databases, authentication, and API security.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'
import TopicGrid from '../../../components/TopicGrid.astro'
import Stats from '../../../components/Stats.astro'

<LessonMeta level="Intermediate" duration="8 weeks" track="Phase roadmap" prerequisites="Phase 1 complete" />

This is where learners become backend developers in a visible way. They move from scripts and runtime concepts into APIs, persistent storage, secure access, and clean request handling.

<Stats items={[
  { value: '8', label: 'Weeks' },
  { value: '3', label: 'Modules' },
  { value: '1', label: 'Secure CRUD API' },
]} />

<Objectives>
- Build multi-route REST APIs with clear middleware chains and consistent response behavior
- Model and query data in MongoDB, and reason about when SQL is the better choice
- Apply hashing, JWTs, cookies, sessions, and role checks safely
- Protect APIs using validation, CORS, rate limiting, and secure configuration
</Objectives>

## Modules in this phase

<TopicGrid topics={[
  { eyebrow: 'Module 04', title: 'Express.js & REST APIs', description: 'Routing, middleware, validation, and OpenAPI basics.', href: '/modules/module-04-express-rest-api-development/' },
  { eyebrow: 'Module 05', title: 'Databases & Data Modeling', description: 'MongoDB, SQL, indexing, pagination, and repository patterns.', href: '/modules/module-05-databases-data-modeling/' },
  { eyebrow: 'Module 06', title: 'Auth, Authorization & Security', description: 'Passwords, JWT, sessions, RBAC, and API hardening.', href: '/modules/module-06-auth-authorization-security/' },
]} />

## Weekly plan

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

## Live examples to teach

- A route with validation and centralized error middleware
- A Mongoose schema with custom validation and hooks
- Pagination endpoints and query building
- JWT issue and verify flow
- Protected admin route with role-based access control

## Lab work

- Build a student management or task management API with CRUD endpoints
- Add user registration, login, and protected routes
- Compare MongoDB and SQL schema design for the same domain
- Create a security checklist for the API project

## Assessment gate

Students should be able to:

- create a secure resource API without mixing all logic in route files
- model core entities with sensible validation rules
- explain token lifecycle trade-offs
- identify obvious backend security failures before shipping

<Callout type="tip" title="Make security boring early">
Phase 2 is the last phase where security can be introduced calmly. If you let it slide until the capstone, students ship working APIs that leak tokens, trust client input, and skip authorization. Wire hashing, validation, and RBAC in week 11 and refuse to move on until they stick.
</Callout>

<Callout type="success" title="Next step">
Proceed to [Phase 3: Architecture, Quality, and Scale](/roadmap/phase-3-architecture-quality-scale/).
</Callout>
