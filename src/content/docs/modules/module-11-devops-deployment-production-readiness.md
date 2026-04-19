---
title: Module 11 - DevOps, Deployment, and Production Readiness
description: Linux basics, Docker, Nginx, CI or CD, PM2, health checks, and production operations for Node.js services.
---

**Duration:** 2 weeks

This module moves the class from development-time success to runtime responsibility. Students learn what it takes to operate a Node.js application outside their editor.

## What Learners Cover

- Linux basics for backend developers
- Docker fundamentals and containerizing Node.js apps
- Nginx reverse proxy basics
- deployment to cloud platforms or VPS environments
- environment-based configuration and secrets management
- GitHub Actions CI or CD pipelines
- PM2, health checks, restart policies, and production logging

## Suggested Teaching Sequence

1. Begin with local containerization.
2. Explain runtime configuration and why dev settings should not leak into production.
3. Add process management and health checks.
4. Introduce CI pipelines for repeatable verification.
5. End with a simple deployment walkthrough.

## Live Examples

- Dockerfile for a Node.js API
- environment-specific configuration loading
- GitHub Actions pipeline with install, test, and build
- PM2 process management and restart handling

## Practical Labs

- containerize an existing API
- deploy to a VPS or cloud platform
- add a CI workflow that blocks broken changes
- create a production checklist for releases

## Exit Outcomes

- students can package and ship backend services
- students understand that deployment is part of backend work
- students are ready to deploy capstones rather than only demo locally
