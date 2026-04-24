---
title: Queries, Indexes, Transactions, and Migrations
slug: learning/databases/queries-indexes-transactions-migrations
description: Learn query behavior, indexing, transaction thinking, schema evolution, and migration discipline for serious backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="30 min" track="Databases" prerequisites="SQL, Postgres, Node.js, basic async/await" />

Schemas make invariants real. Queries, indexes, transactions, and migrations make them fast, correct under concurrency, and evolvable without outages. This is the page that separates "I use Postgres" from "Postgres is my friend."

<Objectives>
- Read `EXPLAIN ANALYZE` and identify the one change that will move the plan
- Choose B-tree, hash, GIN, or BRIN indexes — and know when none is right
- Pick an isolation level for a given race and prove it with a failing test
- Ship a column rename against a live service without locking writes
</Objectives>

## Reading an execution plan

`EXPLAIN ANALYZE` runs the query and shows what the planner actually did, including timings. Read it bottom-up; the innermost node is where rows start flowing.

```sql
explain (analyze, buffers)
select p.id, p.title
  from posts p
  join users u on u.id = p.author_id
 where u.email = 'ada@example.com'
   and p.published_at is not null
 order by p.published_at desc
 limit 20;
```

A healthy plan for this query looks like:

```
Limit  (cost=... rows=20 ...) (actual time=0.12..0.14 rows=20 loops=1)
  ->  Index Scan Backward using posts_author_published_idx on posts p
        Index Cond: (author_id = $1)
        Filter: (published_at IS NOT NULL)
  ->  Index Scan using users_email_idx on users u
        Index Cond: (email = 'ada@example.com'::citext)
Planning Time: 0.4 ms
Execution Time: 0.6 ms
```

Three signals you actually care about:

1. **Seq Scan** on a large table usually means a missing index or a non-sargable predicate.
2. **Rows removed by filter** high on a scan node means the index got you to the right page but not the right rows.
3. **Actual rows** wildly different from **estimated rows** means statistics are stale — run `ANALYZE`.

<Callout type="tip" title="Always use BUFFERS">
`explain (analyze, buffers)` shows **shared hit** (in memory) vs **read** (from disk) blocks. A query that reads 10,000 blocks from disk will be slow even if CPU time looks fine.
</Callout>

## Indexes: the four kinds you need

### B-tree — the default

Ordered, range-friendly, supports equality and sort. Created implicitly on primary keys and unique constraints. This is what you want 90% of the time.

```sql
-- Composite index chosen to match the query's WHERE + ORDER BY
create index posts_author_published_idx
  on posts (author_id, published_at desc)
  where published_at is not null;
```

Two tricks in that statement:

- **Column order** matches the query's `WHERE author_id = $1 ORDER BY published_at DESC`. The planner can use the leading columns for equality and the trailing columns for ordering.
- **Partial index** (`where published_at is not null`) makes the index smaller and faster, because drafts never enter it.

### Covering (INCLUDE) — avoid a heap fetch

```sql
create index posts_author_published_cover
  on posts (author_id, published_at desc)
  include (title, slug)
  where published_at is not null;
```

When the query only needs `author_id`, `published_at`, `title`, `slug`, Postgres can answer from the index alone (an **index-only scan**). Watch the plan say `Heap Fetches: 0`.

### GIN — arrays, JSONB, full text

```sql
create index posts_tags_gin on post_tags using gin (tag_id);
create index posts_body_fts on posts using gin (to_tsvector('english', body));

-- Now these are cheap:
select * from posts where to_tsvector('english', body) @@ plainto_tsquery('event loop');
```

### BRIN — time-series and append-only

```sql
create index events_created_brin on events using brin (created_at) with (pages_per_range = 32);
```

BRIN stores a summary per block range. Tiny on disk (MB instead of GB for a billion-row table), perfect when data is naturally ordered by the indexed column.

<Compare badLabel="Non-sargable" goodLabel="Sargable">
<Fragment slot="bad">
```sql
-- Forces a function on every row; cannot use an index on email
select * from users where lower(email) = 'ada@example.com';
```
</Fragment>
<Fragment slot="good">
```sql
-- Use citext or a functional index
create index users_email_lower_idx on users (lower(email));
-- Or better: email citext not null unique;
select * from users where email = 'ada@example.com';
```
</Fragment>
</Compare>

## Transactions, actually

A transaction is a promise: either all of these writes happen, or none do, and they happen as if the world held still. The cost of that promise is measured in locks held and rows visible to other readers.

