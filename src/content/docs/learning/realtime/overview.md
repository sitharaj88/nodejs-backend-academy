---
title: Real-Time Overview
slug: learning/realtime/overview
description: Overview for the real-time and advanced APIs learning track, covering WebSockets, SSE, queues, jobs, webhooks, GraphQL, gRPC, and event-driven flows.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Real-Time & Advanced APIs" prerequisites="HTTP, JSON APIs, async/await, Redis basics" />

Most backends start as request-response JSON. Then a chat feature arrives, or a dashboard that needs to update without a reload, or a third party that will retry webhooks at 3 a.m. whether you are ready or not. This track covers the communication shapes that live beyond REST — and, more importantly, when each one is actually the right answer.

<Objectives>
- Pick between WebSockets, SSE, long polling, and plain HTTP with intent
- Design job queues and webhook consumers that survive retries, failures, and duplicates
- Choose between GraphQL, gRPC, tRPC, and REST by constraint, not fashion
- Reason about delivery guarantees (at-most-once, at-least-once, exactly-once-ish) and what each one actually costs
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Push', title: 'WebSockets, Socket.IO, and SSE', description: 'Persistent connections, rooms, presence, reconnection.', href: '/learning/realtime/websockets-socketio-and-sse/' },
  { eyebrow: 'Async', title: 'Queues, Jobs, Webhooks, Events', description: 'BullMQ, retries, DLQs, webhook signatures, outbox.', href: '/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/' },
  { eyebrow: 'API shapes', title: 'GraphQL, gRPC, and tRPC', description: 'Schema design, proto contracts, when each wins.', href: '/learning/realtime/graphql-grpc-and-advanced-api-shapes/' },
  { eyebrow: 'Ecosystem', title: 'Modern Real-Time Coverage', description: 'ws, socket.io, Apollo, Yoga, Pothos, grpc-js, NATS, Kafka.', href: '/learning/realtime/modern-realtime-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Build chat, process webhooks, evolve a GraphQL schema.', href: '/learning/realtime/labs-projects-interview-case-studies/' },
]} />

## Recommended path

1. [WebSockets, Socket.IO, and Server-Sent Events](/learning/realtime/websockets-socketio-and-sse/)
2. [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/)
3. [GraphQL, gRPC, and Advanced API Shapes](/learning/realtime/graphql-grpc-and-advanced-api-shapes/)
4. [Modern Real-Time Coverage](/learning/realtime/modern-realtime-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/realtime/labs-projects-interview-case-studies/)

<Callout type="tip" title="Pick one real feature to follow the whole track">
Imagine you are building a customer-support tool. As you move through the pages, design its chat (WebSockets), its retryable outbound notifications (BullMQ), its partner integrations (webhooks), and its internal API for a mobile app (GraphQL or gRPC). The boring parts are where the interesting tradeoffs live.
</Callout>

<Callout type="warn" title="Real-time does not mean realtime">
&ldquo;Real-time&rdquo; usually means &ldquo;fast enough that a human does not notice the delay.&rdquo; Sub-200 ms is plenty for most UIs. If you genuinely need microseconds, you are not building with HTTP and you are not reading this page.
</Callout>

## Outcomes

By the end of the track you can look at a "we need real-time" requirement, ask the right three questions to narrow it, and pick the transport, the delivery guarantee, and the failure model on purpose. You can also explain why your webhook endpoint returns 200 even when processing fails, and why your queue has a dead-letter topic.
