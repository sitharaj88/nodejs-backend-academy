---
title: Databases Overview
slug: learning/databases/overview
description: Overview for the databases and data modeling learning track, covering relational thinking, document modeling, indexing, transactions, and migration discipline.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import TopicGrid from '../../../../components/TopicGrid.astro'

<LessonMeta level="Intermediate" duration="6 min" track="Databases" prerequisites="SQL basics, Node.js, async/await" />

A database is not a bucket. It is the part of your system that enforces the invariants every other layer assumes. The data model you pick on Monday constrains the features you can ship on Friday, the latency your users feel, and the outages you will write postmortems for. This track teaches you to reason about relational and document models, write queries that use indexes, hold transactions correctly, and evolve schemas without downtime.

<Objectives>
- Model real domains relationally and document-first, and defend both choices
- Read an execution plan and add the index the planner actually uses
- Pick the right isolation level for a given race and prove it with a test
- Evolve a live schema through an expand-migrate-contract pattern without locking writes
- Choose between Prisma, Drizzle, Kysely, Knex, and raw drivers with intent
</Objectives>

## What this track covers

<TopicGrid topics={[
  { eyebrow: 'Relational', title: 'Relational Modeling and SQL Thinking', description: 'Entities, keys, joins, constraints. Normalize on purpose; denormalize with receipts.', href: '/learning/databases/relational-modeling-sql-thinking/' },
  { eyebrow: 'Document', title: 'Document Modeling and NoSQL Patterns', description: 'Embed vs reference, access-pattern-driven shapes, consistency trade-offs.', href: '/learning/databases/document-modeling-nosql-patterns/' },
  { eyebrow: 'Execution', title: 'Queries, Indexes, Transactions, Migrations', description: 'EXPLAIN, B-tree mechanics, isolation levels, zero-downtime schema change.', href: '/learning/databases/queries-indexes-transactions-migrations/' },
  { eyebrow: 'Ecosystem', title: 'Modern Databases Coverage', description: 'Postgres, Mongo, Redis, SQLite, Prisma, Drizzle, Kysely, Mongoose, Knex.', href: '/learning/databases/modern-databases-coverage/' },
  { eyebrow: 'Practice', title: 'Labs, Interviews, Case Studies', description: 'Model a domain, fix a slow query, run a zero-downtime migration.', href: '/learning/databases/labs-projects-interview-case-studies/' },
]} />

## Recommended path

1. [Relational Modeling and SQL Thinking](/learning/databases/relational-modeling-sql-thinking/)
2. [Document Modeling and NoSQL Patterns](/learning/databases/document-modeling-nosql-patterns/)
3. [Queries, Indexes, Transactions, and Migrations](/learning/databases/queries-indexes-transactions-migrations/)
4. [Modern Databases Coverage](/learning/databases/modern-databases-coverage/)
5. [Labs, Projects, Interview Questions, Case Studies](/learning/databases/labs-projects-interview-case-studies/)

<Callout type="tip" title="How to study this track">
Pick one small domain — say, a blogging app with users, posts, tags, and comments. Model it relationally first, then document-first, then ask which queries become awkward. The page on queries and indexes lands harder once you have a schema you care about.
</Callout>

## Outcomes

By the end of the track you can sketch a schema on a whiteboard, defend each key and index, read a `EXPLAIN ANALYZE` without flinching, choose a sane isolation level for a given bug, and walk a teammate through a zero-downtime column rename. You know when Postgres is the answer and when Redis, SQLite, or Mongo is — and you know how to tell.