```ts
// src/db/transfer.ts
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function transfer(fromId: string, toId: string, amountCents: number) {
  const client = await pool.connect()
  try {
    await client.query('begin')

    // Lock the source row to avoid concurrent double-spend
    const { rows: [src] } = await client.query(
      'select balance_cents from accounts where id = $1 for update',
      [fromId],
    )
    if (!src) throw new Error('ACCOUNT_NOT_FOUND')
    if (src.balance_cents < amountCents) throw new Error('INSUFFICIENT_FUNDS')

    await client.query(
      'update accounts set balance_cents = balance_cents - $1 where id = $2',
      [amountCents, fromId],
    )
    await client.query(
      'update accounts set balance_cents = balance_cents + $1 where id = $2',
      [amountCents, toId],
    )
    await client.query(
      `insert into ledger (from_id, to_id, amount_cents) values ($1, $2, $3)`,
      [fromId, toId, amountCents],
    )

    await client.query('commit')
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}
```

Three rules:

1. **Acquire the same client** for every statement in the transaction. Using `pool.query` mid-transaction will silently run on a different connection.
2. **Lock the rows you write** with `for update`. Without it, two concurrent transfers can both read `balance = 100` and both succeed, producing a ledger that does not balance.
3. **Always release** in `finally`. A leaked connection eventually starves the pool.

## Isolation levels, in one table

| Level | Prevents | Allows | When to use |
| --- | --- | --- | --- |
| Read Committed (default) | Dirty reads | Non-repeatable reads, phantom reads | Most web apps |
| Repeatable Read | Non-repeatable reads | Phantoms in some engines | Reports, multi-read invariants |
| Serializable | All of the above | Nothing (may fail with 40001) | Financial invariants, strict correctness |

In Postgres, **Serializable Snapshot Isolation** gives you full serializability with optimistic concurrency: the transaction runs, and at commit time the engine checks for conflicts. On conflict it throws `40001 serialization_failure` and your app retries.

```ts
async function withSerializableRetry<T>(fn: (c: any) => Promise<T>, attempts = 3): Promise<T> {
  const client = await pool.connect()
  try {
    for (let i = 0; i < attempts; i++) {
      try {
        await client.query('begin isolation level serializable')
        const out = await fn(client)
        await client.query('commit')
        return out
      } catch (err: any) {
        await client.query('rollback')
        if (err.code !== '40001' || i === attempts - 1) throw err
      }
    }
    throw new Error('unreachable')
  } finally {
    client.release()
  }
}
```

<Callout type="warn" title="Do not increase isolation out of superstition">
Bumping everything to serializable "to be safe" creates deadlocks, contention, and mysterious retries. Pick the lowest level that makes your invariants hold, and write a test that fails without it.
</Callout>

## Deadlocks, by example and by rule

Two concurrent transfers — one from A to B, one from B to A — each lock their source then try to update the other's destination. Classic deadlock. Postgres detects it, kills one, and returns `40P01`.

The rule: **acquire locks in a consistent order**. Sort the account ids, lock the lower one first, then the higher one.

```ts
const [first, second] = [fromId, toId].sort()
await client.query('select 1 from accounts where id = $1 for update', [first])
await client.query('select 1 from accounts where id = $1 for update', [second])
```

## Migrations: expand, migrate, contract

Shipping schema changes against a live service is a three-step dance. You never do the dangerous step until the code on all running instances is ready for it.

```
Phase 1: EXPAND
  - Add the new column/table/index. Nothing reads it yet.
  - Write to both old and new from the app.

Phase 2: MIGRATE
  - Backfill old rows in batches.
  - Switch reads to the new column/table.

Phase 3: CONTRACT
  - Stop writing the old column. Drop it.
```

Tools: `node-pg-migrate`, `knex migrate`, `drizzle-kit`, `prisma migrate`. The tool matters less than the discipline.

```ts
// migrations/20260424_add_user_tz.ts with node-pg-migrate
export const up = (pgm: any) => {
  pgm.addColumns('users', {
    timezone: { type: 'text', notNull: false }, // nullable in expand phase
  })
  pgm.createIndex('users', 'timezone', { where: 'timezone is not null' })
}

export const down = (pgm: any) => {
  pgm.dropColumns('users', ['timezone'])
}
```

