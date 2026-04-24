---
title: Glossary
description: Plain-English definitions for the backend, Node.js, and distributed-systems terms used throughout the academy.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Reference" track="All tracks" />

A quick, honest glossary of terms used across the academy. Definitions are short on purpose — enough to decode a page or a stand-up, with links back to the full lesson where the term earns its depth.

<Callout type="tip" title="How to use this page">
Skim when you hit a term you can't define. If you still can't define it after reading the entry, follow the link. Don't memorize the glossary — memorize the mental model.
</Callout>

## Runtime & language

**Event loop** — The Node.js scheduler that runs JavaScript, I/O callbacks, and timers on a single thread across phases (timers, pending, poll, check, close). Blocking the loop blocks every in-flight request. See [Event loop lesson](/learning/performance/performance-profiling-event-loop/).

**Microtask queue** — Promise callbacks and `queueMicrotask()` work, drained between phases of the event loop. Always runs before the next tick of the loop.

**Event-loop lag** — How long the loop takes to come back around. Measured with `monitorEventLoopDelay`. Healthy p99 is under 10 ms.

**Backpressure** — The mechanism by which a stream consumer signals &ldquo;slow down&rdquo; to its producer. Ignoring it causes memory blowup.

**Stream** — A lazy, chunked abstraction over data. Readable, Writable, Duplex, Transform. Preferred over buffering for anything large.

**ESM / CJS** — ECMAScript Modules (`import`/`export`) vs CommonJS (`require`). New projects should use ESM; know the interop quirks for legacy libraries. See [Project setup](/learning/tooling/project-setup-scripts-configuration/).

**Top-level `await`** — Using `await` at module scope in ESM. Handy for config; can slow cold start if overused.

**AsyncLocalStorage** — Node's mechanism to carry context (request id, user id) through async work without passing it explicitly. See [Debugging & logging](/learning/testing/debugging-logging-diagnostics/).

**Worker thread** — A separate V8 isolate used to do CPU-heavy work without blocking the main thread. See [Scaling lesson](/learning/performance/scaling-reliability-and-capacity/).

**Cluster** — A Node module that forks one process per CPU core. In production, prefer running one process per container/pod.

## HTTP & API

**Idempotent** — An operation that produces the same result whether called once or many times. `GET`, `PUT`, `DELETE` are idempotent; `POST` is not unless you add an idempotency key.

**Idempotency key** — A client-generated identifier that a server uses to deduplicate retries of an unsafe request. Essential for payments and webhook handlers.

**Middleware** — A function in the request pipeline that can inspect/modify the request, short-circuit a response, or call `next()` to continue. See [Middleware lifecycle](/learning/nodejs/express/middleware-request-lifecycle/).

**Content negotiation** — The mechanism (`Accept`, `Accept-Encoding`) by which server and client pick a response format/encoding.

**REST** — An API style using HTTP verbs on resource URIs. Usually with JSON. The practical definition.

**GraphQL** — A query language that lets clients ask for exactly the fields they need. Trades specification complexity for client flexibility. See [GraphQL lesson](/learning/realtime/graphql-grpc-and-advanced-api-shapes/).

**gRPC** — A binary RPC protocol over HTTP/2. Fast, typed via `.proto` files, great for service-to-service.

**WebSocket** — Full-duplex TCP-over-HTTP upgrade for real-time client/server communication. See [Real-time lesson](/learning/realtime/websockets-socketio-and-sse/).

**SSE (Server-Sent Events)** — One-way streaming over HTTP from server to client. Simpler than WebSockets when you don't need client-to-server messages.

**OpenAPI** — A specification format (YAML/JSON) that describes REST APIs in a machine-readable way. Generate clients, docs, and fuzzing tests from it.

## Data & persistence

**ACID** — Atomicity, Consistency, Isolation, Durability — the transactional guarantees of traditional relational databases. See [Queries & transactions](/learning/databases/queries-indexes-transactions-migrations/).

**Isolation level** — How much one transaction can see of another's in-flight changes. Read committed, repeatable read, serializable. Default in Postgres is read committed.

**CAP theorem** — In a partitioned distributed system, you can have Consistency or Availability, not both. See [Messaging & resilience](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/).

**PACELC** — CAP's sharper cousin: during a Partition, pick A or C; Else (no partition), pick Latency or Consistency.

**Eventual consistency** — All replicas will agree, eventually. You trade immediate read-after-write for availability / scale.

**CQRS** — Command-Query Responsibility Segregation. Reads and writes use different models. Overhead; earns its keep at scale.

**Outbox pattern** — Writing a domain event to a local outbox table inside the same transaction as the business write, then publishing it reliably. See [Messaging lesson](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/).

**Saga** — A long-running multi-service transaction coordinated with compensating actions instead of 2PC.

**Index** — A data structure (typically B-tree) that speeds up specific query shapes at the cost of extra writes and disk.

**Covering index** — An index that contains all columns a query needs, so the DB can answer from the index alone without touching the table.

**Sharding / partitioning** — Splitting data across multiple nodes by a shard key. Adds horizontal scale; complicates cross-shard queries.

**Replica** — A copy of the primary database that follows its writes. Used for read scaling, failover, analytics.

## Security

**AuthN vs AuthZ** — Authentication proves **who** you are. Authorization decides **what** you can do. Different failure modes; different tests.

**JWT** — JSON Web Token. A signed, stateless token. Good for auth claims across services; bad for long-lived sessions (revocation is hard). See [Auth lesson](/learning/security/authentication-sessions-jwt-oauth/).

**OAuth 2.1 / OIDC** — Protocols for delegated authorization and identity. PKCE is mandatory for public clients.

