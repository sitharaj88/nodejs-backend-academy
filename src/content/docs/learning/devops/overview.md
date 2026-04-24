---
title: DevOps Overview
slug: learning/devops/overview
description: Overview for the DevOps and deployment learning track, covering environment management, Docker, CI/CD, runtime operations, and delivery discipline.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="7 min" track="DevOps" prerequisites="Node.js, HTTP, basic Linux shell" />

DevOps is not a job title and it is not a toolbox. It is the set of engineering disciplines that turn "works on my laptop" into "survives at 3am on a Sunday." This track treats delivery, configuration, containers, CI/CD, and observability as one continuous loop: you change code, ship it safely, watch it run, and feed the signal back into the next change.

<Objectives>
- Separate configuration from code so one artifact runs in every environment
- Build small, reproducible container images that do not run as root
- Ship changes through a CI pipeline that is boring, fast, and hard to break
- Release with a strategy — blue-green, canary, rolling — and a real rollback path
- Operate services with metrics, logs, traces, SLOs, and runbooks instead of vibes
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Config & Packaging', title: 'Environments, Config, Docker', description: '12-factor config, multi-stage Dockerfiles, Compose, non-root, distroless.', href: '/learning/devops/environment-config-docker-containers/' },
  { eyebrow: 'Delivery', title: 'CI, CD, and Release Flow', description: 'GitHub Actions, caching, test matrix, canary, rollback, feature flags.', href: '/learning/devops/ci-cd-release-flow-and-deployment/' },
  { eyebrow: 'Operations', title: 'Observability & Runbooks', description: 'Metrics, logs, traces, SLI/SLO/error budget, on-call discipline.', href: '/learning/devops/observability-runtime-operations-and-runbooks/' },
  { eyebrow: 'Ecosystem', title: 'Modern DevOps Coverage', description: 'Kubernetes, Argo CD, Fly.io, Prometheus/Grafana, Datadog, Sentry.', href: '/learning/devops/modern-devops-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Dockerize a service, build a pipeline, run a rollback drill.', href: '/learning/devops/labs-projects-interview-case-studies/' },
]} />

## The loop, honestly

Every page in this track lives inside one loop:

```
code → build → test → release → run → observe → learn → code
```

Breaking any link breaks the whole thing. A great pipeline with no observability is flying blind. A great dashboard with a slow pipeline means you cannot act on what you see. You study this track to keep every link short and strong.

<Callout type="tip" title="How to study this track">
Pick one small Node.js service — a CRUD API with Postgres and Redis is perfect. As you move through the pages, containerize it, wire a pipeline for it, add SLOs to it, and run a rollback drill on it. The artifacts from each page become the inputs to the next.
</Callout>

## Recommended path

1. [Environment, Config, Docker, and Containers](/learning/devops/environment-config-docker-containers/)
2. [CI, CD, Release Flow, and Deployment](/learning/devops/ci-cd-release-flow-and-deployment/)
3. [Observability, Runtime Operations, and Runbooks](/learning/devops/observability-runtime-operations-and-runbooks/)
4. [Modern DevOps Coverage](/learning/devops/modern-devops-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/devops/labs-projects-interview-case-studies/)

## What "good" looks like

A team that has internalised this track ships changes on Friday afternoon and does not cancel weekend plans. Concretely:

- One container image is promoted unchanged from dev to staging to prod. Config is injected, not baked.
- A pull request goes from "approved" to "running in production for 1% of traffic" in under fifteen minutes.
- Every user-facing error correlates to a trace id visible in logs, a span in the tracer, and a bump on a dashboard.
- Every alert links to a runbook with the first five commands to run. No alert fires at 3am without also firing in staging first.
- Rolling back is a single command and is rehearsed monthly — not a panic-driven improvisation.

<Callout type="info" title="If you are brand new to Linux or Docker">
Do not skip the first page. Every subsequent page assumes you can explain what a layer is, what a namespace is, and what happens when you type `docker run`. The payoff is that the rest of the track stops feeling like magic.
</Callout>

## Outcomes

By the end of the track you can take a plain Node.js service and deliver it to production with a reproducible image, a green pipeline, SLO-backed alerts, a documented runbook, and a rollback you have actually tested. You also know which of those items to build first when starting from nothing, and which to defer until real load demands them.
