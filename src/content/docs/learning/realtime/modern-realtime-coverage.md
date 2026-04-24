---
title: Modern Real-Time Coverage
slug: learning/realtime/modern-realtime-coverage
description: Coverage map for the real-time and advanced APIs learning track, including WebSockets, SSE, jobs, queues, webhooks, GraphQL, and gRPC.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'

<LessonMeta level="Intermediate" duration="10 min" track="Real-Time & Advanced APIs" prerequisites="The rest of this track" />

The real-time and advanced-API ecosystem in Node.js is bigger than any one team needs, and most of it overlaps. This page is the lookup table: what each library is for, what it costs, and what you should actually reach for when the problem is in front of you.

<Objectives>
- Recognise the standard Node.js libraries for each communication shape
- Choose between comparable options (ws vs Socket.IO, Apollo vs Yoga, BullMQ vs NATS) on grounds you can defend
- Know where the marketing ends and the operational weight begins
- Pick the smallest tool that solves today's problem without boxing in tomorrow
</Objectives>

## Connection-based transports

### `ws`

Minimal WebSocket implementation. Zero dependencies, RFC-6455 compliant, fast. Use it when you want the protocol and nothing else. You will write your own message framing, rooms, and reconnect.

### Socket.IO

Namespaces, rooms, acknowledgements, reconnection with state recovery, transport fallback, the `@socket.io/redis-adapter` for multi-pod scale. The right default for browser-connected real-time features. Requires `socket.io-client`; not a plain WebSocket endpoint.

### `uWebSockets.js`

Absurdly fast (millions of connections per pod), tiny memory footprint, native C++ backend. Worth it at scale; overkill for most. Different API from `ws` — porting is not a drop-in.

### Server-Sent Events

No library needed — it is an HTTP response with `Content-Type: text/event-stream`. Built into every browser as `EventSource`. The right choice for one-way server push (dashboards, notifications, log tails).

### WebTransport

HTTP/3-based, QUIC, datagrams + streams. Promising, but browser and server support is still uneven. Track it; do not bet production on it yet.

<Callout type="info" title="The boring answer is usually SSE">
A surprising number of &ldquo;we need WebSockets&rdquo; features are server push only. SSE is cheaper to run, cheaper to debug, cheaper to scale, and works through every CDN. Reach for WebSockets when you genuinely need client-to-server frames.
</Callout>

## GraphQL

### Servers

- **`graphql-yoga`** — fast, minimal, modern. First choice for new servers.
- **`@apollo/server`** — bigger, feature-rich, tied to the Apollo ecosystem (Federation, Studio). Pick when you need Federation across multiple services.
- **Mercurius** — Fastify-native alternative.

### Schema builders

- **Pothos** — code-first TypeScript schema, excellent type inference, great plugin ecosystem. Default choice.
- **Nexus** — older code-first approach. Still works; Pothos is more active.
- **Schema-first with `graphql-tools`** — you write SDL, it compiles. Good for teams that prefer the schema language as the source of truth.

### Essentials

- **DataLoader** — batches and deduplicates per-request. Non-negotiable in production.
- **`graphql-query-complexity`** / **`graphql-depth-limit`** — stop malicious or accidental N×M queries.
- **Persisted queries** — send a hash instead of the query text; reject unknown hashes.

## gRPC and RPC variants

- **`@grpc/grpc-js`** — pure JS, the official Node.js gRPC. Does not require native builds.
- **`@bufbuild/connect`** (Connect RPC) — gRPC-compatible but speaks HTTP/1.1 JSON too. Works in browsers without a proxy. Strong Buf ecosystem for `.proto` management.
- **Twirp** — similar idea, smaller surface. Good for Go-interop teams.

<Pitfall title="Browser gRPC is not free">
Vanilla gRPC needs HTTP/2 trailer frames browsers cannot read. gRPC-Web requires a proxy (Envoy, Traefik) to translate. Connect RPC avoids the proxy at the cost of adding another wire format.
</Pitfall>

## Full-stack TypeScript

- **tRPC** — type-shared client-server calls in a monorepo. Great for solo devs and small teams shipping full-stack TS apps.
- **Server Actions / RSC** (Next.js, Remix) — the framework takes over the wire format entirely. Simple for form-shaped interactions; leaky for anything complex.

## Queues, jobs, and messaging

### Redis-based

- **BullMQ** — the default. Delayed jobs, priorities, rate limits, repeatable jobs, flows. Redis streams under the hood. Dashboards: BullBoard, Taskforce.
- **Bee-Queue** — simpler, faster for narrow use cases; much less active than BullMQ.

### Broker-based

- **NATS / NATS JetStream** — tiny (one binary), very fast, at-most-once by default; JetStream adds durability and at-least-once with replay. Excellent for service-to-service events.
- **Apache Kafka** — log-structured, retention, replay, high throughput. Worth it when you have real event-sourcing needs or multiple consumers replaying history. Overkill for &ldquo;send welcome email.&rdquo;
- **Google Pub/Sub, AWS SQS, Azure Service Bus** — managed queues. Great when you are already in one of those clouds.
- **RabbitMQ** — mature AMQP broker. Rich routing (topics, fanouts). Losing ground to NATS and Kafka for new work.

### Cron and scheduling

- **`node-cron`** or **BullMQ `repeat`** — in-process. Fine for one instance.
- **Temporal** — workflow orchestration with durable state. Use when "this thing takes hours or days, survives restarts, and has compensating actions on failure" is a real requirement.

<Callout type="tip" title="Start with BullMQ">
For 90% of Node.js teams, BullMQ over a Redis you already run is the right answer. Reach for NATS or Kafka when scale, retention, or multi-language consumers make BullMQ awkward.
</Callout>

## Observability you will want on day two

- **OpenTelemetry** — standardised traces, metrics, logs. SDKs for Express, Fastify, Socket.IO, grpc-js, BullMQ. Export to Jaeger, Tempo, Honeycomb, Datadog.
- **Sentry** — for errors across HTTP handlers and background workers. Integrates with BullMQ via `@sentry/bullmq`.
- **pino + request id via AsyncLocalStorage** — structured logs, per-request correlation.

## Webhook-specific tools

- **Svix / Hookdeck / Inngest** — managed webhook delivery (outbound) and reliable processing (inbound). Take the retry, dedup, and backoff problems off your plate. Worth considering once you have more than a handful of outbound integrations.
- **ngrok** / **tunnelmole** — local dev tunnels for webhook testing. Essential.

## Load and contract testing

- **`autocannon`** — HTTP load tester written in Node.
- **`ghz`** — gRPC load tester.
- **k6** — richer scripted load testing.
- **Pact** — consumer-driven contract tests. Especially valuable in gRPC/GraphQL internal-service settings.

## How to pick, in one sentence

- Real-time push to browsers, one-way → SSE.
- Real-time two-way with browsers → Socket.IO.
- Service-to-service, internal → gRPC.
- Full-stack TS, one repo → tRPC.
- Multi-client, varied field needs → GraphQL + Pothos + DataLoader + query complexity.
- Background work → BullMQ until you feel its edges, then NATS JetStream or Kafka.
- Workflows that last days → Temporal.

## Bottom line

The ecosystem will keep expanding. Pick tools by the shape of the problem, ship something, and let the production operational cost tell you when to migrate. Premature migration is how teams lose quarters.
