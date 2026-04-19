---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/tooling/labs-projects-interview-case-studies
description: Practical depth page for the tooling track, including hands-on labs, mini-project ideas, interview questions, and production case studies.
---

This page turns the tooling track into training material learners can practice, present, and discuss.

## Code Labs

- Build a clean `package.json` for a Node.js API with `dev`, `build`, `start`, `test`, and `lint` scripts, then explain why each script exists.
- Add strict dependency discipline to an existing sample app by moving packages into the correct dependency category and documenting the reason for each one.
- Introduce a formatting, linting, and type-check workflow to a messy project and make the output reproducible in one command.

## Mini Projects

- Create a reusable backend starter template with scripts, config loading, linting, testing, and build steps.
- Build a training repo that demonstrates ESM setup, TypeScript integration, and a clean CI-ready script surface.

## Interview Questions

- What problem does a lockfile solve, and why is committing it important?
- When would you place a package in `devDependencies` instead of `dependencies`?
- What is semantic versioning, and how do major, minor, and patch releases affect backend maintenance?
- Why can a project with too many scripts become harder to maintain?
- What is the difference between a local workflow and a CI workflow?
- When is adding another build tool justified, and when is it unnecessary complexity?

## Production Case Studies

### Case Study 1: Reproducibility Failure

A production hotfix behaved differently from staging because the pipeline installed newer transitive dependencies than the developer machine. The root cause was missing lockfile discipline.

### Case Study 2: Script Sprawl

A team had many undocumented scripts with overlapping behavior. New joiners could not tell which command was the real deployment path, which slowed releases and increased mistakes.

### Case Study 3: Tooling Without Purpose

A project accumulated linting, bundling, formatting, and generation tools nobody could explain. Maintenance overhead increased while confidence did not. The fix was to keep only tools that solved a clear failure mode.

## Teaching Advice

- Ask learners to explain the workflow in plain language, not only run the commands.
- Review whether every tool in the stack has a clear justification.
- Treat setup quality as part of backend engineering, not only onboarding.
