---
title: JavaScript Versions and ECMAScript History
description: Full JavaScript and ECMAScript version timeline from ES1 through ECMAScript 2025, including notable features and naming guidance.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="All levels" duration="18 min" track="JavaScript" prerequisites="None, though the feature names make more sense after the other pages" />

Knowing the ECMAScript timeline is not trivia. It is what tells you whether a syntax will run in the runtime you target, whether a Stack Overflow answer is current, and how to explain to a teammate why a codebase looks the way it does.

<Objectives>
- Distinguish JavaScript (the language) from ECMAScript (the spec)
- Map any modern feature to the edition that shipped it
- Pick a target edition for a new project with a clear justification
- Recognise why ES4 does not exist as a published edition
- Use edition names correctly in code review and interviews
</Objectives>

JavaScript is the language developers write. ECMAScript is the standard that defines the language.

That is why people often say things like:

- JavaScript
- ES6
- ES2015
- ECMAScript 2025

They are closely related, but not identical terms.

<Callout type="info" title="Language, spec, engine, runtime — four different things">
**JavaScript** is the language developers write. **ECMAScript** is the spec that TC39 publishes. **V8** / **SpiderMonkey** / **JavaScriptCore** are the engines that implement the spec. **Node.js** / **Chrome** / **Deno** are the runtimes that bundle an engine with platform APIs. A feature lands in the language only when all four line up.
</Callout>

## Current Latest Standard

As of April 19, 2026, the latest published ECMAScript standard is **ECMAScript 2025**, also called the **16th edition**, published in **June 2025**.

## Full Version Timeline

### ES1

- official name: ECMAScript 1st edition
- published: June 1997
- significance: first standardized version

### ES2

- official name: ECMAScript 2nd edition
- published: August 1998
- significance: editorial alignment with international standards work

### ES3

- official name: ECMAScript 3rd edition
- published: December 1999
- significance: major early language foundation used for many years

### ES4

- official name: reserved but not published
- significance: often discussed historically, but there is no official ECMAScript 4 publication

<Pitfall title="Saying 'ES4' as if it shipped">
ES4 is a common source of confusion in interviews and write-ups. It was an ambitious proposal that was ultimately abandoned — the work that followed became ES5 and then the modern yearly cadence. **Fix:** when someone mentions ES4, clarify that the edition number was reserved but never published.
</Pitfall>

### ES5

- official name: ECMAScript 5th edition
- published: December 2009
- notable additions:
  - strict mode
  - `JSON`
  - `Object.create()`
  - `Object.defineProperty()`
  - array extras like `forEach()`, `map()`, `filter()`, `reduce()`, and `some()`

### ES5.1

- official name: ECMAScript 5.1 edition
- published: June 2011
- significance: maintenance and specification alignment update

### ES2015 / ES6

- official name: ECMAScript 2015, 6th edition
- published: June 2015
- notable additions:
  - `let` and `const`
  - arrow functions
  - classes
  - template literals
  - destructuring
  - rest and spread
  - promises
  - modules
  - `Map`, `Set`, `WeakMap`, `WeakSet`, `Symbol`
  - generators

### ES2016

- official name: ECMAScript 2016, 7th edition
- published: June 2016
- notable additions:
  - exponentiation operator `**`
  - `Array.prototype.includes()`

### ES2017

- official name: ECMAScript 2017, 8th edition
- published: June 2017
- notable additions:
  - `async` or `await`
  - `Object.values()`
  - `Object.entries()`
  - `String.prototype.padStart()` and `padEnd()`

### ES2018

- official name: ECMAScript 2018, 9th edition
- published: June 2018
- notable additions:
  - rest and spread for object literals
  - asynchronous iteration with `for await...of`
  - promise `finally()`
  - regex improvements such as named capture groups

### ES2019

- official name: ECMAScript 2019, 10th edition
- published: June 2019
- notable additions:
  - `Array.prototype.flat()` and `flatMap()`
  - `Object.fromEntries()`
  - optional `catch` binding
  - `trimStart()` and `trimEnd()`

### ES2020

- official name: ECMAScript 2020, 11th edition
- published: June 2020
- notable additions:
  - optional chaining `?.`
  - nullish coalescing `??`
  - `BigInt`
  - dynamic `import()`
  - `Promise.allSettled()`
  - `globalThis`

### ES2021

- official name: ECMAScript 2021, 12th edition
- published: June 2021
- notable additions:
  - logical assignment operators
  - numeric separators
  - `Promise.any()`
  - `String.prototype.replaceAll()`
  - weak reference related additions

### ES2022

