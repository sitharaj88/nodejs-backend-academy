---
title: Runtime Fundamentals
slug: learning/nodejs/runtime-fundamentals
description: Learn what Node.js is, how the event loop works, what non-blocking I/O means, and how the runtime differs from browser JavaScript.
---

Node.js is a JavaScript runtime built on the V8 engine. It is designed for server-side execution and exposes operating-system-level capabilities through JavaScript APIs.

## What Makes Node.js Different

Node.js is not just “JavaScript on the server.” It adds:

- file system access
- networking APIs
- process management
- streams and event emitters
- runtime-level tools for servers and command-line programs

Unlike browser JavaScript, Node.js has no DOM. Its default concerns are I/O, processes, networking, and long-running applications.

## The Event Loop Mental Model

Node.js uses an event-driven, non-blocking model. This means:

- JavaScript code runs on the main thread
- I/O operations are handed off to the runtime or system
- completed work schedules callbacks, promise continuations, or events

### Teaching point

Students should stop asking “is Node.js multi-threaded?” as a yes-or-no question. The better question is: which work runs on the JavaScript thread, and which work is delegated to the runtime, OS, or worker threads?

## Blocking Versus Non-Blocking Work

### Blocking example

```js
const fs = require('node:fs')

const data = fs.readFileSync('report.txt', 'utf8')
console.log(data)
```

### Non-blocking example

```js
const fs = require('node:fs/promises')

async function loadReport() {
  const data = await fs.readFile('report.txt', 'utf8')
  console.log(data)
}
```

The second example lets Node.js continue handling other work while the file is being read.

## Why Non-Blocking I/O Matters

This design is one reason Node.js is effective for:

- APIs
- chat systems
- real-time dashboards
- streaming services
- gateways and BFF layers

But it is not magic. CPU-heavy work can still block the event loop badly.

## Microtasks and Task Timing

Node.js processes several kinds of work:

- synchronous code
- promise microtasks
- timers
- I/O callbacks
- close events

Learners do not need to memorize every internal phase immediately, but they must understand that callback order is not random.

## A Simple Ordering Example

```js
console.log('start')

setTimeout(() => console.log('timer'), 0)

Promise.resolve().then(() => console.log('promise'))

console.log('end')
```

Expected order:

1. `start`
2. `end`
3. `promise`
4. `timer`

This is a foundational Node.js teaching example because it shows that “later” does not mean “all later work is equal.”

## CPU-Bound Work

Heavy CPU tasks such as image processing, compression, large JSON transforms, or expensive loops can block the main thread.

```js
function blockCpu() {
  let total = 0
  for (let i = 0; i < 1_000_000_000; i += 1) {
    total += i
  }
  return total
}
```

During work like this, the process cannot respond efficiently to incoming requests.

## Worker Threads Awareness

Modern Node.js supports worker threads for CPU-heavy tasks.

Learners should know:

- worker threads are not the default answer to every problem
- they are useful for parallel CPU work
- most backend code still spends more time on I/O, coordination, and service structure than on raw compute

## Global APIs in Modern Node.js

Modern Node.js includes browser-like APIs and runtime conveniences such as:

- `fetch`
- `AbortController`
- `URL`
- `URLSearchParams`
- web streams awareness in some workflows

This is important because older training material may still assume every HTTP request requires third-party libraries for basic usage.

## Runtime Boundaries

Node.js can interact with:

- files
- network sockets
- environment variables
- child processes
- timers
- system signals

These boundaries are where many real production issues happen.

## Common Mistakes

- assuming all asynchronous code is free
- writing CPU-heavy logic directly in request handlers
- confusing JavaScript language behavior with Node.js runtime behavior
- treating the event loop as magic instead of understanding scheduling basics
- blocking the process with synchronous APIs in the wrong places

## Practice Ideas

- compare `readFileSync()` with `readFile()`
- predict the order of small async snippets
- simulate one slow CPU task and observe how it affects an HTTP server
- identify which APIs are JavaScript features and which are Node.js runtime features

## What To Remember

- Node.js is a runtime, not a framework
- non-blocking I/O is one of its core strengths
- the event loop explains much of Node.js behavior
- CPU-bound work can still hurt performance badly
- modern Node.js includes more built-in platform capabilities than older tutorials often assume
