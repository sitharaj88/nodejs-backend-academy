---
title: Modern Databases Coverage
slug: learning/databases/modern-databases-coverage
description: Coverage map for the databases and data modeling track, including relational modeling, document modeling, indexes, transactions, and migrations.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'
import Compare from '../../../../components/Compare.astro'
import Pitfall from '../../../../components/Pitfall.astro'

<LessonMeta level="Intermediate" duration="10 min" track="Databases" prerequisites="Relational and document modeling basics" />

The Node.js database ecosystem is a pile of good choices, not a single right answer. This page is a tour with opinions: what each tool is for, where it hurts, and which combinations actually ship together.

## Engines

### PostgreSQL — the default answer

Postgres is the sensible choice for almost any new backend. You get relational modeling with `jsonb` when you need documents, full-text search without a separate system, `LISTEN`/`NOTIFY` for cheap pub-sub, extensions for vectors (`pgvector`), time-series (`TimescaleDB`), and strong ACID including serializable snapshot isolation. If you cannot name a specific reason to pick something else, pick Postgres.

### MongoDB — when access patterns dominate

Reach for MongoDB when the domain is naturally document-shaped (product catalogs with varying attributes, event payloads, CMS content) and your hot reads map to single-document fetches. Stop reaching for it if you find yourself writing `$lookup` pipelines that reassemble a relational graph — that is a sign the wrong tool is being asked to do SQL's job.

### Redis — not a database, a data structure server

Use Redis for ephemeral shared state: caches, rate-limit counters, session stores, queues, leaderboards, pub-sub. Treat it as unreliable storage by default — enable persistence only when you understand what RDB vs AOF buys you. Never make Redis your source of truth for anything a regulator will ask about later.

### SQLite — the quietly excellent choice

For single-node applications, edge workers, CLI tools, and dev/test environments, SQLite with `better-sqlite3` outperforms a networked Postgres for small datasets and removes a whole operational concern. In production, pair it with Litestream or LiteFS for replication and backup. Not a fit for high write concurrency across processes.

<Callout type="tip" title="Pick one, not three">
Most services need one database. A typical web app is happy with Postgres plus Redis for caching and rate limits. Adding a third datastore triples your on-call rotation; do it only when you have measured proof a single store cannot meet the requirement.
</Callout>

## Query builders and ORMs

### Prisma — typed and opinionated

Prisma generates a TypeScript client from a `schema.prisma` file. Reads are ergonomic, relations are typed, migrations are managed. The trade-offs: the runtime shells out to a Rust query engine (slightly higher cold-start, more memory), and complex queries sometimes require `$queryRaw`. Fits teams that value DX and a single source of truth over the last 5% of query flexibility.

### Drizzle — SQL with types, almost no runtime

Drizzle is a thin TypeScript layer over SQL. You write queries that read like SQL, get full type inference, and there is no separate engine. Migrations are plain SQL you can diff. Fits teams who want SQL literacy in their code and do not want an ORM deciding how their joins run.

### Kysely — a typed query builder, nothing more

Kysely is "if SQL had great types." No ORM abstractions, no migrations baked in, just a builder with full autocompletion from a database-shaped type. Good when you want types and readability but dislike the shape of full ORMs.

### Knex — battle-tested, dialect-agnostic

Knex has been around long enough to know every edge case in every database. Its migrations are reliable and simple. Less type-safe than the modern options; pair it with hand-written types or a codegen step if you want strong typing.

### Mongoose — schemas for MongoDB

Mongoose gives Mongo collections a schema, validation, and middleware. Useful for enforcing shape in a language the database itself considers optional. Be aware it adds object-mapping overhead; for hot paths, the native driver is faster.

<Compare badLabel="Over-ORM: fighting the tool" goodLabel="Use the right layer">
<Fragment slot="bad">
```ts
// Prisma: reaching for clever aggregations that SQL would express in 3 lines
const posts = await prisma.post.findMany({ include: { author: true, comments: { take: 3 } } })
for (const p of posts) {
  p.score = await prisma.reaction.count({ where: { postId: p.id, kind: 'up' } })
}
// N+1 in 10 lines of TypeScript.
```
</Fragment>
<Fragment slot="good">
```ts
// Drop to raw SQL (or Drizzle/Kysely) when the query is the point
const rows = await prisma.$queryRaw<Array<{ id: string; title: string; score: number }>>`
  select p.id, p.title, coalesce(r.score, 0) as score
  from posts p
  left join lateral (
    select count(*)::int as score from reactions where post_id = p.id and kind = 'up'
  ) r on true
  order by p.created_at desc
  limit 20
`
```
</Fragment>
</Compare>

## Migrations

- `node-pg-migrate` — minimal, readable, Postgres-focused.
- `drizzle-kit` — generates SQL from Drizzle schema diffs; you review and apply it.
- `prisma migrate` — generates and applies migrations from the `schema.prisma` file.
- `knex migrate` — dialect-agnostic, trusted by long-lived codebases.
- `atlas` — schema-as-code, dialect-agnostic, strong diff engine.

The tool matters less than the **discipline**: expand-migrate-contract, reversible where possible, run automatically as part of deploy, and never edit a migration after it has been applied to a shared environment.

## Connection pooling and the Node realities

- In a single-process Node service, `pg.Pool` with `max: 10` is usually enough. More connections is not more throughput.
- When the service runs behind a serverless platform (Vercel, Lambda), use `pgbouncer` or Neon's connection pooler in **transaction mode** so short-lived function invocations share a small set of real Postgres connections.
- For MongoDB, reuse one `MongoClient` per process; never open a client per request.

<Pitfall title="Serverless + raw Postgres connections">
A Lambda function opens a new `pg.Client` on every invocation. Under burst load you exhaust Postgres `max_connections` in 30 seconds and the database stops accepting any connections — including from your dashboard. **Fix:** put pgbouncer in front, or use a serverless-aware driver (`@neondatabase/serverless`, `@vercel/postgres`).
</Pitfall>

## How to pick

A few patterns that work well together:

- **Default web app:** Postgres + Redis + Drizzle or Prisma + `node-pg-migrate` or `drizzle-kit`.
- **Content-heavy app:** Postgres with `jsonb` for flexible fields; reach for MongoDB only if you need per-document indexes on deep nested keys at scale.
- **Read-heavy dashboard:** Postgres + materialized views + Redis for hot keys.
- **Edge / CLI / embedded:** SQLite with `better-sqlite3`, Litestream for backup.
- **Single-shot scripts or tests:** SQLite in memory.

## Observability for the database layer

- Turn on `log_min_duration_statement` in Postgres (e.g. 100 ms) and ship logs to a searchable store.
- Instrument the Node driver with OpenTelemetry — every query becomes a span with duration and SQL text (scrubbed).
- Track pool metrics: waiting clients, idle count, acquire time p99. An empty pool under load is a louder signal than a slow query.

## Further reading

- [Relational Modeling and SQL Thinking](/learning/databases/relational-modeling-sql-thinking/)
- [Document Modeling and NoSQL Patterns](/learning/databases/document-modeling-nosql-patterns/)
- [Queries, Indexes, Transactions, and Migrations](/learning/databases/queries-indexes-transactions-migrations/)
- [Labs, Projects, Interview Questions, Case Studies](/learning/databases/labs-projects-interview-case-studies/)
