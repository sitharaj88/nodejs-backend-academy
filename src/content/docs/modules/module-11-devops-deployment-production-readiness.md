---
title: Module 11 - DevOps, Deployment, and Production Readiness
description: Linux basics, Docker, Nginx, CI or CD, PM2, health checks, and production operations for Node.js services.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Advanced" duration="2 weeks" track="Module 11" prerequisites="Modules 04-09" />

This module moves the class from development-time success to runtime responsibility. Students learn what it takes to operate a Node.js application outside their editor — containerized, health-checked, configured per environment, and redeployable on every merge to main.

<Objectives>
- Containerize a Node.js API with a multi-stage, non-root Dockerfile
- Separate config per environment and keep secrets out of the repo
- Run a CI pipeline that blocks merges when lint, test, or build fails
- Operate a deployed service with health checks, restart policy, and log access
</Objectives>

## What this module covers

- Linux basics for backend developers
- Docker fundamentals and containerizing Node.js apps
- Nginx reverse proxy basics
- deployment to cloud platforms or VPS environments
- environment-based configuration and secrets management
- GitHub Actions CI or CD pipelines
- PM2, health checks, restart policies, and production logging

## Teaching sequence

1. Begin with local containerization.
2. Explain runtime configuration and why dev settings should not leak into production.
3. Add process management and health checks.
4. Introduce CI pipelines for repeatable verification.
5. End with a simple deployment walkthrough.

## Live examples

- Dockerfile for a Node.js API
- environment-specific configuration loading
- GitHub Actions pipeline with install, test, and build
- PM2 process management and restart handling

## Labs

- containerize an existing API
- deploy to a VPS or cloud platform
- add a CI workflow that blocks broken changes
- create a production checklist for releases

## Exit outcomes

- students can package and ship backend services
- students understand that deployment is part of backend work
- students are ready to deploy capstones rather than only demo locally

<Callout type="tip" title="The fresh-clone test">
Every deployable project in this module must pass a "fresh clone" test: a teammate who has never seen the code clones the repo, runs the documented setup, and has the service running in production-like mode within fifteen minutes. If they cannot, the README or the Docker setup is broken — and that counts as broken code.
</Callout>

## Cross-links

- Deep-study path: [Learning / DevOps](/learning/devops/overview/) — Docker, CI/CD, observability, and runbooks.
- Next module: [Module 12 — System Design & Microservices Basics](/modules/module-12-system-design-microservices-basics/).
