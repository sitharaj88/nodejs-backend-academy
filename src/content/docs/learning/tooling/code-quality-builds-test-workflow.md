---
title: Code Quality, Builds, and Test Workflow
slug: learning/tooling/code-quality-builds-test-workflow
description: Learn linting, formatting, type checking, build workflow, CI awareness, and how quality gates support maintainable backend engineering.
---

Code quality is not about cosmetic strictness. It is about preventing avoidable problems before code reaches production.

## Quality Layers

Important quality layers include:

- formatting
- linting
- type checking
- tests
- builds

Each catches different categories of failure.

## Formatting

Formatting should reduce noise in reviews. It should not be a recurring manual debate.

## Linting

Linting helps catch:

- bad async patterns
- unused code
- inconsistent style
- risky constructs

Teach students to understand the rule’s purpose, not only how to silence it.

## Type Checking

Type checking is a quality gate when TypeScript is present. It helps catch broken assumptions before runtime.

## Build Workflow

A build step may include:

- transpilation
- bundling when needed
- asset generation
- type emission

Not every backend needs complex bundling, but every backend needs clear build expectations.

## CI Awareness

Students should know that local workflow eventually becomes CI workflow:

- install dependencies
- run checks
- run tests
- build artifacts

## Common Mistakes

- running tests manually but not as part of repeatable scripts
- treating lint errors as meaningless friction
- adding tools without integrating them into workflow
- building a pipeline nobody can explain

## What To Remember

- quality workflow is layered
- each tool should solve a real failure mode
- builds and tests should be reproducible
- maintainable tooling is easier to trust
