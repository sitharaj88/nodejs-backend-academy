---
title: Events, Streams, and Async Patterns
slug: learning/nodejs/events-streams-async-patterns
description: Learn EventEmitter, readable and writable streams, piping, backpressure, async iteration, cancellation, and modern Node.js async design patterns.
---

Events and streams are part of what makes Node.js feel like Node.js rather than just server-side JavaScript.

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

Piping connects streams.

```js
import fs from 'node:fs'
import zlib from 'node:zlib'

fs.createReadStream('./report.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('./report.txt.gz'))
```

This is one of the classic Node.js strengths.

## Backpressure

Backpressure means the receiver cannot safely consume data as quickly as the sender produces it.

Students should understand this concept even before they know every low-level detail. It explains why streams scale better than naive “load everything first” approaches.

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

## Event-Driven Versus Promise-Driven APIs

Learners should be able to compare:

- callback style
- event style
- promise style
- stream style

Each exists because the runtime handles different shapes of work.

## Common Mistakes

- using events where direct function calls would be clearer
- reading huge files fully into memory instead of streaming
- ignoring stream errors
- treating stream APIs as “advanced magic” rather than normal data-flow tools
- forgetting cancellation and timeout strategy

## Practice Ideas

- emit a domain event after a simulated enrollment
- gzip a large file with `pipeline()`
- read a stream with `for await...of`
- explain when a stream is better than `readFile()`

## What To Remember

- events describe runtime notifications
- streams describe incremental data flow
- backpressure is a real scaling concern
- promise-based stream helpers make modern Node.js cleaner to teach
- cancellation and timeout strategy are part of mature async design
