---
title: Functions, Scope, Closures, and This
description: Learn how JavaScript functions work, how scope is resolved, what closures capture, and how the this keyword behaves.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="30 min" track="JavaScript" prerequisites="Syntax, Types, and Variables; Operators, Conditions, and Loops" />

Functions are the unit of composition in JavaScript. Get scope and closures right and classes feel easy. Get `this` right and half the "JavaScript is weird" complaints disappear. This page builds that foundation with small, reusable examples.

<Objectives>
- Declare functions in all three forms and explain when each fits
- Trace variable lookup through lexical scope without guessing
- Use closures on purpose to build counters, factories, and memoizers
- Predict what `this` refers to given the call site, not the definition site
- Refactor nested logic into small pure functions
</Objectives>

## Function Declarations and Expressions

### Function declaration

```js
function greet(name) {
  return `Hello, ${name}`
}
```

### Function expression

```js
const greet = function (name) {
  return `Hello, ${name}`
}
```

### Arrow function

```js
const greet = (name) => `Hello, ${name}`
```

Each form is useful, but students should understand the behavioral differences instead of treating them as cosmetic.

<Callout type="info" title="Three forms, three behaviors">
Function declarations are fully hoisted — you can call them before the definition line. Function expressions and arrow functions are only hoisted as variables, so calling them early throws a `ReferenceError`. Only arrow functions refuse to bind their own `this`.
</Callout>

## Parameters and Arguments

Parameters are names in the function definition. Arguments are actual values passed into the function.

```js
function enroll(studentName, trackName) {
  return `${studentName} enrolled in ${trackName}`
}

enroll('Kiran', 'Backend')
```

## Default Parameters

```js
function createLesson(title, duration = 30) {
  return { title, duration }
}
```

Default parameters are cleaner than manually checking for `undefined` inside the function.

## Return Values

Functions can:

- return a value
- return nothing
- return early

```js
function findLevel(score) {
  if (score >= 80) return 'advanced'
  if (score >= 50) return 'intermediate'
  return 'beginner'
}
```

## Pure and Impure Functions

### Pure function

- same input gives same output
- no side effects

### Impure function

- depends on outside state or changes outside state

```js
function add(a, b) {
  return a + b
}
```

Pure functions are easier to test and reason about.

## Scope

JavaScript uses lexical scope. That means variable lookup depends on where code is written.

```js
const appName = 'Academy'

function run() {
  const moduleName = 'JavaScript'
  console.log(appName, moduleName)
}
```

### Scope levels

- global scope
- function scope
- block scope

## Lexical Scope Example

```js
const topic = 'outer'

function first() {
  const topic = 'inner'

  function second() {
    console.log(topic)
  }

  second()
}
```

`second()` logs `"inner"` because it sees the closest matching variable in its lexical environment.

## Closures

A closure happens when a function retains access to variables from its outer scope.

```js
function createSequence(prefix) {
  let current = 0

  return function next() {
    current += 1
    return `${prefix}-${current}`
  }
}

const nextInvoice = createSequence('INV')
console.log(nextInvoice()) // INV-1
console.log(nextInvoice()) // INV-2
```

### Why closures matter

Closures appear in:

- configuration factories
- middleware creators
- caching helpers
- stateful utilities

<Compare badLabel="Global mutable state" goodLabel="Closed-over state">
<Fragment slot="bad">
```js
let counter = 0
function nextId() {
  counter += 1
  return counter
}
// Anyone can reset `counter` from anywhere.
```
</Fragment>
<Fragment slot="good">
```js
function createIdGenerator() {
  let counter = 0
  return () => {
    counter += 1
    return counter
  }
}
const nextId = createIdGenerator()
// `counter` is only reachable through the returned function.
```
Private by construction; testable without resetting globals.
</Fragment>
</Compare>

## Higher-Order Functions

A higher-order function:

- takes another function as input
- or returns a function

```js
function repeat(action, times) {
  for (let i = 0; i < times; i += 1) {
    action(i)
  }
}
```

This concept prepares students for callbacks, array methods, and composition patterns.

## Callback Functions

A callback is a function passed into another function.

```js
function processStudent(student, formatter) {
  return formatter(student)
}
```

Callbacks are foundational for event-driven and asynchronous programming.

## Hoisting

Function declarations are hoisted differently from variables.

```js
sayHi()

function sayHi() {
  console.log('hi')
}
```

By contrast, function expressions assigned to `const` do not work before initialization.

