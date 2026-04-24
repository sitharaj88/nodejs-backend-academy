---
title: NPM, Tooling, and Setup Overview
slug: learning/tooling/overview
description: Package management, reproducible builds, lint and format, TypeScript builds, and scripts that scale — the tooling discipline that separates hobby projects from shippable ones.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="6 min" track="Tooling" prerequisites="Basic Node.js" />

A senior Node.js developer is recognizable by their `package.json`, their lockfile habits, and what happens in the ten seconds after they clone a repo. This track teaches the tooling decisions that make a codebase pleasant to inherit.

<Objectives>
- Set up a reproducible Node.js + TypeScript project in under 5 minutes
- Read and reason about a lockfile
- Write scripts that do one thing well and compose
- Wire lint, format, type-check, and test into a fast quality gate
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Packages', title: 'Package Management, Semver, Lockfiles', description: 'npm vs pnpm vs yarn, ^ vs ~, lockfile truth.', href: '/learning/tooling/package-management-semver-lockfiles/' },
  { eyebrow: 'Setup', title: 'Project Setup, Scripts, Configuration', description: 'tsconfig, env vars, scripts that compose.', href: '/learning/tooling/project-setup-scripts-configuration/' },
  { eyebrow: 'Quality', title: 'Code Quality, Builds, Test Workflow', description: 'ESLint, Prettier, tsc, build outputs.', href: '/learning/tooling/code-quality-builds-test-workflow/' },
  { eyebrow: 'Ecosystem', title: 'Modern Tooling Coverage', description: 'pnpm, tsx, vitest, biome, changesets, turborepo.', href: '/learning/tooling/modern-tooling-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Set up real projects and reason about trade-offs.', href: '/learning/tooling/labs-projects-interview-case-studies/' },
]} />

<Callout type="tip" title="How to study this track">
Clone an open-source Node.js library you admire (Fastify, Hono, Prisma) and read its `package.json` + `tsconfig.json` top to bottom. Pick one thing you don't understand per day.
</Callout>

## Outcomes

By the end of the track, you can bootstrap a Node.js service that a new engineer can clone, run, and deploy within 15 minutes, with lint, format, type-check, and tests all wired to the same script surface.
