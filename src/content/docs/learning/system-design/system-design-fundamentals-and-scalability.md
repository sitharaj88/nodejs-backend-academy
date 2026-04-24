---
title: System Design Fundamentals and Scalability
slug: learning/system-design/system-design-fundamentals-and-scalability
description: Learn core system design thinking, scale dimensions, latency, throughput, bottlenecks, and how to reason about backend architecture beyond individual functions.
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

<LessonMeta level="Intermediate" duration="28 min" track="System Design" prerequisites="HTTP, databases, at least one Node.js service in production" />

Scale is not a vibe. It is a small number of equations applied to specific components. This page gives you the math you need to reason about capacity in your head, the levers you pull to change it, and the vocabulary — latency vs throughput, sharding vs replication — that makes the tradeoffs legible.

<Objectives>
- Define latency, throughput, availability, and durability in numbers, not adjectives
- Estimate capacity with Little's Law and back-of-envelope arithmetic
- Choose between vertical scale, horizontal scale, partitioning, and replication
- Distinguish cache, CDN, and load balancer by the bottleneck each removes
- Predict the next bottleneck before building out the current one
</Objectives>

## Mental model: every system has a bottleneck, and it moves

<Diagram caption="As you remove one bottleneck, another takes its place. The goal is to know where it will move.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Bottleneck chain">
    <defs>
      <marker id="sdarr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="80" width="110" height="60" rx="6" fill="#dff5e5" stroke="#2f8f46" stroke-width="1.5" />
      <text x="75" y="105" text-anchor="middle" font-weight="800">client</text>
      <text x="75" y="125" text-anchor="middle" font-size="11" fill="#596579">RTT, TLS</text>

      <rect x="150" y="80" width="110" height="60" rx="6" fill="#e9f4fb" stroke="#087ea4" stroke-width="1.5" />
      <text x="205" y="105" text-anchor="middle" font-weight="800">LB / edge</text>
      <text x="205" y="125" text-anchor="middle" font-size="11" fill="#596579">conns, TLS term</text>

      <rect x="280" y="80" width="110" height="60" rx="6" fill="#fef3d7" stroke="#b7791f" stroke-width="1.5" />
      <text x="335" y="105" text-anchor="middle" font-weight="800">app tier</text>
      <text x="335" y="125" text-anchor="middle" font-size="11" fill="#596579">CPU, loop lag</text>

      <rect x="410" y="80" width="110" height="60" rx="6" fill="#e8e4ff" stroke="#6d4aff" stroke-width="1.5" />
      <text x="465" y="105" text-anchor="middle" font-weight="800">cache</text>
      <text x="465" y="125" text-anchor="middle" font-size="11" fill="#596579">memory, keys</text>

      <rect x="540" y="80" width="90" height="60" rx="6" fill="#fde4e1" stroke="#b42318" stroke-width="1.5" />
      <text x="585" y="105" text-anchor="middle" font-weight="800">DB</text>
      <text x="585" y="125" text-anchor="middle" font-size="11" fill="#596579">IOPS, locks</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#sdarr)">
        <path d="M130 110 L150 110" />
        <path d="M260 110 L280 110" />
        <path d="M390 110 L410 110" />
        <path d="M520 110 L540 110" />
      </g>
      <text x="320" y="200" text-anchor="middle" font-size="11" fill="#596579">you almost never finish at the app tier</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Scalability is the rate of change of cost vs load">
A system "scales" when doubling the load costs less than double. That is the whole definition. Cost can be money, latency, or engineering time — but if any of them goes up super-linearly as users arrive, the system does not scale along that axis, no matter how many pods you run.
</KeyConcept>

## The four numbers

Before drawing boxes, commit to numbers.

- **Latency** — time for one request. Report as a distribution: p50, p95, p99, p99.9. Mean is a lie.
- **Throughput** — requests per second the system sustains. Report with the latency distribution it happens under.
- **Availability** — fraction of time the service meets its contract. "99.9% over 30 days" = 43 minutes of "bad" allowed.
- **Durability** — probability a committed write still exists after T years. S3's "eleven nines" means 10^-11 per object per year.

<Compare badLabel="Adjectives" goodLabel="Numbers">
<Fragment slot="bad">
"It needs to be fast and reliable and handle lots of users."
</Fragment>
<Fragment slot="good">
"p99 latency under 250 ms at 3,000 rps, 99.9% availability over 30 days, durability good enough for 10 years — we can lose a read request but never a paid order."
</Fragment>
</Compare>

## Little's Law, the most useful equation in this job

```
L = λ × W
  L = items in the system at any instant (concurrency)
  λ = arrival rate (rps)
  W = time each item spends in the system (latency, seconds)
```

If your service handles 2,000 rps at 80 ms mean latency, the concurrency in flight is `2000 × 0.08 = 160`. On 8 cores that is 20 per core — comfortable for Node.js if the work is I/O-bound.

