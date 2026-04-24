---
title: Module 05 - Databases and Data Modeling
description: MongoDB, Mongoose, SQL fundamentals, indexing, pagination, repository patterns, and choosing storage approaches.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'

<LessonMeta level="Intermediate" duration="3 weeks" track="Module 05" prerequisites="Module 04 — Express & REST APIs" />

This module teaches persistence as a design problem, not just a connection string problem. Learners should see how domain shape affects schema decisions, queries, and performance — and how to keep database code out of their route handlers.

<Objectives>
- Model one domain in both MongoDB and SQL and explain the trade-offs
- Choose indexes and pagination strategies from actual query shape
- Isolate persistence behind a repository boundary
- Decide which storage engine fits a product requirement with specific reasons
</Objectives>

## What this module covers

- MongoDB fundamentals and document modeling
- Mongoose schemas, validation, hooks, and model usage
- SQL basics with PostgreSQL or MySQL
- relations, normalization, and transaction awareness
- indexing and pagination patterns
- connection pooling and database performance basics
- repository or data access layer thinking
- choosing MongoDB versus SQL based on product needs

## Teaching sequence

1. Model one domain in MongoDB first for fast iteration.
2. Compare the same domain in SQL to surface trade-offs.
3. Introduce indexing and pagination after query basics.
4. Add repository boundaries so database logic is not spread everywhere.

## Live examples

- Mongoose schema with required fields and custom validators
- paginated list endpoint backed by indexed fields
- simple relational design for users, orders, and products
- repository function for clean data access

## Labs

- design a schema for a user and order domain
- add paginated listing endpoints
- compare one document-first model versus one relational model

## Exit outcomes

- students can model backend data intentionally
- students understand why query shape matters to performance
- students can keep persistence logic out of controllers

<Callout type="tip" title="Teach from the query, not the schema">
Ask students to list the five queries their API will actually run before they design any schema. Indexes, denormalization, and pagination all fall out naturally from query patterns. Schemas designed from imagination first always need re-shaping a week later.
</Callout>

## Cross-links

- Deep-study path: [Learning / Databases](/learning/databases/overview/) — SQL, NoSQL, indexes, transactions, and migrations.
- Next module: [Module 06 — Authentication, Authorization & Security](/modules/module-06-auth-authorization-security/).
