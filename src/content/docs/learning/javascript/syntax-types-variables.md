---
title: Syntax, Types, and Variables
description: Learn JavaScript syntax basics, primitive and reference types, declarations, mutation, coercion, and how values behave.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="22 min" track="JavaScript" prerequisites="Any programming experience; no prior JavaScript required" />

Every JavaScript bug you will ever meet starts with a value behaving differently than you expected. This page gives you the mental model to predict value behavior — primitives versus references, coercion, declaration scope, and equality — so you stop guessing and start reasoning.

<Objectives>
- Distinguish primitive and reference types and predict copy-versus-share behavior
- Pick between `const`, `let`, and `var` for a reason, not out of habit
- Explain the difference between `null` and `undefined` in a single sentence
- Predict the result of coercion in `+`, `==`, and boolean contexts
- Read any small JavaScript snippet and name every value's type
</Objectives>

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

<Callout type="info" title="Copy versus share in one rule">
Primitives copy their value. Objects and arrays copy a **reference** to the same underlying data. If two variables point at the same object, changing the object through one variable is visible through the other.
</Callout>

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

<Pitfall title="`typeof null` is `'object'`">
This is a historical quirk from the very first JavaScript implementation that can never be fixed without breaking the web. **Fix:** when you need to check for null specifically, use `value === null`. To check for "any object", use `typeof value === 'object' && value !== null`.
</Pitfall>

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

<Pitfall title="`const` does not freeze objects">
Learners often assume `const` means "cannot change." It only means the binding cannot be reassigned. The object it points to is still mutable. **Fix:** use `Object.freeze(obj)` for shallow immutability, or a library like Immer for deep, ergonomic updates.
</Pitfall>

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

<Compare badLabel="Loose equality hides bugs" goodLabel="Strict equality is explicit">
<Fragment slot="bad">
```js
function isPositive(value) {
  if (value == null) return false // matches null AND undefined
  return value > 0
}

isPositive('') // false — because '' > 0 is false
isPositive('3') // true — coerced to 3, surprising
isPositive([]) // false — [] > 0 is false, also surprising
```
The function accidentally accepts string numbers and empty arrays.
</Fragment>
<Fragment slot="good">
```js
function isPositive(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return false
  return value > 0
}

isPositive('3') // false
isPositive(3) // true
isPositive(NaN) // false
```
Explicit about what a "positive number" means.
</Fragment>
</Compare>

<Callout type="tip" title="When `==` is actually useful">
`value == null` is the one case where loose equality is idiomatic — it matches both `null` and `undefined` in a single check. Every other comparison should use `===` or `!==`.
</Callout>

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

<Pitfall title="Money in floats loses cents">
`0.1 + 0.2 !== 0.3` is not a bug — it is how IEEE-754 floats work. If you multiply a 19.99 price by a 0.9 discount, you will lose a paisa eventually. **Fix:** store money as integer minor units (paise, cents). Convert to human-readable form only at the display edge.
</Pitfall>

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

## Lab

<Lab title="Predict, then verify" duration="30 min" difficulty="Easy" stack="Browser console or Node.js REPL">

### Goal
Build a gut feel for JavaScript values by predicting the output of small snippets before running them.

### Steps
1. Open a REPL (Node.js or your browser's DevTools console).
2. For each of these, write down your prediction first, then run it:
   - `typeof null`
   - `[] + []`
   - `[] + {}`
   - `0 == '0'`, `0 === '0'`, `'' == 0`
   - `const a = { n: 1 }; const b = a; b.n = 2; a.n`
   - `Boolean('false')`
3. For each miss, write a one-line explanation of what you got wrong.
4. Build a small `typeOf(value)` helper that correctly reports `'null'`, `'array'`, `'object'`, and any primitive name.

### Success criteria
- You predict at least 5 of the 6 snippets correctly on the second attempt.
- Your `typeOf` helper distinguishes `null`, arrays, and plain objects.
- You can explain, in one sentence each, why `0 == '0'` is true and why `typeof null` is `'object'`.

</Lab>

## Checkpoint

<Checkpoint>
1. You have `const a = [1, 2, 3]` and later write `a.push(4)`. Does this throw? Why or why not?
2. Why does `typeof null` return `'object'`, and what should you write instead to check for null?
3. In one sentence each, distinguish `null` from `undefined` as you would use them in your own code.
4. Predict the output: `console.log('5' + 2, '5' - 2, 5 + true)`. Explain each.
5. When is `==` the right choice over `===`, and why is it the only case where that is true?
</Checkpoint>

## What To Remember

- primitives and objects behave differently
- `const` does not freeze objects
- `null` and `undefined` are not interchangeable
- coercion can be useful or dangerous depending on clarity
- strict equality is usually the safest default

## Further reading

- [Operators, Conditions, and Loops](/learning/javascript/operators-conditions-loops/) — the rules this page sets up in action
- [Arrays, Objects, and Destructuring](/learning/javascript/arrays-objects-destructuring/) — what to do now that you understand references
- [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/) — when each feature shipped
- [MDN: Equality comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