**RBAC / ABAC / ReBAC** — Role-based, attribute-based, relationship-based access control. Most systems start with RBAC and graduate to ABAC when policies get conditional. See [Authorization lesson](/learning/security/authorization-rbac-abac-ownership/).

**CSRF** — Cross-Site Request Forgery. An attack using a user's authenticated browser to perform unintended actions. Mitigated with SameSite cookies, tokens, origin checks.

**CORS** — Cross-Origin Resource Sharing. Browser-enforced rules about which origins can read responses from your API.

**argon2id** — The recommended password-hashing algorithm. Memory-hard; resistant to GPU cracking. Prefer over bcrypt for new systems.

**Rate limit** — A cap on requests per key per window. Essential for public endpoints; implemented per-IP, per-token, or per-account.

## Testing & quality

**Test pyramid** — A healthy distribution: many fast unit tests, fewer integration tests, a small number of end-to-end/API tests. See [Test layers](/learning/testing/unit-integration-api-testing/).

**Fixture** — Pre-defined data a test reads from. Named (&ldquo;alice&rdquo;, &ldquo;bob&rdquo;) for readability; static for determinism.

**Mock / stub / fake** — Stub returns canned data. Fake is a working in-memory replacement. Mock records calls and enforces expectations. Different tools for different jobs. See [Mocking & fixtures](/learning/testing/mocking-fixtures-contracts-test-data/).

**Contract test** — A test that pins the **shape** of a cross-service interaction, so producers can't break consumers without CI knowing. Pact is the canonical tool.

**Flaky test** — A test that sometimes passes and sometimes fails with no code change. Almost always a signal of a real race or timing bug in the code, not the test.

**Coverage** — The percentage of code that ran during tests. A diagnostic, not a target. Chasing the number produces empty assertions.

## Performance & scaling

**p50 / p95 / p99** — Median, 95th percentile, 99th percentile latency. p99 is the tail that users remember. Never report means.

**SLI / SLO / SLA** — Service Level Indicator (what you measure), Objective (what you promise yourself), Agreement (what you promise externally). See [Observability](/learning/devops/observability-runtime-operations-and-runbooks/).

**Error budget** — `100% - SLO`. The allowed rate of failure in a period. When you burn it, stop shipping features and fix reliability.

**Cache stampede / thundering herd** — Many concurrent requests missing the same expired cache key and all hitting the backend simultaneously. Fix with single-flight locks or staggered TTLs. See [Caching](/learning/performance/caching-strategies-and-consistency/).

**Backpressure (networking)** — Same idea as the stream definition above, applied to queues and service calls.

**Bulkhead** — A separate resource pool (connection pool, thread pool) per dependency so one slow downstream cannot starve unrelated calls.

**Circuit breaker** — A wrapper around a call that stops trying after too many failures and fails fast until the downstream recovers.

**Load shedding** — Deliberately returning 503 to some requests during overload so the rest stay fast.

**Little's Law** — `L = λ × W`. Concurrent items = arrival rate × time in system. Use to size connection pools and concurrency limits.

## DevOps & operations

**CI / CD** — Continuous Integration (every commit tested) + Continuous Delivery/Deployment (every successful build deployable).

**Blue/green** — Two identical environments; cut traffic from blue to green on deploy, keep blue for instant rollback.

**Canary** — Ship new version to a small percentage of traffic first, watch metrics, roll forward or back.

**Feature flag** — A runtime switch that decouples &ldquo;deployed&rdquo; from &ldquo;released.&rdquo; Also used for A/B tests and gradual rollouts.

**Runbook** — A short document describing how to diagnose and respond to a specific failure mode. The thing you read at 2 a.m.

**Observability** — The ability to answer new questions about your system from its output without shipping code. Metrics + logs + traces.

**Trace** — A causal graph of spans (units of work) across one request or job, typically using OpenTelemetry.

**Distroless image** — A container image with just your app and its runtime — no shell, no package manager. Smaller attack surface, smaller size.

**Graceful shutdown** — A SIGTERM-aware process that finishes in-flight work, closes connections, and exits cleanly. See [Project setup](/learning/tooling/project-setup-scripts-configuration/).

## Messaging & event-driven

**Queue** — A list of jobs processed by workers, usually with retries and a dead-letter target. BullMQ is the default in Node land. See [Queues & jobs](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/).

**DLQ (dead-letter queue)** — Where messages land when they've failed the retry budget. Inspected, not silently dropped.

**At-most-once / at-least-once / exactly-once** — Delivery semantics. &ldquo;Exactly once&rdquo; is a marketing claim; realistic systems aim for at-least-once + idempotent consumers.

**Pub/sub** — A messaging pattern where publishers fan out to many subscribers. Good for decoupling; not always durable.

**Event sourcing** — Storing state as the sequence of events that produced it, then deriving current state on read. Adds complexity; earns it for audit-heavy domains.

## Architecture

**Bounded context** — A DDD term: a specific part of the domain with its own language and model. Microservice boundaries usually map to bounded contexts. See [Architecture](/learning/architecture/modular-monolith-patterns-and-pragmatism/).

**Modular monolith** — One deployable with internal module boundaries as strict as if they were services. Often the right first architecture.

**Hexagonal / Ports &amp; Adapters** — The domain core depends on no framework; &ldquo;ports&rdquo; are interfaces the core defines and &ldquo;adapters&rdquo; are where the outside world plugs in. See [Clean architecture](/learning/architecture/clean-architecture-and-dependency-flow/).

**Dependency inversion** — High-level modules define abstractions; low-level modules implement them. The arrow points inward, not downward.

**Anti-corruption layer** — A translation layer between your domain and an external system's model, so their mess doesn't leak into yours.

## A note on this glossary

This list is opinionated and will grow with the site. If a term in a lesson is missing here, open an issue or PR with the suggested entry — entries should be under 40 words and link back to the lesson that earns the depth.
