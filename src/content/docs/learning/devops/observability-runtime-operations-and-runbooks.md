---
title: Observability, Runtime Operations, and Runbooks
slug: learning/devops/observability-runtime-operations-and-runbooks
description: Learn logs, metrics, traces, alerts, operational response, and runbook thinking for maintainable backend systems.
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

<LessonMeta level="Intermediate" duration="28 min" track="DevOps" prerequisites="A deployed Node.js service, basic Prometheus concepts" />

A service you cannot see is a service you cannot operate. Observability is how you answer "is it working?" and "why not?" — without deploying more code. This page gives you the three pillars (metrics, logs, traces), the vocabulary of SLI/SLO/error budget, and the discipline of runbooks and on-call that turn 3am pages into 15-minute incidents.

<Objectives>
- Instrument a Node.js service with metrics, structured logs, and traces
- Wire OpenTelemetry to a collector with correlated trace ids
- Pick SLIs that represent user experience and set SLOs you can actually defend
- Design alerts that fire on symptoms, not causes
- Write a runbook a colleague can follow at 3am with one eye open
</Objectives>

## Mental model: three pillars, one trace id

<Diagram caption="Metrics tell you something is wrong. Traces tell you where. Logs tell you why.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Three pillars of observability">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="30" y="40" width="180" height="140" rx="8" fill="#dff5e5" stroke="#2f8f46" stroke-width="1.5" />
      <text x="120" y="66" text-anchor="middle" font-weight="800">Metrics</text>
      <text x="120" y="86" text-anchor="middle" font-size="11" fill="#596579">counts, gauges, histograms</text>
      <text x="120" y="120" text-anchor="middle" font-size="11">requests_total</text>
      <text x="120" y="136" text-anchor="middle" font-size="11">latency_seconds</text>
      <text x="120" y="152" text-anchor="middle" font-size="11">errors_total</text>
      <text x="120" y="172" text-anchor="middle" font-size="10" fill="#596579">"is it wrong?"</text>

      <rect x="230" y="40" width="180" height="140" rx="8" fill="#e9f4fb" stroke="#087ea4" stroke-width="1.5" />
      <text x="320" y="66" text-anchor="middle" font-weight="800">Traces</text>
      <text x="320" y="86" text-anchor="middle" font-size="11" fill="#596579">spans across services</text>
      <text x="320" y="120" text-anchor="middle" font-size="11">POST /orders 842ms</text>
      <text x="320" y="136" text-anchor="middle" font-size="11">└─ payments 780ms ⚠</text>
      <text x="320" y="152" text-anchor="middle" font-size="11">└─ inventory 15ms</text>
      <text x="320" y="172" text-anchor="middle" font-size="10" fill="#596579">"where is it slow?"</text>

      <rect x="430" y="40" width="180" height="140" rx="8" fill="#fef3d7" stroke="#b7791f" stroke-width="1.5" />
      <text x="520" y="66" text-anchor="middle" font-weight="800">Logs</text>
      <text x="520" y="86" text-anchor="middle" font-size="11" fill="#596579">structured events with context</text>
      <text x="520" y="120" text-anchor="middle" font-size="11">level=error code=ETIMEDOUT</text>
      <text x="520" y="136" text-anchor="middle" font-size="11">trace_id=abc123 user=42</text>
      <text x="520" y="152" text-anchor="middle" font-size="11">msg=payments gateway</text>
      <text x="520" y="172" text-anchor="middle" font-size="10" fill="#596579">"why did it fail?"</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="One trace id ties it all together">
Every request gets a trace id at the edge. That id flows into every log line, every downstream call, and every span. When you see an alert, one click takes you to the trace; one click from the trace takes you to the logs for that exact request. No correlation, no observability.
</KeyConcept>

## Structured logs

```ts
// src/logger.ts
import pino from 'pino'
import { AsyncLocalStorage } from 'node:async_hooks'

type Ctx = { traceId: string; userId?: string; tenantId?: string }
export const als = new AsyncLocalStorage<Ctx>()

export const logger = pino({
  level: config.LOG_LEVEL,
  base: { service: 'api', env: config.NODE_ENV, version: config.GIT_SHA },
  mixin: () => als.getStore() ?? {},
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
})
```

```ts
// src/middleware/context.ts
import { randomUUID } from 'node:crypto'
import { als, logger } from '../logger'

export function contextMiddleware(req, res, next) {
  const traceId = req.headers['traceparent']?.split('-')[1] ?? randomUUID()
  res.setHeader('x-trace-id', traceId)
  als.run({ traceId, userId: req.user?.id, tenantId: req.tenant?.id }, () => {
    const start = performance.now()
    res.on('finish', () => {
      logger.info({
        method: req.method,
        path: req.route?.path ?? req.path,
        status: res.statusCode,
        duration_ms: Math.round(performance.now() - start),
      }, 'http.request')
    })
    next()
  })
}
```

