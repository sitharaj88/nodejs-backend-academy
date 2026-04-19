---
title: Operators, Conditions, and Loops
description: Learn arithmetic, comparison, logical operators, branching, loops, iteration patterns, and readable control flow in JavaScript.
---

Control flow is how JavaScript decides what to do, when to do it, and how many times to repeat it.

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

## Nullish Coalescing

`??` only falls back when the left side is `null` or `undefined`.

```js
const seats = userSelectedSeats ?? 1
```

This is better than `||` when `0` or `''` should remain valid.

## Optional Chaining

Optional chaining lets you safely access nested properties.

```js
const city = student.address?.city
```

It avoids crashes when intermediate properties are missing.

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

## Short-Circuit Logic

JavaScript stops evaluating once the result is known.

```js
isLoggedIn && showDashboard()
cachedValue || fetchFreshValue()
```

Teach students what this does, but also warn them not to hide too much logic inside shortcuts if readability suffers.

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

## What To Remember

- use simple conditions first
- choose loops based on the problem
- prefer readability over cleverness
- use early return to reduce unnecessary nesting
