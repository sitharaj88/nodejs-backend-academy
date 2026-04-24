---
title: Modern Performance Coverage
slug: learning/performance/modern-performance-coverage
description: Modern performance stack for Node.js — clinic, 0x, autocannon, k6, Grafana k6 Cloud, OpenTelemetry, and how to wire end-to-end observability.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="12 min" track="Performance" />

The performance toolchain in 2025 has a clear shape. This page is the opinionated stack — what to reach for and in what order.

## Load generation

| Tool | Use it for |
| --- | --- |
| **autocannon** | Quick local checks, smoke tests. `npx autocannon -c 100 -d 30 URL`. |
| **k6** | Scripted scenarios, ramps, SLO checks. Runs in CI. |
| **Artillery** | YAML scenarios, good for complex flows with state. |
| **wrk2** | Steady-state throughput targeting, classic. |

```js
// k6 scenario
import http from 'k6/http'
import { check } from 'k6'
export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: { http_req_duration: ['p(99)<250'] },
}
export default function () {
  const r = http.get('https://api.test/products')
  check(r, { 200: (x) => x.status === 200 })
}
```

## Profiling

- **clinic.js** — bundles `clinic doctor` (health), `clinic flame` (CPU), `clinic bubbleprof` (async).
- **0x** — classic flame graph generator; works well with production-like builds.
- **`--cpu-prof` / `--heap-prof`** — built-in, zero-dep; visualize in Chrome DevTools.

## Instrumentation

- **prom-client** — Prometheus metrics (`http_request_duration_seconds`, `nodejs_eventloop_lag_seconds`).
- **OpenTelemetry** — traces and metrics with broad backend support (Jaeger, Tempo, Datadog, Honeycomb).
- **`pino` + structured logs** — searchable per-request context.

```ts
// prom-client minimal integration
import client from 'prom-client'
const reqDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
})
app.use((req, res, next) => {
  const end = reqDuration.startTimer({ method: req.method, route: req.route?.path ?? 'unmatched' })
  res.on('finish', () => end({ status: res.statusCode }))
  next()
})
```

## The SLO-driven loop

1. Define an SLO — e.g. &ldquo;p99 of `GET /products` ≤ 200 ms, measured over 7 days.&rdquo;
2. Expose the signal as a metric with the right labels.
3. Put a dashboard on it and an alert on sustained budget burn.
4. When the alert fires, profile, fix, re-load-test against the SLO.

<Callout type="tip" title="Performance is a habit">
Run the same k6 scenario in CI on every merge. Track the numbers in a time-series dashboard. Regressions that would have been invisible become obvious the day they ship.
</Callout>

## Language-level speed ups

- **Fastify** over Express when raw throughput matters (≈2× the requests/sec on identical hardware).
- **`undici`** for outbound HTTP; faster and more correct than `node-fetch`.
- **Native `fetch`** (Node 20+) is `undici` under the hood.
- **`sonic-boom`** for synchronous-looking async logging at high throughput.
- **Avoid** premature C++ addons. JS is fast enough in most cases; the addon overhead and complexity rarely pays off.

## Further reading

- [Profiling & the Event Loop](/learning/performance/performance-profiling-event-loop/)
- [Caching Strategies](/learning/performance/caching-strategies-and-consistency/)
- [Scaling & Capacity](/learning/performance/scaling-reliability-and-capacity/)
- [DevOps: observability &amp; runbooks](/learning/devops/observability-runtime-operations-and-runbooks/)
