---
title: Module 06 - Authentication, Authorization, and Security
description: Password hashing, JWT, sessions, RBAC, OAuth concepts, security middleware, validation, and secrets handling.
---

**Duration:** 2 weeks

This module turns student APIs into responsible systems. Authentication is only one part. The larger goal is secure backend behavior under realistic conditions.

## What Learners Cover

- password hashing with `bcrypt`
- credential flows and secure login design
- JWT creation, verification, and token lifecycle thinking
- sessions, cookies, and refresh token strategies
- role-based access control and permission systems
- OAuth and social login concepts
- Helmet, CORS, rate limiting, and hardening basics
- input validation, injection prevention, XSS awareness, and secrets handling

## Suggested Teaching Sequence

1. Start with registration and login flows.
2. Compare session and token approaches conceptually.
3. Protect routes with middleware.
4. Add role-based access and permission checks.
5. End with a hardening pass across the whole API.

## Live Examples

- register or login flow with hashed passwords
- auth middleware that resolves the current user
- admin-only route protection
- secure environment variable loading

## Practical Labs

- add auth to the existing CRUD API
- build refresh token or session strategy notes
- audit an API for missing security controls

## Exit Outcomes

- students understand secure auth flow basics
- students can distinguish authentication from authorization
- students begin thinking like backend owners, not just implementers
