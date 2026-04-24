---
title: Phase 1 - Foundation and Runtime Mastery
description: Phase 1 roadmap covering JavaScript, Node.js runtime internals, npm, tooling, and project setup.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'
import TopicGrid from '../../../components/TopicGrid.astro'
import Stats from '../../../components/Stats.astro'

<LessonMeta level="Beginner" duration="6 weeks" track="Phase roadmap" prerequisites="Basic programming awareness" />

This phase creates the baseline for everything that follows. Students should leave this stage able to reason about asynchronous JavaScript, understand what the Node.js runtime is doing, and create clean backend project foundations without depending on framework magic.

<Stats items={[
  { value: '6', label: 'Weeks' },
  { value: '3', label: 'Modules' },
  { value: '1', label: 'Project scaffold' },
]} />

<Objectives>
- Explain how async JavaScript behaves using promises, async or await, and task ordering
- Use built-in Node.js modules such as `fs`, `path`, `http`, and `events`
- Reason about streams, buffers, environment variables, and process-level control
- Scaffold a scalable project structure with scripts, linting, formatting, and Git discipline
</Objectives>

## Modules in this phase

<TopicGrid topics={[
  { eyebrow: 'Module 01', title: 'JavaScript Foundation', description: 'Backend-ready reasoning about scope, async, modules, and errors.', href: '/modules/module-01-javascript-foundation/' },
  { eyebrow: 'Module 02', title: 'Node.js Core Runtime', description: 'Event loop, built-in modules, streams, buffers, and process control.', href: '/modules/module-02-nodejs-core-runtime/' },
  { eyebrow: 'Module 03', title: 'NPM, Tooling & Project Setup', description: 'Dependencies, scripts, linting, formatting, and repo structure.', href: '/modules/module-03-npm-tooling-project-setup/' },
]} />

## Weekly plan

| Week | Focus |
| --- | --- |
| 1 | JavaScript control flow, functions, scope, closures, and objects |
| 2 | async or await, promises, modules, classes, and error handling |
| 3 | V8, event loop, call stack, task queues, and non-blocking I/O |
| 4 | Core modules, streams, buffers, CLI utilities, and runtime tooling |
| 5 | npm, versioning, scripts, dependency strategy, and environments |
| 6 | Project structure, linting, formatting, hot reload, and Git conventions |

## Live examples to teach

- A promise chain refactored into async or await
- A file-processing script using `fs/promises`
- A stream-based large file reader
- An HTTP server without Express
- A CLI command that reads project config and environment variables

## Lab work

- Build a command-line utility that reads a JSON file and prints structured output
- Create a module-based Node.js mini project using both ESM concepts and package scripts
- Implement a script that logs execution timing and handles process exit correctly

## Assessment gate

Before moving to Phase 2, students should be able to:

- read and explain a small Node.js script without guidance
- set up a project with scripts, formatting, and linting
- identify blocking versus non-blocking operations
- debug errors using runtime output instead of guessing

<Callout type="tip" title="Teach the runtime before the framework">
If a student cannot explain what the event loop does without Express in the picture, they will misdiagnose every performance issue later. Keep Phase 1 framework-free on purpose. The payoff shows up in Phase 3.
</Callout>

<Callout type="success" title="Next step">
Proceed to [Phase 2: APIs, Data, and Security](/roadmap/phase-2-api-engineering-data/).
</Callout>
