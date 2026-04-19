---
title: Syntax, Types, and Variables
description: Learn JavaScript syntax basics, primitive and reference types, declarations, mutation, coercion, and how values behave.
---

This page covers the concepts that every JavaScript learner must understand before writing larger programs.

## JavaScript Syntax Basics

JavaScript programs are built from:

- statements
- expressions
- values
- identifiers
- blocks
- comments

```js
const course = 'JavaScript'
const lessons = 12
const published = true
```

Each line above is a statement that declares a variable and assigns a value.

## Expressions Versus Statements

An expression produces a value.

```js
2 + 3
'Hello ' + 'world'
isActive && isVerified
```

A statement performs an action.

```js
const result = 2 + 3
if (result > 4) {
  console.log('large enough')
}
```

### Why this matters

Understanding the difference helps students read code more confidently and reason about return values.

## Primitive Types

JavaScript primitive types are:

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `bigint`
- `symbol`

```js
const title = 'Backend Academy'
const price = 199
const isActive = true
const missingData = null
let currentTopic
const maxId = 9007199254740995n
const token = Symbol('auth')
```

## Reference Types

Objects are reference values. Common examples:

- object literals
- arrays
- functions
- maps
- sets
- dates

```js
const student = { name: 'Ravi', level: 'beginner' }
const topics = ['variables', 'functions', 'objects']
```

### Important concept

Primitive values are copied independently. Objects and arrays are shared by reference unless copied intentionally.

```js
const original = { module: 'JavaScript' }
const alias = original
alias.module = 'TypeScript'

console.log(original.module) // TypeScript
```

## `typeof`

Use `typeof` to inspect values, but teach its limitations:

```js
typeof 'hello' // string
typeof 10 // number
typeof true // boolean
typeof undefined // undefined
typeof {} // object
typeof [] // object
typeof null // object
```

### Important warning

`typeof null` returns `"object"` because of historical behavior in JavaScript. Students should know this early.

## Variable Declarations

Modern JavaScript mainly uses:

- `const`
- `let`

Avoid `var` in new code unless you are teaching legacy behavior.

```js
const platform = 'web'
let enrolledStudents = 40
enrolledStudents += 5
```

### Best practice

- use `const` by default
- use `let` when reassignment is required
- avoid `var` because of confusing function scope and hoisting behavior

## `var`, `let`, and `const`

### `var`

- function-scoped
- hoisted differently
- can lead to bugs in loops and blocks

### `let`

- block-scoped
- reassignable

### `const`

- block-scoped
- not reassignable
- does not make nested objects immutable

```js
const config = { env: 'dev' }
config.env = 'prod' // allowed
```

Teach students that `const` protects the variable binding, not the internal contents of an object.

## `undefined` and `null`

These two values are often confused.

### `undefined`

Means a value is missing or not assigned yet.

### `null`

Usually means “empty on purpose.”

```js
let currentLesson
const selectedStudent = null
```

### Good teaching rule

- `undefined`: not set yet
- `null`: intentionally empty

## Type Conversion

JavaScript converts values in many situations. This is called coercion.

```js
Number('42') // 42
String(100) // "100"
Boolean('hello') // true
Boolean('') // false
```

### Dangerous examples

```js
'5' + 2 // "52"
'5' - 2 // 3
Boolean(0) // false
Boolean('0') // true
```

### Teaching point

Students should not fear coercion, but they must see where it causes confusion.

## Truthy and Falsy

Falsy values are:

- `false`
- `0`
- `''`
- `null`
- `undefined`
- `NaN`

Everything else is truthy.

```js
if ('0') {
  console.log('This runs')
}
```

This matters in validation and conditional logic.

## Equality

Teach the difference between:

- loose equality `==`
- strict equality `===`

```js
5 == '5' // true
5 === '5' // false
```

### Best practice

Prefer `===` and `!==` in most code. Then explain `==` only so students can read older code safely.

## Strings

Students should know:

- quotes
- template literals
- interpolation
- multiline strings
- useful string methods

```js
const learner = 'Asha'
const message = `Welcome, ${learner}`
```

Useful methods:

- `trim()`
- `toLowerCase()`
- `toUpperCase()`
- `includes()`
- `slice()`
- `replace()`
- `split()`

## Numbers

Students should understand:

- integers and decimals
- floating-point issues
- `NaN`
- `Infinity`
- number parsing

```js
0.1 + 0.2 // 0.30000000000000004
Number('199.99') // 199.99
parseInt('42px', 10) // 42
```

### Unique example

If you are building an invoice calculator, using floating-point numbers carelessly can produce wrong totals. This is why monetary systems often store minor units like paise or cents as integers.

## Comments and Readability

Teach both comment forms:

```js
// single line

/*
  multi line
*/
```

But also teach restraint. Most code should be made clear through naming and structure first.

## Practice Ideas

- declare variables for a fake training platform
- convert string inputs into typed values
- identify truthy and falsy behavior in small snippets
- compare primitive copying versus object reference behavior

## What To Remember

- primitives and objects behave differently
- `const` does not freeze objects
- `null` and `undefined` are not interchangeable
- coercion can be useful or dangerous depending on clarity
- strict equality is usually the safest default
