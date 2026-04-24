---
title: GraphQL, gRPC, and Advanced API Shapes
slug: learning/realtime/graphql-grpc-and-advanced-api-shapes
description: Learn how GraphQL, gRPC, and other advanced API styles differ from REST, and when they are useful in backend architecture.
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

<LessonMeta level="Intermediate" duration="30 min" track="Real-Time & Advanced APIs" prerequisites="REST, TypeScript, a database you know well" />

REST works. Most of the time, a plain JSON API is the fastest path to a working product and the easiest thing for the next engineer to understand. But there are specific situations — narrow clients picking their fields, internal services that need strong contracts and binary speed, full-stack TypeScript teams that want calls to feel local — where a different shape is genuinely better. This page teaches the three you will encounter most: GraphQL, gRPC, and tRPC.

<Objectives>
- Design a small GraphQL schema with typed resolvers and avoid the N+1 trap
- Define a gRPC service with Protocol Buffers and generate a typed Node.js server and client
- Decide between REST, GraphQL, gRPC, and tRPC using three questions
- Evolve schemas without breaking deployed clients
</Objectives>

## Mental model

<Diagram caption="Four API shapes, four tradeoffs. Pick by constraint, not fashion.">
  <svg viewBox="0 0 640 240" role="img" aria-label="API shapes compared">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="30" width="140" height="180" rx="10" fill="#e9f4fb" stroke="#087ea4" />
      <text x="90" y="55" text-anchor="middle" font-weight="800">REST</text>
      <text x="90" y="80" text-anchor="middle" font-size="11" fill="#596579">resources, HTTP verbs</text>
      <text x="90" y="100" text-anchor="middle" font-size="11" fill="#596579">caches everywhere</text>
      <text x="90" y="120" text-anchor="middle" font-size="11" fill="#596579">loose contract</text>
      <text x="90" y="160" text-anchor="middle" font-size="11" fill="#596579">default for public APIs</text>

      <rect x="180" y="30" width="140" height="180" rx="10" fill="#dff5e5" stroke="#2f8f46" />
      <text x="250" y="55" text-anchor="middle" font-weight="800">GraphQL</text>
      <text x="250" y="80" text-anchor="middle" font-size="11" fill="#596579">client picks fields</text>
      <text x="250" y="100" text-anchor="middle" font-size="11" fill="#596579">one endpoint</text>
      <text x="250" y="120" text-anchor="middle" font-size="11" fill="#596579">schema is the contract</text>
      <text x="250" y="160" text-anchor="middle" font-size="11" fill="#596579">multi-client BFF</text>

      <rect x="340" y="30" width="140" height="180" rx="10" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="410" y="55" text-anchor="middle" font-weight="800">gRPC</text>
      <text x="410" y="80" text-anchor="middle" font-size="11" fill="#596579">proto schema</text>
      <text x="410" y="100" text-anchor="middle" font-size="11" fill="#596579">HTTP/2 + binary</text>
      <text x="410" y="120" text-anchor="middle" font-size="11" fill="#596579">streams, deadlines</text>
      <text x="410" y="160" text-anchor="middle" font-size="11" fill="#596579">service-to-service</text>

      <rect x="500" y="30" width="120" height="180" rx="10" fill="#fef3d7" stroke="#b7791f" />
      <text x="560" y="55" text-anchor="middle" font-weight="800">tRPC</text>
      <text x="560" y="80" text-anchor="middle" font-size="11" fill="#596579">TS types as contract</text>
      <text x="560" y="100" text-anchor="middle" font-size="11" fill="#596579">no schema language</text>
      <text x="560" y="120" text-anchor="middle" font-size="11" fill="#596579">one repo, one stack</text>
      <text x="560" y="160" text-anchor="middle" font-size="11" fill="#596579">full-stack TS apps</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="The contract is the API, not the URL">
Every API style you see in this page is a choice of how strict the contract is, who writes it, and how it is enforced. REST keeps the contract in OpenAPI (optional, often drifts). GraphQL has a schema the server compiles against. gRPC has `.proto` files generating code on both sides. tRPC uses TypeScript as the schema. Pick based on how much drift you can tolerate.
</KeyConcept>

## GraphQL — when clients want to choose fields

