---
title: Modern System Design Coverage
slug: learning/system-design/modern-system-design-coverage
description: Coverage map for the system design and microservices learning track, including scale, service boundaries, messaging, resilience, and consistency tradeoffs.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="10 min" track="System Design" prerequisites="The other pages in this track" />

The system-design toolbox in 2026 is bigger than any one team needs. This page is an opinionated map — which tool solves which problem, and what it replaces. Use it to recognise tools in architecture diagrams and to pick a short list when you have to build something new.

<KeyConcept title="Tools follow patterns, not the other way around">
Learn the patterns — outbox, saga, competing consumers, CQRS, strangler-fig — and the tool becomes obvious. Memorise tools first and you will choose a saga orchestrator for something a single Postgres transaction could do.
</KeyConcept>

## Messaging and streaming

- **Apache Kafka** — durable, partitioned, replayable log. The default for event streaming at scale. Operationally heavy; run Confluent Cloud or AWS MSK unless you are committed.
- **Redpanda** — Kafka-wire-compatible, no JVM, single binary. Good fit if you like Kafka's model but not Kafka's ops.
- **NATS JetStream** — lightweight streaming and pub/sub in one. Fastest to operate for small teams; pull consumers, subject hierarchy, key/value buckets included.
- **RabbitMQ** — the classic AMQP broker. Best at complex routing (topic exchanges, direct exchanges, dead-letter bindings) and at strict per-message semantics.
- **AWS SQS + SNS** — managed pub/sub + work queue. Zero ops. No replay, no ordering across partitions, but the boring choice that works.
- **Google Pub/Sub, Azure Service Bus** — equivalent managed options on other clouds.

<Callout type="tip" title="If in doubt, NATS or SQS">
Both give you a correct messaging primitive with almost zero ops. Move to Kafka/Redpanda only when you need replayable history or very high per-partition throughput. "We might need Kafka one day" is not a reason to run Kafka today.
</Callout>

## Workflow orchestration

- **Temporal** — durable function executions with automatic retries, versioning, timers, signals. If your saga is complex enough to need a coordinator, this is the one. First-class Node.js SDK.
- **AWS Step Functions** — state-machine-based orchestration. Good when you want the orchestrator off your servers; limited programmability.
- **Inngest** — event-driven workflows with a nice Node DX; lighter than Temporal, sweet spot for teams under ~30 engineers.
- **BullMQ** — Redis-backed job queue with delayed jobs, cron, rate limiting, groups. Great for background tasks; not a general workflow engine.

## Service-to-service communication

- **gRPC** — contract-first, binary, HTTP/2. Worth the investment for internal APIs with high volume or strict schemas. Code-gen across languages is real.
- **JSON over HTTP + OpenAPI** — the default for public APIs and most internal ones. Generate clients with openapi-typescript-codegen or oazapfts.
- **GraphQL** — when the consumer set is genuinely diverse (web, mobile, partners) and needs to fetch arbitrary shapes. Federation (Apollo, Hive) scales it across teams.
- **tRPC** — TypeScript-only RPC. Great when both ends are Node/TS; pay attention before choosing it for a polyglot org.
- **Service mesh** (Istio, Linkerd, Consul Connect) — mTLS, retries, timeouts, traffic shifting at the infrastructure layer. Adopt only after you have three+ teams and mesh-level policy is actually required.

## Data and storage patterns

- **Postgres + pgbouncer** — the default until it is not. Logical replication, JSONB, partitioning, generated columns, and a strong feature list cover most needs.
- **CockroachDB, YugabyteDB** — Postgres wire-compatible, horizontally scalable. Consider when you truly need multi-region writes.
- **DynamoDB, Bigtable, Cassandra** — wide-column key/value at scale. Trade flexible querying for predictable performance.
- **Redis (and KeyDB, Dragonfly)** — cache, rate limits, ephemeral data, pub/sub.
- **ClickHouse, DuckDB, Pinot** — analytics and real-time aggregation on columnar storage. Complement, not replace, your transactional DB.
- **Elasticsearch / OpenSearch, Meilisearch, Typesense** — text search. Meilisearch and Typesense are the easy-to-operate choices; OpenSearch is what you reach for when you also need logs and aggregations.

## Migration and evolution patterns

- **Strangler-fig** — new service wraps the legacy one; endpoints migrate behind a gateway one at a time until the legacy is dead.
- **Branch-by-abstraction** — introduce an interface, keep both implementations working, cut over module by module.
- **Expand/contract for schemas** — add new columns nullable, dual-write, migrate reads, drop old.
- **Shadow traffic** — send a copy of production traffic to the new service, compare responses, catch regressions before cutover.

## Observability for distributed systems

- **OpenTelemetry** — trace/metric/log SDK spec. Non-negotiable at this point.
- **Jaeger, Tempo, Honeycomb, Lightstep/ServiceNow Cloud Observability** — trace backends, each with a different strength (Honeycomb for high-cardinality queries; Tempo for the open stack).
- **Prometheus + Grafana** — metrics + dashboards; the open default.
- **Datadog, New Relic, Dynatrace** — full-stack SaaS; pay to not run your own observability stack.

## Security and supply chain

- **SLSA levels** — a framework for build-provenance. SLSA 2 is reachable with GitHub Actions + `actions/attest-build-provenance`; SLSA 3+ is the realm of hardened, isolated builders.
- **Sigstore / cosign** — sign images with a keyless OIDC identity. Verify signatures at deploy time.
- **OPA / Kyverno** — policy-as-code for admission control (no service can run without a signed image, without limits, as root, etc.).
- **SPIFFE / SPIRE** — cryptographic workload identity. Useful once you have many services authenticating to each other.

## Event-driven architecture reading list

Recognise these in diagrams:

- **CQRS** — split the command model (writes) from the query model (reads). Reads are derived, eventually consistent.
- **Event sourcing** — the source of truth is an append-only log; current state is a projection. Powerful, expensive to learn.
- **Outbox pattern** — transactional publish via a database table, covered on the messaging page.
- **Choreography vs orchestration** — choreographed sagas have no central coordinator; each service reacts to events. Orchestrated sagas have one (e.g., Temporal).
- **Request/reply over message bus** — sometimes appropriate (async RPC, slow backend); usually a code smell.

## A sensible starter stack for a new product in 2026

If you were building a new Node.js backend product today and had to commit quickly:

- Language: TypeScript on Node 22 LTS.
- HTTP: Fastify or Hono; zod for validation.
- Data: Postgres primary + pgbouncer, Redis for cache and rate limits.
- Messaging: start with a single-node NATS JetStream or AWS SQS+SNS.
- Auth: an IdP (WorkOS, Clerk, Auth0) — do not build yours.
- Observability: OpenTelemetry SDK + Grafana Cloud or Datadog.
- Orchestration: Fly.io or Cloud Run; Kubernetes only past ~20 services.
- Workflow engine: defer until you need one. Temporal when you do.

<Callout type="info" title="Every row is a decision you must defend">
The point of the list is not "copy this." It is "be able to say why you chose each." If you cannot defend one choice, you have an open risk in your architecture — add it to the list of things to revisit.
</Callout>

## Further reading

- [System Design Fundamentals and Scalability](/learning/system-design/system-design-fundamentals-and-scalability/)
- [Microservices Boundaries and Data Consistency](/learning/system-design/microservices-boundaries-and-data-consistency/)
- [Messaging, Resilience, and Distributed Tradeoffs](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/)
- [Labs, Projects, Interview Questions, Case Studies](/learning/system-design/labs-projects-interview-case-studies/)
