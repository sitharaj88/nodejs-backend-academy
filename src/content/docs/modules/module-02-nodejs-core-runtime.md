---
title: Module 02 - Node.js Core Runtime
description: Event loop, built-in modules, streams, buffers, process management, and runtime tooling in Node.js.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="2 weeks" track="Module 02" prerequisites="Module 01 — JavaScript Foundation" />

This module explains what Node.js actually is. Students should leave understanding the runtime well enough to reason about performance, file handling, environment behavior, and non-blocking I/O without a framework in the picture.

<Objectives>
- Describe how V8, libuv, and the event loop cooperate to run Node.js code
- Use core modules (`fs`, `path`, `http`, `events`, `process`) with confidence
- Choose streams over naive reads when data size or latency matters
- Build a small CLI tool that reads config and prints runtime information
</Objectives>

## What this module covers

- what Node.js is and how V8 fits into the runtime
- event loop, call stack, task queues, and non-blocking behavior
- built-in modules such as `fs`, `path`, `os`, `http`, and `events`
- streams and buffers for efficient file or network processing
- timers, `process`, exit codes, and environment variables
- REPL usage, `npx`, and runtime-oriented workflows
- building small CLI utilities

## Teaching sequence

1. Explain runtime architecture visually before writing code.
2. Use timer-based examples to show task ordering.
3. Move into core module usage with file and path operations.
4. Demonstrate large-file reading with streams to contrast with naive approaches.
5. End with a CLI tool that reads config and prints runtime information.

## Live examples

- a task queue timing demo with `setTimeout`, promises, and console order
- file reading with `fs/promises`
- a raw `http` server without Express
- a stream pipeline for large text processing

## Labs

- build a CLI that analyzes a directory and prints file stats
- create a small HTTP server that returns JSON and text responses
- compare full-file reads versus streaming behavior

## Exit outcomes

- students can explain why Node.js is suited to API workloads
- students understand when event-loop blocking hurts backend performance
- students can work comfortably with built-in modules before adding frameworks

<Callout type="tip" title="Diagram the runtime, then code it">
Before writing any code, draw the call stack, task queue, and microtask queue on a whiteboard and run through a `setTimeout` + `Promise.then` trace by hand. Students who see the ordering drawn first stop being confused by async behavior for the rest of the program.
</Callout>

## Cross-links

- Deep-study path: [Learning / Node.js](/learning/nodejs/overview/) — runtime internals, streams, filesystem, and HTTP server content.
- Next module: [Module 03 — NPM, Tooling & Project Setup](/modules/module-03-npm-tooling-project-setup/).