Double the latency to 160 ms, same rps → 320 concurrent. Now you need a bigger thread pool, bigger connection pool, and more memory per replica. The number of boxes did not change; the pressure per box did.

### Back-of-envelope: designing a feed service for 10M DAU

```
DAU:        10,000,000
Sessions:   2 per user/day  → 20M sessions/day
Actions:    20 reads per session → 400M reads/day
Peak RPS:   400M / 86,400 × 3 (peak factor) ≈ 14k rps at peak
Write RPS:  ~1/50 of reads = 280 wps

Storage:
  rows per user per day:   30
  bytes per row:           200
  days retained:           365
  = 10M × 30 × 200 × 365 = ~22 TB/year

Cache budget:
  hot set: 5% of users × 1 KB/user = 500 MB
  comfortable on a single 16 GB Redis, with room to grow
```

That is the whole calculation. Three minutes of arithmetic tells you the feed is read-dominated (50:1), needs a CDN or cache for fanout, and fits one cluster of Redis. You have not picked a language yet — the math is the same in any.

## Vertical vs horizontal

<Compare badLabel="Scale up by default" goodLabel="Scale out when stateless">
<Fragment slot="bad">
Bump the instance to 32 cores, 128 GB RAM. Node.js still runs one JS thread per process; most of the extra cores sit idle. Next bottleneck arrives in two weeks; no headroom.
</Fragment>
<Fragment slot="good">
Make the service stateless (sessions in Redis, no in-proc caches), put it behind an LB, run N replicas. Autoscale by CPU or concurrency. One replica crashes, the rest absorb load.
</Fragment>
</Compare>

Horizontal scale works only for **stateless** services. Anything storing session, counters, or cached results in memory breaks the moment a new replica arrives or an old one dies. Push state to Redis, the database, or the client.

## Load balancing

A load balancer has one job: pick a healthy replica for each request. The interesting choices are:

- **Round robin** — simple, fine for uniform requests.
- **Least connections** — better when request latency varies; avoids piling work on a slow replica.
- **Consistent hashing** — sends the same key to the same replica. Essential for in-memory caches and sticky sessions.
- **Layer 4 vs Layer 7** — L4 (TCP) is fast and dumb; L7 (HTTP) sees paths, headers, can do retries and canary routing.

<Callout type="tip" title="Health checks are the LB's only honesty">
An LB that does not probe `/readyz` every few seconds sends traffic to a dead replica. Two-second interval, three-failure threshold is a reasonable default. Tune aggressively and you get flapping; tune slowly and you get user-visible errors during deploys.
</Callout>

## Partitioning and sharding

When one database cannot hold the data or serve the writes, split it.

- **Range partitioning** — by key range, e.g., `user_id 0–1M` on shard A. Simple, hotspots if traffic is skewed.
- **Hash partitioning** — by `hash(key) mod N`. Even distribution, painful to rebalance when you add a shard.
- **Consistent hashing** — key → point on a ring; shard owns a ring slice. Adding a shard moves only `1/N` of the data.
- **Directory-based** — explicit mapping `user_id → shard`. Most flexible, one more moving part.

```
# Consistent hashing, simplified
ring = [(hash("shard-a"), "shard-a"), (hash("shard-b"), "shard-b"), ...]
pick = first shard clockwise from hash(user_id)
```

Sharding multiplies every operational cost: backups, migrations, cross-shard queries, failover. Do not shard until one well-tuned primary cannot keep up.

## Replication

Copies of the same data for availability, read scale, and latency.

- **Primary/replica, asynchronous** — writes go to the primary; reads fan out to replicas. Replica lag is real; 50–400 ms is normal, longer under write pressure.
- **Primary/replica, synchronous** — primary waits for at least one replica to acknowledge. Zero data loss on failover; writes slower by the network RTT.
- **Multi-primary** — writes accepted anywhere; conflicts resolved later (LWW, CRDTs). Operationally expensive; reserved for globally distributed active-active.

<Callout type="info" title="Read-your-writes consistency is a classic trap">
A user posts a comment, then the next request reads from a replica that has not yet received the write. The comment appears to have vanished. Fix: route that user's reads to the primary for a short window, or wait for LSN on the replica, or read from primary only for "just wrote" endpoints.
</Callout>

## Caching

A cache removes a bottleneck by answering faster than the source. Where you put it matters:

- **CDN / edge** — static assets and cacheable API responses. `Cache-Control: public, s-maxage=60`. Best hit-rate-per-dollar you will ever get.
- **Application cache (Redis)** — hot rows, rate-limit counters, session tokens. Sub-millisecond when collocated with the app.
- **In-process cache** — microseconds, but only useful if per-replica duplication is acceptable. LRU with small TTL.

### Cache patterns

