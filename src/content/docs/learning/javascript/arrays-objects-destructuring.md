---
title: Arrays, Objects, and Destructuring
description: Learn how to work with arrays and objects, transform data, use destructuring, spread, rest, and write cleaner JavaScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="28 min" track="JavaScript" prerequisites="Functions, Scope, Closures, and This" />

Most backend code is data shaping — take one shape in, return another shape out. This page gives you the vocabulary: `map`, `filter`, `reduce`, destructuring, spread, and rest, with the mutation rules that keep those tools safe.

<Objectives>
- Choose between `map`, `filter`, `find`, and `reduce` based on intent, not habit
- Destructure arrays and objects with defaults and renames without losing readability
- Use spread and rest correctly, knowing they make shallow copies
- Predict which array operations mutate and which return copies
- Write a small data-transformation pipeline end to end
</Objectives>

## Arrays

Arrays store ordered collections.

```js
const topics = ['variables', 'functions', 'promises']
```

### Accessing array elements

```js
topics[0] // variables
topics[1] // functions
```

## Common Array Operations

### Add and remove

```js
const lessons = ['intro']
lessons.push('scope')
lessons.unshift('welcome')
lessons.pop()
lessons.shift()
```

### Search and checks

```js
topics.includes('promises')
topics.find((topic) => topic.startsWith('pro'))
topics.some((topic) => topic.length > 10)
topics.every((topic) => typeof topic === 'string')
```

## Transforming Arrays

### `map()`

Transforms each item.

```js
const upper = topics.map((topic) => topic.toUpperCase())
```

### `filter()`

Keeps matching items.

```js
const longTopics = topics.filter((topic) => topic.length > 8)
```

### `reduce()`

Combines items into one value.

```js
const totalChars = topics.reduce((sum, topic) => sum + topic.length, 0)
```

<Callout type="tip" title="Ask one question before picking a method">
Am I **transforming** every item (map), **keeping some** items (filter), **looking for one** item (find), or **combining** items into a single value (reduce)? If you cannot answer in one word, break the operation into two steps.
</Callout>

<Compare badLabel="`for` loop with state" goodLabel="Small functional pipeline">
<Fragment slot="bad">
```js
const totals = []
for (let i = 0; i < orders.length; i += 1) {
  const o = orders[i]
  if (o.status !== 'paid') continue
  totals.push(o.total)
}
let sum = 0
for (let i = 0; i < totals.length; i += 1) sum += totals[i]
```
Three concerns tangled in one block.
</Fragment>
<Fragment slot="good">
```js
const paidTotal = orders
  .filter((o) => o.status === 'paid')
  .reduce((sum, o) => sum + o.total, 0)
```
Intent reads left to right.
</Fragment>
</Compare>

## Objects

Objects store key-value pairs.

```js
const course = {
  title: 'JavaScript Mastery',
  level: 'beginner',
  lessons: 40,
}
```

### Accessing properties

```js
course.title
course['level']
```

Use bracket notation when keys are dynamic.

```js
const field = 'title'
course[field]
```

## Nested Data

Objects and arrays often combine.

```js
const student = {
  name: 'Latha',
  progress: {
    currentModule: 'Functions',
    completedLessons: [1, 2, 3],
  },
}
```

Teach students how to read nested data safely and clearly.

## Destructuring

Destructuring extracts data from arrays or objects.

### Object destructuring

```js
const { title, level } = course
```

### Array destructuring

```js
const [firstTopic, secondTopic] = topics
```

### Renaming

```js
const { title: courseTitle } = course
```

### Default values

```js
const { language = 'English' } = course
```

## Spread Syntax

Spread expands values.

### Arrays

```js
const core = ['js', 'ts']
const full = [...core, 'node']
```

### Objects

```js
const baseUser = { role: 'student', active: true }
const detailedUser = { ...baseUser, name: 'Anu' }
```

## Rest Syntax

Rest collects remaining items.

### Arrays

```js
const [first, ...rest] = topics
```

### Objects

```js
const { password, ...safeUser } = {
  id: 1,
  name: 'Ravi',
  password: 'secret',
}
```

This is extremely useful in API response shaping.

