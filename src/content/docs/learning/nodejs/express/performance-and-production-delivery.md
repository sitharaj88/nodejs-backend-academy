---
title: Performance and Production Delivery
slug: learning/nodejs/express/performance-and-production-delivery
description: Learn Express performance awareness, timeout and cancellation strategy, deployment concerns, logging, health endpoints, and production delivery patterns.
---

An Express app that works locally is not automatically ready for real traffic.

## Performance Starts with Request Discipline

Express performance problems often begin with:

- slow synchronous work in handlers
- excessive database calls
- large response serialization
- missing caching
- poor timeout strategy

## Keep Handlers Lean

Route handlers should coordinate work, not do expensive computation directly.

Move expensive or long-running tasks out of the request path when possible.

## Timeouts and Cancellation

Production APIs need explicit strategies for:

- slow downstream services
- hanging requests
- cancellation during shutdown
- client disconnect handling

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

## Graceful Shutdown

An Express server should stop accepting new requests, allow in-flight work to finish or time out safely, release resources, and then exit.

## Reverse Proxies and Deployment Awareness

Many Express apps run behind:

- Nginx
- cloud load balancers
- platform ingress layers

Students should know that proxy-aware configuration and trust settings matter in production.

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

## What To Remember

- production Express engineering is about runtime behavior, not only routes
- timeouts, cancellation, and shutdown strategy matter
- observability is part of API quality
- large payloads and blocking work are common performance risks
- deployment awareness should be taught before learners ship real services
