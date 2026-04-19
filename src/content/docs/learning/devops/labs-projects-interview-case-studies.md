---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/devops/labs-projects-interview-case-studies
description: Practical depth page for the DevOps track, including container labs, CI/CD projects, interview questions, and production case studies.
---

This page adds practical depth to the DevOps and deployment track.

## Code Labs

- Containerize a small Node.js service and explain every line of the Dockerfile in terms of runtime and delivery impact.
- Create a simple CI workflow that installs dependencies, runs checks, tests the app, and builds an artifact.
- Add health checks, readiness awareness, and graceful shutdown handling to a backend service.

## Mini Projects

- Build a deployment-ready Node.js starter with Docker, scripts, health routes, and a CI pipeline.
- Create a release simulation where learners promote one service through local, staging, and production-like environments with different config values.

## Interview Questions

- What problem does containerization solve?
- Why should CI and local scripts align closely?
- What is the difference between liveness and readiness?
- Why is rollback planning part of deployment design?
- What makes logs, metrics, and traces complementary?
- Why are runbooks useful even for small teams?

## Production Case Studies

### Case Study 1: Config Drift Across Environments

The service passed locally but failed in production because one secret and one environment variable name were different across environments.

### Case Study 2: Pipeline Nobody Could Explain

The CI/CD flow became so opaque that failures took longer to debug than the code issues themselves. The fix was to simplify and document the release path.

### Case Study 3: No Readiness Strategy

Instances started receiving traffic before the app had completed startup connections. Deployment instability was blamed on the platform when the real issue was missing readiness design.

## Teaching Advice

- Ask learners to narrate the release path from commit to runtime.
- Review failure handling in the pipeline, not only success.
- Include operational visibility and shutdown behavior in hands-on work.
