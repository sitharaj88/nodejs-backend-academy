---
title: Performance, Profiling, and the Event Loop
slug: learning/performance/performance-profiling-event-loop
description: Understand how the Node.js event loop governs throughput, measure lag and hotspots, and fix the real bottleneck instead of the one you assumed.
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

<LessonMeta level="Intermediate" duration="22 min" track="Performance" prerequisites="Async/await, Node runtime basics" />

Most Node.js performance bugs are not about the language. They are about work happening on the wrong thread, in the wrong loop phase, or without backpressure. This page teaches you to see that, measure it, and fix it with technique instead of guesswork.

<Objectives>
- Explain the event loop phases with the right level of detail for debugging
- Measure p50/p95/p99 and event-loop lag in a running service
- Record and read a flame graph from a real load test
- Categorize fixes: remove work, move work off the loop, or move it out of process
</Objectives>

## Mental model: the event loop in one picture

<Diagram caption="Each loop tick runs phase work, drains the microtask queue, and checks for new I/O.">
  <svg viewBox="0 0 620 220" role="img" aria-label="Event loop phases">
    <defs>
      <marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <circle cx="310" cy="110" r="85" fill="none" stroke="#2f8f46" stroke-width="2" />
      <circle cx="310" cy="110" r="55" fill="none" stroke="#087ea4" stroke-dasharray="3 4" />
      <text x="310" y="112" text-anchor="middle" font-weight="800">event loop</text>

      <g text-anchor="middle">
        <rect x="260" y="10" width="100" height="26" rx="4" fill="#dff5e5" stroke="#2f8f46" />
        <text x="310" y="27" font-weight="700">timers</text>

        <rect x="450" y="60" width="140" height="26" rx="4" fill="#e9f4fb" stroke="#087ea4" />
        <text x="520" y="77" font-weight="700">pending callbacks</text>

        <rect x="470" y="140" width="120" height="26" rx="4" fill="#fef3d7" stroke="#b7791f" />
        <text x="530" y="157" font-weight="700">poll (I/O)</text>

        <rect x="260" y="180" width="100" height="26" rx="4" fill="#e8e4ff" stroke="#6d4aff" />
        <text x="310" y="197" font-weight="700">check (setImmediate)</text>

        <rect x="30" y="140" width="120" height="26" rx="4" fill="#fde4e1" stroke="#b42318" />
        <text x="90" y="157" font-weight="700">close callbacks</text>

        <rect x="50" y="60" width="140" height="26" rx="4" fill="#f6f8fb" stroke="#596579" />
        <text x="120" y="77" font-weight="700">idle / prepare</text>
      </g>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#a)">
        <path d="M310 40 Q 420 50 450 74" />
        <path d="M520 88 Q 540 110 530 140" />
        <path d="M470 166 Q 400 180 360 186" />
        <path d="M260 193 Q 180 180 150 164" />
        <path d="M90 140 Q 80 110 90 86" />
        <path d="M150 74 Q 240 40 260 36" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="One loop, many phases">
Node runs your JavaScript on one main thread. Between phases, it drains the **microtask queue** (promise callbacks, `queueMicrotask`). Anything synchronous and long — a regex, a JSON parse, a crypto hash — freezes the whole loop and every in-flight request.
</KeyConcept>

## Measure the right numbers

Averages lie. Percentiles tell the truth. A service with p50 of 30 ms and p99 of 2 s is a bad service.

```ts
// src/metrics.ts
import { monitorEventLoopDelay, performance } from 'node:perf_hooks'
import { logger } from './logger'

const hist = monitorEventLoopDelay({ resolution: 20 })
hist.enable()

setInterval(() => {
  logger.info(
    {
      loop_p50_ms: hist.percentile(50) / 1e6,
      loop_p95_ms: hist.percentile(95) / 1e6,
      loop_p99_ms: hist.percentile(99) / 1e6,
      loop_max_ms: hist.max / 1e6,
      rss_mb: process.memoryUsage.rss() / 1024 / 1024,
    },
    'loop.stats',
  )
  hist.reset()
}, 5000).unref()
```

<Callout type="tip" title="Target: p99 loop lag under 10 ms">
A healthy API service keeps event-loop lag p99 under 10 ms. Above 50 ms, users feel it. Above 200 ms, your health check starts failing.
</Callout>

## Three classes of performance bug

<Compare badLabel="Blocking the loop" goodLabel="Yielding or offloading">
<Fragment slot="bad">
```ts
app.post('/signup', async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 12) // 120 ms of CPU
  await users.create({ ...req.body, hash })
  res.json({ ok: true })
})
```
One signup blocks every in-flight request.
</Fragment>
<Fragment slot="good">
```ts
import { hash } from 'argon2' // async, uses thread pool

app.post('/signup', async (req, res) => {
  const hash_ = await hash(req.body.password)
  await users.create({ ...req.body, hash: hash_ })
  res.json({ ok: true })
})
```
Hashing runs on libuv's thread pool; the loop keeps serving.
</Fragment>
</Compare>

