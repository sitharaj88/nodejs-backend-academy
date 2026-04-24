---
title: Document Modeling and NoSQL Patterns
slug: learning/databases/document-modeling-nosql-patterns
description: Learn document-oriented modeling, embedding versus referencing, schema flexibility, and when NoSQL patterns are useful in backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="26 min" track="Databases" prerequisites="JavaScript objects, MongoDB basics, Node.js" />

Document databases are not "SQL without schemas." They ask you to model around **access patterns** instead of entity normal forms. The right document shape makes your hot reads one query; the wrong one leads to fan-out, stale duplicates, and the same data scattered across collections with no one to enforce consistency.

<Objectives>
- Decide embed vs reference using read/write ratio, update locality, and size caps
- Design documents around the top three queries, not the entity list
- Use subset, bucket, extended-reference, and computed patterns deliberately
- Know when a document database is the wrong tool and say so
</Objectives>

## Mental model

<KeyConcept title="Model for the query, not the entity">
In a relational store you normalize entities and let joins assemble answers at read time. In a document store there are no joins worth counting on — the shape of the document is the query. If the home feed shows a post with its author and last three comments, that document should be one read.
</KeyConcept>

A useful heuristic: write down your top three queries before you touch a schema. If two of them return the same three fields from two different collections, those fields want to live together.

## Embedding vs referencing

Embedding puts related data inside the parent document. Referencing stores an id and resolves it with a second query. Pick based on four questions:

1. **How are they read?** Always together → embed. Sometimes together → reference with selective projection.
2. **How are they written?** Updated together in one unit → embed. Independently → reference.
3. **How large is the child set?** Bounded and small → embed. Unbounded (messages in a chat) → reference or bucket.
4. **Who owns consistency?** One owner → embed. Many writers → reference.

<Compare badLabel="Wrong: unbounded embed" goodLabel="Right: bounded embed + bucketed overflow">
<Fragment slot="bad">
```js
// Every comment embedded in the post document
{
  _id: ObjectId("..."),
  title: "Hello",
  author: { _id: "...", name: "Ada" },
  comments: [ /* grows forever */ ]
}
// Document eventually exceeds 16 MB; every write rewrites the whole thing.
```
</Fragment>
<Fragment slot="good">
```js
// Post keeps the latest three for display
{
  _id: ObjectId("..."),
  title: "Hello",
  author: { _id: "...", name: "Ada" },
  comment_count: 412,
  recent_comments: [ /* cap at 3 */ ]
}

// Older comments live in bucketed documents
{
  _id: ObjectId("..."),
  post_id: ObjectId("..."),
  bucket: 0,            // 0..N
  count: 100,
  comments: [ /* up to 100 per bucket */ ]
}
```
Reads of a post stay one document; deep history pages load one bucket at a time.
</Fragment>
</Compare>

## The four patterns you will use every week

### 1. Subset pattern

Store a subset of the frequently read data on the parent, with a link to the full record.

```js
// product document carries the top 5 reviews
{
  _id: ObjectId("p1"),
  name: "Noise-cancelling headphones",
  price_cents: 29900,
  top_reviews: [
    { _id: ObjectId("r1"), rating: 5, excerpt: "Excellent", author: "Ada" },
    { _id: ObjectId("r2"), rating: 4, excerpt: "Solid",    author: "Grace" }
  ],
  review_count: 812,
  average_rating: 4.6
}
```

Use it when the main page shows a preview (top reviews, last three messages, latest posts by an author) and a detail page loads the rest.

### 2. Extended reference pattern

Duplicate a few fields from the referenced document so the common read does not need a second query.

```js
// order stores a snapshot of the customer name and shipping address
{
  _id: ObjectId("o1"),
  customer: {
    _id: ObjectId("c1"),
    name: "Ada Lovelace",           // snapshot at order time
    shipping_address: { city: "London", postal_code: "EC1A" }
  },
  items: [ /* ... */ ]
}
```

Snapshots are frequently the **right** behavior. An invoice should show the address as it was when the order was placed, not today's.

### 3. Bucket pattern

Group many small records into fixed-size documents. Time-series data, IoT readings, chat history.

```js
// 60 readings per minute bucket
{
  _id: ObjectId("..."),
  sensor_id: "s-42",
  bucket_minute: ISODate("2026-04-24T13:15:00Z"),
  count: 60,
  readings: [ { t: 0, v: 22.1 }, { t: 1, v: 22.1 }, /* ... */ ]
}
```

### 4. Computed pattern

Store derived values that are expensive to recompute on every read: counts, sums, pre-aggregated hourly rollups. Recompute in the write path or a scheduled job.

## Schema validation in MongoDB

"Schemaless" is a lie; there is always a schema, the question is where it lives. Put it in the database.

```js
db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'author_id', 'created_at'],
      properties: {
        title: { bsonType: 'string', minLength: 1, maxLength: 200 },
        author_id: { bsonType: 'objectId' },
        created_at: { bsonType: 'date' },
        recent_comments: {
          bsonType: 'array',
          maxItems: 3,
          items: {
            bsonType: 'object',
            required: ['body', 'author'],
            properties: {
              body: { bsonType: 'string', maxLength: 500 },
              author: { bsonType: 'string' }
            }
          }
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
})
```

<Callout type="info" title="validationAction: error, not warn">
`validationAction: 'warn'` ships broken documents with a log line no one reads. Use `'error'` from day one, or you are just running a slower relational database with worse constraints.
</Callout>

## Mongoose: schemas in code, with discipline