<Compare badLabel="Risky: rename in place" goodLabel="Safe: expand-migrate-contract">
<Fragment slot="bad">
```sql
alter table users rename column tz to timezone;
-- All in-flight app instances that still read "tz" now break.
```
</Fragment>
<Fragment slot="good">
```sql
-- Phase 1: expand
alter table users add column timezone text;
update users set timezone = tz where timezone is null;

-- Phase 2: migrate
-- Deploy app that reads "timezone" and writes both columns.

-- Phase 3: contract (later release)
alter table users drop column tz;
```
</Fragment>
</Compare>

<Callout type="info" title="Lock-free adds, lock-heavy drops">
In Postgres, `ADD COLUMN ... NULL` is nearly free. `ADD COLUMN ... NOT NULL DEFAULT ...` rewrites the table under an `ACCESS EXCLUSIVE` lock on older versions. On Postgres 11+ the default is computed virtually, but still — always check the version and the table size before you `alter`.
</Callout>

## Index creation on big tables

`create index` takes an `ACCESS EXCLUSIVE` lock and blocks writes. On any table that matters, use `CONCURRENTLY`:

```sql
create index concurrently posts_author_published_idx
  on posts (author_id, published_at desc);
```

It takes longer but only blocks other schema changes. If it fails halfway, the index is marked `INVALID` — drop it and try again.

## Common pitfalls

<Pitfall title="Index you added, planner ignored">
You add an index but `EXPLAIN` still shows a sequential scan. Usually one of three things: the table is small enough that a seq scan is cheaper, statistics are stale, or the predicate is not sargable. **Fix:** run `ANALYZE`, check the query rewrites the predicate as expected, and confirm the table is big enough that an index would actually win.
</Pitfall>

<Pitfall title="Long-running transaction that blocks `vacuum`">
A developer opens a `begin` in a Node REPL, forgets about it, and goes to lunch. Postgres cannot vacuum tuples newer than that transaction's snapshot; bloat grows, autovacuum struggles, queries slow down. **Fix:** set `idle_in_transaction_session_timeout` to something aggressive (30 seconds for app connections), and alert on long-running transactions.
</Pitfall>

<Pitfall title="Migration that breaks the previous app version">
A "harmless" `drop column` ships, but the previous deploy (still running on half the fleet) still selects it. Every request on the old version 500s until the deploy completes. **Fix:** always assume the two most recent app versions run simultaneously. Schema changes must be compatible with the **previous** code.
</Pitfall>

## Lab

<Lab title="Fix a slow endpoint and ship a safe migration" duration="75 min" difficulty="Medium" stack="Postgres 16, node-postgres, node-pg-migrate, autocannon">

### Goal
Take a `/api/feed` endpoint that does a sequential scan, fix it with the right index, then rename a column on the same table without downtime.

### Steps
1. Seed `posts` with 500k rows using a script. Run `autocannon -c 50 -d 30 http://localhost:3000/api/feed?user=ada` and record p99.
2. Capture `explain (analyze, buffers)` for the query. Identify the offender (seq scan, wrong sort, missing partial predicate).
3. Add one composite index with `create index concurrently`. Re-run `EXPLAIN` and confirm the plan uses it with `Index Scan Backward` or `Index-Only Scan`.
4. Re-run autocannon. Expect p99 to drop by at least 10x.
5. Plan an expand-migrate-contract to rename `posts.body` to `posts.content`. Write three migrations and confirm the app runs correctly after each, without restarts between migrations.

### Success criteria
- Before/after numbers for p99 are in the commit message.
- The new index is created `CONCURRENTLY` and is partial where it makes sense.
- Each of the three rename migrations keeps the service fully available (no 5xx responses during a rolling deploy).
- A test in the suite would fail if a future developer replaced the partial index with a full one.

</Lab>

## Checkpoint

<Checkpoint>
1. An `EXPLAIN` shows `Seq Scan` on a 50M-row table with `Rows Removed by Filter: 49,999,900`. Name two fixes and the trade-off of each.
2. When is a BRIN index better than a B-tree, and what is the one question you must answer before using it?
3. Your transfer function occasionally produces an imbalanced ledger under load. Which isolation level fixes it, and what must your app handle that it did not before?
4. You are renaming `posts.body` to `posts.content` on a table with 100M rows in a live service. Describe the three phases and what code ships in each.
5. What does `Heap Fetches: 0` in an index-only scan tell you, and how do you lose it?
</Checkpoint>

## Further reading

- [Relational Modeling and SQL Thinking](/learning/databases/relational-modeling-sql-thinking/) — the schema you are now tuning
- [Modern Databases Coverage](/learning/databases/modern-databases-coverage/) — which migration tool fits your stack
- [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/) — database slowness often masquerades as app slowness