- official name: ECMAScript 2022, 13th edition
- published: June 2022
- notable additions:
  - top-level `await`
  - class fields
  - private methods and fields
  - static class initialization blocks
  - `Array.prototype.at()`
  - `Object.hasOwn()`
  - ergonomic brand checks for private fields

### ES2023

- official name: ECMAScript 2023, 14th edition
- published: June 2023
- notable additions:
  - copying array methods:
    `toSorted()`, `toReversed()`, `toSpliced()`, and `with()`
  - `findLast()` and `findLastIndex()`
  - hashbang grammar support

### ES2024

- official name: ECMAScript 2024, 15th edition
- published: June 2024
- notable additions:
  - `Object.groupBy()`
  - `Map.groupBy()`
  - `Promise.withResolvers()`

### ES2025

- official name: ECMAScript 2025, 16th edition
- published: June 2025
- notable additions learners should recognize in modern references:
  - `RegExp.escape()`
  - continued refinement of the modern standard library

## Naming Rules That Help Learners

- `ES6` and `ES2015` refer to the same edition.
- After ES2015, yearly naming became normal.
- In modern teaching, it is usually better to say `ES2020` or `ECMAScript 2020` than vague phrases like “new JavaScript.”

<Compare badLabel="Vague" goodLabel="Precise">
<Fragment slot="bad">
"We should use modern JS syntax here."

Which features? Which baseline? How does the reviewer verify it?
</Fragment>
<Fragment slot="good">
"Our tsconfig `target` is `ES2022`. This PR uses `Object.hasOwn` (ES2022), which is fine. It does not use `toSorted` (ES2023), which would not transpile."

Anyone can check the claim.
</Fragment>
</Compare>

## Which Versions Matter Most In Practice

For working developers, the most important versions to recognize are usually:

- ES5, because older codebases still contain it
- ES2015, because it changed everyday JavaScript dramatically
- ES2017, because `async` or `await` became mainstream
- ES2020 and later, because many modern codebases use optional chaining, nullish coalescing, top-level `await`, and newer helpers

<Pitfall title="Assuming your runtime supports the latest edition">
The spec publishing in June does not mean every runtime implements everything on day one. Node.js often lags a year or two behind for niche features, and older Node LTS lines may never get them. **Fix:** consult your runtime's release notes or [node.green](https://node.green) for actual support, not the TC39 finished-proposals list alone.
</Pitfall>

## Teaching Advice

Do not teach this page as a date-memorization exercise. Use it to explain why the language feels layered:

- older code may look very different
- modern JavaScript is mostly ES2015 and later
- reading edition names helps learners understand documentation, interview questions, and code reviews

## Lab

<Lab title="Target an edition, then prove it" duration="40 min" difficulty="Easy" stack="Node.js and a small repo, or tsconfig.json">

### Goal
Pick an ECMAScript edition as your baseline and verify that your code actually respects it — no accidental future syntax.

### Steps
1. Check the Node.js LTS your project targets. Decide on an ECMAScript baseline that it fully supports (usually ES2022 or ES2023 for a recent LTS).
2. In `tsconfig.json` or your ESLint config, set `target`/`parserOptions.ecmaVersion` to that edition.
3. Deliberately add one feature from a *later* edition (for example, `toSorted` if you set ES2022). Observe the linter or compiler reject it.
4. Replace the illegal feature with a compliant alternative (`[...arr].sort()`) and confirm the build passes.
5. Write a short `RUNTIME_TARGETS.md` note for future contributors stating the edition, the reason, and the features that are off-limits.

### Success criteria
- Your build fails when someone uses a post-baseline feature, without relying on review
- The replacement code produces identical behavior
- The note in `RUNTIME_TARGETS.md` names the edition and the runtime

</Lab>

## Checkpoint

<Checkpoint>
1. In one sentence: what is the difference between JavaScript and ECMAScript?
2. A coworker says they want to use "ES6 syntax". Which concrete features from that edition are they most likely to mean, and what is the modern name for it?
3. Why is there no published ECMAScript 4?
4. `Object.hasOwn`, `toSorted`, `Promise.any` — which editions shipped each?
5. You are starting a new Node 20 service. Which ECMAScript edition would you target in your tsconfig, and why?
</Checkpoint>

## What To Remember

- JavaScript is the language; ECMAScript is the standard
- ES4 does not officially exist as a published edition
- ES2015 was the biggest modern turning point
- the latest published standard is ECMAScript 2025, released in June 2025

## Further reading

- [Modern JavaScript Coverage](/learning/javascript/modern-javascript-coverage/) — the feature checklist this timeline supports
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — where the recent helpers are practiced
- [TC39 finished proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md) — the official list by year
- [node.green](https://node.green) — per-runtime feature support matrix
- [MDN: JavaScript versions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/JavaScript_technologies_overview)
