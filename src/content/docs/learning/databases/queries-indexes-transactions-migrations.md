---
title: Queries, Indexes, Transactions, and Migrations
slug: learning/databases/queries-indexes-transactions-migrations
description: Learn query behavior, indexing, transaction thinking, schema evolution, and migration discipline for serious backend systems.
---

Many database problems are not caused by the wrong database product. They are caused by weak query and schema discipline.

## Query Thinking

Students should ask:

- what data is needed
- how often it is read
- how often it is written
- what filters and sorts are common

## Indexes

Indexes improve lookup speed for the right access patterns.

But they also have costs:

- storage
- write overhead
- maintenance complexity

## Transactions

Transactions matter when multiple related changes must succeed or fail together.

Teach students to recognize transactional boundaries rather than sprinkling them blindly.

## Migrations

Schema evolution should be intentional.

Students should understand:

- additive changes
- destructive changes
- rollback awareness
- seed data discipline

## Common Mistakes

- adding indexes without understanding query patterns
- ignoring transaction boundaries in critical workflows
- changing schema manually without repeatable migrations
- treating migrations as temporary dev-only hacks

## What To Remember

- queries and indexes are design concerns
- transactions protect important invariants
- migrations are part of operational discipline
- data evolution should be repeatable and reviewable
