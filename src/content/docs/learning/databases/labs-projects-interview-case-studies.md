---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/databases/labs-projects-interview-case-studies
description: Practical depth page for the databases track, including schema labs, query exercises, mini-projects, interview questions, and production case studies.
---

This page adds practice depth to the databases and data modeling track.

## Code Labs

- Model a course platform relational schema with users, courses, enrollments, and lessons, then identify primary keys and foreign keys.
- Take one relational design and produce a document-model alternative, then explain the tradeoffs in read patterns and update complexity.
- Analyze a slow endpoint scenario and propose which indexes or query changes would improve it without guessing blindly.

## Mini Projects

- Build a small LMS persistence layer twice: once with a relational model and once with a document-oriented model, then compare the pain points.
- Create a migration-based backend starter that includes seed data, repeatable schema changes, and rollback awareness.

## Interview Questions

- When would you choose a relational database over a document database?
- What is normalization, and when might denormalization be reasonable?
- Why do indexes improve reads but still carry cost?
- What problems do transactions solve?
- Why are migrations an operational concern, not only a developer convenience?
- What causes N+1-style data access problems?

## Production Case Studies

### Case Study 1: Missing Indexes

A search endpoint slowed dramatically as the dataset grew. The code path seemed unchanged, but the query pattern no longer matched the existing index strategy.

### Case Study 2: Unsafe Migration

A schema change was applied manually in one environment and via code in another, leaving the systems out of sync. The result was inconsistent runtime behavior and broken deployments.

### Case Study 3: Wrong Data Model for Access Pattern

A document model looked simpler initially, but frequent cross-entity updates became expensive and inconsistent. The lesson was that access patterns should guide modeling from the start.

## Teaching Advice

- Ask learners to justify schema decisions against read and write patterns.
- Compare designs instead of teaching one database style as universally superior.
- Include migration discipline in labs, not only schema sketches.
