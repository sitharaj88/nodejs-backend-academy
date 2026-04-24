---
title: Operators, Conditions, and Loops
description: Learn arithmetic, comparison, logical operators, branching, loops, iteration patterns, and readable control flow in JavaScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="20 min" track="JavaScript" prerequisites="Syntax, Types, and Variables" />

Control flow is how JavaScript decides what to do, when to do it, and how many times to repeat it. The goal of this page is not to memorize every operator — it is to write conditions that read like decisions and loops that make the right trade-offs.

<Objectives>
- Pick between `||`, `??`, and `?.` based on what "missing" actually means in each case
- Choose the right loop form (`for`, `for...of`, `for...in`, `while`) for a given iteration
- Refactor nested `if` blocks into early returns without losing meaning
- Predict what truthy/falsy short-circuiting evaluates to, not just whether it runs
- Recognize when a loop should actually be `map`, `filter`, or `find`
</Objectives>

## Arithmetic Operators

Arithmetic operators work with numbers:

- `+`
- `-`
- `*`
- `/`
- `%`
- `**`

```js
const totalLessons = 10 + 5
const remaining = 12 - 4
const doubled = 6 * 2
const average = 90 / 3
const remainder = 10 % 3
const power = 2 ** 4
```

### Unique example

Use `%` to alternate styles in a list:

```js
for (let i = 0; i < 6; i += 1) {
  const lane = i % 2 === 0 ? 'left' : 'right'
  console.log(`Card ${i} goes to ${lane}`)
}
```

## Comparison Operators

These compare values:

- `>`
- `<`
- `>=`
- `<=`
- `===`
- `!==`

```js
const canJoin = age >= 18
const sameCourse = selectedTrack === 'backend'
```

## Logical Operators

JavaScript uses:

- `&&` for AND
- `||` for OR
- `!` for NOT

```js
const canAccess = isLoggedIn && hasPaid
const name = nickname || 'Guest'
const hidden = !isVisible
```

### Important point

These operators return values, not just booleans.

```js
'hello' && 42 // 42
'' || 'fallback' // "fallback"
```

<Callout type="info" title="`&&` and `||` return values, not booleans">
`a && b` returns `a` if `a` is falsy, otherwise `b`. `a || b` returns `a` if `a` is truthy, otherwise `b`. This is why `cachedValue || fetchFreshValue()` works as a fallback — it is not a hidden if-statement, it is value passing.
</Callout>

## Nullish Coalescing

`??` only falls back when the left side is `null` or `undefined`.

```js
const seats = userSelectedSeats ?? 1
```

This is better than `||` when `0` or `''` should remain valid.

<Pitfall title="`||` eats valid zeros and empty strings">
`const qty = input || 1` silently replaces `0` with `1` — the user typed zero on purpose and you are ignoring them. Same for an empty string that the user cleared intentionally. **Fix:** use `??` when only `null` and `undefined` should trigger the fallback. Reserve `||` for genuine "any falsy" fallbacks.
</Pitfall>

## Optional Chaining

Optional chaining lets you safely access nested properties.

```js
const city = student.address?.city
```

It avoids crashes when intermediate properties are missing.

<Compare badLabel="Defensive ladder" goodLabel="Optional chaining">
<Fragment slot="bad">
```js
const city =
  student &&
  student.address &&
  student.address.city
    ? student.address.city
    : 'Unknown'
```
Hard to read; easy to miss a link.
</Fragment>
<Fragment slot="good">
```js
const city = student?.address?.city ?? 'Unknown'
```
Reads like prose: if any link is missing, fall back.
</Fragment>
</Compare>

## `if`, `else if`, and `else`

This is the basic decision structure in JavaScript.

```js
if (score >= 90) {
  console.log('excellent')
} else if (score >= 60) {
  console.log('pass')
} else {
  console.log('needs improvement')
}
```

### Teaching point

Students should write conditions that read like decisions, not puzzles.

## Ternary Operator

Use it for simple branching expressions.

```js
const label = isPremium ? 'Premium Member' : 'Standard Member'
```

### Best practice

Do not use nested ternaries until students are already strong readers of code.

## `switch`

`switch` can be useful when many branches depend on one value.

```js
switch (role) {
  case 'admin':
    console.log('full access')
    break
  case 'trainer':
    console.log('course management')
    break
  default:
    console.log('limited access')
}
```

<Pitfall title="Forgetting `break` causes fall-through">
Without `break`, a matching `case` continues into the next one and runs its code too. This sometimes looks correct in tests and fails in production. **Fix:** either add `break` to every case explicitly, or convert to a lookup object: `const message = { admin: 'full access', trainer: 'course management' }[role] ?? 'limited access'`.
</Pitfall>

## Loops

JavaScript supports multiple looping patterns.

### `for`

Best when you need an index.

```js
for (let i = 0; i < 3; i += 1) {
  console.log(i)
}
```

### `while`

Best when repetition depends on a condition.

```js
let attempts = 0

while (attempts < 3) {
  console.log(`Attempt ${attempts + 1}`)
  attempts += 1
}
```

