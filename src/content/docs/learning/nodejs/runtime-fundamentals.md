---
title: Runtime Fundamentals
slug: learning/nodejs/runtime-fundamentals
description: Learn what Node.js is, how the event loop works, what non-blocking I/O means, and how the runtime differs from browser JavaScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Beginner" duration="20 min" track="Node.js" prerequisites="JavaScript async/await, functions as values" />

Node.js is a JavaScript runtime built on the V8 engine. It is designed for server-side execution and exposes operating-system-level capabilities through JavaScript APIs.

<Objectives>
- Describe the event loop phases with the level of detail needed to debug a slow handler
- Predict the order of sync code, microtasks, timers, and I/O callbacks in a small snippet
- Tell the difference between work that runs on the JS thread and work delegated to libuv
- Recognise CPU-bound code paths and decide when to offload them
</Objectives>

## What Makes Node.js Different

Node.js is not just "JavaScript on the server." It adds:

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

<Diagram caption="One main thread runs phase callbacks; between phases the microtask queue drains; I/O and CPU work runs on libuv's thread pool.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Node.js event loop phases">
    <defs>
      <marker id="nf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <circle cx="320" cy="110" r="88" fill="none" stroke="#2f8f46" stroke-width="2" />
      <text x="320" y="108" text-anchor="middle" font-weight="800">event loop</text>
      <text x="320" y="124" text-anchor="middle" font-size="10" fill="#596579">microtasks drain between phases</text>

      <g text-anchor="middle">
        <rect x="270" y="10" width="100" height="26" rx="4" fill="#dff5e5" stroke="#2f8f46" />
        <text x="320" y="27" font-weight="700">timers</text>

        <rect x="460" y="60" width="150" height="26" rx="4" fill="#e9f4fb" stroke="#087ea4" />
        <text x="535" y="77" font-weight="700">pending callbacks</text>

        <rect x="470" y="140" width="140" height="26" rx="4" fill="#fef3d7" stroke="#b7791f" />
        <text x="540" y="157" font-weight="700">poll (I/O)</text>

        <rect x="270" y="180" width="100" height="26" rx="4" fill="#e8e4ff" stroke="#6d4aff" />
        <text x="320" y="197" font-weight="700">check</text>

        <rect x="30" y="140" width="140" height="26" rx="4" fill="#fde4e1" stroke="#b42318" />
        <text x="100" y="157" font-weight="700">close callbacks</text>

        <rect x="30" y="60" width="140" height="26" rx="4" fill="#f6f8fb" stroke="#596579" />
        <text x="100" y="77" font-weight="700">idle / prepare</text>
      </g>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#nf-arrow)">
        <path d="M320 38 Q 430 50 460 74" />
        <path d="M540 88 Q 560 110 545 140" />
        <path d="M470 166 Q 400 184 370 190" />
        <path d="M270 193 Q 190 184 160 164" />
        <path d="M100 140 Q 85 110 95 86" />
        <path d="M160 74 Q 250 40 270 36" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="One loop, many phases">
Node runs your JavaScript on one main thread. Between phases, it drains the **microtask queue** — promise callbacks and `queueMicrotask`. Anything synchronous and long freezes the whole loop and every in-flight request.
</KeyConcept>

### Teaching point

Students should stop asking "is Node.js multi-threaded?" as a yes-or-no question. The better question is: which work runs on the JavaScript thread, and which work is delegated to the runtime, OS, or worker threads?

## Blocking Versus Non-Blocking Work

<Compare badLabel="Blocking the loop" goodLabel="Non-blocking I/O">
<Fragment slot="bad">
```js
const fs = require('node:fs')

const data = fs.readFileSync('report.txt', 'utf8')
console.log(data)
```
While the file reads, no other request, timer, or callback can run.
</Fragment>
<Fragment slot="good">
```js
const fs = require('node:fs/promises')

async function loadReport() {
  const data = await fs.readFile('report.txt', 'utf8')
  console.log(data)
}
```
The read is delegated to libuv; the loop is free to serve other work.
</Fragment>
</Compare>

## Why Non-Blocking I/O Matters

This design is one reason Node.js is effective for:

- APIs
- chat systems
- real-time dashboards
- streaming services
- gateways and BFF layers

But it is not magic. CPU-heavy work can still block the event loop badly.

<Callout type="info" title="I/O is cheap, CPU is expensive">
Async I/O scales well because the thread is free while the kernel waits. CPU-bound work sits on the JS thread no matter how many `await` keywords you sprinkle on it.
</Callout>

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

This is a foundational Node.js teaching example because it shows that "later" does not mean "all later work is equal."

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

<Callout type="warn" title="An `async` function is not automatically non-blocking">
`async function hash() { return bcrypt.hashSync(pw, 12) }` still blocks the loop for ~120 ms. `async` only wraps the return value in a promise — it does not move CPU work off the JS thread.
</Callout>

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

## Common Pitfalls

<Pitfall title="Treating `await` as if it yielded for CPU work">
A developer wraps a tight loop in `async` and expects the loop to "break up" naturally. The handler still stalls for seconds because synchronous iteration never yields. **Fix:** split the work into batches with `setImmediate`, or move it to a worker thread.
</Pitfall>

<Pitfall title="`process.nextTick` starvation">
Scheduling work with `process.nextTick` inside a recursive function prevents the loop from ever advancing — I/O never gets a chance to run. **Fix:** use `setImmediate` when you want "as soon as possible, but after I/O," and reserve `nextTick` for micro-corrections.
</Pitfall>

<Pitfall title="Sync APIs in the hot path">
A team uses `readFileSync` to load a template on every request. Under 50 RPS the loop is fine; at 500 RPS latency spikes to seconds. **Fix:** read once at startup, or cache and refresh with async reads.
</Pitfall>

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

## Lab

<Lab title="Feel the event loop block" duration="30 min" difficulty="Easy" stack="Node.js 20+, autocannon">

### Goal
Observe, measure, and fix a handler that blocks the event loop, using nothing but the runtime and one load-testing tool.

### Steps
1. Create a tiny Express or `http.createServer` app with two routes: `GET /fast` returning `{ ok: true }` immediately, and `GET /slow` running a 500 ms busy loop.
2. Run `autocannon -c 20 -d 10 http://localhost:3000/fast` and record p50/p99.
3. Start a second `autocannon` session hitting `/slow`. Re-measure `/fast`.
4. Replace the busy loop with `await new Promise((r) => setTimeout(r, 500))`. Re-measure.
5. Explain the difference in one paragraph referring to the loop phases.

### Success criteria
- `/fast` p99 degrades by 10x or more in step 3
- `/fast` p99 returns to baseline in step 4
- Your explanation names at least two phases of the event loop

</Lab>

## Checkpoint

<Checkpoint>
1. Why does a 500 ms CPU loop hurt every concurrent request, while a 500 ms `await setTimeout` does not?
2. In the ordering example, why does `promise` print before `timer`?
3. Which phase handles `setImmediate` callbacks, and how is that different from `process.nextTick`?
4. Name one kind of work where worker threads are the right answer and one where they are overkill.
5. Your service's p99 latency is fine alone but terrible alongside a background JSON import. What is the most likely cause?
</Checkpoint>

## Further reading

- [Events, Streams, and Async Patterns](/learning/nodejs/events-streams-async-patterns/)
- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
- [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/)
- [File System, Path, Buffer, and Process](/learning/nodejs/filesystem-path-buffer-process/)
