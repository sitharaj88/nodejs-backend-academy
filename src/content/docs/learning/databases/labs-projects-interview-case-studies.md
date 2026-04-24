---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/databases/labs-projects-interview-case-studies
description: Practical depth page for the databases track, including schema labs, query exercises, mini-projects, interview questions, and production case studies.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="25 min" track="Databases" />

Practice database discipline on realistic schemas and real postmortems. Every lab below has a measurable outcome; every case study names the fix that shipped.

## Code labs

<Lab title="Design and stress-test a marketplace schema" duration="90 min" difficulty="Medium" stack="Postgres 16, node-postgres, autocannon, Vitest">
Model sellers, products, orders, order_items with proper keys and constraints. Seed 1M rows. Run a "top sellers this week" query under 100 concurrent clients. Tune with composite and partial indexes until p99 is under 50 ms.

**Success criteria**: every foreign key has a deliberate `on delete` policy; the revenue query uses an index-only scan (`Heap Fetches: 0`); a test fails if a future edit drops the partial index.
</Lab>

<Lab title="Fix an N+1 without an ORM rewrite" duration="45 min" difficulty="Medium" stack="Node.js, Prisma or Drizzle, Postgres">
Take a provided `GET /feed` endpoint that loads posts then fetches authors and comments one by one. Rewrite as a single join or a batched second query. Prove with a query log that total queries per request drops from O(N) to O(1) or O(2).

**Success criteria**: request count visible in pg stats goes from 51 to 2 for a 50-post feed; response p99 drops by 5x under load.
</Lab>

<Lab title="Serializable transfer with retry" duration="60 min" difficulty="Medium" stack="Postgres, node-postgres, Vitest">
Implement `transfer(fromId, toId, amount)` at isolation level `SERIALIZABLE`. Write a concurrency test with 200 parallel transfers that prove the ledger always balances. Handle `40001 serialization_failure` with bounded retry.

**Success criteria**: sum of all balances is invariant across 10 test runs; fewer than 5% of transactions retry; no deadlocks (`40P01`) because locks are acquired in deterministic order.
</Lab>

<Lab title="Zero-downtime column rename" duration="75 min" difficulty="Medium" stack="Postgres, node-pg-migrate, supertest">
Rename `users.tz` to `users.timezone` on a live service. Write three migrations (expand, migrate, contract) and three app versions that each keep the service green. Run a rolling deploy script that proves the middle deploy serves 200s throughout.

**Success criteria**: zero 5xx responses during the migration window; rollback from any phase to the previous phase works without data loss; a checklist lives in the repo for the next migration.
</Lab>

## Mini projects

- **ERD to production**: start from a user story ("a clinic schedules appointments") and take it through ERD, migrations, seed data, and a small Express API. Defend every key, index, and constraint in a `MODEL.md`.
- **Query tuner week**: pick a public dataset (NYC taxi, StackOverflow dump). Write five real analytical queries, record baseline plans, add indexes, and publish before/after timings.
- **Datastore swap**: take a service built on Mongo and re-implement storage on Postgres with `jsonb`. Document which queries became easier, which became awkward, and the overall latency delta.
- **Cache consistency demo**: put Redis in front of a Postgres read, and deliberately produce three stale-read scenarios. Fix each one with a named pattern (write-through, TTL, invalidate-on-write).

## Interview questions

1. Walk me through choosing a primary key type for a new table. When would you pick UUIDv7 over `bigserial`?
2. A colleague says "we don't need foreign keys; the application enforces them." How do you respond?
3. Explain the difference between `Index Scan`, `Index-Only Scan`, and `Bitmap Index Scan` in Postgres. When do you get each?
4. You have a query that occasionally takes 5 s while the same query usually takes 5 ms. What are the three most likely causes?
5. A service has a deadlock once an hour. Where do you look first, and what is the fix pattern that makes them impossible?
6. Embed or reference: "comments on a blog post" and "messages in a chat room." Defend both answers.
7. Describe the expand-migrate-contract pattern for renaming a column without downtime.
8. When is Serializable isolation the wrong choice, even for financial data?
9. Why might adding an index make a query slower?
10. A feature needs "last seen" for each user, updated on every request. How do you implement it without murdering the database?

