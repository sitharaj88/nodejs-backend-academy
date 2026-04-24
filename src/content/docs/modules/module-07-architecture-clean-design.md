---
title: Module 07 - Architecture and Clean Backend Design
description: MVC, layered design, repository and service patterns, dependency boundaries, and maintainable Node.js architecture.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="2 weeks" track="Module 07" prerequisites="Modules 04-06" />

This module answers a question students start asking once their APIs grow: where should the code go? The purpose is not to worship folder structures. It is to keep business logic readable and changeable as the project moves from one hundred lines to ten thousand.

<Objectives>
- Refactor a route-heavy API into controller, service, and repository layers
- Explain which layer owns which responsibility, and defend the boundary
- Recognize the difference between structure that earns its cost and structure added out of habit
- Produce a short design note justifying the architecture of a module
</Objectives>

## What this module covers

- MVC pattern and controller-service separation
- clean architecture ideas for Node.js
- repository, service, and use-case patterns
- dependency boundaries and injection concepts
- shared modules, config layers, and reusable utilities
- domain-driven thinking for business rules
- monolith versus modular monolith basics

## Teaching sequence

1. Review a messy route-centric API and identify pain points.
2. Introduce a layered refactor in small steps.
3. Show repository boundaries only where they add clarity.
4. Compare over-engineering with pragmatic design.

## Live examples

- refactoring business logic out of a route file
- introducing service and repository layers
- creating a domain-friendly folder structure

## Labs

- restructure an existing project using controller, service, and repository layers
- identify shared concerns such as config, errors, and utilities
- explain architecture decisions in a short design note

## Exit outcomes

- students can defend why code belongs in a given layer
- students avoid dumping everything into controllers
- students are ready to write tests around stable boundaries

<Callout type="tip" title="Refactor a real mess, not a textbook example">
The most useful exercise in this module is taking the actual Module 04-06 project and refactoring it into layers. Synthetic "clean architecture" examples teach students the shape but not the pain it solves. Only real legacy code teaches the judgment.
</Callout>

## Cross-links

- Deep-study path: [Learning / Architecture](/learning/architecture/overview/) — layered, clean, modular monolith, and modern patterns.
- Next module: [Module 08 — Testing, Debugging & Code Quality](/modules/module-08-testing-debugging-code-quality/).