<Callout type="info" title="Rest in destructuring is different from rest in parameters">
In destructuring, `...name` collects leftover keys or elements into a new array/object. In function parameters, `...args` collects all remaining arguments into an array. Same syntax, similar idea, different position.
</Callout>

## Mutation Versus Non-Mutation

Students must understand which operations mutate original data.

### Mutating examples

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- direct property assignment

### Non-mutating examples

- `map()`
- `filter()`
- `slice()`
- object spread

<Pitfall title="`sort` and `reverse` mutate the original array">
```js
const scores = [3, 1, 2]
const sorted = scores.sort() // scores is also now [1, 2, 3]
```
The function returns the same array, mutated in place. **Fix:** use `scores.toSorted()` and `scores.toReversed()` (ES2023), or clone first: `[...scores].sort()`.
</Pitfall>

<Pitfall title="Spread is a shallow copy">
```js
const original = { profile: { theme: 'dark' } }
const clone = { ...original }
clone.profile.theme = 'light'
console.log(original.profile.theme) // 'light' — nested object is shared
```
**Fix:** for independent nested data use `structuredClone(original)`; for reshaping one nested object, spread at every level you care about.
</Pitfall>

## `Object.keys`, `Object.values`, `Object.entries`

These are essential for working with objects dynamically.

```js
const settings = { theme: 'dark', compact: true }

Object.keys(settings)
Object.values(settings)
Object.entries(settings)
```

## Practical Data Transformation Example

```js
const rawUsers = [
  { id: 1, name: 'Asha', passwordHash: 'abc' },
  { id: 2, name: 'Mohan', passwordHash: 'xyz' },
]

const publicUsers = rawUsers.map(({ passwordHash, ...safeUser }) => safeUser)
```

This is a realistic pattern for backend responses.

## Common Mistakes

- mutating arrays when a new array is intended
- forgetting that spread is shallow
- using `map()` when `filter()` or `find()` is needed
- overcomplicating destructuring in places where direct access is clearer

## Practice Ideas

- transform a list of course objects into display cards
- remove private fields from user records
- group data using `reduce()`
- destructure nested objects into local variables

## Lab

<Lab title="Shape an API payload" duration="45 min" difficulty="Medium" stack="Node.js REPL or any scratch file">

### Goal
Take a realistic raw dataset and produce a clean public-facing payload with a three-step pipeline, no mutation of the source.

### Steps
1. Start with `const users = [{ id, name, email, passwordHash, roles, posts }]` and seed 5 rows.
2. Step one — remove sensitive fields using object rest: `({ passwordHash, email, ...safe }) => safe`.
3. Step two — add a computed `isAdmin` by spreading: `{ ...user, isAdmin: user.roles.includes('admin') }`.
4. Step three — return only users whose `posts.length > 0`, sorted by most posts, without mutating the input. Use `toSorted`.
5. Write one assertion that confirms the original `users` array is unchanged after the pipeline runs.

### Success criteria
- No `push`, `sort`, or direct property assignment on the input array
- Final array contains only safe fields plus `isAdmin`
- Sorted descending by `posts.length` using `toSorted`
- The assertion from step 5 passes on every run

</Lab>

## Checkpoint

<Checkpoint>
1. You need the total of `prices` where `status === 'paid'`. Which two array methods would you chain, in which order, and why?
2. What is the difference between `const [a, b] = arr` and `const { 0: a, 1: b } = arr`?
3. Given `const safe = { ...user }`, you later set `safe.address.city = 'X'`. Why does `user.address.city` also change?
4. Which of these mutate: `sort`, `toSorted`, `splice`, `slice`, `reverse`, `toReversed`?
5. Write a destructuring line that pulls `title` (renamed to `courseTitle`), `duration` with a default of `30`, and the rest of the properties into `meta`.
</Checkpoint>

## What To Remember

- arrays are for ordered collections
- objects are for named properties
- destructuring improves readability when used well
- spread and rest are powerful but shallow

## Further reading

- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — `Map`, `Set`, `toSorted`, and `Object.groupBy`
- [Prototypes, Classes, and OOP](/learning/javascript/prototypes-classes-oop/) — when an object deserves a class
- [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/) — where data pipelines live in a real codebase
- [MDN: Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