## Production case studies

### Case 1 — The `lower(email)` that scanned

A dating app noticed p99 on `GET /users/by-email` climbing from 8 ms to 900 ms over a month. The query was `select * from users where lower(email) = $1`. The column was `text`, not `citext`, and there was no functional index. As user count crossed 2 million the seq scan became noticeable.

**Fix:** migrate the column to `citext`, drop the `lower()` call in the query, add a unique index on `email`. p99 returned to sub-millisecond.

**Lesson:** non-sargable predicates are not slow because of data, they are slow because they cannot use indexes. Fix them in the schema, not with a bigger instance.

### Case 2 — The enum that took production down

An observability vendor added a new `alert_status` enum value on a 400M-row table. `alter type ... add value` was run inside a migration transaction — which Postgres does not allow for enums — and the surrounding migration tool retried the whole transaction three times. By the third retry, the advisory lock had timed out and the deploy rolled back. The service was degraded for 25 minutes because the new code path expected the new enum value.

**Fix:** migrate the column to `text` + `CHECK` constraint. Adding a new status became a one-line `alter table` inside a transaction, safe to deploy any time.

**Lesson:** `ENUM` types look tidy but are operationally expensive. Use text + check constraint for anything that might grow.

### Case 3 — The cache that became the source of truth

A retail backend cached product prices in Redis with a 1-hour TTL. One evening, a bulk-import job wrote new prices to Postgres but the deploy that invalidated the cache was rolled back due to an unrelated test failure. Customers saw old prices for 55 minutes. The team started writing to Redis first and Postgres second "to keep them in sync"; soon the cache had values that never made it to Postgres at all.

**Fix:** write to Postgres only. Invalidate the cache key synchronously after the DB commit. If invalidation fails, let the TTL handle it — do not block the write.

**Lesson:** Redis is a cache, not a source of truth. Write paths go to the authoritative store first; caches follow.

### Case 4 — The idle transaction that ate disk

A staging environment's Grafana dashboard ran a `select pg_sleep(...)` test every minute and never closed its client. Over a weekend, autovacuum could not reclaim dead tuples because the oldest snapshot was held open by that idle transaction. Disk hit 98% on Monday morning and the primary refused writes.

**Fix:** set `idle_in_transaction_session_timeout = '30s'` cluster-wide, and monitor `pg_stat_activity` for transactions older than one minute.

**Lesson:** a forgotten `BEGIN` is an operational event, not a quirk. Put a timeout on it.

### Case 5 — The migration that matched no rows

A fintech backend ran a migration to backfill a new `timezone` column from IP geolocation data. The migration used `update users set timezone = lookup(ip) where timezone is null` on a 30M-row table with no `LIMIT`. The single transaction held a row lock on every row, blocked all writes for 14 minutes, and hit the statement timeout. The migration rolled back; the column remained empty.

**Fix:** batch updates in chunks of 1,000 rows with `where timezone is null ... returning id`; loop until zero rows returned; commit between batches. Total time went up (now 35 minutes) but the service stayed available throughout.

**Lesson:** large `UPDATE` statements are not migrations, they are outages. Always batch, always commit between batches, always leave the service available.

<Callout type="tip" title="Run the case studies as archaeology">
For each case above, hand a teammate the symptoms only ("queries are slow, p99 up 100x") and have them propose diagnostics before you reveal the fix. The habit of forming a hypothesis from observable signals is the single biggest lever on debugging time.
</Callout>

## Teaching tips

- Before writing any SQL, require a one-paragraph answer to "what are the top three queries?"
- In code review, ask: what invariant does this column encode, and where is it enforced?
- When a query is slow, read the plan before tuning anything. Guessing costs more than reading.
- Migrations are deploys; treat them with the same review discipline.
