---
title: Module 10 - Real-Time Systems and Advanced APIs
description: WebSockets, Socket.IO, SSE, file pipelines, GraphQL basics, webhooks, and third-party integrations.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="2 weeks" track="Module 10" prerequisites="Modules 04 and 09" />

This module expands the student view of backend systems beyond CRUD. The goal is to show how Node.js supports event-driven and interactive product features — and to build the judgment to choose REST, WebSockets, SSE, GraphQL, or webhooks for the right reasons.

<Objectives>
- Pick a real-time transport (WebSocket, SSE) with a defensible reason
- Design an upload pipeline with validation, size limits, and storage handoff
- Build a webhook receiver that is idempotent and signature-verified
- Explain where GraphQL fits and where REST is still the right answer
</Objectives>

## What this module covers

- WebSockets and Socket.IO fundamentals
- real-time chat and notification patterns
- Server-Sent Events basics
- file upload pipelines and media handling
- GraphQL basics and where it fits
- webhook design and event-driven integrations
- resilient third-party API integration patterns

## Teaching sequence

1. Start with real-time messaging concepts.
2. Build one small Socket.IO or SSE example.
3. Introduce file upload workflow and media constraints.
4. Compare REST with GraphQL conceptually.
5. Finish with webhook receivers and outbound integration resilience.

## Live examples

- notification channel with Socket.IO
- webhook receiver with signature or idempotency discussion
- file upload endpoint with validation rules
- simple GraphQL resolver example

## Labs

- build a notification or chat proof of concept
- accept and validate uploaded files
- connect to a third-party API with retries and logging

## Exit outcomes

- students know when advanced API styles are useful
- students understand how event-driven flows change backend design
- students are prepared for capstones with interactive behavior

<Callout type="tip" title="Default to REST, upgrade on evidence">
When a student proposes WebSockets or GraphQL, ask them what problem REST could not solve. The answer should be specific — "polling would miss events shorter than our 5s window" or "the mobile client needs to pick five fields from three resources in one round trip." Vague answers mean REST is still the right tool.
</Callout>

## Cross-links

- Deep-study path: [Learning / Real-Time](/learning/realtime/overview/) — WebSockets, SSE, queues, GraphQL, and gRPC.
- Next module: [Module 11 — DevOps, Deployment & Production Readiness](/modules/module-11-devops-deployment-production-readiness/).
