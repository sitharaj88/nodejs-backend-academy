---
title: Arrays, Objects, and Destructuring
description: Learn how to work with arrays and objects, transform data, use destructuring, spread, rest, and write cleaner JavaScript.
---

JavaScript applications spend a large amount of time working with collections and object-shaped data.

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

### Teaching point

Students should not memorize methods without asking:

- am I transforming?
- am I filtering?
- am I searching?
- am I combining?

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

## What To Remember

- arrays are for ordered collections
- objects are for named properties
- destructuring improves readability when used well
- spread and rest are powerful but shallow