```ts
// src/models/post.ts
import { Schema, model, Types } from 'mongoose'

const CommentSummarySchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: true },
    body: { type: String, required: true, maxlength: 500 },
    author: { type: String, required: true },
  },
  { _id: false },
)

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true },
    author_id: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },
    recent_comments: { type: [CommentSummarySchema], default: [], validate: (v: unknown[]) => v.length <= 3 },
    comment_count: { type: Number, default: 0, min: 0 },
    created_at: { type: Date, default: () => new Date(), index: true },
  },
  { versionKey: false },
)

PostSchema.index({ author_id: 1, created_at: -1 })
PostSchema.index({ slug: 1 }, { unique: true })

export const Post = model('Post', PostSchema)
```

```ts
// src/services/comments.ts — keep recent_comments capped on write
import { Types } from 'mongoose'
import { Post } from '../models/post'
import { Comment } from '../models/comment'

export async function addComment(postId: string, body: string, author: string) {
  const comment = await Comment.create({ post_id: postId, body, author })

  await Post.updateOne(
    { _id: new Types.ObjectId(postId) },
    {
      $inc: { comment_count: 1 },
      $push: {
        recent_comments: {
          $each: [{ _id: comment._id, body: comment.body, author: comment.author }],
          $slice: -3, // keep last three only
        },
      },
    },
  )

  return comment
}
```

`$push` with `$slice` caps the embedded array without a separate read. The `$inc` keeps the computed count accurate. Both happen in one update — no transaction needed.

## Transactions exist; use them for what needs atomicity

MongoDB supports multi-document ACID transactions on replica sets. They cost more than single-document updates, so reserve them for real cross-document invariants.

```ts
import { startSession } from 'mongoose'

export async function transferCredits(fromId: string, toId: string, amount: number) {
  const session = await startSession()
  try {
    await session.withTransaction(async () => {
      const ok = await User.updateOne(
        { _id: fromId, credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { session },
      )
      if (ok.modifiedCount !== 1) throw new Error('INSUFFICIENT_CREDITS')
      await User.updateOne({ _id: toId }, { $inc: { credits: amount } }, { session })
    })
  } finally {
    session.endSession()
  }
}
```

<Callout type="warn" title="Design away from cross-document transactions">
If you find yourself reaching for transactions often, your document boundaries are probably wrong. Ask whether the two documents should be one, or whether the invariant belongs on a single owner document.
</Callout>

## When a document database is the wrong tool

Document stores lose ground when:

- The domain is deeply relational and every read needs three or four joins.
- Reporting and ad-hoc analytics dominate. SQL is a better query language than aggregation pipelines.
- Strong cross-entity consistency is table stakes (financial ledgers, inventory with reservations).
- You need multi-statement transactions across many documents on the hot path.

"Postgres with a `jsonb` column" often gives you document flexibility and relational joins. Consider it before reaching for MongoDB.

## Common pitfalls

<Pitfall title="Unbounded arrays">
A `tags` array grows to thousands of entries. Every update rewrites the whole document; indexes on other fields bloat. **Fix:** cap embedded arrays (bucket pattern) or move the collection out and reference it. MongoDB's 16 MB document limit is a ceiling, not a target.
</Pitfall>

<Pitfall title="Snapshots that go stale and matter">
You embed `author.name` in every post. A user changes their display name and the old posts still show the old name. Sometimes that is correct (invoices), sometimes it is a bug. **Fix:** write down the rule. If the display must stay current, do not embed the name — reference it and project at read time, or run a background job that fans out changes.
</Pitfall>

<Pitfall title="Using `$lookup` like a relational join">
You discover `$lookup` and start assembling full relational graphs in aggregation pipelines. Performance collapses on large collections. **Fix:** `$lookup` is a last resort. If you need it on a hot path, either the schema is wrong or you are using the wrong database.
</Pitfall>

## Lab

<Lab title="Model a chat app, document-first" duration="60 min" difficulty="Medium" stack="MongoDB 7, Mongoose, Vitest">

### Goal
Design documents for a chat app — users, channels, messages — so the three hot reads (channel list, latest messages, one message's thread) are each a single query.

### Steps
1. List the top three read queries in one sentence each before writing code.
2. Create a `channels` collection with an extended-reference snapshot of the creator and a capped `recent_messages` array of length 20.
3. Create a `message_buckets` collection with one document per 100 messages per channel. Write an `appendMessage(channelId, msg)` that appends to the open bucket or starts a new one when full.
4. Add a `$jsonSchema` validator to both collections that rejects missing fields.
5. Write Vitest integration tests using Testcontainers' `MongoDBContainer`. Assert: `recent_messages` stays capped at 20; `appendMessage` never creates a 101st message in a bucket; schema validator rejects a message with no body.

### Success criteria
- The "load a channel" read is one `findOne`; the "scroll history" read is a single `find` on buckets with `limit(1)`.
- `appendMessage` is idempotent under concurrent calls (use `findOneAndUpdate` with a filter on bucket count).
- Schema validator is `validationLevel: strict, validationAction: error`.
- No query uses `$lookup`.

</Lab>

## Checkpoint

<Checkpoint>
1. Given a "show post with author name and top 3 comments" read, would you embed, reference, or snapshot each piece? Defend each choice.
2. When does the bucket pattern beat one-document-per-record, and what does it cost?
3. A user's display name changes. Which embedded snapshots should update and which should not? How do you decide?
4. You find yourself using `$lookup` on the hot path. What are the two questions to ask before tuning the query?
5. Name two cases where Postgres with a `jsonb` column is a better answer than MongoDB.
</Checkpoint>

## Further reading

- [Relational Modeling and SQL Thinking](/learning/databases/relational-modeling-sql-thinking/) — the same domain, modelled by entities
- [Queries, Indexes, Transactions, and Migrations](/learning/databases/queries-indexes-transactions-migrations/) — make your documents fast and safe
- [Modern Databases Coverage](/learning/databases/modern-databases-coverage/) — Mongoose, native driver, and when to leave Mongo behind
