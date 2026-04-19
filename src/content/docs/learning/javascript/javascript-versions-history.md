---
title: JavaScript Versions and ECMAScript History
description: Full JavaScript and ECMAScript version timeline from ES1 through ECMAScript 2025, including notable features and naming guidance.
---

JavaScript is the language developers write. ECMAScript is the standard that defines the language.

That is why people often say things like:

- JavaScript
- ES6
- ES2015
- ECMAScript 2025

They are closely related, but not identical terms.

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

## Which Versions Matter Most In Practice

For working developers, the most important versions to recognize are usually:

- ES5, because older codebases still contain it
- ES2015, because it changed everyday JavaScript dramatically
- ES2017, because `async` or `await` became mainstream
- ES2020 and later, because many modern codebases use optional chaining, nullish coalescing, top-level `await`, and newer helpers

## Teaching Advice

Do not teach this page as a date-memorization exercise. Use it to explain why the language feels layered:

- older code may look very different
- modern JavaScript is mostly ES2015 and later
- reading edition names helps learners understand documentation, interview questions, and code reviews

## What To Remember

- JavaScript is the language; ECMAScript is the standard
- ES4 does not officially exist as a published edition
- ES2015 was the biggest modern turning point
- the latest published standard is ECMAScript 2025, released in June 2025
