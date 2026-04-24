---
title: Testing and Debugging Overview
slug: learning/testing/overview
description: Learn what backend testing actually proves, which layer catches which bugs, and how to move from guesswork debugging to repeatable diagnostic technique.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Testing" prerequisites="Express basics, async/await" />

Testing and debugging are not cleanup work. They are the engineering disciplines that let you change code without breaking it and diagnose a broken system without luck. This track turns **Module 08** into a hands-on learning path with mental models, runnable code, labs, and real outage case studies.

<Objectives>
- Choose between unit, integration, and API tests with intent
- Design fixtures and mocks that protect real confidence
- Debug production-like failures with structured logs and reproducible steps
- Set minimum quality gates that survive team churn
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Layers', title: 'Unit, Integration, API', description: 'When each layer is cheap, honest, or misleading.', href: '/learning/testing/unit-integration-api-testing/' },
  { eyebrow: 'Test data', title: 'Mocking, Fixtures, Contracts', description: 'Stop faking behavior you actually need to verify.', href: '/learning/testing/mocking-fixtures-contracts-test-data/' },
  { eyebrow: 'Diagnostics', title: 'Debugging & Logging', description: 'Logs that survive an incident, debuggers that save hours.', href: '/learning/testing/debugging-logging-diagnostics/' },
  { eyebrow: 'Ecosystem', title: 'Modern Testing Coverage', description: 'Vitest, node:test, Testcontainers, Playwright, Pact.', href: '/learning/testing/modern-testing-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Write tests, break systems, reason about outages.', href: '/learning/testing/labs-projects-interview-case-studies/' },
]} />

## Recommended path

1. [Unit, Integration, and API Testing](/learning/testing/unit-integration-api-testing/)
2. [Mocking, Fixtures, Contracts, and Test Data](/learning/testing/mocking-fixtures-contracts-test-data/)
3. [Debugging, Logging, and Diagnostics](/learning/testing/debugging-logging-diagnostics/)
4. [Modern Testing Coverage](/learning/testing/modern-testing-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/testing/labs-projects-interview-case-studies/)

<Callout type="tip" title="How to study this track">
Pick one feature in a small Express API — for example, a `POST /users` route. As you move through the pages, write a unit test, an integration test, and an API test for the **same** feature. Compare what each one catches and what each one misses.
</Callout>

## Outcomes

By the end of the track you can decide, for any change, which tests must pass before merge, which logs must appear in production, and how you would reproduce an incident from a user's report in under thirty minutes.
