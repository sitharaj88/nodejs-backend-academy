---
title: Asynchronous JavaScript
description: Learn callbacks, promises, async or await, concurrency, task ordering, microtasks, timers, and event loop thinking in JavaScript.
---

Asynchronous JavaScript is one of the most important topics for backend learners.

## Why Asynchronous JavaScript Matters

Programs often wait for:

- network requests
- database operations
- file reading
- timers
- user actions

JavaScript must keep working while those operations are in progress.

## Synchronous Versus Asynchronous

### Synchronous

Runs one step after another in order.

### Asynchronous

Starts work that finishes later, while the program continues.

```js
console.log('start')

setTimeout(() => {
  console.log('later')
}, 0)

console.log('end')
```

This prints:

1. `start`
2. `end`
3. `later`

## Callbacks

A callback is a function passed to run later.

```js
function loadData(callback) {
  setTimeout(() => {
    callback({ ok: true })
  }, 1000)
}
```

### Problem

Deeply nested callbacks become hard to read and maintain.

## Promises

Promises represent future results.

They have three states:

- pending
- fulfilled
- rejected

```js
function fetchLesson() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('lesson loaded'), 500)
  })
}
```

## Promise Chaining

```js
fetchLesson()
  .then((message) => {
    console.log(message)
    return 'next step'
  })
  .then((next) => {
    console.log(next)
  })
  .catch((error) => {
    console.error(error)
  })
```

## Async and Await

`async` and `await` make promise-based code easier to read.

```js
async function run() {
  const lesson = await fetchLesson()
  console.log(lesson)
}
```

### Teaching point

`await` pauses inside the async function. It does not freeze JavaScript like a long synchronous CPU task.

## Error Handling with Async Code

Use `try` and `catch` with `await`.

```js
async function loadProfile() {
  try {
    const profile = await profileService.get()
    return profile
  } catch (error) {
    console.error('Failed to load profile', error)
    throw error
  }
}
```

## Sequential Versus Parallel Awaiting

### Sequential

```js
const user = await getUser()
const courses = await getCourses()
```

### Parallel

```js
const [user, courses] = await Promise.all([getUser(), getCourses()])
```

### Key lesson

Independent work should often run in parallel. Dependent work should remain sequential.

## `Promise.allSettled()`

Useful when you want all outcomes, even if some fail.

```js
const results = await Promise.allSettled([
  syncUsers(),
  syncCourses(),
  syncPayments(),
])
```

## `Promise.race()` and `Promise.any()`

These solve different concurrency problems.

### `Promise.race()`

Resolves or rejects as soon as the first promise settles.

```js
const result = await Promise.race([
  fetch('/fast-cache'),
  fetch('/primary-api'),
])
```

### `Promise.any()`

Resolves as soon as the first promise fulfills.

```js
const mirror = await Promise.any([
  fetch('/mirror-1'),
  fetch('/mirror-2'),
  fetch('/mirror-3'),
])
```

Teach students not to treat these as interchangeable. One watches for the first settled promise, while the other waits for the first successful one.

## Async Iteration

Modern JavaScript supports asynchronous streams of values.

```js
async function* streamLessons() {
  yield 'intro'
  yield 'functions'
  yield 'promises'
}

for await (const lesson of streamLessons()) {
  console.log(lesson)
}
```

This matters in real systems where data arrives over time rather than all at once.

## Top-Level `await`

In ES modules, JavaScript can use `await` at the top level.

```js
const config = await loadConfig()
console.log(config.env)
```

This is powerful, but it should be used with care because it can delay module loading for importers.

## Timers

JavaScript provides:

- `setTimeout()`
- `setInterval()`

These schedule work for later.

## Event Loop Basics

At a high level:

- synchronous code runs first
- completed promise callbacks run in the microtask queue
- timer callbacks run later from task queues

```js
console.log('A')

setTimeout(() => console.log('B'), 0)

Promise.resolve().then(() => console.log('C'))

console.log('D')
```

Output:

1. `A`
2. `D`
3. `C`
4. `B`

This is a great teaching example because it reveals the difference between promise microtasks and timer callbacks.

## Common Mistakes

- forgetting to return a promise in a chain
- running independent work sequentially
- swallowing async errors
- mixing callback style and promise style carelessly
- assuming `setTimeout(..., 0)` means immediate execution

## Practice Ideas

- convert callback-based code into promises
- refactor promise chains into `async` or `await`
- compare sequential and parallel loading
- predict execution order in small async snippets

## What To Remember

- asynchronous code is normal in JavaScript
- promises model future results
- `async` or `await` improves readability
- concurrency decisions affect performance
- event loop ordering explains many “weird” outputs
- async iteration and top-level `await` are now part of modern JavaScript
