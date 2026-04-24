---
title: Capstone Projects
description: Four ambitious capstone tracks — commerce API, social platform, SaaS backend, real-time support — each with scope, milestones, architecture prompts, and a review rubric that matches a senior code review.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Callout from '../../../components/Callout.astro'
import KeyConcept from '../../../components/KeyConcept.astro'
import Pitfall from '../../../components/Pitfall.astro'
import Lab from '../../../components/Lab.astro'

<LessonMeta level="Advanced" duration="Full program finale" track="Capstones" prerequisites="Phases 1–4 of the academy" />

A capstone proves that you can take what the modules taught and deliver one coherent system end-to-end — with the design trade-offs defended, the tests honest, the security boring, and the deploy repeatable. Each track below maps to a different shape of real backend work.

<KeyConcept title="Capstones are graded on operational truth, not feature count">
Five working endpoints with real validation, real tests, real deploys, and a readable architecture doc beat fifty half-wired features. Scope down, finish up.
</KeyConcept>

## How to choose a track

| Track | Picks this if you want to prove… |
| --- | --- |
| **01 — E-Commerce API** | data modeling across related domains, transactions, payment flows, pagination, and RBAC for admin vs customer. |
| **02 — Social Media Backend** | feed generation, caching trade-offs, asynchronous fan-out, and real-time notifications at scale. |
| **03 — SaaS Product Backend** | multi-tenant isolation, team roles, billing, feature flags, and clean architecture for change. |
| **04 — Real-Time Support System** | WebSocket / SSE design, workflow state machines, event-driven integrations, and observability for live systems. |

<Callout type="tip" title="Pick the scariest track">
Growth happens at the edge of what you know. If one track makes you nervous, that's the one.
</Callout>

## Common deliverables (every track)

Regardless of track, a finished capstone ships:

1. One GitHub repository (or monorepo) with a clean README covering setup, architecture, and deploy.
2. A documented API surface — OpenAPI or an equivalent written contract.
3. A validated environment configuration (`.env.example`) and boot-time schema.
4. A layered test suite with unit, integration, and API tests wired to a `check` script.
5. A live deployed instance (Fly.io, Render, Railway, Fly Machines, Cloud Run, or a Docker image + compose file).
6. A CI pipeline that runs the check script on every PR.
7. A runbook: how to diagnose common failures, who owns what, where the logs live.
8. A 10-minute demo with known limitations and the next three things you would do.

## Capstone 01 — E-Commerce API

### Scope

Build the backend for a single-seller commerce store with:

- **Catalog**: products, variants (size, color), categories, inventory counts.
- **Cart & checkout**: per-session carts, reservations, checkout pipeline that withstands race conditions.
- **Orders**: lifecycle from `pending` → `paid` → `fulfilled` → `shipped` → `delivered` / `cancelled`.
- **Payments**: Stripe-style webhook integration with idempotency keys and signature verification.
- **Admin**: RBAC-gated endpoints for product edits, inventory adjustments, and refunds.
- **Pagination**: cursor-based for listings.

### Architecture prompts

- How do you prevent overselling when two carts check out the last item at the same time?
- Where do you put the transaction boundary in &ldquo;create order, decrement inventory, capture payment&rdquo;?
- How do you make the payment webhook handler idempotent against network retries?

### Milestones

1. **Week 1** — Repo scaffold, config, DB schema v1, CRUD for products.
2. **Week 2** — Cart + checkout with inventory reservation.
3. **Week 3** — Payments (mock first), webhook processing with idempotency.
4. **Week 4** — Admin RBAC, refunds, reports, deploy.
5. **Week 5** — Polish: caching, OpenAPI, load test, runbook.

### What it proves

Multi-table data modeling, transactional thinking, security boundaries between customer and admin, and an external-integration pattern you will re-use for any third-party API.

## Capstone 02 — Social Media Backend

### Scope

Build the backend for a small social network:

- **Identity**: signup, login, profile, avatar upload to object storage.
- **Graph**: follow / unfollow with at least 10k test users.
- **Posts**: create, edit, delete, with text and media.
- **Feed**: home feed (people you follow), explore feed, ranked by recency with a simple score.
- **Engagement**: likes, comments, reactions.
- **Notifications**: in-app + optional email / websocket push.
- **Real-time**: live likes and comment counts via WebSocket or SSE.

### Architecture prompts

