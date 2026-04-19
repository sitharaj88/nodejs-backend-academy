---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/security/labs-projects-interview-case-studies
description: Practical depth page for the security track, including auth labs, mini-projects, interview questions, and production case studies.
---

This page adds hands-on and scenario depth to the security track.

## Code Labs

- Implement a simple session or token-based auth flow and list the trust boundaries in the request lifecycle.
- Add role-based and ownership-based authorization to the same API and show where each rule belongs.
- Introduce request limits, safer secret loading, and clearer error behavior to an intentionally weak sample API.

## Mini Projects

- Build an internal admin portal API with login, role separation, and audited access checks.
- Extend an Express API with secure password handling, refresh-token awareness, and protected routes.

## Interview Questions

- What is the difference between authentication and authorization?
- When would you choose sessions over JWTs?
- Why are secrets management and password hashing separate concerns?
- What is the difference between `401` and `403`?
- Why is role-based access control sometimes insufficient?
- How does API hardening go beyond adding auth middleware?

## Production Case Studies

### Case Study 1: Leaked Secret in Source Control

A secret was committed to the repository and copied across environments. The issue became both a code hygiene and incident response problem.

### Case Study 2: Role Check Without Ownership Check

Users with a valid role could still access resources they did not own because authorization logic stopped at role validation.

### Case Study 3: Verbose Error Responses

The API returned detailed internal error messages during auth failures, exposing system behavior that should have stayed private.

## Teaching Advice

- Ask learners to map identity, access, and trust boundaries explicitly.
- Review both happy-path auth flow and abuse scenarios.
- Make security a design discussion, not only a middleware demo.
