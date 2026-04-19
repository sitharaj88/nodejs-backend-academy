---
title: Mocking, Fixtures, Contracts, and Test Data
slug: learning/testing/mocking-fixtures-contracts-test-data
description: Learn when to mock, how to design fixtures, how contracts shape tests, and how realistic test data improves backend confidence.
---

Poor test data and careless mocking can create false confidence very quickly.

## Mocking

Mocking is useful when:

- the dependency is expensive
- the dependency is external
- the behavior under test should stay isolated

## Fixtures

Fixtures should be:

- readable
- purposeful
- close to real domain shapes

## Contract Thinking

Students should understand that APIs, services, and repositories all have contracts. Tests can verify those contracts explicitly.

## Common Mistakes

- mocking everything
- using unrealistic fixtures
- hiding important integration behavior behind fake data

## What To Remember

- mocks are tools, not defaults
- realistic data improves test value
- contract thinking keeps tests aligned with real behavior
