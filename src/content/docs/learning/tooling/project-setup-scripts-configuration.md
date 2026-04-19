---
title: Project Setup, Scripts, and Configuration
slug: learning/tooling/project-setup-scripts-configuration
description: Learn practical Node.js project setup, directory structure, npm scripts, environment config, tsconfig awareness, and local development workflow.
---

Good project setup reduces friction for every developer who touches the codebase later.

## Scripts as Workflow

Typical scripts include:

- `dev`
- `build`
- `start`
- `test`
- `lint`
- `check`

Scripts should describe the team workflow clearly, not accumulate random shell commands.

## Directory Structure

Students should choose structure based on clarity:

- `src/`
- `tests/`
- `scripts/`
- `config/`

Avoid both chaos and needless abstraction.

## Environment Configuration

Applications need clear startup configuration for:

- ports
- database URLs
- JWT secrets
- feature flags
- third-party credentials

Configuration should be validated early, not assumed throughout the codebase.

## TypeScript and Config Awareness

Even if a project is primarily JavaScript, learners should understand:

- `tsconfig` if TypeScript is used
- ESM versus CommonJS settings
- path alias tradeoffs

## Watch Mode and Local Feedback

Fast feedback matters in training and real work.

Students should know how to run:

- watch mode during development
- rebuilds after config or source changes
- test reruns in local workflow

## Common Mistakes

- hiding too much setup logic in undocumented scripts
- scattering config assumptions throughout the app
- making the startup process hard to understand
- mixing runtime config with source constants carelessly

## What To Remember

- good setup reduces repeated confusion
- scripts should reflect real developer workflow
- config belongs at clear boundaries
- startup clarity is part of engineering quality
