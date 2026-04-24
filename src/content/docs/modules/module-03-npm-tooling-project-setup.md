---
title: Module 03 - NPM, Tooling, and Project Setup
description: npm fundamentals, dependency management, linting, formatting, environments, project structure, and Git discipline.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="2 weeks" track="Module 03" prerequisites="Module 02 — Node.js Core Runtime" />

This module makes learners operational. Instead of writing loose scripts, they begin creating maintainable repositories with clear structure and professional defaults. The output is not a tutorial project — it is the scaffold every later module will extend.

<Objectives>
- Start a Node.js repo with scripts, lockfile, and semver discipline
- Configure ESLint and Prettier and enforce them via scripts
- Separate config, secrets, and environment concerns cleanly
- Lock in a folder structure that survives the jump to Express and services
</Objectives>

## What this module covers

- npm commands, semantic versioning, and script design
- production, development, and peer dependency awareness
- Prettier and ESLint setup
- environment configuration strategy
- hot reload workflows with tools like `nodemon` or `tsx`
- folder structure for scalable backend work
- Git ignore rules and branch conventions

## Teaching sequence

1. Create a clean package setup from zero.
2. Show why scripts matter for repeatable team workflows.
3. Add linting and formatting before project growth.
4. Introduce environment-based configuration and secrets boundaries.
5. Lock in a folder structure that matches future Express and service layers.

## Live examples

- defining `dev`, `build`, `lint`, and `test` scripts
- separating `src`, `config`, `routes`, `controllers`, and `services`
- creating `.env.example` and explaining secret handling

## Labs

- scaffold a backend starter repository
- configure linting and formatting with enforced scripts
- document local setup in a README

## Exit outcomes

- students can start a backend repository cleanly
- students understand why structure decisions matter before complexity arrives
- students are ready to begin the API phase without setup confusion

<Callout type="tip" title="One command to verify everything">
Before leaving this module, every student's repo should answer to a single `pnpm check` (or `npm run check`) that runs lint, format, and type-check in one pass. That single script is the seed of the CI pipeline they will build in Module 11.
</Callout>

## Cross-links

- Deep-study path: [Learning / Tooling](/learning/tooling/overview/) — package managers, scripts, lint/format, and repo hygiene.
- Next module: [Module 04 — Express.js & REST API Development](/modules/module-04-express-rest-api-development/).
