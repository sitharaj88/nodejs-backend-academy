---
title: Package Management, Semver, and Lockfiles
slug: learning/tooling/package-management-semver-lockfiles
description: Learn npm package management, dependencies, semantic versioning, lockfiles, audits, and how package decisions affect backend reliability.
---

Package management is one of the main operational foundations of a Node.js codebase.

## `package.json`

Students should understand:

- `name`
- `version`
- `scripts`
- `dependencies`
- `devDependencies`
- `engines`
- `type`

These are not decoration. They define how the project behaves.

## Dependency Categories

- `dependencies` are needed at runtime
- `devDependencies` support building, testing, linting, or generating code

Treating these casually creates deployment and install problems.

## Semantic Versioning

Semver is core backend literacy:

- major: breaking changes
- minor: backward-compatible features
- patch: backward-compatible fixes

Students should learn to read version ranges, not only copy them.

## Lockfiles

Lockfiles make installs reproducible. They should usually be committed.

Without them, one developer or CI pipeline may install different transitive versions than another.

## Audits and Supply Chain Awareness

Learners should know:

- `npm audit` is useful but not magical
- not every audit issue should trigger panic
- dependency count and dependency quality both matter

## Common Mistakes

- installing packages without understanding why they are needed
- overusing dependencies for things already built into Node.js
- ignoring the lockfile
- updating packages without checking release notes

## What To Remember

- package management is part of reliability
- semver affects upgrade strategy
- lockfiles protect reproducibility
- fewer, better dependencies usually improve maintainability
