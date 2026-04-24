---
title: Debugging, Logging, and Diagnostics
slug: learning/testing/debugging-logging-diagnostics
description: Turn debugging from guesswork into structured technique. Reproduce failures on purpose, write logs that survive an incident, and use the Node.js inspector like a senior engineer.
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

<LessonMeta level="Intermediate" duration="24 min" track="Testing" prerequisites="Async/await, basic Express" />

Debugging is not a personality trait. It is a workflow: reproduce, isolate, prove, fix, regression-test. This page teaches the workflow and the tooling — structured logs, the Node.js inspector, and the production habits that make debugging possible at 2 a.m.

<Objectives>
- Run the five-step debugging loop on any bug, every time
- Write structured logs with context that survives an outage
- Use the Node.js inspector and VS Code breakpoints to skip `console.log` spelunking
- Correlate logs, traces, and metrics with a single request id
</Objectives>

## The debugging workflow

<Diagram caption="Any bug report becomes one of these five steps.">
  <svg viewBox="0 0 640 170" role="img" aria-label="Debugging loop">
    <defs>
      <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="55" width="110" height="60" rx="8" fill="#dff5e5" stroke="#2f8f46" />
      <text x="75" y="82" text-anchor="middle" font-weight="800">Reproduce</text>
      <text x="75" y="100" text-anchor="middle" font-size="10" fill="#596579">make it fail on demand</text>

      <rect x="150" y="55" width="110" height="60" rx="8" fill="#e9f4fb" stroke="#087ea4" />
      <text x="205" y="82" text-anchor="middle" font-weight="800">Isolate</text>
      <text x="205" y="100" text-anchor="middle" font-size="10" fill="#596579">bisect, narrow inputs</text>

      <rect x="280" y="55" width="110" height="60" rx="8" fill="#fef3d7" stroke="#b7791f" />
      <text x="335" y="82" text-anchor="middle" font-weight="800">Prove</text>
      <text x="335" y="100" text-anchor="middle" font-size="10" fill="#596579">what is, not what you think</text>

      <rect x="410" y="55" width="110" height="60" rx="8" fill="#fde4e1" stroke="#b42318" />
      <text x="465" y="82" text-anchor="middle" font-weight="800">Fix</text>
      <text x="465" y="100" text-anchor="middle" font-size="10" fill="#596579">smallest change that holds</text>

      <rect x="540" y="55" width="90" height="60" rx="8" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="585" y="82" text-anchor="middle" font-weight="800">Regress</text>
      <text x="585" y="100" text-anchor="middle" font-size="10" fill="#596579">add a test</text>

      <g stroke="#596579" stroke-width="1.5" fill="none" marker-end="url(#arr)">
        <path d="M130 85 h20" />
        <path d="M260 85 h20" />
        <path d="M390 85 h20" />
        <path d="M520 85 h20" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Reproduce before you guess">
A bug you cannot reproduce is a hypothesis. Until you can trigger the failure on demand, every &ldquo;fix&rdquo; is a guess that may or may not hold. Invest minutes in a reliable repro; save hours in churn.
</KeyConcept>

## Structured logs — the debugger you get in production

`console.log` is not a strategy. Production debugging depends on logs that are:

1. **Structured** — JSON with typed fields a tool can filter on
2. **Contextual** — carry `requestId`, `userId`, `tenantId` through every log in a chain
3. **Actionable** — log enough to explain the failure without logging the world

```ts
// src/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'orders', env: process.env.NODE_ENV },
  redact: ['req.headers.authorization', '*.password', '*.token'],
  formatters: { level: (label) => ({ level: label }) },
})
```

```ts
// src/requestContext.ts — carry request id through async work
import { AsyncLocalStorage } from 'node:async_hooks'

type Ctx = { requestId: string; userId?: string }
export const requestContext = new AsyncLocalStorage<Ctx>()

export function withContext<T>(ctx: Ctx, fn: () => Promise<T>): Promise<T> {
  return requestContext.run(ctx, fn)
}

export function ctxLogger() {
  const ctx = requestContext.getStore()
  return ctx ? logger.child(ctx) : logger
}
```

```ts
// src/middleware/requestLog.ts
import { randomUUID } from 'node:crypto'
import { withContext, ctxLogger } from '../requestContext'

export function requestLog(req, res, next) {
  const requestId = req.headers['x-request-id'] ?? randomUUID()
  res.setHeader('x-request-id', requestId)
  const start = process.hrtime.bigint()

  withContext({ requestId, userId: req.user?.id }, async () => {
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6
      ctxLogger().info(
        { method: req.method, path: req.path, status: res.statusCode, ms },
        'request.complete',
      )
    })
    next()
  })
}
```

