---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/devops/labs-projects-interview-case-studies
description: Practical depth page for the DevOps track, including container labs, CI/CD projects, interview questions, and production case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="25 min" track="DevOps" />

Ship real artifacts. Break them on purpose. Repair them under a stopwatch.

## Code labs

<Lab title="Dockerize a Node service to a non-root, sub-200 MB image" duration="60 min" difficulty="Medium" stack="Node.js 22, Docker, docker-compose, Postgres, Redis">
Build a multi-stage Dockerfile that produces a distroless, non-root image of a real Express + Postgres + Redis service. Add `/livez` and `/readyz`, wire them to `docker-compose` healthchecks, and verify that stopping Postgres flips `/readyz` to 503 while `/livez` stays 200.

**Success criteria**: final image under 200 MB, `docker run --rm IMG id` shows a non-root uid, `docker compose up` reaches healthy in under 30 seconds, removing `JWT_SECRET` makes the app exit 1 at startup with a specific error.
</Lab>

<Lab title="GitHub Actions pipeline with caching, matrix, and canary" duration="90 min" difficulty="Hard" stack="GitHub Actions, GHCR, Fly.io or ECS">
Author `.github/workflows/ci.yml` that runs lint/typecheck/unit/integration in parallel, builds one image tagged with the commit SHA, and promotes through staging and a 10% canary in production. Gate the canary promotion on an SLO-verify script that reads Prometheus.

**Success criteria**: end-to-end pipeline under 15 minutes, `concurrency` cancels superseded runs, no secret appears in any log (`gh run view --log | grep -i secret` is clean), canary auto-holds on > 0.5% error rate.
</Lab>

<Lab title="SLO dashboard with alert and runbook" duration="75 min" difficulty="Medium" stack="Node.js, OpenTelemetry, Prometheus, Grafana, Alertmanager">
Define one SLO: "99.5% of `POST /orders` return 2xx within 500 ms over 30 days." Emit the right metrics from the service, write the Prometheus recording rule and alert, and author a runbook for the alert. Game-day: inject 800 ms of latency via `toxiproxy` and confirm the alert fires, the trace identifies the slow span, and the runbook's first command is actionable.

**Success criteria**: dashboard shows error-budget remaining as a percentage and updates live, alert fires within 5 minutes of fault injection, the trace id in the response header matches the one in logs and Jaeger, runbook executes cleanly when followed verbatim.
</Lab>

<Lab title="Rollback drill under a stopwatch" duration="45 min" difficulty="Medium" stack="Docker, GHCR, your deploy target">
Intentionally ship a bug to production canary (e.g., a handler that throws on a specific payload shape). Observe the canary auto-hold. Roll back to the previous digest with a single command and measure wall-clock time from "decided" to "error rate normal."

**Success criteria**: rollback command is one line, takes under 60 seconds, causes zero data loss, and is documented in `ROLLBACK.md` well enough that a teammate who has never deployed this service can execute it.
</Lab>

## Mini projects

- **Deployment-ready Node.js starter**: a repo with a multi-stage Dockerfile, `.dockerignore`, docker-compose, `src/config.ts` with zod, pino + OpenTelemetry, `/livez` + `/readyz`, a GitHub Actions workflow, and `ROLLBACK.md`. Use it as the base for the next three services you build.
- **Game-day workshop repo**: each branch introduces a different production failure — slow downstream, poisoned cache entry, migration drift, leaked secret in logs. Learners run `git checkout game-03` and play out the incident with a real stopwatch.
- **GitOps lab**: wire an Argo CD install to a staging cluster. PR in the manifests repo changes the image tag; Argo reconciles within 2 minutes. Write a PR that intentionally drifts the live state and watch Argo revert it.
- **Cost-aware autoscaling**: add HPA to a service. Load-test it with `k6`. Measure replicas vs requests vs cost. Produce a one-page memo on when HPA helps and when it masks a real bottleneck.

## Interview questions

1. Walk me through what happens between `git push` and "traffic is live on the new version."
2. What is the difference between liveness and readiness probes? Give an example where confusing them causes a multi-minute outage.
3. Why is "build once, promote the digest" better than "rebuild on each environment"?
4. Name three things you must pin to make a Docker build reproducible.
5. When would you pick blue-green over canary?
6. How do you roll back a deploy that included a database migration?
7. What is an SLO? How does an error budget change the team's behaviour?
8. You are paged at 3am for a 95th-percentile-latency alert. The p50 looks normal. What do you check first?
9. What goes in a runbook and what does not?
10. A canary shows a 0.3% error increase. Ship it or hold? Defend your answer.
11. Explain the expand/contract pattern for a column rename.
12. What does OIDC give you that long-lived cloud keys do not?
13. When is Kubernetes the wrong choice?
14. What are high-cardinality labels and why do they break Prometheus?
15. How do you prevent a secret from ending up in a CI log?

## Production case studies

### Case 1 — The deploy that passed CI and failed prod

CI ran `npm install`, which installed the latest minor of a transitive dependency published 20 minutes earlier. The dependency shipped a regression in its TLS client. Production's same-branch rebuild installed it; errors started 8 minutes after deploy.

**Lesson:** build once in CI, promote the digest. Use `npm ci` with a committed `package-lock.json`, never `npm install` in a deploy step.

### Case 2 — The alert that cried wolf

A team had 180 alerts, most cause-based ("Redis memory above 80%"). Engineers snoozed the pager. A real outage — payments down for 18 minutes — went unnoticed because the page looked like all the others.

**Lesson:** alert on symptoms (user-visible error rate, user-visible latency), not on internals. Prune alerts ruthlessly. If a page does not have a runbook, it should not page.

### Case 3 — The migration that bricked rollback

A column rename `ALTER TABLE users RENAME COLUMN name TO full_name` shipped in the same deploy as the code that reads `full_name`. When the deploy caused errors for unrelated reasons, rollback to the previous image failed because the previous image referenced `name`, which no longer existed.

**Lesson:** expand/contract. Ship the schema change and the code change in separate deploys, with the old and new shapes both valid for at least one release cycle.

### Case 4 — Readiness probe pinned to Postgres

Liveness and readiness both pinged the database. A 40-second Postgres failover storm triggered liveness failures, Kubernetes killed every pod, and when Postgres recovered there were no pods to serve traffic. The service stayed down for 6 more minutes during cold start.

**Lesson:** liveness checks the process only. Readiness checks dependencies. Confusing them amplifies transient downstream issues into permanent outages.

### Case 5 — The secret that leaked through a log line

A debug PR added `logger.info({ config }, 'boot')` to help diagnose a config parsing issue. It shipped. `config.JWT_SECRET` and `config.DATABASE_URL` sat in the central log index for six weeks before a security scan caught it. Rotation took two days.

**Lesson:** log redaction at the logger (not at the call site), a `redact` list that includes anything resembling `*_secret`, `*_token`, `*_password`, plus a pre-merge grep for bare `logger.(info|debug)({ config` in PR review.

<Callout type="tip" title="Practice the rollback before you need it">
A rollback you have never executed is a theoretical capability, not an operational one. Every team should run one rehearsed rollback per month during working hours — not during an incident.
</Callout>

## Teaching tips

- Have learners walk the commit-to-production path end to end before introducing any tool.
- Every lab deliverable includes a `ROLLBACK.md` — no exceptions.
- Run at least one game day per cohort. Inject a real fault and time the response.
- When reviewing a learner's pipeline, ask "how would you know it broke?" and "how would you undo it?" before asking anything else.
