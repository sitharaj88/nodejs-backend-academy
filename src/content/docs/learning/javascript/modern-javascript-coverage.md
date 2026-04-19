---
title: Modern JavaScript Coverage
description: Coverage map for modern JavaScript topics across the learning path, including ES2015+ concepts, newer standard-library helpers, and what is intentionally out of scope.
---

This page answers a practical question: does this learning path cover modern JavaScript properly?

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

## What Is Intentionally Not Treated As “Fully Covered”

This site does not pretend to teach every corner of the JavaScript ecosystem in one path. A few areas are intentionally treated as adjacent or advanced-reference topics rather than core-language mastery:

- browser-only Web APIs
- Node.js platform APIs that are not part of the JavaScript language itself
- experimental proposals that are not yet part of the ECMAScript standard
- specialized domains such as graphics, WebAssembly integration, and engine internals

## How To Use This Coverage Page

- Use it as a completeness checklist.
- If you are teaching JavaScript from this site, make sure each topic above appears in lecture, demo, or lab work.
- If learners skip pages, use this page to find the missing concept quickly.

## Bottom Line

This learning path now covers the major modern JavaScript concepts that current learners should know, including both core language features and newer standard-library improvements. For the official version history behind those features, continue to [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/).