- Fan-out-on-write (push to followers' feeds at post time) vs fan-out-on-read (compute at request time) — pick one and defend it against the other.
- How does the feed stay fast when a user follows 5,000 people?
- What happens when a viral post gets 10k likes in 30 seconds — where does the write pressure go?

### Milestones

1. **Week 1** — Auth, profiles, media upload.
2. **Week 2** — Follow graph, posts, basic feed.
3. **Week 3** — Engagement, ranked feed, caching layer.
4. **Week 4** — Real-time counts, notifications.
5. **Week 5** — Load test for feed latency, deploy, runbook.

### What it proves

Graph-shaped data, caching trade-offs with staleness budgets, asynchronous fan-out patterns, and live features that do not fall over under bursts.

## Capstone 03 — SaaS Product Backend

### Scope

Build the backend for a B2B SaaS product (pick a theme — project management, time tracking, CRM, whatever):

- **Tenancy**: organizations with members and roles (owner, admin, member, viewer).
- **Invitations**: email invites with expiring tokens.
- **Billing**: subscription plans with Stripe (or mock provider), feature flags per plan.
- **Data**: your domain's primary resource (e.g., projects → tasks, clients → invoices).
- **Audit log**: who did what when, queryable by admins.
- **API keys**: scoped keys for programmatic access.
- **Export**: GDPR-style data export per organization.

### Architecture prompts

- Row-level tenancy vs schema-per-tenant vs database-per-tenant — pick a model and justify it.
- How do you prevent a bug from leaking one org's data to another? Name two independent safeguards.
- Where do feature flags live, and how do they interact with the billing plan?

### Milestones

1. **Week 1** — Auth, orgs, members, invitations.
2. **Week 2** — Domain resources with tenant isolation.
3. **Week 3** — Billing, plans, feature gating.
4. **Week 4** — Audit log, API keys, export.
5. **Week 5** — Clean architecture refactor, deploy, runbook.

### What it proves

Multi-tenant design, identity-aware authorization, billing integration, and clean-architecture discipline — the most common shape of real SaaS backend work.

## Capstone 04 — Real-Time Support System

### Scope

Build a support-desk backend with live conversations:

- **Tickets**: customers create, agents handle; state machine (`open` → `pending` → `resolved` → `closed`).
- **Live chat**: WebSocket channel per ticket, typing indicators, read receipts.
- **Routing**: simple round-robin or skill-based queue.
- **SLA timers**: first-response and resolution timers per ticket, stored & queryable.
- **Integrations**: inbound webhook to create tickets from external sources (email, form, API).
- **Knowledge base**: searchable FAQ auto-suggested inside a conversation.
- **Agent dashboard**: current load, queue depth, response-time metrics.

### Architecture prompts

- How do you keep WebSocket state when a pod restarts?
- Ticket state transitions — synchronous update or event sourced?
- Which parts of the system belong behind a queue instead of in the request path?

### Milestones

1. **Week 1** — Tickets, state machine, REST endpoints.
2. **Week 2** — WebSocket layer, presence, typing indicators.
3. **Week 3** — Routing, SLA timers, inbound webhooks.
4. **Week 4** — KB, search, agent dashboard.
5. **Week 5** — Observability, deploy, runbook.

### What it proves

Event-driven design, real-time transport, workflow state machines, and observability for a system where users feel latency directly.

## Review rubric

Every capstone is reviewed on the same six axes. Each is scored **Meets / Exceeds / Needs work** — you pass with no &ldquo;Needs work&rdquo; in any axis.

| Axis | What reviewers look for |
| --- | --- |
| **API design** | Resource naming, HTTP semantics, consistent error shape, versioning plan, documented in OpenAPI. |
| **Security** | Auth that fails closed, authz tested per endpoint, secrets outside the repo, headers via `helmet`, rate limits on public routes. |
| **Architecture** | Module boundaries that match the domain, dependency direction clean, tests can swap adapters without rewriting the core. |
| **Data modeling** | Schema that matches query patterns, indexes justified, transactions where required, migration discipline. |
| **Quality** | Layered tests, no `any`, no `console.log` in src, lint / format / type-check / test all wired to one script. |
| **Delivery** | README covers setup + architecture + run, deployed live, CI on every PR, runbook describes how to debug the top three failure modes. |

<Callout type="success" title="Exceeds criteria are where portfolios are made">
Passing the rubric gets you across the line. Exceeds bar in 2–3 axes is how your capstone stands out in an interview. Reach for it in the area you care most about.
</Callout>

## Common pitfalls

<Pitfall title="Feature creep > finish line">
Week 4 arrives and the product is 30% done across 12 features. **Fix:** set a weekly scope budget, cut anything that isn't on the critical user path, and ship a smaller but complete system.
</Pitfall>

<Pitfall title="Tests bolted on at the end">
Capstones without a `test/` folder in week 2 rarely get one in week 5. **Fix:** write the first API test before the second endpoint. Let the scaffolding shape the code.
</Pitfall>

<Pitfall title="Demo-driven shortcuts">
&ldquo;I'll handle auth properly after the demo.&rdquo; The demo version ships to production. **Fix:** treat every commit as if it will ship. If you need a shortcut, open an issue with the followup named.
</Pitfall>

## Starting lab

<Lab title="Week 0 — scaffolding sprint" duration="4 hours" difficulty="Medium" stack="pnpm, TypeScript, Express, Postgres, Docker">

### Goal
Before real feature work, set up everything so every later week is fast.

### Steps
1. Pick a capstone track. Write a 1-page README: what it is, who uses it, what proves it's done.
2. Create a repo with pnpm, TypeScript strict, ESM, Zod config, `createApp()`, SIGTERM handling.
3. Wire ESLint, Prettier, Vitest (unit + int configs), GitHub Actions.
4. Add a Dockerfile (multi-stage, non-root, distroless final) and `docker-compose.yml` with Postgres + Redis.
5. Commit `.env.example`. Ship a `GET /health` and a CI pipeline that deploys a preview on PR merge (Fly, Render, Railway — pick one).

### Success criteria
- Fresh clone → `pnpm check` + `pnpm dev` + `curl /health` in under 15 minutes
- CI green, preview deploy reachable
- Secrets not in repo; `NODE_ENV=production` without `.env` works
- Team can name the next five endpoints on a whiteboard

</Lab>

## Before your review

Prepare a 10-minute demo and a 3-slide deck:

1. **What it does** — live demo, one real flow end-to-end.
2. **What I chose and why** — three architecture decisions, each with an alternative.
3. **What's next** — the three things you would do with another two weeks.

<Callout type="tip" title="Final question reviewers always ask">
&ldquo;If this service got 100× traffic tomorrow, which part breaks first?&rdquo; Know the answer. That's the single question that separates &ldquo;passed&rdquo; from &ldquo;would hire.&rdquo;
</Callout>

Pair this page with [Tools &amp; Technologies](/projects/tools-technologies/) during capstone planning, and keep the module pages open as reference — the capstone is where they stop being pages and start being muscle memory.