<Compare badLabel="Sync I/O" goodLabel="Async or stream">
<Fragment slot="bad">
```ts
app.get('/report', (req, res) => {
  const csv = fs.readFileSync('./reports/big.csv', 'utf8') // 800 MB
  res.type('text/csv').send(csv)
})
```
Loads 800 MB into memory and blocks until done.
</Fragment>
<Fragment slot="good">
```ts
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

app.get('/report', async (req, res) => {
  res.type('text/csv')
  await pipeline(createReadStream('./reports/big.csv'), res)
})
```
Streams bytes as fast as the client reads them.
</Fragment>
</Compare>

<Compare badLabel="Accidental N+1" goodLabel="Batched load">
<Fragment slot="bad">
```ts
const orders = await db.orders.findMany({ where: { userId } })
for (const o of orders) {
  o.items = await db.items.findMany({ where: { orderId: o.id } })
}
```
One query per order → 100 orders = 101 round-trips.
</Fragment>
<Fragment slot="good">
```ts
const orders = await db.orders.findMany({ where: { userId } })
const items = await db.items.findMany({
  where: { orderId: { in: orders.map((o) => o.id) } },
})
const byOrder = Map.groupBy(items, (i) => i.orderId)
for (const o of orders) o.items = byOrder.get(o.id) ?? []
```
Two queries, regardless of order count.
</Fragment>
</Compare>

## Profiling with flame graphs

A flame graph maps where CPU time is spent. Wider means hotter; stacks read top-down.

```bash
# Load the service
autocannon -c 50 -d 30 http://localhost:3000/api/search?q=node

# In another terminal — record CPU profile for 10 s
node --cpu-prof --cpu-prof-dir=./profiles dist/server.js

# Render via clinic
npm i -D clinic
clinic flame -- node dist/server.js
```

Read the flame graph top-down: the tall plateaus are your hotspots. A 40%-wide `JSON.parse` is a real finding; a 1% `Array#map` is noise.

## Pitfalls

<Pitfall title="Benchmarking on a cold service">
`autocannon` runs for 5 seconds against a service that just started. V8 hasn't JIT-optimized anything, caches are cold. The number means nothing. **Fix:** warm up for 30 s, measure for 60 s, repeat three times.
</Pitfall>

<Pitfall title="`JSON.parse(JSON.stringify(x))` as a clone">
Deep clones via JSON drop `Date`, `Map`, `Set`, and `undefined`, throw on cycles, and run in O(n). **Fix:** `structuredClone(x)` — faster, correct.
</Pitfall>

<Pitfall title="Regex against user input">
A crafted input like `'a'.repeat(10_000) + '!'` against `/^(a+)+$/` backtracks exponentially and stalls the loop for minutes. **Fix:** use `node:re2` or re-express without nested quantifiers; add input length limits.
</Pitfall>

## Lab

<Lab title="Profile, fix, and re-measure" duration="60 min" difficulty="Medium" stack="Node.js, clinic, autocannon">

### Goal
Take a provided &ldquo;slow&rdquo; Express service, find the real bottleneck, and ship a change that improves p99 by at least 60% under load — with numbers before and after.

### Steps
1. Run `autocannon -c 100 -d 60 http://localhost:3000/api/products` and record p50/p95/p99.
2. Enable the event-loop monitor; note baseline loop p99.
3. Capture a flame graph with `clinic flame`.
4. Pick the single biggest block. Guess what it is before looking.
5. Apply a focused fix: async the sync, stream the large response, batch the N+1, or cache the pure function.
6. Re-run the same test. Report the delta.

### Success criteria
- p99 drops by ≥60%
- Event-loop lag p99 stays under 10 ms at the new throughput
- The diff touches one file and keeps all tests green
- Commit message includes before/after numbers

</Lab>

## Checkpoint

<Checkpoint>
1. What does event-loop lag measure and why is p99 more useful than mean?
2. Your p50 is 20 ms but p99 is 2 s. Name two classes of bug that produce that shape.
3. How does `argon2.hash` avoid blocking the loop while `bcrypt.hashSync` does not?
4. Why is `JSON.parse(JSON.stringify(x))` a bad deep clone?
5. A regex on user input freezes the service. What are your two options?
</Checkpoint>

## Further reading

- [Caching Strategies and Consistency](/learning/performance/caching-strategies-and-consistency/)
- [Scaling, Reliability, and Capacity](/learning/performance/scaling-reliability-and-capacity/)
- [Modern Performance Coverage](/learning/performance/modern-performance-coverage/)