<Callout type="tip" title="Log events, not sentences">
`logger.info({ userId, action: 'password.reset.requested' })` is queryable.<br />
`logger.info('User asked to reset password')` is prose. Tools index the first; humans skim the second and miss 90%.
</Callout>

## Log levels that mean something

<Compare badLabel="Inconsistent levels" goodLabel="Shared convention">
<Fragment slot="bad">
```
INFO  validation failed
INFO  database error
INFO  user created
ERROR user not found   ← normal 404
```
On-call cannot page on `ERROR` — half are expected.
</Fragment>
<Fragment slot="good">
```
INFO  user.created
INFO  user.not_found       ← expected, for analytics only
WARN  db.retry              ← degraded, not broken
ERROR db.connection_failed  ← page-worthy
```
`ERROR` is rare and actionable. Dashboards and alerts work.
</Fragment>
</Compare>

**A working convention:**

- `DEBUG` — high-volume detail, off in production
- `INFO` — normal, meaningful events (requests, jobs, state transitions)
- `WARN` — unexpected but handled (retried, degraded)
- `ERROR` — unhandled, requires attention

## The Node.js inspector

`node --inspect` exposes the Chrome DevTools protocol. VS Code ships an integration out of the box.

```bash
node --inspect-brk dist/server.js
# VS Code "Attach to Node process" → pick 9229
```

Or with the built-in debugger run config:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug server",
  "runtimeExecutable": "tsx",
  "args": ["src/server.ts"],
  "skipFiles": ["<node_internals>/**"],
  "env": { "LOG_LEVEL": "debug" }
}
```

<Callout type="success" title="Debug tests, not the terminal">
Put a breakpoint inside a failing Vitest test and run `vitest --inspect-brk --no-file-parallelism`. You step through the exact state that produced the failure — no `console.log` scatter.
</Callout>

## Tracing and correlation

For anything beyond a single service, add OpenTelemetry so the `requestId` you log locally links to spans across services.

```ts
// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
}).start()
```

## Pitfalls

<Pitfall title="Logs without request id">
Production is on fire. Logs show 4,000 lines per second across 30 pods. Nothing ties one user's report to one log line. **Fix:** request id in every log, echoed in response header, propagated to downstream services.
</Pitfall>

<Pitfall title="Secrets in logs">
An otherwise great logger prints `req.body` which includes `password`. A replication to a log warehouse quietly stores millions of plaintext passwords. **Fix:** redact at the logger level, not at call sites. Treat leaks as security incidents.
</Pitfall>

<Pitfall title="console.log left in production">
`console.log` bypasses your logger's levels, context, redaction, and sinks. It also cannot be turned off. Lint against it. Fail CI if it appears outside `test/`.
</Pitfall>

## Lab

<Lab title="Debug a broken feature using the workflow" duration="50 min" difficulty="Medium" stack="Node.js, Express, pino, Vitest">

### Goal
You will receive a small Express service with a known, non-obvious bug: `PATCH /orders/:id/cancel` succeeds for canceled orders it shouldn't. Find it using the five-step workflow.

### Steps
1. **Reproduce.** Write a failing Vitest test that sends a cancel request for an already-canceled order and expects 409.
2. **Isolate.** Add a request id to logs. Confirm the failing test produces the id in the log output.
3. **Prove.** Set a breakpoint in the service; inspect the order state read from the repository. Screenshot or copy the value.
4. **Fix.** Change the guard to check state before mutating. Ship the smallest diff.
5. **Regress.** Keep the test from step 1 as the regression test. Add one more for the other forbidden transition (canceled → shipped).

### Success criteria
- The failing test fails before the fix and passes after
- Every log line for the failing request carries the same request id
- No `console.log` remains in `src/`
- A new colleague could rerun the repro from your commit message alone

</Lab>

## Checkpoint

<Checkpoint>
1. What are the five steps of the debugging loop, in order?
2. Name three fields every production log should carry.
3. When is `ERROR` the correct level, and when is `WARN` better?
4. How do you attach the VS Code debugger to a running Node.js server?
5. You see a log line with a stack trace but no request id. What is the first thing you change in the codebase?
</Checkpoint>

## Further reading

- [Unit, Integration, API Testing](/learning/testing/unit-integration-api-testing/) — writing the repro test
- [Performance: profiling &amp; the event loop](/learning/performance/performance-profiling-event-loop/)
- [DevOps: observability &amp; runbooks](/learning/devops/observability-runtime-operations-and-runbooks/)
