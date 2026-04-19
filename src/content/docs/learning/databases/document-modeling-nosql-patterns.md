---
title: Document Modeling and NoSQL Patterns
slug: learning/databases/document-modeling-nosql-patterns
description: Learn document-oriented modeling, embedding versus referencing, schema flexibility, and when NoSQL patterns are useful in backend systems.
---

Document databases solve different problems than relational databases. They are not automatically simpler. They are different.

## Document Modeling

Students should understand:

- collections
- documents
- flexible schema
- embedded versus referenced data

## Embedding Versus Referencing

Embedding is useful when related data is naturally read together.

Referencing is useful when:

- relationships are large
- data is shared across many records
- updates need centralized control

## Tradeoffs

Document modeling can reduce join complexity, but it can also create duplication and update coordination problems.

## Common Mistakes

- assuming NoSQL means no design discipline
- embedding too much data
- ignoring query patterns while modeling
- treating schema flexibility as a reason to skip validation

## What To Remember

- NoSQL is not schema-free thinking
- document models should still follow access patterns
- flexibility does not remove the need for strong modeling
