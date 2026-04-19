---
title: Functions, Scope, Closures, and This
description: Learn how JavaScript functions work, how scope is resolved, what closures capture, and how the this keyword behaves.
---

Functions are one of the most important parts of JavaScript. They shape logic, abstraction, reuse, and behavior.

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

## What To Remember

- functions are values in JavaScript
- scope depends on where code is written
- closures keep access to outer variables
- `this` depends on call style, not only on function location