GraphQL is best when you have several clients with different data needs pointing at the same domain and you are tired of inventing `?fields=` query parameters and bespoke REST variants.

### Schema-first with Yoga + Pothos

```ts
// src/graphql/schema.ts
import SchemaBuilder from '@pothos/core'
import type { Context } from './context'

const builder = new SchemaBuilder<{ Context: Context }>({})

builder.queryType({
  fields: (t) => ({
    me: t.field({
      type: User,
      nullable: true,
      resolve: (_, __, ctx) => ctx.user ?? null,
    }),
    order: t.field({
      type: Order,
      nullable: true,
      args: { id: t.arg.id({ required: true }) },
      resolve: (_, { id }, ctx) => ctx.loaders.order.load(String(id)),
    }),
  }),
})

const User = builder.objectRef<{ id: string; email: string }>('User').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    orders: t.field({
      type: [Order],
      resolve: (user, _, ctx) => ctx.loaders.ordersByUser.load(user.id),
    }),
  }),
})

const Order = builder.objectRef<{ id: string; userId: string; total: number }>('Order').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    total: t.exposeInt('total'),
    user: t.field({ type: User, resolve: (o, _, ctx) => ctx.loaders.user.load(o.userId) }),
  }),
})

export const schema = builder.toSchema()
```

```ts
// src/graphql/server.ts
import { createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { makeContext } from './context'

const yoga = createYoga({ schema, context: makeContext, graphqlEndpoint: '/graphql' })
// mount on Express: app.use('/graphql', yoga.handle)
```

### Solve N+1 with DataLoader before it bites you

```ts
// src/graphql/context.ts
import DataLoader from 'dataloader'
import { db } from '../db'

export interface Context {
  user: { id: string } | null
  loaders: ReturnType<typeof makeLoaders>
}

function makeLoaders() {
  return {
    user: new DataLoader<string, { id: string; email: string }>(async (ids) => {
      const rows = await db.query('select id, email from users where id = any($1)', [ids])
      const byId = new Map(rows.map((r) => [r.id, r]))
      return ids.map((id) => byId.get(id) ?? new Error(`user ${id} not found`))
    }),
    order: new DataLoader(/* similar */),
    ordersByUser: new DataLoader<string, any[]>(async (userIds) => {
      const rows = await db.query('select * from orders where user_id = any($1)', [userIds])
      return userIds.map((u) => rows.filter((r) => r.user_id === u))
    }),
  }
}

export async function makeContext({ request }: { request: Request }): Promise<Context> {
  const user = await authFromHeader(request.headers.get('authorization'))
  return { user, loaders: makeLoaders() }
}
```

<Callout type="warn" title="A loader is per-request, not per-process">
Caching across requests leaks user data. Build a fresh loader in `makeContext` for every request.
</Callout>

<Compare badLabel="Resolver calls the DB directly" goodLabel="Resolver goes through DataLoader">
<Fragment slot="bad">
```graphql
query { users { id email orders { id total } } }
```
Resolver for `users` runs one query; resolver for `orders` runs one query per user. 100 users = 101 queries.
</Fragment>
<Fragment slot="good">
`orders` goes through `loaders.ordersByUser.load(user.id)`. DataLoader batches the 100 calls in one tick into a single `where user_id = any($1)` query. Two queries total, regardless of user count.
</Fragment>
</Compare>

### Authorization lives at the field

```ts
orders: t.field({
  type: [Order],
  authScopes: { user: true },   // pothos-plugin-scope-auth
  resolve: (user, _, ctx) => {
    if (ctx.user?.id !== user.id && !ctx.user?.isAdmin) return []
    return ctx.loaders.ordersByUser.load(user.id)
  },
}),
```

Every field is a trust boundary. A public `Order.user` without a check leaks user emails to anyone who can query an order.

### Schema evolution

GraphQL's rule: you may add fields and arguments with defaults; you may **not** remove or change the type of an existing field without versioning the schema. `@deprecated` tells clients a field is going away.

```graphql
type User {
  email: String!
  legacyName: String @deprecated(reason: "Use displayName")
  displayName: String!
}
```

## gRPC — strong contracts between services

