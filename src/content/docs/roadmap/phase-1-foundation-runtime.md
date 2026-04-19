---
title: Phase 1 - Foundation and Runtime Mastery
description: Phase 1 roadmap covering JavaScript, Node.js runtime internals, npm, tooling, and project setup.
---

**Duration:** Weeks 1-6

This phase creates the baseline for everything that follows. Students should leave this stage able to reason about asynchronous JavaScript, understand what the Node.js runtime is doing, and create clean backend project foundations without depending on framework magic.

## Modules In This Phase

- [Module 01: JavaScript Foundation](/modules/module-01-javascript-foundation/)
- [Module 02: Node.js Core Runtime](/modules/module-02-nodejs-core-runtime/)
- [Module 03: NPM, Tooling & Project Setup](/modules/module-03-npm-tooling-project-setup/)

## Phase Outcomes

- Explain how async JavaScript behaves using promises, async or await, and task ordering
- Use built-in Node.js modules such as `fs`, `path`, `http`, and `events`
- Understand streams, buffers, environment variables, and process-level control
- Scaffold scalable project structure with scripts, linting, formatting, and workflow discipline

## Weekly Plan

| Week | Focus |
| --- | --- |
| 1 | JavaScript control flow, functions, scope, closures, and objects |
| 2 | async or await, promises, modules, classes, and error handling |
| 3 | V8, event loop, call stack, task queues, and non-blocking I/O |
| 4 | Core modules, streams, buffers, CLI utilities, and runtime tooling |
| 5 | npm, versioning, scripts, dependency strategy, and environments |
| 6 | Project structure, linting, formatting, hot reload, and Git conventions |

## Live Examples To Teach

- A promise chain refactored into async or await
- A file-processing script using `fs/promises`
- A stream-based large file reader
- An HTTP server without Express
- A CLI command that reads project config and environment variables

## Lab Work

- Build a command-line utility that reads a JSON file and prints structured output
- Create a module-based Node.js mini project using both ESM concepts and package scripts
- Implement a script that logs execution timing and handles process exit correctly

## Assessment Gate

Before moving to Phase 2, students should be able to:

- read and explain a small Node.js script without guidance
- set up a project with scripts, formatting, and linting
- identify blocking versus non-blocking operations
- debug errors using runtime output instead of guessing

Proceed to [Phase 2: APIs, Data, and Security](/roadmap/phase-2-api-engineering-data/).
