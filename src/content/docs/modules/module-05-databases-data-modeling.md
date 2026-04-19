---
title: Module 05 - Databases and Data Modeling
description: MongoDB, Mongoose, SQL fundamentals, indexing, pagination, repository patterns, and choosing storage approaches.
---

**Duration:** 3 weeks

This module teaches persistence as a design problem, not just a connection string problem. Learners should see how domain shape affects schema decisions, queries, and performance.

## What Learners Cover

- MongoDB fundamentals and document modeling
- Mongoose schemas, validation, hooks, and model usage
- SQL basics with PostgreSQL or MySQL
- relations, normalization, and transaction awareness
- indexing and pagination patterns
- connection pooling and database performance basics
- repository or data access layer thinking
- choosing MongoDB versus SQL based on product needs

## Suggested Teaching Sequence

1. Model one domain in MongoDB first for fast iteration.
2. Compare the same domain in SQL to surface trade-offs.
3. Introduce indexing and pagination after query basics.
4. Add repository boundaries so database logic is not spread everywhere.

## Live Examples

- Mongoose schema with required fields and custom validators
- paginated list endpoint backed by indexed fields
- simple relational design for users, orders, and products
- repository function for clean data access

## Practical Labs

- design a schema for a user and order domain
- add paginated listing endpoints
- compare one document-first model versus one relational model

## Exit Outcomes

- students can model backend data intentionally
- students understand why query shape matters to performance
- students can keep persistence logic out of controllers