gRPC is Google's RPC over HTTP/2 with Protocol Buffers. You write a `.proto` file and generate typed servers and clients. Binary serialisation, streaming, deadlines, and cancellation are built in. It is excellent for internal service-to-service calls and almost always wrong for public browser-facing APIs (browsers speak HTTP/1.1 fine; gRPC-Web exists but adds proxies).

### Define the contract

```proto
// proto/billing.proto
syntax = "proto3";
package billing.v1;

service Billing {
  rpc GetInvoice (GetInvoiceRequest) returns (Invoice);
  rpc PayInvoice (PayInvoiceRequest) returns (PayInvoiceResponse);
  rpc StreamInvoiceEvents (StreamRequest) returns (stream InvoiceEvent);
}

message GetInvoiceRequest { string id = 1; }

message Invoice {
  string id = 1;
  string customer_id = 2;
  int64 total_minor = 3;
  string currency = 4;
  Status status = 5;
  enum Status { PENDING = 0; PAID = 1; FAILED = 2; }
}

message PayInvoiceRequest { string id = 1; }
message PayInvoiceResponse { string reference = 1; }

message StreamRequest { string since_id = 1; }
message InvoiceEvent { string id = 1; string type = 2; int64 at_ms = 3; }
```

### Node.js server

```ts
// src/grpc/server.ts
import { Server, ServerCredentials, status } from '@grpc/grpc-js'
import { loadPackageDefinition } from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import { PayInvoice, InvoiceNotFound } from '../billing/application/pay-invoice'

const def = protoLoader.loadSync('proto/billing.proto', {
  keepCase: false, longs: String, enums: String, defaults: true, oneofs: true,
})
const pkg = loadPackageDefinition(def).billing.v1 as any

export function createGrpcServer(deps: { pay: PayInvoice }) {
  const server = new Server()
  server.addService(pkg.Billing.service, {
    async PayInvoice(call: any, cb: any) {
      try {
        const out = await deps.pay.run({ invoiceId: call.request.id })
        cb(null, { reference: out.reference })
      } catch (e) {
        if (e instanceof InvoiceNotFound) return cb({ code: status.NOT_FOUND, message: e.code })
        cb({ code: status.INTERNAL, message: 'INTERNAL' })
      }
    },
    StreamInvoiceEvents(call: any) {
      const off = events.subscribe((evt) => call.write(evt))
      call.on('cancelled', off)
    },
  })
  server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => server.start())
  return server
}
```

### Typed client

```ts
const client = new pkg.Billing('billing.svc:50051', ChannelCredentials.createInsecure())
const deadline = new Date(Date.now() + 2_000) // always set deadlines
client.PayInvoice({ id: 'inv_1' }, { deadline }, (err: any, resp: any) => {
  if (err?.code === status.NOT_FOUND) { /* ... */ }
})
```

<Callout type="tip" title="Deadlines, not timeouts">
A gRPC deadline propagates downstream. If service A calls B with a 2 s deadline, and B calls C, C knows it has "deadline minus time already spent" to respond. This is how you prevent cascading timeouts in a deep call graph.
</Callout>

<Compare badLabel="REST between services" goodLabel="gRPC between services">
<Fragment slot="bad">
JSON bodies, ad-hoc error shapes, no generated client, no type sharing, no streaming, no deadlines, no cancellation propagation. You rebuild all of that in half-working bespoke code.
</Fragment>
<Fragment slot="good">
One `.proto` file, codegen on both sides, binary encoding (smaller, faster), bidirectional streams, deadlines and cancellation end-to-end. The contract is mechanically enforced.
</Fragment>
</Compare>

## tRPC — when both ends are TypeScript

If your server and client live in one monorepo and both speak TypeScript, tRPC lets you skip schema languages entirely. The server exports types; the client imports them.

```ts
// server/trpc.ts
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const appRouter = t.router({
  getInvoice: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => invoices.byId(input.id)),
  payInvoice: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => pay.run({ invoiceId: input.id })),
})
export type AppRouter = typeof appRouter
```

```ts
// client/api.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/trpc'

export const api = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/trpc' })],
})
// api.payInvoice.mutate({ id: 'inv_1' }) — fully typed, rename-safe
```

