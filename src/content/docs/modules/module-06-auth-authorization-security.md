---
title: Module 06 - Authentication, Authorization, and Security
description: Password hashing, JWT, sessions, RBAC, OAuth concepts, security middleware, validation, and secrets handling.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="2 weeks" track="Module 06" prerequisites="Modules 04-05" />

This module turns student APIs into responsible systems. Authentication is only one part. The larger goal is secure backend behavior under realistic conditions — including the conditions students will not think to test for.

<Objectives>
- Implement a register/login flow with hashed passwords and safe error messages
- Issue, verify, and rotate tokens (or sessions) with an explicit lifetime strategy
- Gate routes with role-based authorization and prove it with a failing test per route
- Apply Helmet, CORS, rate limiting, input validation, and secrets hygiene across the API
</Objectives>

## What this module covers

- password hashing with `bcrypt`
- credential flows and secure login design
- JWT creation, verification, and token lifecycle thinking
- sessions, cookies, and refresh token strategies
- role-based access control and permission systems
- OAuth and social login concepts
- Helmet, CORS, rate limiting, and hardening basics
- input validation, injection prevention, XSS awareness, and secrets handling

## Teaching sequence

1. Start with registration and login flows.
2. Compare session and token approaches conceptually.
3. Protect routes with middleware.
4. Add role-based access and permission checks.
5. End with a hardening pass across the whole API.

## Live examples

- register or login flow with hashed passwords
- auth middleware that resolves the current user
- admin-only route protection
- secure environment variable loading

## Labs

- add auth to the existing CRUD API
- build refresh token or session strategy notes
- audit an API for missing security controls

## Exit outcomes

- students understand secure auth flow basics
- students can distinguish authentication from authorization
- students begin thinking like backend owners, not just implementers

<Callout type="tip" title="Fail closed, log loud">
Teach students to write auth middleware that returns 401/403 on every missing or invalid token by default. Any route that does not explicitly opt in to "public" should be rejected. "Forgot to add the auth middleware" is the single most common security bug in student projects. Default-deny makes it impossible.
</Callout>

## Cross-links

- Deep-study path: [Learning / Security](/learning/security/overview/) — auth flows, sessions, JWT, authorization, and hardening in depth.
- Next module: [Module 07 — Architecture & Clean Design](/modules/module-07-architecture-clean-design/).
