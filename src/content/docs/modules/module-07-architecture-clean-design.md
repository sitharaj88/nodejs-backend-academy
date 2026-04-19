---
title: Module 07 - Architecture and Clean Backend Design
description: MVC, layered design, repository and service patterns, dependency boundaries, and maintainable Node.js architecture.
---

**Duration:** 2 weeks

This module answers a question students start asking once their APIs grow: where should the code go? The purpose is not to worship folder structures. It is to keep business logic readable and changeable.

## What Learners Cover

- MVC pattern and controller-service separation
- clean architecture ideas for Node.js
- repository, service, and use-case patterns
- dependency boundaries and injection concepts
- shared modules, config layers, and reusable utilities
- domain-driven thinking for business rules
- monolith versus modular monolith basics

## Suggested Teaching Sequence

1. Review a messy route-centric API and identify pain points.
2. Introduce a layered refactor in small steps.
3. Show repository boundaries only where they add clarity.
4. Compare over-engineering with pragmatic design.

## Live Examples

- refactoring business logic out of a route file
- introducing service and repository layers
- creating a domain-friendly folder structure

## Practical Labs

- restructure an existing project using controller, service, and repository layers
- identify shared concerns such as config, errors, and utilities
- explain architecture decisions in a short design note

## Exit Outcomes

- students can defend why code belongs in a given layer
- students avoid dumping everything into controllers
- students are ready to write tests around stable boundaries
