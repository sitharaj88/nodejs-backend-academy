---
title: Module 01 - JavaScript Foundation for Backend
description: Variables, control flow, functions, objects, modules, async programming, and error handling for backend learners.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="2 weeks" track="Module 01" prerequisites="Basic programming logic" />

This module gives students the language confidence required to write backend code without confusion. The goal is not generic JavaScript familiarity. The goal is backend-ready JavaScript reasoning — the specific language features that show up inside request handlers, data-access code, and async pipelines.

<Objectives>
- Read any small JavaScript function and explain its execution step by step
- Choose between promise, async/await, and callback styles with intent
- Move objects, arrays, and payload shapes around without fighting the language
- Handle errors explicitly instead of hoping for the best
</Objectives>

## What this module covers

- variables, data types, operators, and expressions
- control flow with `if`, `switch`, loops, and early returns
- functions, scope, closures, hoisting, and execution context
- objects, arrays, destructuring, and spread or rest
- classes, prototypes, and object-oriented basics
- ESM and CommonJS concepts
- promises, async or await, and concurrency basics
- error handling and debugging fundamentals

## Teaching sequence

1. Move from values and control flow into function thinking.
2. Show scope problems and closure behavior with small examples.
3. Introduce object and array handling as preparation for backend payload work.
4. Compare synchronous and asynchronous execution with visible console output.
5. Finish with error handling patterns students will reuse in every module.

## Live examples

- a closure-based counter used to explain lexical scope
- parsing and transforming JSON-style objects
- refactoring promise chains into async or await
- `try` and `catch` around async service-like functions

## Labs

- build a simple utility library for array and object transformations
- write async functions that fetch mock data and combine results safely
- create a small module-based app with separate files for logic and entry point

## Exit outcomes

- students can read a JavaScript function and explain its execution clearly
- students stop mixing async patterns carelessly
- students understand how data transformations map to backend request or response code

<Callout type="tip" title="Stay under the framework line">
Resist the temptation to introduce Express here. Every concept in this module shows up again inside Express handlers — closures inside middleware, async inside services, destructuring on `req.body`. If students learn them in isolation first, the framework later feels small. If not, they will think Express is the source of behaviors that are really JavaScript.
</Callout>

## Cross-links

- Deep-study path: [Learning / JavaScript](/learning/javascript/overview/) — concept pages, labs, and checkpoints for every topic above.
- Next module: [Module 02 — Node.js Core Runtime](/modules/module-02-nodejs-core-runtime/).
