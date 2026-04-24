---
title: Module 08 - Testing, Debugging, and Code Quality
description: Unit tests, integration tests, Supertest, debugger workflows, logging, coverage, and quality checkpoints.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="2 weeks" track="Module 08" prerequisites="Module 07 — Architecture" />

This module teaches confidence. Students stop asking whether a change "probably works" and start verifying behavior with repeatable techniques — tests that protect real confidence, debuggers that save hours, and logs that survive an incident.

<Objectives>
- Choose between unit, integration, and API tests with intent
- Debug failing tests and failing services with the Node inspector instead of guessing
- Add structured logs that are useful during incidents, not just during development
- Define and enforce minimum quality gates on every pull request
</Objectives>

## What this module covers

- unit testing with Jest or Vitest
- integration testing for APIs and database flows
- Supertest for route-level testing
- mocks and test doubles
- Node inspector and VS Code debugging
- structured logging and error observability basics
- coverage, test strategy, and CI integration

## Teaching sequence

1. Begin with one failing unit test.
2. Move to route-level integration tests.
3. Add debugging and logging to understand failures faster.
4. Connect tests to CI so quality checks become normal.

## Live examples

- testing a service function in isolation
- testing an Express route with Supertest
- debugging a failing async test
- adding structured request or error logs

## Labs

- add tests to a previously built module
- reproduce a bug and fix it with a failing test first
- define minimum quality gates for pull requests

## Exit outcomes

- students can choose the right level of test
- students know how to debug instead of guessing
- students start treating quality as part of development, not cleanup

<Callout type="tip" title="Write the failing test before the fix">
When a bug report arrives, the first commit should add a failing test that reproduces the reported behavior, and the second commit should fix it. Students who adopt this rhythm stop re-introducing bugs they already fixed — and their pull requests get reviewed faster.
</Callout>

## Cross-links

- Deep-study path: [Learning / Testing](/learning/testing/overview/) — unit, integration, API, mocks, contracts, and debugging.
- Next module: [Module 09 — Performance, Caching & Scalability](/modules/module-09-performance-caching-scalability/).
