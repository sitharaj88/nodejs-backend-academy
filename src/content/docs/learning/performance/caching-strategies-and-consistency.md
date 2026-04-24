---
title: Caching Strategies and Consistency
slug: learning/performance/caching-strategies-and-consistency
description: Choose a cache layer, an invalidation strategy, and a consistency model deliberately. Learn look-aside, write-through, stale-while-revalidate, and how to avoid stampedes.
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

<LessonMeta level="Intermediate" duration="22 min" track="Performance" prerequisites="Node.js, Redis basics" />

Caching is the sharpest tool in the performance drawer and the one most likely to cut you. It trades freshness for speed, and the bug it produces — "the site shows stale data to one user out of fifty" — is expensive to debug. This page is how to cache on purpose.

<Objectives>
- Pick the right cache tier (HTTP / edge / app / distributed / DB) for a workload
- Apply look-aside, write-through, write-behind, and stale-while-revalidate correctly
- Choose a TTL with a reason, not a round number
- Prevent thundering herds and cache stampedes on hot keys
</Objectives>

## The cache hierarchy

<Diagram caption="Every layer below the browser is a tradeoff: speed versus freshness.">
  <svg viewBox="0 0 620 220" role="img" aria-label="Cache hierarchy">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <g>
        <rect x="30" y="20"  width="560" height="32" rx="6" fill="#e8e4ff" stroke="#6d4aff"/>
        <text x="50" y="40" font-weight="800">Browser / Client</text>
        <text x="580" y="40" text-anchor="end" font-size="11" fill="#596579">cache-control, etag</text>
      </g>
      <g>
        <rect x="30" y="58"  width="560" height="32" rx="6" fill="#e9f4fb" stroke="#087ea4"/>
        <text x="50" y="78" font-weight="800">Edge / CDN</text>
        <text x="580" y="78" text-anchor="end" font-size="11" fill="#596579">geographic, shared</text>
      </g>
      <g>
        <rect x="30" y="96"  width="560" height="32" rx="6" fill="#dff5e5" stroke="#2f8f46"/>
        <text x="50" y="116" font-weight="800">Application (in-process)</text>
        <text x="580" y="116" text-anchor="end" font-size="11" fill="#596579">lru-cache, per-pod</text>
      </g>
      <g>
        <rect x="30" y="134" width="560" height="32" rx="6" fill="#fef3d7" stroke="#b7791f"/>
        <text x="50" y="154" font-weight="800">Distributed (Redis / Memcached)</text>
        <text x="580" y="154" text-anchor="end" font-size="11" fill="#596579">shared across pods</text>
      </g>
      <g>
        <rect x="30" y="172" width="560" height="32" rx="6" fill="#fde4e1" stroke="#b42318"/>
        <text x="50" y="192" font-weight="800">Database (indexes, materialized views)</text>
        <text x="580" y="192" text-anchor="end" font-size="11" fill="#596579">source of truth</text>
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Rule of thumb">
Cache the **nearest** layer that gives acceptable freshness. A 60-second CDN TTL often outperforms a complicated Redis invalidation scheme, and does it for free.
</KeyConcept>

## Access patterns

Four patterns cover almost every case.

### Look-aside (most common)

```ts
async function getProduct(id: string): Promise<Product> {
  const cached = await redis.get(`product:${id}`)
  if (cached) return JSON.parse(cached)
  const fresh = await db.products.findUnique({ where: { id } })
  if (fresh) await redis.set(`product:${id}`, JSON.stringify(fresh), 'EX', 300)
  return fresh
}
```

App reads from cache; on miss, reads from DB and writes to cache. Simple, debuggable, invalidation is explicit.

### Write-through

```ts
async function updateProduct(id: string, patch: Partial<Product>) {
  const updated = await db.products.update({ where: { id }, data: patch })
  await redis.set(`product:${id}`, JSON.stringify(updated), 'EX', 300)
  return updated
}
```

Every write goes through both stores. Cache is never stale after a successful write — but a failed cache write can silently diverge from the DB.

### Write-behind

Application writes to cache first, async job drains to DB. Fast writes, high risk of loss. Rare in web backends; common in metrics pipelines.

### Stale-while-revalidate

```ts
// fetch returns immediately with potentially stale data
// in the background, a refresh is scheduled
const cache = new Map<string, { value: unknown; expiresAt: number; refreshing?: boolean }>()

export async function swr<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  const now = Date.now()
  if (hit && hit.expiresAt > now) return hit.value as T

  if (hit && !hit.refreshing) {
    hit.refreshing = true
    loader()
      .then((v) => cache.set(key, { value: v, expiresAt: now + ttlMs }))
      .catch(() => {})
    return hit.value as T // serve stale
  }

  const v = await loader()
  cache.set(key, { value: v, expiresAt: now + ttlMs })
  return v
}
```

