---
title: Performance, Profiling, and the Event Loop
slug: learning/performance/performance-profiling-event-loop
description: Learn how Node.js runtime behavior affects performance, how to find hotspots, and why event-loop protection matters in backend services.
---

Performance work starts with measurement and runtime understanding.

## Event-Loop Impact

Students should ask:

- what blocks the event loop
- what waits on I/O
- what creates unnecessary serialization or parsing cost

## Profiling

Profiling helps locate:

- CPU hotspots
- expensive response building
- repeated conversions
- memory pressure

## Common Mistakes

- optimizing without measuring
- blaming Node.js before checking application logic
- ignoring JSON serialization cost and heavy synchronous loops

## What To Remember

- event-loop health matters directly
- profiling should guide performance work
- most performance fixes start with finding the real hotspot
