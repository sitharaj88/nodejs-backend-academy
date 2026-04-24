---
title: Performance and Production Delivery
slug: learning/nodejs/express/performance-and-production-delivery
description: Learn Express performance awareness, timeout and cancellation strategy, deployment concerns, logging, health endpoints, and production delivery patterns.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate to Advanced" duration="22 min" track="Express" prerequisites="Routing, middleware, streams, node event loop" />

An Express app that works locally is not automatically ready for real traffic.

<Objectives>
- Keep request handlers lean and move expensive work out of the critical path
- Configure explicit timeouts for inbound requests and outbound calls
- Expose liveness and readiness endpoints that mean what they say
- Shut down gracefully so deploys and restarts do not drop in-flight requests
</Objectives>

## Performance Starts with Request Discipline

Express performance problems often begin with:

- slow synchronous work in handlers
- excessive database calls
- large response serialization
- missing caching
- poor timeout strategy

<KeyConcept title="The request path is a budget, not a playground">
Pick a p99 latency target (say, 200 ms). Anything in the handler that cannot fit in that budget needs a home elsewhere — a queue, a cache, a downstream service, or a bigger box with a different architecture.
</KeyConcept>

## Keep Handlers Lean

Route handlers should coordinate work, not do expensive computation directly.

Move expensive or long-running tasks out of the request path when possible.

<Compare badLabel="Work in the handler" goodLabel="Enqueue, then respond">
<Fragment slot="bad">
```js
app.post('/reports', async (req, res) => {
  const report = await buildReport(req.body)   // 30 s
  await emailer.send('report', report)           // 5 s
  res.json({ ok: true })
})
```
Client waits 35 s; any timeout kills the work half-finished.
</Fragment>
<Fragment slot="good">
```js
app.post('/reports', async (req, res) => {
  const job = await queue.enqueue('build-report', req.body)
  res.status(202).json({ jobId: job.id, statusUrl: `/reports/${job.id}` })
})
```
Request returns in ms; worker does the real work; client polls or is notified.
</Fragment>
</Compare>

## Timeouts and Cancellation

Production APIs need explicit strategies for:

- slow downstream services
- hanging requests
- cancellation during shutdown
- client disconnect handling

<Callout type="warn" title="A `fetch` with no signal is a latent outage">
Every outbound HTTP call needs an `AbortSignal` and a timeout. Without one, a slow upstream cascades into a stuck handler, a queue of queued requests, and a stuck server.
</Callout>

## Compression and Response Size Awareness

Learners should think about:

- payload size
- compression
- pagination
- selective field return

Big responses are a performance and reliability issue, not just an aesthetic concern.

## Logging and Observability

Express applications should include:

- structured request logs
- error logs with context
- correlation or request IDs when possible
- health and readiness awareness

## Health Endpoints

Simple endpoints like `/health` or `/ready` are important for load balancers, orchestrators, and operational visibility.

<Callout type="info" title="`/health` is cheap; `/ready` is honest">
`/health` returns 200 if the process is alive — no downstream touches. `/ready` returns 200 only when the process can serve real requests (DB reachable, migrations applied, warm caches). Kubernetes uses them differently on purpose.
</Callout>

## Graceful Shutdown

An Express server should stop accepting new requests, allow in-flight work to finish or time out safely, release resources, and then exit.

## Reverse Proxies and Deployment Awareness

Many Express apps run behind:

- Nginx
- cloud load balancers
- platform ingress layers

Students should know that proxy-aware configuration and trust settings matter in production.

## Common Pitfalls

<Pitfall title="`trust proxy` misconfigured">
`req.ip` returns the proxy's IP instead of the client's; every rate-limit key collapses to one value. **Fix:** set `app.set('trust proxy', 'loopback, linklocal, uniquelocal')` — or the explicit hop count — matching your actual proxy chain.
</Pitfall>

<Pitfall title="Graceful shutdown skipped">
Kubernetes sends `SIGTERM`; your process exits instantly. Clients see 502s. **Fix:** on `SIGTERM`, call `server.close`, wait for in-flight to finish with a bounded timeout, close pools, then exit.
</Pitfall>

<Pitfall title="No outbound timeout">
Handler calls `fetch(upstream)` with no signal. Upstream slows to 60 s; your handler holds a socket for a minute; thread pool saturates. **Fix:** wrap every `fetch` with `AbortSignal.timeout(ms)` and add a circuit breaker for repeat failures.
</Pitfall>

## Common Mistakes

- testing only local behavior and ignoring deployment conditions
- doing slow blocking work in route handlers
- ignoring timeout budgets
- having no health or readiness story
- logging too little to diagnose production behavior

## Practice Ideas

- add a health route and readiness-aware startup or shutdown flow
- identify one expensive path in a sample API and redesign it
- create a request logger that adds timing information
- compare a local-only Express setup with a production-aware one

## Lab

<Lab title="Ship it like you mean it" duration="70 min" difficulty="Medium" stack="Node.js 22+, Express, pino, autocannon">

### Goal
Take a working Express API and make it production-ready: timeouts, health/readiness, graceful shutdown, structured logs.

### Steps
1. Add pino with a `requestId` per request; every log line inside a handler should inherit the id.
2. Expose `GET /health` (no downstream) and `GET /ready` (DB ping + migration check).
3. Set `server.headersTimeout`, `server.requestTimeout`, and per-route outbound timeouts via `AbortSignal.timeout`.
4. Implement `SIGTERM` handling: stop accepting new requests, drain in-flight up to 20 s, close DB pools, exit.
5. Run `autocannon -c 50 -d 30` and send `SIGTERM` mid-run. Confirm zero request errors.
6. Set `app.set('trust proxy', ...)` correctly for your deployment target and verify `req.ip` returns the real client IP.

### Success criteria
- A rolling restart drops zero requests
- `/ready` returns 503 before DB is connected
- Every log line carries a `requestId`
- No outbound call can hang longer than the configured timeout

</Lab>

## Checkpoint

<Checkpoint>
1. What is the difference in intent between `/health` and `/ready`? Which one should a load balancer use?
2. Why does skipping `AbortSignal.timeout` on a `fetch` eventually take down the whole service?
3. What does `app.set('trust proxy', ...)` affect besides `req.ip`?
4. Name two things a `SIGTERM` handler should do and one thing it must not do.
5. Your p50 is fine but p99 spikes during deploys. What is the most likely root cause?
</Checkpoint>

## Further reading

- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
- [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/)
- [Architecture and Testing](/learning/nodejs/express/architecture-and-testing/)
