---
title: Module 02 - Node.js Core Runtime
description: Event loop, built-in modules, streams, buffers, process management, and runtime tooling in Node.js.
---

**Duration:** 2 weeks

This module explains what Node.js actually is. Students should leave understanding the runtime well enough to reason about performance, file handling, environment behavior, and non-blocking I or O.

## What Learners Cover

- what Node.js is and how V8 fits into the runtime
- event loop, call stack, task queues, and non-blocking behavior
- built-in modules such as `fs`, `path`, `os`, `http`, and `events`
- streams and buffers for efficient file or network processing
- timers, `process`, exit codes, and environment variables
- REPL usage, `npx`, and runtime-oriented workflows
- building small CLI utilities

## Suggested Teaching Sequence

1. Explain runtime architecture visually before writing code.
2. Use timer-based examples to show task ordering.
3. Move into core module usage with file and path operations.
4. Demonstrate large-file reading with streams to contrast with naive approaches.
5. End with a CLI tool that reads config and prints runtime information.

## Live Examples

- a task queue timing demo with `setTimeout`, promises, and console order
- file reading with `fs/promises`
- a raw `http` server without Express
- a stream pipeline for large text processing

## Practical Labs

- build a CLI that analyzes a directory and prints file stats
- create a small HTTP server that returns JSON and text responses
- compare full-file reads versus streaming behavior

## Exit Outcomes

- students can explain why Node.js is suited to API workloads
- students understand when event-loop blocking hurts backend performance
- students can work comfortably with built-in modules before adding frameworks
