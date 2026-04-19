---
title: Unit, Integration, and API Testing
slug: learning/testing/unit-integration-api-testing
description: Learn the main testing layers in backend systems, what each layer proves, and how to choose the right depth of testing.
---

Different tests answer different questions.

## Unit Tests

Unit tests focus on small pieces of logic with tight feedback loops.

## Integration Tests

Integration tests check how parts work together:

- service and repository
- route and middleware
- application and database

## API Tests

API tests validate full request and response behavior.

They are especially valuable for:

- validation flow
- auth flow
- response shape consistency

## Common Mistakes

- testing only happy paths
- writing only unit tests and assuming the system is safe
- using broad integration tests for every tiny behavior

## What To Remember

- each test layer has a purpose
- confidence comes from layered testing, not one style only
- API behavior deserves direct verification
