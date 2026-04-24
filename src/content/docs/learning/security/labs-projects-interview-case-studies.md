---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/security/labs-projects-interview-case-studies
description: Practical depth page for the security track, including auth labs, mini-projects, interview questions, and production case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="25 min" track="Security" />

Security is learned by breaking things on purpose and fixing them before someone else does. Every lab below ends with an assertion the test suite can check; every case study names the one control that would have prevented the incident.

## Code labs

<Lab title="Ship login, refresh rotation, and OIDC" duration="120 min" difficulty="Medium" stack="Express, Redis, argon2, jose">
Build password login with argon2id, server sessions in Redis, a 15-minute access token with rotating refresh tokens, and Google sign-in via OIDC with PKCE. Add replay detection on the refresh path.

**Success criteria**: reuse of a refresh token revokes the entire family; removing algorithm pinning fails a dedicated test; no credential or token is ever logged.
</Lab>

<Lab title="Tenant-safe notes with Postgres RLS" duration="90 min" difficulty="Medium" stack="Express, Postgres, Zod, Vitest">
Implement a notes API where every row carries a `tenant_id`, every query sets `app.tenant_id` in the transaction, and row-level security policies make cross-tenant reads return zero rows even when the SQL forgets a filter.

**Success criteria**: disabling RLS fails one dedicated test and no others; cross-tenant requests return 404; the `can()` module has 100% branch coverage.
</Lab>

<Lab title="Harden a live API end to end" duration="120 min" difficulty="Medium" stack="Express, helmet, zod, express-rate-limit, Redis">
Take an existing Express service and add strict Zod input/output schemas, helmet with a locked-down CSP, global and per-route rate limits, body-size limits, CSRF for state-changing routes, and SSRF-safe outbound fetch.

**Success criteria**: removing any control fails exactly one dedicated test; `gitleaks detect` is clean; CSP has no `unsafe-inline`; oversized body returns 413.
</Lab>

<Lab title="Red-team your own auth" duration="90 min" difficulty="Medium" stack="Burp Suite or mitmproxy, ZAP">
Run a local proxy and attack your auth flows: test `alg: none`, RS256→HS256 confusion, JWT replay after logout, IDOR on `/notes/:id`, rate-limit bypass with `X-Forwarded-For`, CSRF on state-changing routes, open redirect on login.

**Success criteria**: every attack returns a safe 4xx; one class of bug is found and fixed with a regression test; a short report lists the attacks tried and the response for each.
</Lab>

## Mini projects

- **Auth service as a library**: extract your auth, session, and rate-limiter code into a reusable module with its own test suite. Use it in two services and prove the second service needs zero auth code of its own.
- **Policy decision log**: add a structured audit log for every authorization decision (actor id, resource id, action, decision, reason). Build a simple admin view that shows a user their last 100 decisions.
- **Passkey rollout**: add passkey registration and login alongside password login. Write a runbook for account recovery when a user loses every credential.
- **Secrets rotation drill**: once a quarter, rotate the JWT signing key and session encryption key while the service is live. Time it, document blockers, reduce time next quarter.

## Interview questions

1. Why use argon2id over bcrypt for new systems? What parameters would you pick and how would you evolve them?
2. Walk through the OAuth 2.1 Authorization Code flow with PKCE. What does each parameter prevent?
3. A teammate proposes storing JWTs in `localStorage`. Give three reasons to push back and a concrete alternative.
4. Explain IDOR with an example. What is the code-level pattern that makes it impossible?
5. When does CSRF still matter in 2026, and when does it not?
6. A user reports that after changing their password, their other device is still logged in. How do you fix it, and why is this an important control?
7. What is the difference between RBAC and ABAC, and when would you add a policy engine like Cedar or OPA?
8. Describe one concrete SSRF scenario and the code-level defense against it.
9. You are asked to design rate limiting for `/login`. What dimensions do you limit by, and what storage do you use?
10. A secret was committed to the repo an hour ago. Walk through the next 24 hours.

## Production case studies

### Case 1 — The JWT that never expired

A SaaS startup issued 30-day JWTs with no refresh mechanism. A laptop was stolen; the IT team revoked the user in the identity provider but the app had no revocation list. For 29 days the attacker still had valid tokens because the app trusted the signature alone.

**Fix:** 15-minute access tokens + refresh tokens stored in Redis; logout destroys the refresh token; periodic `kid` rotation expires old signatures.

**Lesson:** a valid signature is not a proof of continued trust. Design for revocation from day one.

### Case 2 — The tenant id that was not checked

A B2B analytics platform had a `/reports/:id` endpoint. Authorization was "user is logged in." An engineer testing from a customer account discovered they could open any report id that existed — for any customer. 1,800 reports across 90 tenants were exposed for 11 days before a customer noticed.

**Fix:** every query embeds the tenant filter; `findReportForActor(actor, id)` returns 404 if the report is in another tenant; Postgres RLS as a belt-and-suspenders safety net.

**Lesson:** authentication proves identity. Authorization must check the resource. Make "load by id" impossible without the actor.

### Case 3 — Secrets in the debug endpoint

A team shipped a `GET /debug/env` endpoint behind "internal network only" — which in staging meant a VPN, and in production meant a misconfigured firewall. A security researcher found it during a bug bounty, pulled the database URL and the OAuth client secret, and responsibly disclosed.

**Fix:** the endpoint was deleted. Secrets moved to AWS Secrets Manager. An allow-list firewall replaced the implicit-trust network boundary.

**Lesson:** there is no such thing as a "safe" endpoint that returns secrets. Do not write one.

### Case 4 — Rate-limit bypass via `X-Forwarded-For`

An attacker discovered that the app trusted any `X-Forwarded-For` header and used it as the rate-limit key. They sent one million login attempts in two hours, each with a different spoofed IP. Two accounts were compromised before the team noticed the slow burn in login-error metrics.

**Fix:** set `app.set('trust proxy', 1)` with a specific hop count, so only the reverse proxy's `X-Forwarded-For` is used. Add a per-email rate limit in addition to per-IP.

**Lesson:** rate limits are only as trustworthy as the IP you are limiting by. In a proxy chain, know exactly which hop you trust.

### Case 5 — The forgotten `/v1/old/*` routes

A fintech maintained three API versions in parallel. The v1 routes were supposed to be decommissioned in 2022 but the routes were still mounted in production. A new authz rule was added to v3 but not to v1. An attacker found the v1 version of the endpoint, which had the old "logged in is enough" check, and downloaded statements for 40,000 users.

**Fix:** an inventory test that diffs mounted routes against an OpenAPI spec; deprecated routes return 410 Gone; a quarterly audit walks every route against the authz table.

**Lesson:** every endpoint you forgot is still on the internet. Inventory is a security control.

<Callout type="tip" title="Run the case studies as a game day">
For each case above, give the team the symptoms only ("customers are reporting seeing other customers' data") and have them propose the fix before the reveal. The habit of reasoning from symptoms to root cause is the most transferable skill in security work.
</Callout>

## Teaching tips

- Every new route must answer three questions in the PR description: what does it validate, what does it authorize, what does it rate limit?
- Pair every hardening feature with a test that fails when the feature is removed. Otherwise you cannot tell whether the control is still in force.
- Treat a secret in Git history as a live incident — rotate, do not squash-and-forget.
- Read a new public postmortem every month. Almost all of them are authorization failures and misconfigurations; few are crypto bugs.
