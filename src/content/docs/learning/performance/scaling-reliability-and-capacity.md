---
title: Scaling, Reliability, and Capacity
slug: learning/performance/scaling-reliability-and-capacity
description: Scale Node.js services without breaking correctness. Learn cluster, worker_threads, load shedding, bulkheads, back-of-envelope capacity math, and graceful degradation.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Advanced" duration="22 min" track="Performance" prerequisites="Event loop, caching basics" />

Scaling is not "add more boxes." It is knowing the bottleneck, moving the work that doesn't belong in the request path, and designing so that failure in one dependency doesn't take down the whole service.

<Objectives>
- Estimate capacity with back-of-envelope math
- Scale Node.js horizontally with stateless services and health checks
- Use `cluster` and `worker_threads` correctly (and know when not to)
- Apply bulkheads, timeouts, and circuit breakers to protect against dependency failure
- Shed load deliberately instead of collapsing
</Objectives>

## Capacity math

Before adding hardware, do the math.

```
target rps × avg latency = concurrent requests needed
concurrent requests / cores = per-core concurrency
```

Example: 2,000 rps, 80 ms mean latency = **160 concurrent requests**. On 8 cores that is **20 per core**. An 8-core Node instance handles that comfortably if latency stays under 100 ms. If latency doubles, so does concurrency — plan the headroom.

```
Little's Law:  L = λ × W
  L = items in system
  λ = arrival rate (rps)
  W = time each item spends in the system (s)
```

## Stateless services scale horizontally

A service is &ldquo;stateless&rdquo; when any replica can handle any request. State — sessions, rate-limit counters, cached data — lives in Redis, the DB, or the client, not in memory.

<Compare badLabel="Hidden state per-pod" goodLabel="State outside the pod">
<Fragment slot="bad">
```ts
const sessions = new Map<string, Session>() // in-process
app.get('/me', (req, res) => res.json(sessions.get(req.cookies.sid)))
```
Autoscaling adds a pod → user's session isn't there.
</Fragment>
<Fragment slot="good">
```ts
app.get('/me', async (req, res) => {
  const session = await redis.get(`sess:${req.cookies.sid}`)
  res.json(session ? JSON.parse(session) : null)
})
```
Any pod can serve any request.
</Fragment>
</Compare>

## `cluster` and `worker_threads`

Node runs one JavaScript thread. Two built-in tools break out of that limit.

### `cluster` — one process per core

```ts
// server.ts — works with Node or PM2
import cluster from 'node:cluster'
import os from 'node:os'
import { startApp } from './app'

if (cluster.isPrimary) {
  for (let i = 0; i < os.availableParallelism(); i++) cluster.fork()
  cluster.on('exit', (w, code) => {
    if (code !== 0) cluster.fork() // respawn on crash
  })
} else {
  startApp().listen(3000)
}
```

Good for CPU-bound workloads where each request is independent. In production, let Kubernetes or your platform run one process per pod instead and scale pods horizontally — simpler, more uniform.

### `worker_threads` — CPU work without blocking the loop

```ts
// csv-worker.ts
import { parentPort } from 'node:worker_threads'
parentPort!.on('message', (rows: string[]) => {
  const processed = rows.map(expensiveTransform)
  parentPort!.postMessage(processed)
})
```

```ts
import { Worker } from 'node:worker_threads'
const worker = new Worker(new URL('./csv-worker.js', import.meta.url))
worker.postMessage(rows)
worker.on('message', (out) => res.json(out))
```

<Callout type="tip" title="Don't hand-roll worker pools">
Use `piscina` or similar. It handles pool sizing, graceful shutdown, and task cancellation — the parts that go wrong under load.
</Callout>

## Moving work out of the request path

If a task takes longer than the caller can reasonably wait, queue it.

```ts
// in the request handler
await queue.add('send-welcome-email', { userId: user.id })
res.status(202).json({ id: user.id })
```

```ts
// worker process
queue.process('send-welcome-email', async (job) => {
  await emailer.send({ template: 'welcome', userId: job.data.userId })
})
```

Result: request returns in milliseconds, failures retry, traffic spikes absorb into queue depth instead of timeouts.

## Bulkheads, timeouts, and circuit breakers