### `for...of`

Best for iterating over iterable values such as arrays.

```js
for (const topic of ['js', 'ts', 'node']) {
  console.log(topic)
}
```

### `for...in`

Iterates over object keys, but must be taught carefully.

```js
const student = { name: 'Anu', track: 'backend' }

for (const key in student) {
  console.log(key, student[key])
}
```

<Pitfall title="`for...in` walks the prototype chain and orders numerically">
`for...in` includes inherited enumerable properties and reorders integer-like keys. On arrays it is almost always wrong. **Fix:** use `for...of` for values, `Object.keys(obj)` or `Object.entries(obj)` for own keys, and never use `for...in` on arrays.
</Pitfall>

### Teaching point

Prefer `Object.keys()`, `Object.values()`, or `Object.entries()` for many object iteration tasks because they are often clearer.

## `break` and `continue`

### `break`

Stops the loop immediately.

### `continue`

Skips the current iteration.

```js
for (const lesson of lessons) {
  if (!lesson.isPublished) continue
  console.log(lesson.title)
}
```

## Early Return

Early return often improves readability.

```js
function getDiscount(user) {
  if (!user) return 0
  if (!user.isPaid) return 0
  if (user.role === 'admin') return 100
  return 10
}
```

This is often cleaner than deeply nested `if` blocks.

<Compare badLabel="Nested pyramid" goodLabel="Early return">
<Fragment slot="bad">
```js
function getDiscount(user) {
  if (user) {
    if (user.isPaid) {
      if (user.role === 'admin') {
        return 100
      } else {
        return 10
      }
    } else {
      return 0
    }
  } else {
    return 0
  }
}
```
Four levels of nesting to express four rules.
</Fragment>
<Fragment slot="good">
```js
function getDiscount(user) {
  if (!user) return 0
  if (!user.isPaid) return 0
  if (user.role === 'admin') return 100
  return 10
}
```
Each rule is one line; the happy path is at the bottom.
</Fragment>
</Compare>

## Short-Circuit Logic

JavaScript stops evaluating once the result is known.

```js
isLoggedIn && showDashboard()
cachedValue || fetchFreshValue()
```

Teach students what this does, but also warn them not to hide too much logic inside shortcuts if readability suffers.

<Callout type="warn" title="Short-circuit is an expression, not a statement">
`a && doThing()` evaluates `doThing()` for its side effect but also returns a value. In JSX and template expressions this can render `0` or `false` unintentionally. Prefer an explicit `if` when the action is the point, and `a ? b : c` when the value is the point.
</Callout>

## Common Mistakes

- using `||` when `??` is the right choice
- nesting too many `if` blocks
- using loops when `map()` or `filter()` would express the idea better
- writing conditions that mix too many responsibilities

## Practice Ideas

- build a grading function
- write a loop that filters unpublished lessons
- convert a nested `if` block into early returns
- use `switch` for role-based output

## Lab

<Lab title="Refactor control flow" duration="35 min" difficulty="Easy" stack="Node.js REPL or any scratch file">

### Goal
Take a deliberately messy piece of control flow and rewrite it three ways — early returns, a lookup object, and a functional pipeline — then compare readability and test-ability.

### Steps
1. Write a `classifyInvoice(invoice)` function with nested `if/else` covering: no invoice, unpaid, paid-on-time, paid-late, refunded, disputed.
2. Rewrite it using early returns only. Count the lines and the maximum nesting depth.
3. Rewrite the classification as a lookup object keyed by status, using `??` for the default case.
4. Given an array of 1000 invoices, produce the count per class. First with a `for` loop and a counter object, then with `Object.groupBy(invoices, classifyInvoice)`.
5. Swap `||` for `??` in one place where it changes behavior; write down what actually changed.

### Success criteria
- Early-return version has nesting depth 1 and no `else`
- Lookup-object version handles unknown statuses without a crash
- `Object.groupBy` version is shorter than the `for`-loop version and produces identical output
- You can name one case where `||` and `??` differ and explain which you would pick

</Lab>

## Checkpoint

<Checkpoint>
1. A form field reports `input = 0`. You write `const qty = input || 1`. What value does `qty` get and why? What should you write instead?
2. Predict the output: `console.log('hello' && 42, '' && 42, 'hello' || 42)`. Explain each.
3. Why is `for...in` almost always the wrong choice for iterating an array?
4. Convert this into early returns: `if (a) { if (b) { return doWork() } else { return 'no b' } } else { return 'no a' }`.
5. When would you pick `switch` over a lookup object, and when the reverse?
</Checkpoint>

## What To Remember

- use simple conditions first
- choose loops based on the problem
- prefer readability over cleverness
- use early return to reduce unnecessary nesting

## Further reading

- [Functions, Scope, Closures, and This](/learning/javascript/functions-scope-closures-this/) — where early returns really pay off
- [Arrays, Objects, and Destructuring](/learning/javascript/arrays-objects-destructuring/) — the functional alternatives to loops
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — `Object.groupBy` and related helpers
- [MDN: Logical operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#logical_operators)
