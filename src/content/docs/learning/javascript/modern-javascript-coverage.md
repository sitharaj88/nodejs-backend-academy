---
title: Modern JavaScript Coverage
description: Coverage map for modern JavaScript topics across the learning path, including ES2015+ concepts, newer standard-library helpers, and what is intentionally out of scope.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="All levels" duration="12 min" track="JavaScript" prerequisites="At least one previous page in this track" />

This page answers a practical question: does this learning path cover modern JavaScript properly? Use it as a checklist — when a concept appears in a real codebase or interview, you should be able to point to where on this track you practiced it.

<Objectives>
- Confirm which ES2015+ features this track teaches
- Find the right page for any "modern JavaScript" concept in seconds
- Separate language features from platform APIs
- Know what this path intentionally does not cover
</Objectives>

The answer is yes for the major language features learners are expected to know in current development work. The path is designed around modern JavaScript, especially ECMAScript 2015 and later, not just older pre-module syntax.

## What Counts As Modern JavaScript Here

For this training site, modern JavaScript means:

- block-scoped declarations with `let` and `const`
- arrow functions, template literals, destructuring, rest, and spread
- classes, private fields, and current object-oriented syntax
- modules, dynamic imports, and top-level `await`
- promises, `async` or `await`, async iteration, and concurrency helpers
- maps, sets, symbols, bigints, iterators, generators, weak collections, proxies, and reflect-based meta-programming
- newer standard-library helpers such as `Object.hasOwn()`, `findLast()`, and `toSorted()`

<Callout type="info" title="Language features, not platform APIs">
This checklist covers ECMAScript — the language. Node-specific APIs (`fs`, `http`, streams) and browser-only APIs (`fetch`, `IndexedDB`, `Worker`) live in the Node.js and browser tracks, not here.
</Callout>

## Coverage Map

### Core language and values

- syntax, expressions, primitives, references, coercion, strings, and numbers:
  [Syntax, Types, and Variables](/learning/javascript/syntax-types-variables/)
- operators, branching, loops, `??`, `?.`, and short-circuit behavior:
  [Operators, Conditions, and Loops](/learning/javascript/operators-conditions-loops/)

### Functions and execution model

- functions, callbacks, scope, closures, and `this`:
  [Functions, Scope, Closures, and This](/learning/javascript/functions-scope-closures-this/)
- promises, `async` or `await`, event loop basics, async iteration, `Promise.race()`, `Promise.any()`, and top-level `await`:
  [Asynchronous JavaScript](/learning/javascript/asynchronous-javascript/)

### Data structures and transformation

- arrays, objects, destructuring, rest, spread, `map()`, `filter()`, and `reduce()`:
  [Arrays, Objects, and Destructuring](/learning/javascript/arrays-objects-destructuring/)
- `Map`, `Set`, `WeakMap`, `WeakSet`, `Object.groupBy()`, `Map.groupBy()`, `Array.prototype.at()`, `findLast()`, `findLastIndex()`, `toSorted()`, `toReversed()`, `toSpliced()`, and `with()`:
  [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/)

### Object model and classes

- prototypes, class syntax, inheritance, private fields, public fields, static methods, and static blocks:
  [Prototypes, Classes, and OOP](/learning/javascript/prototypes-classes-oop/)

### Modules and architecture

- ES modules, CommonJS, dynamic `import()`, `import.meta`, top-level `await`, errors, guard clauses, factory functions, and result-object patterns:
  [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/)

### Advanced runtime concepts

- symbols, bigint, iterables, iterators, generators, proxy, reflect, `Promise.withResolvers()`, `RegExp.escape()`, immutability awareness, and memory awareness:
  [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/)

<Compare badLabel="Calling something 'modern' loosely" goodLabel="Pointing to an edition">
<Fragment slot="bad">
"Use modern JavaScript for this project."

Which subset? 2015? 2023? Does the team's target runtime support it? Nobody knows.
</Fragment>
<Fragment slot="good">
"Target ECMAScript 2022. That gives us top-level `await`, `Object.hasOwn`, and `Array#at`, but not `toSorted` (ES2023)."

A concrete baseline that tooling can enforce.
</Fragment>
</Compare>

## What Is Intentionally Not Treated As "Fully Covered"

This site does not pretend to teach every corner of the JavaScript ecosystem in one path. A few areas are intentionally treated as adjacent or advanced-reference topics rather than core-language mastery:

- browser-only Web APIs
- Node.js platform APIs that are not part of the JavaScript language itself
- experimental proposals that are not yet part of the ECMAScript standard
- specialized domains such as graphics, WebAssembly integration, and engine internals

<Pitfall title="Confusing proposals with standardized features">
Social media often treats Stage 2 proposals (records and tuples, pattern matching, Temporal outside of polyfills) as if they shipped. Build tooling will not transpile them and runtimes will reject them. **Fix:** check the TC39 stage before adopting a syntax. Stage 4 (or already published in a June ECMAScript edition) is the only safe bar for production code.
</Pitfall>

## How To Use This Coverage Page

- Use it as a completeness checklist.
- If you are teaching JavaScript from this site, make sure each topic above appears in lecture, demo, or lab work.
- If learners skip pages, use this page to find the missing concept quickly.

## Lab

<Lab title="Self-audit against the coverage map" duration="30 min" difficulty="Easy" stack="Paper or a notes file">

### Goal
Use this page as a checklist to identify which modern JavaScript concepts you can explain without looking, and which need a return visit.

### Steps
1. Copy the bullet list from each "Coverage Map" subsection into a notes file.
2. For each bullet, rate yourself: "can teach this," "can use this," or "need to revisit."
3. For every "need to revisit" item, open the linked page and re-do its Lab.
4. Write a single paragraph explaining ECMAScript 2020, 2022, and 2023 in your own words and check it against [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/).
5. If your codebase has a `tsconfig.json` or a build target, note which ECMAScript edition it compiles down to.

### Success criteria
- No more than 3 items are left in "need to revisit" after one round
- Your paragraph correctly attributes `??`/`?.` to ES2020, top-level `await` to ES2022, and `toSorted` to ES2023
- You can point at every item on the coverage map and name the page that teaches it

</Lab>

## Checkpoint

<Checkpoint>
1. Which two ECMAScript editions would you call the most important turning points for everyday JavaScript, and why?
2. `fetch` — language feature or platform API? Which track covers it?
3. Where on this path would a learner practice `Object.groupBy` and `Map.groupBy`?
4. A developer asks "can I use records and tuples?" What is the safe way to decide?
5. What is the difference between ES2015 and ES6?
</Checkpoint>

## Bottom Line

This learning path now covers the major modern JavaScript concepts that current learners should know, including both core language features and newer standard-library improvements. For the official version history behind those features, continue to [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/).

## Further reading

- [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/) — the timeline behind each feature
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — where most of the newer helpers get practiced
- [TC39 finished proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md) — the authoritative list of what is actually in the language
- [MDN: JavaScript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