<Pitfall title="Calling a `const` function before it is defined">
```js
greet() // ReferenceError: Cannot access 'greet' before initialization
const greet = () => 'hi'
```
The `const` binding is hoisted into the temporal dead zone, but the value is only assigned at the definition line. **Fix:** define before use, or switch to a `function` declaration when top-down ordering is awkward.
</Pitfall>

## `this`

`this` refers to context, but that context depends on how the function is called.

```js
const trainer = {
  name: 'Sitharaj',
  introduce() {
    return `I am ${this.name}`
  },
}
```

### Common rule

In object methods, `this` usually refers to the object on the left side of the call.

## Arrow Functions and `this`

Arrow functions do not create their own `this`.

```js
const trainer = {
  name: 'Sitharaj',
  normal() {
    return this.name
  },
  arrow: () => this.name,
}
```

The arrow example is often surprising because it does not behave like an object method.

<Pitfall title="Lost `this` when you pass a method around">
```js
const user = { name: 'Anu', show() { console.log(this.name) } }
setTimeout(user.show, 100) // logs undefined
```
The function reference is extracted, so the call site no longer has `user` on the left. **Fix:** bind explicitly — `setTimeout(user.show.bind(user), 100)` — or wrap in an arrow: `setTimeout(() => user.show(), 100)`.
</Pitfall>

## Method Versus Standalone Function

```js
const user = {
  name: 'Anu',
  show() {
    console.log(this.name)
  },
}

const detached = user.show
detached() // this is no longer the same object context
```

### Teaching point

How you call a function matters just as much as how you define it.

## Rest Parameters

Functions can collect multiple arguments with rest parameters.

```js
function total(...values) {
  return values.reduce((sum, value) => sum + value, 0)
}
```

## Recursive Functions

Recursion is when a function calls itself.

```js
function countDown(value) {
  if (value <= 0) return
  console.log(value)
  countDown(value - 1)
}
```

This is useful for learning function flow, though students should also know iterative alternatives.

## Practical Patterns

### Factory function

```js
function createUser(name, role) {
  return {
    name,
    role,
    isAdmin() {
      return role === 'admin'
    },
  }
}
```

### Function composition idea

Break large logic into smaller functions instead of one giant function body.

## Common Mistakes

- confusing where a variable is available
- misunderstanding what closures retain
- expecting arrow functions to behave like methods with `this`
- relying on hoisting instead of clear structure

## Practice Ideas

- write a sequence generator with closures
- build a factory function for student profiles
- compare normal methods and arrow methods
- refactor nested logic into small pure functions

## Lab

<Lab title="Closures in practice" duration="40 min" difficulty="Medium" stack="Node.js REPL or any scratch file">

### Goal
Use closures deliberately to build three small utilities, and confirm you can reason about what each closure captures.

### Steps
1. Build `once(fn)` — a wrapper that calls `fn` the first time and returns the cached result forever after. Test with a function that logs a side effect.
2. Build `memoize(fn)` for pure, single-argument functions. Test on a slow Fibonacci implementation; measure the speedup.
3. Build `rateLimited(fn, intervalMs)` — returns a wrapper that ignores calls within `intervalMs` of the last successful call.
4. For each utility, list the variables the returned function closes over and whether any of them could leak memory over time.
5. Write one bug where `this` is lost inside one of your wrappers, then fix it with either a `function` expression or explicit arguments.

### Success criteria
- `once(fn)` produces identical results on the 1st and 100th call
- `memoize` turns your slow Fibonacci from seconds into milliseconds on repeat calls
- `rateLimited` drops calls inside the interval without error
- You can explain which variable each closure captures and why

</Lab>

## Checkpoint

<Checkpoint>
1. Predict: `console.log(a); const a = 1`. Why does it throw instead of printing `undefined`?
2. What does a closure actually capture — the value at creation time, or the variable binding?
3. You write `const fn = user.show` and call `fn()`. Inside, `this.name` is `undefined`. Explain why and list two fixes.
4. In `createSequence` above, two calls produce `'INV-1'` and `'INV-2'`. Where does `current` live between those calls?
5. Why do arrow functions not have their own `this`, and when is that exactly the behavior you want?
</Checkpoint>

## What To Remember

- functions are values in JavaScript
- scope depends on where code is written
- closures keep access to outer variables
- `this` depends on call style, not only on function location

## Further reading

- [Prototypes, Classes, and OOP](/learning/javascript/prototypes-classes-oop/) — where `this` rules become class rules
- [Asynchronous JavaScript](/learning/javascript/asynchronous-javascript/) — callbacks and closures across async boundaries
- [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/) — factory functions as module design
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