- **Cache-aside (lazy)** — read tries cache, falls back to DB, writes back. Simple; first reader pays the cost.
- **Read-through / write-through** — cache layer sits between app and DB. Hides misses from callers; couples two systems.
- **Write-behind** — writes go to cache, flush to DB async. Higher throughput; data loss risk on cache death.

<Compare badLabel="Unbounded cache" goodLabel="Bounded cache with TTL">
<Fragment slot="bad">
```ts
const cache = new Map<string, User>()
async function getUser(id: string) {
  if (cache.has(id)) return cache.get(id)
  const u = await db.users.find(id)
  cache.set(id, u)
  return u
}
```
Grows forever. A 6 AM load test OOMs the pod at 10 AM.
</Fragment>
<Fragment slot="good">
```ts
import QuickLRU from 'quick-lru'
const cache = new QuickLRU<string, User>({ maxSize: 10_000, maxAge: 60_000 })
```
Bounded size, bounded staleness. Tune `maxAge` to your consistency budget.
</Fragment>
</Compare>

## The bottleneck you will actually hit

Stateless Node.js apps with Postgres behind them hit bottlenecks in a predictable order:

1. **One thread of JavaScript** — fix with async I/O, workers, or horizontal scale.
2. **Database connections** — 300-ish Postgres max; fix with pgbouncer, short transactions, fewer connections per pod.
3. **Database write IOPS** — fix with partitioning (by tenant or time), CQRS, or offloading to a log.
4. **Replica lag under write load** — fix by sending reads that must be fresh to the primary.
5. **Cross-region latency** — fix with read replicas in the user's region; writes still cross the ocean.

Knowing this list lets you predict where to add observability *before* the traffic arrives.

## Pitfalls

<Pitfall title="Designing for 100× today's load">
Team spends six months building a sharded, event-sourced system for a service with 30 rps. Launch is delayed, complexity ships, real users never arrive. **Fix:** design for 10× current traffic, not 100×. Leave clear seams (stateless app, single DB) where the next scale step will go.
</Pitfall>

<Pitfall title="Hiding the bottleneck with horizontal scale">
CPU spikes on a single pod → autoscaler adds 10 more pods → database connection pool saturates → latency worse. You spent money without buying performance. **Fix:** find the bottleneck first. Adding replicas against a shared bottleneck is expensive misdirection.
</Pitfall>

<Pitfall title="Using microservices to buy scale you already have">
Splitting an 800-rps monolith into 12 services does not make it handle 8,000 rps. It adds 12 network hops. **Fix:** scale the monolith horizontally until the *database* is the bottleneck. Then split services around the data, not around the team.
</Pitfall>

## Lab

<Lab title="Size a URL shortener for 100M redirects/day" duration="60 min" difficulty="Medium" stack="Notebook, calculator, Node.js, Postgres, Redis">

### Goal
Produce a defensible design — numbers first, boxes second — for a URL shortener that serves 100M redirects/day with p99 under 80 ms, durable writes, and a single-region launch plan.

### Steps
1. Compute: average rps, peak rps (use 3× as peak factor), write:read ratio, storage/year.
2. Apply Little's Law at peak. Compute concurrency per replica at expected p99.
3. Pick a partitioning scheme for the URL map. Defend: range, hash, or consistent.
4. Pick a cache layer and a TTL. Explain what happens on a cache miss at peak.
5. Write pseudocode for the `GET /:code → 302` path and the `POST /shorten` path.
6. Name the first three bottlenecks in the order they will appear as traffic doubles, triples, quadruples. For each, name the change you will make.

### Success criteria
- Numbers are shown, not asserted. You can reproduce them on paper.
- Cache hit rate target is explicit (e.g., 98%) and justified by the storage math.
- A reader can predict the behaviour at 10× load without reopening the design.
- The rollback plan from the new partitioning back to a single primary is one paragraph and realistic.

</Lab>

## Checkpoint

<Checkpoint>
1. Your service handles 1,500 rps at 120 ms p50. Roughly how many requests are in flight at any moment?
2. Define availability for a service with an SLA of 99.95% monthly. How many minutes of "bad" does that allow?
3. When would you choose synchronous replication over asynchronous for Postgres, knowing the write latency hit?
4. A cache hit rate of 92% on a read-heavy service drops to 60% after a deploy. Name two likely causes.
5. Your team proposes splitting the monolith into services to "handle more traffic." Give two questions that check whether this will help.
</Checkpoint>

## Further reading

- [Microservices Boundaries and Data Consistency](/learning/system-design/microservices-boundaries-and-data-consistency/)
- [Messaging, Resilience, and Distributed Tradeoffs](/learning/system-design/messaging-resilience-and-distributed-tradeoffs/)
- [Performance: scaling, reliability, and capacity](/learning/performance/scaling-reliability-and-capacity/)
