---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/testing/labs-projects-interview-case-studies
description: Practical depth page for the testing track, including test labs, debugging drills, mini-projects, interview questions, and outage case studies.
---

This page makes the testing and debugging track more classroom-ready.

## Code Labs

- Write unit, integration, and API tests for the same feature and compare what each layer actually proves.
- Introduce a bug into a service, reproduce it, and then debug it using logs, assertions, and a regression test.
- Replace unsafe mocking with a more meaningful integration test and document what confidence improved.

## Mini Projects

- Build a test suite for a small Express API including validation, auth, and error paths.
- Create a debugging workshop where learners receive a broken backend and must isolate the fault with logs and tests.

## Interview Questions

- What is the difference between unit, integration, and end-to-end tests?
- When is mocking helpful, and when does it create false confidence?
- Why are failure-path tests important?
- What makes logs useful during debugging?
- How do you debug a production issue methodically?
- What is the relationship between tests and observability?

## Production Case Studies

### Case Study 1: Happy-Path-Only Test Suite

The system looked well tested until an invalid payload reached production. The suite had never exercised validation failure or partial downstream failure behavior.

### Case Study 2: Over-Mocked Integration

A test suite passed consistently, but the real database integration broke because mocks never reflected actual query behavior.

### Case Study 3: Noisy Logs, Low Signal

The service produced many logs, but none carried request context or failure categorization. During an incident, the team had volume without insight.

## Teaching Advice

- Treat debugging as a workflow exercise, not only a lecture topic.
- Make learners explain why a given test exists.
- Include negative-path and operational-failure scenarios in every module.
