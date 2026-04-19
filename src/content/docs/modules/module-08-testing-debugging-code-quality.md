---
title: Module 08 - Testing, Debugging, and Code Quality
description: Unit tests, integration tests, Supertest, debugger workflows, logging, coverage, and quality checkpoints.
---

**Duration:** 2 weeks

This module teaches confidence. Students stop asking whether a change “probably works” and start verifying behavior with repeatable techniques.

## What Learners Cover

- unit testing with Jest or Vitest
- integration testing for APIs and database flows
- Supertest for route-level testing
- mocks and test doubles
- Node inspector and VS Code debugging
- structured logging and error observability basics
- coverage, test strategy, and CI integration

## Suggested Teaching Sequence

1. Begin with one failing unit test.
2. Move to route-level integration tests.
3. Add debugging and logging to understand failures faster.
4. Connect tests to CI so quality checks become normal.

## Live Examples

- testing a service function in isolation
- testing an Express route with Supertest
- debugging a failing async test
- adding structured request or error logs

## Practical Labs

- add tests to a previously built module
- reproduce a bug and fix it with a failing test first
- define minimum quality gates for pull requests

## Exit Outcomes

- students can choose the right level of test
- students know how to debug instead of guessing
- students start treating quality as part of development, not cleanup
