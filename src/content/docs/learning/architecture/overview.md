---
title: Architecture Overview
slug: learning/architecture/overview
description: Overview for the architecture and clean design learning track, covering boundaries, dependency flow, modularity, and maintainable backend structure.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Architecture" prerequisites="Express, TypeScript basics, a database you have used in anger" />

Architecture is the set of decisions you make before the first bug and the set of constraints you accept to keep the next hundred decisions cheap. This track is about making those constraints explicit: where a boundary lives, which way dependencies point, and what a module is allowed to know about its neighbours.

<Objectives>
- Place boundaries between routing, use cases, domain rules, and infrastructure on purpose
- Reason about dependency direction and why inverting it changes testability and reuse
- Design modules that could be extracted into services later, without designing distributed systems today
- Recognise when DDD, hexagonal, vertical slices, or CQRS-lite are the right tool — and when they are astronautics
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Layers', title: 'Layered Architecture and Boundaries', description: 'Routes, services, repositories, DTOs, and contracts between them.', href: '/learning/architecture/layered-architecture-and-boundaries/' },
  { eyebrow: 'Dependency flow', title: 'Clean Architecture', description: 'Ports, adapters, use cases, and why the domain sits at the centre.', href: '/learning/architecture/clean-architecture-and-dependency-flow/' },
  { eyebrow: 'Pragmatism', title: 'Modular Monolith Patterns', description: 'Feature modules, internal events, shared kernel, and when to extract.', href: '/learning/architecture/modular-monolith-patterns-and-pragmatism/' },
  { eyebrow: 'Ecosystem', title: 'Modern Architecture Coverage', description: 'DDD-lite, hex, vertical slices, event-driven, CQRS-lite, Nx/Turborepo.', href: '/learning/architecture/modern-architecture-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Refactor a ball of mud, design a module, defend your boundaries.', href: '/learning/architecture/labs-projects-interview-case-studies/' },
]} />

## Recommended path

1. [Layered Architecture and Boundaries](/learning/architecture/layered-architecture-and-boundaries/)
2. [Clean Architecture and Dependency Flow](/learning/architecture/clean-architecture-and-dependency-flow/)
3. [Modular Monolith Patterns and Pragmatism](/learning/architecture/modular-monolith-patterns-and-pragmatism/)
4. [Modern Architecture Coverage](/learning/architecture/modern-architecture-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/architecture/labs-projects-interview-case-studies/)

<Callout type="tip" title="How to study this track">
Pick a feature you have shipped — ideally one that started small and grew ugly. As you move through the pages, sketch where its boundaries are today, where they should be, and what the one-commit refactor toward the better shape looks like. Architecture without a concrete target is philosophy.
</Callout>

<Callout type="info" title="The architecture you need is the one your team can maintain">
A beautiful hexagonal design that only the original author understands is worse than a boring layered monolith everyone can change on a Friday afternoon. Optimise for the second case.
</Callout>

## Outcomes

By the end of the track you can look at a service, name its layers, point at its dependency arrows, and predict which change requests will be cheap and which will require surgery. You can also defend the structure in a code review without using the word "clean."