<Compare badLabel="Unstructured logs" goodLabel="Structured logs">
<Fragment slot="bad">
```ts
console.log(`User ${user.email} failed to pay: ${err.message}`)
```
Unsearchable, leaks PII, no context, breaks when `err` is an object.
</Fragment>
<Fragment slot="good">
```ts
logger.warn(
  { userId: user.id, code: err.code, stripeRequestId: err.requestId },
  'payment.charge.failed',
)
```
Queryable (`level=warn AND msg=payment.charge.failed`), redacts PII, correlates via trace id injected by the logger mixin.
</Fragment>
</Compare>

## Metrics with Prometheus

```ts
// src/metrics.ts
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client'

collectDefaultMetrics({ prefix: 'node_' })

export const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
})

export const httpLatency = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
})

export function metricsMiddleware(req, res, next) {
  const end = httpLatency.startTimer()
  res.on('finish', () => {
    const route = req.route?.path ?? 'unmatched'
    const labels = { method: req.method, route, status: String(res.statusCode) }
    httpRequests.inc(labels)
    end(labels)
  })
  next()
}

// expose on a separate port so /metrics is not public
import express from 'express'
const mApp = express()
mApp.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.send(await register.metrics())
})
mApp.listen(9464)
```

<Callout type="warn" title="High-cardinality labels will kill Prometheus">
Never label with user id, request id, or a free-form string. Every unique label combination is a new time series. `route` must be the *pattern* (`/users/:id`), never the actual path. 10k users × 50 routes = 500k series per second if you get this wrong.
</Callout>

## Traces with OpenTelemetry

```ts
// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes as Keys } from '@opentelemetry/semantic-conventions'

const sdk = new NodeSDK({
  resource: new Resource({
    [Keys.SERVICE_NAME]: 'api',
    [Keys.SERVICE_VERSION]: process.env.GIT_SHA ?? 'dev',
    [Keys.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // noisy
    }),
  ],
})

sdk.start()
process.on('SIGTERM', () => sdk.shutdown())
```

Require this file *before* your app: `node --import ./dist/tracing.js dist/server.js`. The auto-instrumentations wrap Express, pg, Redis, and outbound `fetch` — one file, spans appear for every hop.

## SLI, SLO, error budget

<KeyConcept title="Alert on user experience, not server internals">
An **SLI** is a number that approximates "is the user happy." Classic choices: successful-request rate, request latency under threshold. An **SLO** is a target for that SLI over a window ("99.9% of requests return 2xx/3xx in under 300 ms, measured over 30 days"). The **error budget** is 1 − SLO: the amount of bad minutes you are allowed before customers notice.
</KeyConcept>

```
SLO:   99.9% availability over 30 days
Budget: 0.1% × 43,200 min = 43 min of "bad" per 30 days
```

When you have burned less than half your budget, ship aggressively. When you are past 75%, slow the release cadence. When you are over budget, freeze new features until reliability recovers.

<Compare badLabel="Cause-based alerts" goodLabel="Symptom-based alerts">
<Fragment slot="bad">
```yaml
- alert: RedisMemoryHigh
  expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.85
```
Fires at 3am. Users are fine. The engineer wakes up, finds nothing to do, goes back to sleep distrusting the pager.
</Fragment>
<Fragment slot="good">
```yaml
- alert: APIErrorBudgetBurn
  expr: |
    (sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m]))) > 0.02
  for: 5m
  annotations:
    summary: "API error rate > 2% for 5m — users impacted"
    runbook: "https://runbooks/api-error-rate"
```
Fires when users are actually experiencing errors, links to the runbook that tells the on-caller what to do.
</Fragment>
</Compare>

## Runtime operations

### Graceful shutdown

A SIGTERM is Kubernetes saying "you have `terminationGracePeriodSeconds` to finish up." Do not ignore it.

```ts
// src/server.ts
const server = app.listen(config.PORT)

let shuttingDown = false
function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'shutdown.begin')

  // 1. Flip /readyz to 503 so the LB stops sending new traffic
  app.locals.ready = false

  // 2. Wait for in-flight requests to finish
  server.close(async (err) => {
    if (err) logger.error({ err }, 'server.close.error')
    // 3. Close dependencies
    await pool.end()
    await redis.quit()
    await sdk.shutdown()
    logger.info('shutdown.complete')
    process.exit(0)
  })

  // 4. Hard exit if we take too long
  setTimeout(() => {
    logger.error('shutdown.timeout — forcing exit')
    process.exit(1)
  }, 25_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

### Health endpoints

`/livez` must never fail for a transient reason — its job is to tell the orchestrator to *restart* you. `/readyz` is where you check dependencies; failing it only *removes* you from the load balancer.

## Runbooks

A runbook is the five things you do in the first five minutes of an incident. Not a manual, not a design doc. Short.

```markdown
# Runbook: High API error rate

Alert: `APIErrorBudgetBurn` (error rate > 2% for 5m)

