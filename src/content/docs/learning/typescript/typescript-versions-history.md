---
title: TypeScript Versions and Feature History
slug: learning/typescript/typescript-versions-history
description: TypeScript version history from the early 0.x releases through TypeScript 6.0, including the major features learners should associate with each era.
---

TypeScript has changed in layers. Old code, mid-era code, and modern code can feel very different even when they all compile today.

This page gives learners a practical timeline so they can understand:

- what the current stable TypeScript version is
- which versions introduced the biggest ideas
- why older blog posts and codebases may look different

## Current Latest Stable Version

As of April 19, 2026, the latest stable TypeScript release is **TypeScript 6.0**, announced on **March 23, 2026**.

TypeScript 7 is part of the next-generation native compiler direction, but it should be treated as the next major step rather than the current stable baseline for this training material.

## Why Version History Matters

TypeScript learners regularly see references like:

- TypeScript 2.8
- TypeScript 3.7
- TypeScript 4.1
- TypeScript 4.9
- TypeScript 5.0
- TypeScript 5.9
- TypeScript 6.0

Those references are important because many major language and tooling features arrived in specific versions.

## Early Era

### TypeScript 0.8

One of the earliest public releases from 2012. This era established TypeScript as a typed superset of JavaScript.

### TypeScript 0.9

A major early step that improved classes, modules, and the language’s basic developer experience.

### TypeScript 1.0

The first official stable milestone. This is the release line that made TypeScript feel like a serious long-term language and tooling platform.

## TypeScript 1.x Line

Versions in this era include:

- 1.0
- 1.1
- 1.3
- 1.4
- 1.5
- 1.6
- 1.7
- 1.8

Notable progress in the 1.x line:

- union types in 1.4
- improved module support
- decorators support in the era where many frameworks became more TypeScript-friendly
- stronger control-flow and language-service maturity

## TypeScript 2.x Line

Versions in this era include:

- 2.0
- 2.1
- 2.2
- 2.3
- 2.4
- 2.5
- 2.6
- 2.7
- 2.8
- 2.9

This was one of the most important growth periods for the type system.

Major milestones:

- **2.0**:
  `strictNullChecks`, control-flow-based analysis, and a much stronger strictness story
- **2.1**:
  `keyof`, lookup types, and mapped types
- **2.3**:
  generic parameter defaults
- **2.8**:
  conditional types and built-in utility types such as `Exclude` and `Extract`

If learners want to understand modern advanced TypeScript, the 2.x line is a major turning point.

## TypeScript 3.x Line

Versions in this era include:

- 3.0
- 3.1
- 3.2
- 3.3
- 3.4
- 3.5
- 3.6
- 3.7
- 3.8
- 3.9

Major milestones:

- **3.0**:
  tuple and parameter handling improvements, better support for JavaScript migration, and project-scale growth
- **3.4**:
  `as const`, readonly tuple improvements, and stronger inference in common patterns
- **3.7**:
  optional chaining `?.`, nullish coalescing `??`, and assertion functions
- **3.8**:
  type-only imports and exports

Version 3.7 is especially important because it changed how many codebases write null-safe logic.

## TypeScript 4.x Line

Versions in this era include:

- 4.0
- 4.1
- 4.2
- 4.3
- 4.4
- 4.5
- 4.6
- 4.7
- 4.8
- 4.9

Major milestones:

- **4.0**:
  variadic tuple types
- **4.1**:
  template literal types and key remapping in mapped types
- **4.4**:
  deeper control over exactness and index behavior in strict projects
- **4.5**:
  `Awaited<T>` and better async typing ergonomics
- **4.7**:
  stronger Node.js ESM support and module-system alignment
- **4.9**:
  `satisfies`, one of the most practical modern TypeScript features

The 4.x line is where many teams felt the type system become dramatically more expressive.

## TypeScript 5.x Line

Versions in this era include:

- 5.0
- 5.1
- 5.2
- 5.3
- 5.4
- 5.5
- 5.6
- 5.7
- 5.8
- 5.9

Major milestones:

- **5.0**:
  modern decorators support, `const` type parameters, and major cleanup of configuration and module-era expectations
- **5.1**:
  quality-of-life improvements around JSX and typing behavior
- **5.5**:
  stronger inference and easier migration patterns in large projects
- **5.9**:
  support for `import defer`, `--module node20`, and a more opinionated modern `tsc --init`

The 5.x line continued the move toward a more modern JavaScript and Node.js baseline.

## TypeScript 6.0

TypeScript 6.0 was announced on March 23, 2026.

This release matters because it is positioned as a bridge release between the long-running JavaScript-based compiler line and the next-generation TypeScript 7 direction.

Notable themes in 6.0:

- deprecations and breaking changes that prepare projects for the next era
- stricter modern defaults
- alignment with current JavaScript and module-system reality
- ongoing pressure toward better performance and cleaner configuration assumptions

## Which Versions Matter Most For Learners

If learners only remember a few milestones, these are the high-value ones:

- **1.0**:
  TypeScript became a real stable platform
- **2.0**:
  strict null safety and modern strictness thinking
- **2.1**:
  `keyof` and mapped types
- **2.8**:
  conditional types
- **3.7**:
  optional chaining and nullish coalescing support
- **4.1**:
  template literal types
- **4.9**:
  `satisfies`
- **5.0**:
  `const` type parameters and modern decorator-era changes
- **5.9**:
  `import defer` and stronger modern config defaults
- **6.0**:
  bridge release toward the next compiler era

## Teaching Advice

Do not teach this page as a memorization contest.

Use it to explain:

- why older TypeScript examples sometimes look limited
- why modern typing patterns often assume features from 2.8, 3.7, 4.1, 4.9, or 5.0 onward
- why version awareness helps when reading release notes, migration guides, or framework documentation

## Official Release Note References

For official per-version release details, the most useful starting points are:

- the TypeScript release notes on `typescriptlang.org`
- the official TypeScript announcement posts on the TypeScript team blog

## What To Remember

- the current stable TypeScript version is 6.0 as of April 19, 2026
- not every version matters equally, but several versions changed the language significantly
- 2.x, 3.7, 4.1, 4.9, 5.0, 5.9, and 6.0 are especially useful milestones to recognize
