---
title: Events, Streams, and Async Patterns
slug: learning/nodejs/events-streams-async-patterns
description: Learn EventEmitter, readable and writable streams, piping, backpressure, async iteration, cancellation, and modern Node.js async design patterns.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="Node.js" prerequisites="Runtime fundamentals, async/await" />

Events and streams are part of what makes Node.js feel like Node.js rather than just server-side JavaScript.

<Objectives>
- Use `EventEmitter` deliberately, not as a flow-control hack
- Stream large data end-to-end with `pipeline()` and respect backpressure
- Consume streams with `for await...of` when that shape is cleaner
- Propagate cancellation with `AbortController` across I/O boundaries
</Objectives>

## EventEmitter

Many Node.js APIs are event-driven.

```js
import { EventEmitter } from 'node:events'

const bus = new EventEmitter()

bus.on('user:created', (user) => {
  console.log('new user', user.email)
})

bus.emit('user:created', { email: 'asha@example.com' })
```

### Teaching point

Events are useful for runtime notifications, not as an excuse to hide all application flow behind implicit behavior.

<KeyConcept title="Events are for notifications; promises are for results">
Reach for `EventEmitter` when the same thing may happen many times to many listeners. Reach for a promise when "this finishes once and produces a value." Using events where a promise fits makes code impossible to follow.
</KeyConcept>

## Streams

Streams process data incrementally instead of loading everything into memory at once.

The main stream concepts learners should know:

- readable streams
- writable streams
- duplex streams
- transform streams

## Why Streams Matter

Streams are powerful for:

- large file reads
- uploads and downloads
- log processing
- compression
- proxying data

## A Simple Read Stream

```js
import fs from 'node:fs'

const stream = fs.createReadStream('./logs/access.log', 'utf8')

stream.on('data', (chunk) => {
  console.log('chunk', chunk.length)
})
```

## Piping

<Compare badLabel="Loading then sending" goodLabel="Streaming end-to-end">
<Fragment slot="bad">
```js
import fs from 'node:fs/promises'

app.get('/report.csv', async (_req, res) => {
  const data = await fs.readFile('./reports/big.csv')
  res.type('text/csv').send(data)
})
```
An 800 MB file pins 800 MB of RSS per concurrent request.
</Fragment>
<Fragment slot="good">
```js
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

app.get('/report.csv', async (_req, res) => {
  res.type('text/csv')
  await pipeline(createReadStream('./reports/big.csv'), res)
})
```
Memory stays flat; backpressure stops the read when the client is slow.
</Fragment>
</Compare>

## Backpressure

Backpressure means the receiver cannot safely consume data as quickly as the sender produces it.

Students should understand this concept even before they know every low-level detail. It explains why streams scale better than naive "load everything first" approaches.

<Callout type="info" title="`pipeline` gives you backpressure and cleanup for free">
Manual `.pipe()` chains leak resources on error. `pipeline()` — especially the promise variant from `node:stream/promises` — closes every stream in the chain on failure and returns a promise you can `await`.
</Callout>

## `stream/promises`

Modern Node.js includes promise-friendly helpers for streams.

```js
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import zlib from 'node:zlib'

await pipeline(
  fs.createReadStream('./input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('./input.txt.gz')
)
```

This is easier to teach than older nested callback handling.

## Async Iteration over Streams

Streams can be consumed with `for await...of`.

```js
import fs from 'node:fs'

for await (const chunk of fs.createReadStream('./notes.txt', 'utf8')) {
  console.log(chunk)
}
```

This connects Node.js stream concepts back to modern JavaScript async iteration.

## `AbortController`

Modern Node.js increasingly supports cancellation through `AbortController`.

```js
const controller = new AbortController()

setTimeout(() => controller.abort(), 1000)
```

Cancellation is especially important for:

- request timeouts
- hung downstream services
- shutdown behavior
- streamed work that should stop early

<Callout type="tip" title="Thread the signal through every `await`">
`fetch`, `stream/promises.pipeline`, and `setTimeout` all accept an `AbortSignal`. A timeout that does not propagate to the I/O call is a timeout that leaks work until it hits OS limits.
</Callout>

## Event-Driven Versus Promise-Driven APIs

Learners should be able to compare:

- callback style
- event style
- promise style
- stream style

Each exists because the runtime handles different shapes of work.

## Common Pitfalls

<Pitfall title="Unhandled `error` event crashes the process">
A stream emits `error` with no listener. Node promotes it to an uncaught exception and the process dies. **Fix:** always use `pipeline()`, or attach an `error` listener explicitly on every stream you construct.
</Pitfall>

<Pitfall title="EventEmitter leak warning">
Adding a listener inside a request handler without removing it leaks listeners and eventually logs `MaxListenersExceededWarning`. **Fix:** bind listeners at startup where possible, or use `.once()` and `emitter.off()` paired with the request lifecycle.
</Pitfall>

<Pitfall title="Buffering what should stream">
A handler collects chunks into an array, joins at the end, and then sends. Memory grows with request size; a 1 GB upload OOMs the container. **Fix:** stream straight through `pipeline(req, destination)` and size-limit at the edge.
</Pitfall>

## Common Mistakes

- using events where direct function calls would be clearer
- reading huge files fully into memory instead of streaming
- ignoring stream errors
- treating stream APIs as "advanced magic" rather than normal data-flow tools
- forgetting cancellation and timeout strategy

## Practice Ideas

- emit a domain event after a simulated enrollment
- gzip a large file with `pipeline()`
- read a stream with `for await...of`
- explain when a stream is better than `readFile()`

## Lab

<Lab title="Stream, gzip, and cancel a big file" duration="45 min" difficulty="Medium" stack="Node.js 22+, node:stream/promises, node:zlib">

### Goal
Serve a large file over HTTP as a gzipped stream that respects backpressure and cancels cleanly when the client disconnects.

### Steps
1. Generate a 500 MB text file (e.g. `node -e "require('fs').writeFileSync('big.txt', 'x'.repeat(500_000_000))"`).
2. Build an HTTP server with `http.createServer`. On `GET /big.gz`, set `Content-Encoding: gzip` and `pipeline(createReadStream('big.txt'), createGzip(), res)`.
3. Wire an `AbortController` to `req.on('close', () => controller.abort())` and pass its signal to `pipeline`.
4. Start `autocannon -c 5 -d 10 http://localhost:3000/big.gz` with `-T 1` to force disconnects. Watch RSS stay flat.
5. Deliberately break the read path (rename the file) and confirm the `pipeline` promise rejects cleanly without leaking sockets.

### Success criteria
- RSS stays under 200 MB during load
- Client disconnects stop the read within 1 second
- Error paths reject with a real error, never an unhandled event
- No `MaxListenersExceededWarning` in logs

</Lab>

## Checkpoint

<Checkpoint>
1. Why does `pipeline()` beat manually calling `.pipe()` across three streams?
2. Name one class of bug that disappears once you start using `for await...of` over streams.
3. How does an `AbortSignal` passed to `fetch` actually cancel the underlying socket?
4. When is `EventEmitter` the wrong choice and a plain async function the right one?
5. Your service OOMs serving a 2 GB CSV. The route uses `fs.readFile`. What is the one-line fix, and why does it work?
</Checkpoint>

## Further reading

- [File System, Path, Buffer, and Process](/learning/nodejs/filesystem-path-buffer-process/)
- [HTTP Server, APIs, and Express](/learning/nodejs/http-server-apis-express/)
- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