<Callout type="info" title="tRPC is a monorepo technology">
The magic is type-sharing between two packages in the same repo. The moment your client is in a different language (Swift, Kotlin, Python) or a different codebase, you are back to needing a schema — GraphQL or gRPC.
</Callout>

## How to pick — three questions

1. **Who calls this API?**
   - Your own TypeScript client in the same repo → tRPC.
   - Many clients (web, iOS, Android) with varied field needs → GraphQL.
   - Another internal service → gRPC.
   - Third parties or an open developer platform → REST with OpenAPI.
2. **How tight must the contract be?**
   - "A mistake should fail to compile" → gRPC or tRPC.
   - "A mistake should fail a CI check against a schema" → GraphQL.
   - "A mistake is caught by a linter if anyone remembers to run it" → REST.
3. **What is the shape of a typical call?**
   - One resource with related data → REST.
   - One query spanning many resources, chosen by the client → GraphQL.
   - High-frequency, low-latency, streaming → gRPC.
   - Full-stack TS CRUD → tRPC.

## Common pitfalls

<Pitfall title="GraphQL N+1 by default">
Every resolver fires its own query. A 30-user feed with nested comments becomes 900 queries. **Fix:** DataLoader in the context, one loader per cross-entity relationship, never share across requests.
</Pitfall>

<Pitfall title="Public GraphQL with no query cost analysis">
A client asks for `users { orders { items { product { reviews { user { orders ... } } } } } }`. Your database melts. **Fix:** depth limit, complexity analysis (graphql-query-complexity), persisted queries for public exposure.
</Pitfall>

<Pitfall title="Breaking changes to gRPC field numbers">
Renaming `total` is safe; changing field number 3 from `int64` to `int32` is catastrophic — existing clients decode junk. **Fix:** never reuse field numbers; mark old fields `reserved`.
</Pitfall>

<Pitfall title="tRPC exposed to a public client">
A third-party integrator is told to import your server's types. Your refactor breaks their production. **Fix:** tRPC is for internal full-stack apps; ship a REST or GraphQL surface for public consumers.
</Pitfall>

## Lab

<Lab title="Three APIs for the same use case" duration="2.5 h" difficulty="Hard" stack="Node.js, TypeScript, GraphQL Yoga, Pothos, grpc-js, tRPC">

### Goal
Expose a `PayInvoice` use case through GraphQL, gRPC, and tRPC. Measure latency and payload size for a realistic call; discuss tradeoffs.

### Steps
1. Reuse the `PayInvoice` application class from the clean-architecture lab.
2. Add a GraphQL mutation with input validation and a typed error union (`Ok | NotFound | Declined`).
3. Define a gRPC `Billing.PayInvoice` RPC and implement the server.
4. Add a tRPC mutation sharing types with a tiny Next.js or Vite client.
5. Run each transport under `autocannon` or `ghz` (gRPC): 100 concurrent requests for 30 s. Record p50/p95/p99 and payload bytes.
6. Write a one-page memo: which transport for which caller, and why.

### Success criteria
- Same domain error (`INVOICE_NOT_FOUND`) surfaces correctly in all three
- gRPC payload is at least 30% smaller than JSON for the same content
- GraphQL DataLoader batching is verified with query logs (one select, not N)
- A schema-breaking change in each transport is caught by CI before merge

</Lab>

## Checkpoint

<Checkpoint>
1. You have a React web app, a Swift iOS app, and a Kotlin Android app that all need user + order data with slightly different fields. Which API shape fits best and why?
2. Describe the N+1 problem in GraphQL in one sentence. What is the standard fix?
3. Why are gRPC deadlines better than client-side timeouts in a chain of service calls?
4. You rename a `.proto` field from `customerId` to `customer_id`. Is this a breaking change? What about renaming field number 2 to field number 5?
5. Your team is two full-stack TypeScript engineers shipping a SaaS. A prospect wants a public developer API. Which two API shapes would you actually run, and for whom?
</Checkpoint>

## Further reading

- [WebSockets, Socket.IO, and Server-Sent Events](/learning/realtime/websockets-socketio-and-sse/) — GraphQL subscriptions often ride on WS
- [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/) — what happens after the mutation
- [Clean Architecture and Dependency Flow](/learning/architecture/clean-architecture-and-dependency-flow/) — the use case powering every transport
