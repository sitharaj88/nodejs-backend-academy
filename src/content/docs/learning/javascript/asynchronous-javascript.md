---
title: Asynchronous JavaScript
description: Learn callbacks, promises, async or await, concurrency, task ordering, microtasks, timers, and event loop thinking in JavaScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Intermediate" duration="32 min" track="JavaScript" prerequisites="Functions, Scope, Closures, and This" />

Asynchronous JavaScript is where a lot of back-end careers stall. The language itself is small, but the ordering rules — microtasks, tasks, timers, and `await` — take a real mental model to see clearly. This page builds that model, then shows you how to use it without stalling the event loop.

<Objectives>
- Explain the three states of a promise and what each transition triggers
- Predict the output of mixed `setTimeout`, `Promise.then`, and synchronous code
- Choose between sequential and parallel awaiting based on data dependencies
- Distinguish `Promise.all`, `allSettled`, `race`, and `any` by what they settle on
- Handle async errors without swallowing them
</Objectives>

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

## The event loop in one picture

<Diagram caption="Synchronous code runs first. Then the microtask queue drains completely. Then one task (timer or I/O callback) runs. Repeat.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Event loop with microtask and task queues">
    <defs>
      <marker id="jsa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <rect x="20" y="30" width="160" height="54" rx="6" fill="#f6f8fb" stroke="#596579" />
      <text x="100" y="50" text-anchor="middle" font-weight="800">Call stack</text>
      <text x="100" y="68" text-anchor="middle" fill="#596579">sync code runs here</text>

      <rect x="20" y="110" width="160" height="80" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="100" y="130" text-anchor="middle" font-weight="800">Microtask queue</text>
      <text x="100" y="150" text-anchor="middle" fill="#596579">.then / .catch / .finally</text>
      <text x="100" y="166" text-anchor="middle" fill="#596579">queueMicrotask</text>
      <text x="100" y="182" text-anchor="middle" fill="#596579">await continuations</text>

      <rect x="460" y="110" width="160" height="80" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="540" y="130" text-anchor="middle" font-weight="800">Task (macrotask) queue</text>
      <text x="540" y="150" text-anchor="middle" fill="#596579">setTimeout / setInterval</text>
      <text x="540" y="166" text-anchor="middle" fill="#596579">setImmediate (Node)</text>
      <text x="540" y="182" text-anchor="middle" fill="#596579">I/O callbacks</text>

      <rect x="220" y="70" width="200" height="80" rx="40" fill="#e9f4fb" stroke="#087ea4" stroke-width="2" />
      <text x="320" y="100" text-anchor="middle" font-weight="800">Event loop</text>
      <text x="320" y="120" text-anchor="middle" fill="#596579">drain microtasks,</text>
      <text x="320" y="136" text-anchor="middle" fill="#596579">then run one task</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#jsa)">
        <path d="M180 110 Q 200 100 220 100" />
        <path d="M460 130 Q 440 120 420 120" />
        <path d="M320 70 Q 200 50 180 56" />
      </g>
    </g>
  </svg>
</Diagram>

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

<Callout type="info" title="`await` pauses the async function, not the program">
When `await` waits, the function suspends and the event loop keeps doing other work. Other requests are still handled, other timers still fire. Only this one async function is paused, not the whole runtime.
</Callout>

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

<Pitfall title="Forgetting `await` silently swallows errors">
```js
async function save(item) {
  db.insert(item) // returns a rejected promise, no one awaits it
  return { ok: true }
}
```
The caller thinks everything worked; the unhandled rejection shows up hours later in logs. **Fix:** either `await` the call, or explicitly `.catch(logAndMetric)` for fire-and-forget.
</Pitfall>

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

<Compare badLabel="Accidental waterfall" goodLabel="Parallel fan-out">
<Fragment slot="bad">
```js
const results = []
for (const id of ids) {
  results.push(await fetchUser(id)) // one at a time
}
```
For 20 IDs at 100 ms each, this takes 2 seconds.
</Fragment>
<Fragment slot="good">
```js
const results = await Promise.all(ids.map((id) => fetchUser(id)))
```
Same 20 calls, roughly 100 ms total — if the server can handle the fan-out.
</Fragment>
</Compare>

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

<Pitfall title="`setTimeout(fn, 0)` is not immediate">
It is "as soon as the current synchronous code and all microtasks finish, and the timer phase runs next." A heavy microtask queue can delay it indefinitely. **Fix:** when you truly need "after the current stack unwinds," `queueMicrotask(fn)` is faster and more predictable than `setTimeout(fn, 0)`.
</Pitfall>

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

## Lab

<Lab title="From waterfall to parallel" duration="45 min" difficulty="Medium" stack="Node.js, any REPL or script file">

### Goal
Take a slow sequential data loader and speed it up with parallelism without losing error handling, then prove the improvement with a timer.

### Steps
1. Write `fakeFetch(id)` that returns `Promise<{id, ms}>` after a random 80–150 ms delay.
2. Build `loadSerial(ids)` using `for...of` and `await`. Measure total time for `ids = [1..20]`.
3. Build `loadParallel(ids)` with `Promise.all`. Measure again.
4. Make one of the calls reject randomly. Decide, with reasons: should you use `Promise.all`, `allSettled`, or `any`? Update the implementation.
5. Predict the order of logs for:
   ```js
   console.log('1')
   setTimeout(() => console.log('2'), 0)
   Promise.resolve().then(() => console.log('3'))
   queueMicrotask(() => console.log('4'))
   console.log('5')
   ```

### Success criteria
- `loadParallel` is at least 8× faster than `loadSerial` for 20 IDs
- Your parallel loader surfaces failures with context, not as silent rejections
- Your predicted log order matches the actual order on the first run
- The code has zero `.catch` calls that swallow without logging

</Lab>

## Checkpoint

<Checkpoint>
1. In the mixed `A/B/C/D` example above, why does `C` print before `B` even though both are "async"?
2. You have `await fetchA(); await fetchB(); await fetchC();` and the three calls are independent. Rewrite it to halve the total time.
3. What is the difference between `Promise.race` and `Promise.any`? Give one real-world example where each is the right choice.
4. You `await` a function that throws. Where can you catch the error? What happens if you do not?
5. Is `setTimeout(fn, 0)` faster than `queueMicrotask(fn)`? Explain why in terms of queues.
</Checkpoint>

## What To Remember

- asynchronous code is normal in JavaScript
- promises model future results
- `async` or `await` improves readability
- concurrency decisions affect performance
- event loop ordering explains many “weird” outputs
- async iteration and top-level `await` are now part of modern JavaScript

## Further reading

- [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/) — top-level `await` in modules
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — generators and `Promise.withResolvers`
- [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/) — what happens when async code blocks
- [MDN: Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
