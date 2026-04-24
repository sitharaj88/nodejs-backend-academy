---
title: Security Overview
slug: learning/security/overview
description: Overview for the authentication, authorization, and security learning track, covering identity, access control, API hardening, and secret management.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Security" prerequisites="Express basics, HTTP fundamentals, async/await" />

Security is not a feature you add before launch. It is a set of decisions about trust boundaries that you make every time you touch the code — who is asking, what are they allowed to do, where do secrets live, what happens when inputs are hostile. This track turns those decisions into concrete patterns you can recognize in a PR at 5 pm on a Friday.

<Objectives>
- Pick between sessions and tokens with a reason you can defend in a design review
- Implement OAuth 2.1 with PKCE and OpenID Connect without hand-rolling crypto
- Design RBAC/ABAC policies that survive new features without rewrites
- Apply the OWASP API Top 10 as a checklist, not a theory
- Manage secrets, rate limits, CORS, CSRF, and input validation with named defaults
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Identity', title: 'Authentication, Sessions, JWT, OAuth', description: 'Hash passwords right, pick the right session mechanism, integrate identity providers.', href: '/learning/security/authentication-sessions-jwt-oauth/' },
  { eyebrow: 'Access', title: 'Authorization, RBAC, ABAC, Ownership', description: 'Model permissions that do not become a giant if-else.', href: '/learning/security/authorization-rbac-abac-ownership/' },
  { eyebrow: 'Surface', title: 'API Security and Hardening', description: 'OWASP API Top 10, secrets, rate limiting, helmet, CORS, CSRF, validation.', href: '/learning/security/api-security-passwords-secrets-hardening/' },
  { eyebrow: 'Ecosystem', title: 'Modern Security Coverage', description: 'argon2, jose, passport, helmet, zod, Clerk, Auth0, SLSA.', href: '/learning/security/modern-security-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Build auth, break auth, read postmortems that cost real money.', href: '/learning/security/labs-projects-interview-case-studies/' },
]} />

## Recommended path

1. [Authentication, Sessions, JWT, and OAuth](/learning/security/authentication-sessions-jwt-oauth/)
2. [Authorization, RBAC, ABAC, and Ownership](/learning/security/authorization-rbac-abac-ownership/)
3. [API Security, Passwords, Secrets, and Hardening](/learning/security/api-security-passwords-secrets-hardening/)
4. [Modern Security Coverage](/learning/security/modern-security-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/security/labs-projects-interview-case-studies/)

<Callout type="tip" title="How to study this track">
Build a small service — a notes API with users, teams, and shared notes — and add exactly one security concern per page: login, permissions, API hardening, secrets. By the end you have a realistic mini-app where each control is present for a reason, not because a template included it.
</Callout>

## Outcomes

By the end of the track you can design an auth system for a multi-tenant app, write an authorization model that scales past three roles, read a pen-test report and triage findings in order, and explain to a non-technical stakeholder why "just add JWT" is not a plan. You will also have a list of things you refuse to hand-roll — and you will know which libraries to use instead.
