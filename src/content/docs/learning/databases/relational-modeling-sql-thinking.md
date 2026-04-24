---
title: Relational Modeling and SQL Thinking
slug: learning/databases/relational-modeling-sql-thinking
description: Learn entities, relationships, normalization, foreign keys, joins, and how to think clearly about relational data in backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Intermediate" duration="28 min" track="Databases" prerequisites="SQL basics, Node.js, Postgres client" />

Relational modeling is not about drawing boxes and lines. It is about deciding what identity, uniqueness, and consistency mean in your domain — and encoding those decisions in the database so the application cannot violate them. Get this right and the rest of the stack becomes easier. Get it wrong and every feature fights you.

<Objectives>
- Translate domain nouns and verbs into entities, attributes, and relationships
- Choose keys (natural vs surrogate) with a clear rationale
- Apply normalization up to 3NF and denormalize only with written justification
- Use foreign keys, `CHECK`, `UNIQUE`, and generated columns to make invalid states unrepresentable
- Write joins that match the question you are actually asking
</Objectives>

## Mental model

<Diagram caption="An ERD is a contract: each line is an invariant the database enforces.">
  <svg viewBox="0 0 620 200" role="img" aria-label="Users posts comments ERD">
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <rect x="30" y="60" width="140" height="80" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="100" y="82" text-anchor="middle" font-weight="800">users</text>
      <text x="100" y="102" text-anchor="middle" fill="#596579">id (uuid PK)</text>
      <text x="100" y="118" text-anchor="middle" fill="#596579">email (unique)</text>
      <text x="100" y="134" text-anchor="middle" fill="#596579">created_at</text>

      <rect x="240" y="60" width="140" height="80" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="310" y="82" text-anchor="middle" font-weight="800">posts</text>
      <text x="310" y="102" text-anchor="middle" fill="#596579">id (uuid PK)</text>
      <text x="310" y="118" text-anchor="middle" fill="#596579">author_id (FK)</text>
      <text x="310" y="134" text-anchor="middle" fill="#596579">slug (unique)</text>

      <rect x="450" y="60" width="140" height="80" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="520" y="82" text-anchor="middle" font-weight="800">comments</text>
      <text x="520" y="102" text-anchor="middle" fill="#596579">id (uuid PK)</text>
      <text x="520" y="118" text-anchor="middle" fill="#596579">post_id (FK)</text>
      <text x="520" y="134" text-anchor="middle" fill="#596579">author_id (FK)</text>

      <g stroke="#596579" stroke-width="1.3" fill="none">
        <path d="M170 100 L240 100" />
        <path d="M380 100 L450 100" />
      </g>
      <text x="205" y="94" text-anchor="middle" font-size="10" fill="#596579">1 — N</text>
      <text x="415" y="94" text-anchor="middle" font-size="10" fill="#596579">1 — N</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="The schema is the contract">
Every column type, `NOT NULL`, `UNIQUE`, `CHECK`, and foreign key is a rule the database will refuse to break, even when the application is buggy. Move invariants into the schema and your tests get shorter; leave them in application code and every bug becomes an outage.
</KeyConcept>

## Entities, attributes, relationships

Start by naming the nouns your domain actually talks about, not the UI screens. A `user` is an entity; a "profile page" is not. The verbs between nouns become relationships.

```sql
-- Core entities for a small blog
create table users (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null unique,
  display_name text  not null check (length(display_name) between 1 and 80),
  created_at  timestamptz not null default now()
);

create table posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references users(id) on delete cascade,
  slug        text not null,
  title       text not null,
  body        text not null,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (author_id, slug)
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  author_id  uuid not null references users(id) on delete restrict,
  body       text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
```

<Callout type="info" title="citext beats lower(email)">
For case-insensitive uniqueness, `citext` makes the constraint honest. Without it, `Ada@example.com` and `ada@example.com` are two different users, and every `WHERE lower(email) = $1` query either misses an index or runs a scan.
</Callout>

## Keys: natural vs surrogate

A **natural key** is a value that already identifies the entity in the real world (ISBN, user email). A **surrogate key** is a synthetic value owned by the database (UUID, bigserial). Use surrogate keys as primary keys; use natural keys as unique constraints.

<Compare badLabel="Natural key as PK" goodLabel="Surrogate PK + natural unique">
<Fragment slot="bad">
```sql
create table users (
  email text primary key,
  display_name text not null
);

create table posts (
  id uuid primary key,
  author_email text not null references users(email)
);
```
If a user changes their email, every FK in the database must cascade. Email typos become schema migrations.
</Fragment>
<Fragment slot="good">
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  display_name text not null
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users(id)
);
```
Email can change tomorrow; the identity of the user does not.
</Fragment>
</Compare>

<Callout type="tip" title="UUIDv7 for new tables">
`uuid_generate_v7()` (via `pg_uuidv7` or `gen_random_uuid()` with an extension) gives you time-ordered UUIDs. Inserts stay sequential in the B-tree, pagination by `id` works, and you can still merge data across shards without collisions.
</Callout>

## Normalization, briefly and honestly

Normalize to third normal form (3NF): every non-key attribute depends on the key, the whole key, and nothing but the key. In practice that means:

- One fact per row. A `users` row does not list the user's three phone numbers.
- Derivable values are either computed in queries or stored in **generated columns**, never duplicated by hand.
- Many-to-many relationships get a join table with their own facts (timestamps, roles).

```sql
-- Tags and the join table
create table tags (
  id   uuid primary key default gen_random_uuid(),
  name citext not null unique
);

create table post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id  uuid not null references tags(id)   on delete restrict,
  tagged_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);
