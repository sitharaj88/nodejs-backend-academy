# Node.js Backend Academy

A production-grade backend engineering academy for Node.js — structured like a real training program with guided lessons, hands-on labs, inline diagrams, production case studies, and capstone projects.

**Live site:** [sitharaj88.github.io/nodejs-backend-academy](https://sitharaj88.github.io/nodejs-backend-academy/)

## What this is

Not a tutorial collection. Not a cheat sheet. A layered curriculum that takes a learner from JavaScript fundamentals to operating production Node.js services — with the same shape on every page: objectives, mental model, runnable code, good-vs-bad comparisons, pitfalls, a lab with success criteria, and a checkpoint.

Built for:

- **Career switchers** moving into backend engineering
- **Frontend engineers** going full-stack
- **Teams** running internal training or onboarding
- **Bootcamps &amp; classrooms** delivering a structured program
- **Interview preparation** for backend and system-design rounds

## At a glance

- **13 modules** across 4 phases (27 planned weeks)
- **120+ concept pages** with runnable code
- **~40+ labs** with explicit pass/fail criteria
- **4 capstone tracks** with milestones and review rubrics
- **9 inline-SVG diagrams** for visual learning
- **Dark mode** + mobile-responsive
- **Full-text search** (Pagefind)

## Curriculum

**Phase 1 — Foundation & Runtime (weeks 1–6)** JavaScript, TypeScript, Node.js runtime, tooling, project setup.

**Phase 2 — APIs, Data & Security (weeks 7–14)** Express, REST conventions, Postgres + MongoDB modeling, auth (sessions, JWT, OAuth, RBAC/ABAC), API hardening.

**Phase 3 — Architecture, Quality & Scale (weeks 15–22)** Layered + clean architecture, modular monolith, testing pyramid, profiling, caching strategies, scaling &amp; reliability, real-time APIs (WebSocket / SSE / GraphQL / gRPC).

**Phase 4 — Delivery & Career (weeks 23–27)** Docker, CI/CD, observability &amp; SLOs, runbooks, system design for microservices &amp; messaging, capstone reviews, interview prep.

## Learning tracks

| Track | Pages | Focus |
| --- | --- | --- |
| JavaScript | 11 | Language mechanics, async, OOP, modern APIs |
| TypeScript | 12 | Types, generics, narrowing, runtime validation |
| Node.js | 11 | Runtime, streams, process, HTTP |
| Express | 9 | Routing, middleware, validation, auth, production |
| Tooling | 6 | Package management, scripts, quality gates |
| Databases | 6 | SQL + NoSQL modeling, queries, transactions |
| Security | 6 | AuthN, AuthZ, API hardening, secrets |
| Architecture | 6 | Layered, clean, modular monolith patterns |
| Testing | 6 | Layers, mocks, contracts, debugging |
| Performance | 6 | Profiling, caching, scaling, capacity |
| Real-Time | 6 | WebSockets, SSE, queues, GraphQL, gRPC |
| DevOps | 6 | Docker, CI/CD, observability, runbooks |
| System Design | 6 | Fundamentals, microservices, messaging, resilience |

Each concept page includes: learning objectives, a mental model, runnable TypeScript/Node.js code, good-vs-bad comparisons, 2–3 named pitfalls with fixes, a lab with explicit success criteria, and a 5-question checkpoint.

## Capstone projects

Four ambitious tracks — each with scope, architecture prompts, 5-week milestones, and a six-axis review rubric:

1. **E-Commerce API** — catalog, carts, orders, payments, RBAC admin
2. **Social Media Backend** — graph, feed, caching, real-time counts
3. **SaaS Product Backend** — multi-tenant, billing, feature flags, clean architecture
4. **Real-Time Support System** — tickets, live chat, SLA timers, observability

## Tech stack (opinionated defaults)

Runtime: **Node 20 LTS**. Language: **TypeScript strict**. Package manager: **pnpm**. Framework: **Express** (with Fastify/Hono noted). Data: **Postgres**, **MongoDB**, **Redis**. Testing: **Vitest** + **Supertest** + **Testcontainers** + **Pact**. Auth: **argon2id**, **jose**, **Passport**/**better-auth**. Observability: **pino**, **OpenTelemetry**, **Prometheus**. Delivery: **Docker** (distroless, non-root), **GitHub Actions**, **Fly/Render/Railway**.

## Repository layout

```
.
├── src/
│   ├── assets/              # logo, hero SVG
│   ├── components/          # Astro MDX components (Lab, Callout, Pitfall, ...)
│   ├── content/docs/        # all lesson content (MDX/Markdown)
│   │   ├── start-here/
│   │   ├── roadmap/         # 4 phase pages
│   │   ├── modules/         # 13 module summaries
│   │   ├── learning/        # 13 deep tracks
│   │   ├── projects/        # capstones + tools reference
│   │   └── reference/       # glossary
│   └── styles/custom.css    # design system (~960 lines)
├── public/                  # static assets (OG image, brochure PDF)
├── astro.config.mjs
└── package.json
```

## Contributing content

The project is built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build). Every concept page uses a shared component library:

- `<LessonMeta>` — level, duration, track, prerequisites at the top
- `<Objectives>` — what the reader will be able to do
- `<KeyConcept>` — labelled mental-model card
- `<Callout type="info|success|warn|danger|tip">` — contextual notes
- `<Pitfall>` — named anti-pattern with a `Fix:` line
- `<Compare>` — side-by-side bad-vs-good code
- `<Lab>` — hands-on exercise with success criteria
- `<Checkpoint>` — 5-question self-assessment
- `<Diagram>` — inline-SVG wrapper for architecture sketches
- `<TopicGrid>` / `<Stats>` — navigation/overview blocks

Follow an existing page (e.g. [`src/content/docs/learning/testing/unit-integration-api-testing.md`](src/content/docs/learning/testing/unit-integration-api-testing.md)) as the shape for new pages.

## Running locally

Prerequisites: Node.js 20+, pnpm (or npm).

```bash
pnpm install        # or: npm install
pnpm dev            # starts Astro dev server on http://localhost:4321
```

### Production build

```bash
pnpm build          # emits dist/
pnpm preview        # serves the build locally
```

## Deployment

Configured for **GitHub Pages** via GitHub Actions from the `main` branch. The build automatically handles base path (`/<repo>/`) for project pages vs root for user/org sites.

## License

Content copyright © the Node.js Backend Academy contributors. See repository for license terms.

---

Feedback, corrections, and new-content contributions welcome — open a pull request or issue. Click "Edit this page" on any lesson to jump straight to the source file on GitHub.