Users never wait on a cold miss after warm-up. Use it for data that is tolerably stale for a few seconds.

## Invalidation — the hard part

> There are only two hard things in computer science: cache invalidation and naming things. — Phil Karlton

Three workable strategies:

1. **Time-based (TTL):** the cache entry expires. Simple, eventually consistent. Use when stale reads are fine for the TTL duration.
2. **Event-based:** every write to the source publishes an invalidation (`redis publish`, outbox → consumer). Freshness is near-real-time. Needs infrastructure.
3. **Version-key:** keys embed a version (`product:v4:123`). Writes increment the version; old entries simply stop being read. No delete step needed.

<Callout type="tip" title="Pick a TTL with a reason">
&ldquo;5 minutes&rdquo; is a round-number cop-out. Write it down: &ldquo;Price changes affect the cart total. Business is OK with up to 30 s of stale pricing during a sale.&rdquo; → TTL = 30 s.
</Callout>

## Cache stampedes

One hot key expires. Ten thousand concurrent requests all miss, all hit the DB, and the DB falls over.

<Compare badLabel="Naive miss → DB" goodLabel="Single-flight or jittered TTL">
<Fragment slot="bad">
```ts
const cached = await redis.get(key)
if (!cached) {
  const fresh = await db.load(id) // all N callers do this
  await redis.set(key, fresh, 'EX', 60)
  return fresh
}
```
</Fragment>
<Fragment slot="good">
```ts
// Single-flight with a short lock
const cached = await redis.get(key)
if (cached) return JSON.parse(cached)

const lock = await redis.set(`${key}:lock`, '1', 'NX', 'EX', 5)
if (!lock) { await sleep(50); return getWithCache(id) } // retry

try {
  const fresh = await db.load(id)
  // Add jitter to avoid synchronized expirations
  await redis.set(key, JSON.stringify(fresh), 'EX', 60 + rand(0, 20))
  return fresh
} finally {
  await redis.del(`${key}:lock`)
}
```
</Fragment>
</Compare>

## HTTP cache headers — the free tier

For public GETs, correct headers make the CDN do the work.

```ts
app.get('/api/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id)
  res.set({
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'ETag': `"${product.version}"`,
  })
  if (req.headers['if-none-match'] === `"${product.version}"`) return res.status(304).end()
  res.json(product)
})
```

## Pitfalls

<Pitfall title="Caching per-user data in a shared cache without a user scope">
A key `dashboard:data` is populated by Alice, served to Bob. Data leak, impossible to debug after the fact. **Fix:** `dashboard:data:${userId}` — always scope keys by whatever the data is &ldquo;about.&rdquo;
</Pitfall>

<Pitfall title="Forever TTLs">
`EX 2592000` (30 days) on user profile. The user changes their email. They see the old address for a month. **Fix:** invalidate on write or pick a TTL that matches the business tolerance.
</Pitfall>

<Pitfall title="Cache as store">
A team removes the database query entirely — &ldquo;it's in Redis, why go twice?&rdquo; Redis restarts for maintenance. Cold cache, empty responses, outage. **Fix:** cache is derived state; the database is truth. Always have a path back to the source.
</Pitfall>

## Lab

<Lab title="Cache a hot read path safely" duration="60 min" difficulty="Medium" stack="Node.js, Redis, Express, autocannon">

### Goal
Take a `GET /products/:id` endpoint that hits Postgres directly (120 ms p99 under load). Add a cache with an explicit freshness contract and stampede protection.

### Steps
1. Baseline: load-test at 500 rps and record p50/p95/p99.
2. Add look-aside caching with a 60 s TTL and 10–20% jitter.
3. Verify stampede protection: kill the key during load; confirm only one backend query fires.
4. Add `Cache-Control` and `ETag` to responses.
5. Invalidate on `PUT /products/:id` using a version-key scheme.

### Success criteria
- p99 at 500 rps drops below 20 ms
- DB QPS drops by ≥90% during a 1-minute sustained load
- Deleting the key mid-load produces one DB query, not 500
- After a PUT, the next GET returns the new version within 1 s

</Lab>

## Checkpoint

<Checkpoint>
1. Name three places a cached value can live between a browser and your database.
2. What is the difference between write-through and write-behind? When is each appropriate?
3. A single-flight lock protects against which specific failure mode?
4. Why is `Cache-Control: public, max-age=60` different from caching in your Redis with the same TTL?
5. A bug shows &ldquo;Alice&rdquo; seeing Bob's dashboard. What is the first thing you inspect?
</Checkpoint>

## Further reading

- [Profiling and the Event Loop](/learning/performance/performance-profiling-event-loop/)
- [Scaling, Reliability, and Capacity](/learning/performance/scaling-reliability-and-capacity/)
- [Databases: queries, indexes, transactions, migrations](/learning/databases/queries-indexes-transactions-migrations/)