```

A composite primary key on `(post_id, tag_id)` makes duplicate tagging impossible and doubles as an index for "what tags does this post have?"

## Denormalize on purpose

Denormalization is a performance tool, not a modeling shortcut. Denormalize when you have measured a specific read that cannot be served fast enough, and write down what you gave up.

<Compare badLabel="Random denormalization" goodLabel="Justified cache column">
<Fragment slot="bad">
```sql
-- Copies author_display_name everywhere "so joins are faster"
alter table posts add column author_display_name text not null default '';
alter table comments add column author_display_name text not null default '';
-- Now every display-name change needs an update across N tables.
```
</Fragment>
<Fragment slot="good">
```sql
-- Cache the count only, refreshed in the write path that already touches comments
alter table posts add column comment_count integer not null default 0;

create or replace function bump_comment_count() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = old.post_id;
  end if;
  return null;
end $$ language plpgsql;

create trigger comments_count_trg
after insert or delete on comments
for each row execute function bump_comment_count();
```
One write path, one invariant. You can always re-derive `comment_count` from `comments` if it drifts.
</Fragment>
</Compare>

## Joins are how you ask questions

A join is not a performance problem. A missing index, a wrong join type, or a join that produces a Cartesian product is. Match the join to the question.

```sql
-- Authors and their published post counts, including authors with zero posts
select u.id, u.display_name, count(p.id) as published_posts
from users u
left join posts p
  on p.author_id = u.id
  and p.published_at is not null
group by u.id, u.display_name
order by published_posts desc;
```

Three things worth noticing:

1. `left join` keeps users with no posts. An `inner join` silently drops them.
2. The `published_at is not null` predicate lives in the `ON` clause so it filters before aggregation. Moving it to `WHERE` would turn the left join back into an inner join.
3. `count(p.id)` counts non-null rows; `count(*)` would count all rows including the synthetic NULL row from the left join and lie.

## From SQL to Node: parameterize everything

```ts
// src/db/posts.ts
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function findPostsByAuthor(authorId: string, limit = 20) {
  const { rows } = await pool.query<{ id: string; title: string; slug: string }>(
    `select id, title, slug
       from posts
      where author_id = $1
        and published_at is not null
      order by published_at desc
      limit $2`,
    [authorId, limit],
  )
  return rows
}
```

Never interpolate values into SQL. Parameterized queries are the only defense against SQL injection that actually works, and they let the database cache plans.

## Common pitfalls

<Pitfall title="Soft deletes that break uniqueness">
You add `deleted_at timestamptz` and a filter `where deleted_at is null` in the app layer. Two weeks later, someone signs up with an email that belonged to a deleted user and the unique constraint fails. **Fix:** use a **partial unique index**: `create unique index users_email_active on users (email) where deleted_at is null`.
</Pitfall>

<Pitfall title="Enum columns that need migrations to add a value">
`status` is modelled as a Postgres `ENUM`. Adding a new value requires `alter type ... add value`, which cannot run inside a transaction and is awkward in CI. **Fix:** use a `status text` column with a `CHECK (status in (...))` constraint, or a lookup table with a foreign key. Both are easier to evolve.
</Pitfall>

<Pitfall title="Nullable foreign keys as a modeling escape hatch">
`orders.shipping_address_id uuid references addresses(id)` is nullable "because not every order ships." Now every join must handle `NULL`, and you cannot tell "no address yet" from "digital order with no address." **Fix:** model the difference explicitly — a separate `order_shipping` table keyed on `order_id`, or an `order_type` column that gates the rule.
</Pitfall>

## Lab

<Lab title="Model a small marketplace" duration="60 min" difficulty="Medium" stack="Postgres 16, node-postgres, pgTAP or Vitest">

### Goal
Design and implement a schema for a tiny marketplace: sellers, products, orders, order_items. Enforce every invariant in the database itself.

### Steps
1. Draw an ERD. Decide for each relationship whether it is 1:1, 1:N, or N:M, and which side holds the foreign key.
2. Write migrations with `uuid` primary keys, `timestamptz` everywhere, and meaningful `CHECK` constraints (for example, `quantity > 0`, `price_cents >= 0`).
3. Add a generated column `line_total_cents` on `order_items` that equals `quantity * price_cents`. Confirm it cannot be written directly.
4. Seed ten sellers, fifty products, and twenty orders with two items each. Use `node-postgres` and explicit transactions.
5. Write a query that returns the top five sellers by revenue in the last 30 days, and another that returns orders containing products from more than one seller.

### Success criteria
- Every foreign key has `on delete` behavior chosen intentionally (cascade, restrict, or set null), and you can defend each choice in one sentence.
- Attempting to insert an order_item with `quantity = 0` fails at the database, not in the application.
- The revenue query returns in under 20 ms on the seed data (`EXPLAIN ANALYZE` shows index usage, not a sequential scan).
- The schema has zero nullable foreign keys; any optional relationship is modelled as a separate table.

</Lab>

## Checkpoint

<Checkpoint>
1. Why is a surrogate primary key almost always preferable, even when a natural key exists?
2. A table stores a user's three phone numbers in columns `phone1`, `phone2`, `phone3`. Which normal form does this violate, and what is the fix?
3. When would you choose `on delete restrict` over `on delete cascade` for a foreign key?
4. Your `left join ... where child.created_at > now() - interval '7 days'` returns fewer parents than expected. What happened, and how do you fix it?
5. Name two invariants that belong in the schema rather than in application code, and explain why.
</Checkpoint>

## Further reading

- [Queries, Indexes, Transactions, and Migrations](/learning/databases/queries-indexes-transactions-migrations/) — once you have a schema, make it fast and safe to evolve
- [Document Modeling and NoSQL Patterns](/learning/databases/document-modeling-nosql-patterns/) — the same domain modelled for access patterns
- [Modern Databases Coverage](/learning/databases/modern-databases-coverage/) — which tools to reach for in Node.js