## First 60 seconds
1. Check the [API overview dashboard](https://grafana/d/api).
   - Is the spike one endpoint or all endpoints?
   - Did a deploy ship in the last 15 minutes? (See the deploy annotation on the graph.)
2. Check dependency health: [Postgres](https://grafana/d/pg), [Redis](https://grafana/d/redis), [payments provider status page].

## If caused by recent deploy
- Roll back: `./scripts/deploy.sh production <previous_digest> --canary=100`
- Previous digest: see the "Deploys" annotation or `gh run list -L 5`
- Verify error rate drops within 2 minutes.

## If caused by downstream outage
- If payments: enable `payments_degraded_mode` feature flag (orders queued, users see banner).
- If database: check connection pool saturation; scale read replicas with `./scripts/scale-replicas.sh +1`.

## Escalation
- Page: #incident-response (auto-paged after 15m if not acknowledged)
- Owner: @api-team
- SLO dashboard: https://grafana/d/api-slos
```

<Callout type="tip" title="Runbooks are tested, not written once">
Every runbook should be executed in a game-day exercise twice a year. If the commands have drifted, the runbook failed the test. Treat runbook drift the same as test-suite rot.
</Callout>

## On-call discipline

- **One pager per team.** Multiple rotations per service fragment responsibility.
- **Shift length matches cognitive limits.** 7 days is max; 24-hour shifts for senior engineers only.
- **Every page becomes a ticket the next business day.** No silent retries, no "I restarted it."
- **Blameless post-mortems for anything over 15 minutes of customer impact.** The goal is a code or process change, not a name.

## Pitfalls

<Pitfall title="Alert spam">
You have 180 alerts; 140 are informational. Nobody reads them. A real page slips through at 4am. **Fix:** only page on symptoms that affect users. Everything else is a dashboard row, not a notification.
</Pitfall>

<Pitfall title="Logs without trace ids">
An incident happens. You have logs from three services. You cannot tell which lines belong to the same request. **Fix:** propagate `traceparent` on every outbound call; include `trace_id` in every log line via a logger mixin.
</Pitfall>

<Pitfall title="Readiness probe that is really a liveness probe">
The team points liveness at `/readyz`, which pings Postgres. Postgres has a 30-second hiccup. Kubernetes kills every pod, simultaneously. Now Postgres is fine but the service is not. **Fix:** liveness checks process health only; readiness checks dependencies.
</Pitfall>

## Lab

<Lab title="Full observability kit for a Node.js service" duration="90 min" difficulty="Medium" stack="Node.js, pino, prom-client, OpenTelemetry, Prometheus, Grafana, Jaeger">

### Goal
Instrument an existing service so one trace id ties request logs, metrics, and a distributed trace together. Define one SLO and write the alert and runbook for it.

### Steps
1. Add `src/logger.ts` with pino, AsyncLocalStorage-based mixin, and a redaction list.
2. Add `src/metrics.ts` exposing `/metrics` on port 9464 with `http_requests_total` and `http_request_duration_seconds`.
3. Add `src/tracing.ts` and run with `node --import ./dist/tracing.js dist/server.js`. Add an outbound call that appears as a child span.
4. Run Prometheus, Grafana, and Jaeger via docker-compose.
5. Define an SLO: "99.5% of `POST /orders` return 2xx within 500 ms over 30 days." Write the Prometheus rule and alert.
6. Write `runbooks/api-error-rate.md` with the first 60 seconds.
7. Game-day: introduce a latency fault (e.g., `toxiproxy` adds 800 ms). Confirm the alert fires, the trace shows the slow span, the log line for that request carries the same trace id.

### Success criteria
- A request's `x-trace-id` response header matches the trace id in Jaeger and every log line for that request
- `/metrics` has no high-cardinality labels (verify: `curl :9464/metrics | wc -l` stays stable under load)
- Alert fires within 5 minutes of the fault and the linked runbook is actionable
- Graceful shutdown drains in-flight requests: during rolling deploy, error rate stays flat
- SLO dashboard shows the error budget remaining, as a percentage, updated continuously

</Lab>

## Checkpoint

<Checkpoint>
1. Give one SLI for a user-facing read API and one for an event-processing worker.
2. Why must route labels on metrics be patterns (`/users/:id`) and never actual paths?
3. Your alert fires every night at 2am but users are always fine. Diagnose.
4. A request fails. You have the error message but not the trace. What did you forget to wire up?
5. You have 10 minutes of error budget left for the month. Do you ship a risky feature? Why or why not?
</Checkpoint>

## Further reading

- [CI, CD, Release Flow, and Deployment](/learning/devops/ci-cd-release-flow-and-deployment/) — how SLOs gate your canary promotion
- [Modern DevOps Coverage](/learning/devops/modern-devops-coverage/) — Datadog, Honeycomb, Grafana Cloud, Sentry
- [Performance: profiling and the event loop](/learning/performance/performance-profiling-event-loop/) — when metrics say slow, this is how you find out why