<KeyConcept title="Every external call needs a timeout">
A call without a timeout inherits the caller's lifetime. If the dependency hangs, your request hangs — until your socket disconnects. Under load, a few hanging calls saturate your connection pool and the service dies from starvation.
</KeyConcept>

```ts
import { setTimeout as delay } from 'node:timers/promises'

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const ac = new AbortController()
  const t = delay(ms, undefined, { signal: ac.signal }).then(() => {
    throw new Error(`timeout after ${ms}ms`)
  })
  try {
    return await Promise.race([p, t as unknown as Promise<T>])
  } finally {
    ac.abort()
  }
}
```

A **circuit breaker** stops calling a dependency that keeps failing, giving it time to recover:

```ts
import CircuitBreaker from 'opossum'

const breaker = new CircuitBreaker(callPayments, {
  timeout: 800,
  errorThresholdPercentage: 50,
  resetTimeout: 10_000,
})
breaker.fallback(() => ({ status: 'queued_for_retry' }))
```

**Bulkheads** isolate pools by dependency so a slow cache doesn't starve database calls. Keep one connection pool per downstream. Set max-concurrent per pool.

## Load shedding

At saturation you can either **degrade on purpose** or **collapse**. Pick on purpose.

```ts
import { monitorEventLoopDelay } from 'node:perf_hooks'
const hist = monitorEventLoopDelay({ resolution: 20 })
hist.enable()

app.use((req, res, next) => {
  if (hist.percentile(99) / 1e6 > 200) {
    res.set('Retry-After', '2').status(503).json({ error: 'OVERLOADED' })
    return
  }
  next()
})
```

This returns 503 early under pressure. Clients retry; latency for everyone else stays predictable.

## Pitfalls

<Pitfall title="No timeout on outbound HTTP">
`fetch('https://payments...')` with no timeout. Payment service hangs during deploy. Your service holds 1,000 sockets open until TCP keepalive kicks in. Health checks fail. **Fix:** timeouts on every outbound call, end of story.
</Pitfall>

<Pitfall title="Scaling app tier past the database">
Autoscaling brings up 40 Node pods. Each opens 20 Postgres connections. Postgres max is 300. Most connections wait; latency spikes for everyone. **Fix:** connection pooling in front of the DB (pgbouncer), and a max_concurrent_requests env per pod.
</Pitfall>

<Pitfall title="Background work in the request">
&ldquo;It only takes 200 ms to warm the cache on save.&rdquo; Then the save is behind a slow dependency, and now saves take 8 s. **Fix:** respond first, warm on a queue; if warming fails, the request still succeeded.
</Pitfall>

## Lab

<Lab title="Survive a dependency outage" duration="75 min" difficulty="Hard" stack="Node.js, BullMQ, opossum, toxiproxy">

### Goal
Make a real service keep serving at 80% functionality while its payments dependency is hard-down.

### Steps
1. Run the stack with `toxiproxy` in front of the payments mock.
2. Baseline: 200 rps, check `POST /orders` p99 and error rate.
3. Inject `down` on payments. Observe failure mode (probably cascading timeouts).
4. Add 800 ms timeouts to the payments client.
5. Wrap the payments client in an opossum circuit breaker with a queue-for-retry fallback.
6. Add event-loop-lag-based load shedding at 150 ms p99.
7. Re-run the test with `down` injected.

### Success criteria
- During the outage, `POST /orders` returns 202 within 500 ms for ≥95% of calls
- Successful orders are later processed when payments recovers
- `GET /orders` and `GET /products` are unaffected
- No memory leaks after a 10-minute sustained run

</Lab>

## Checkpoint

<Checkpoint>
1. 3,000 rps at 60 ms mean. Roughly how many concurrent requests are in flight?
2. When is `worker_threads` a better answer than `cluster`?
3. You add a 5-second timeout to an outbound call. Name two follow-up changes this forces.
4. A 502 from the cache makes every read 2 s slow. Which of bulkhead, timeout, or circuit breaker fixes it?
5. What's the difference between autoscaling and capacity planning?
</Checkpoint>

## Further reading

- [Profiling and the Event Loop](/learning/performance/performance-profiling-event-loop/)
- [Caching Strategies](/learning/performance/caching-strategies-and-consistency/)
- [Architecture: modular monolith vs microservices](/learning/architecture/modular-monolith-patterns-and-pragmatism/)
- [System Design: messaging & resilience](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/)
