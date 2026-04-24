---
title: WebSockets, Socket.IO, and Server-Sent Events
slug: learning/realtime/websockets-socketio-and-sse
description: Learn the main browser-server real-time communication models, their tradeoffs, and when each pattern fits backend systems.
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

<LessonMeta level="Intermediate" duration="28 min" track="Real-Time & Advanced APIs" prerequisites="HTTP, Express, async/await, Redis basics" />

Persistent connections look glamorous in a demo and expensive in production. Every WebSocket you accept is a file descriptor, a heap object, a piece of per-pod state, and a reason your next deploy drops users. This page teaches the three browser-compatible real-time shapes — WebSockets, Socket.IO, Server-Sent Events — what each one does to your server, and how to build them so they survive a rolling restart.

<Objectives>
- Explain the WebSocket handshake and framing at a level you can debug with `curl` and DevTools
- Choose between raw `ws`, Socket.IO, and SSE using three questions, not vibes
- Design rooms, presence, and reconnection without losing events
- Scale persistent connections across pods with a pub/sub backplane
</Objectives>

## Mental model

<Diagram caption="Three transports, three tradeoffs. HTTP for request-response, SSE for server-push only, WebSocket for full-duplex.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Real-time transports">
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="30" y="30" width="180" height="160" rx="10" fill="#e9f4fb" stroke="#087ea4" />
      <text x="120" y="55" text-anchor="middle" font-weight="800">HTTP polling</text>
      <text x="120" y="78" text-anchor="middle" font-size="11" fill="#596579">client asks, server answers</text>
      <text x="120" y="98" text-anchor="middle" font-size="11" fill="#596579">stateless, cacheable</text>
      <text x="120" y="118" text-anchor="middle" font-size="11" fill="#596579">high latency at intervals</text>

      <rect x="230" y="30" width="180" height="160" rx="10" fill="#dff5e5" stroke="#2f8f46" />
      <text x="320" y="55" text-anchor="middle" font-weight="800">Server-Sent Events</text>
      <text x="320" y="78" text-anchor="middle" font-size="11" fill="#596579">one-way push (server → client)</text>
      <text x="320" y="98" text-anchor="middle" font-size="11" fill="#596579">auto-reconnect, Last-Event-ID</text>
      <text x="320" y="118" text-anchor="middle" font-size="11" fill="#596579">plain HTTP</text>

      <rect x="430" y="30" width="180" height="160" rx="10" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="520" y="55" text-anchor="middle" font-weight="800">WebSocket</text>
      <text x="520" y="78" text-anchor="middle" font-size="11" fill="#596579">full-duplex, frames</text>
      <text x="520" y="98" text-anchor="middle" font-size="11" fill="#596579">binary or text</text>
      <text x="520" y="118" text-anchor="middle" font-size="11" fill="#596579">long-lived, stateful</text>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Pick by direction and frequency, not by hype">
If the server only pushes updates to the client, SSE is smaller, simpler, and free on every HTTP/2-capable CDN. If both sides talk equally often, WebSockets earn their complexity. If the client just needs fresh data every 30 seconds, polling is the boring right answer.
</KeyConcept>

## The WebSocket handshake

A WebSocket starts as an HTTP `Upgrade`. If you have never seen the raw exchange, nothing about connection bugs will make sense.

```
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

After `101`, the socket stops speaking HTTP and starts speaking WebSocket frames: a 2–14 byte header, an optional mask, then the payload. Your reverse proxy must be configured to pass `Upgrade` and `Connection` headers through, or the upgrade silently becomes a 200 with an empty body.

## Raw WebSockets with `ws`

The `ws` library is 100 KB, has zero dependencies, and gives you exactly the protocol — nothing more.

```ts
// src/ws-server.ts
import http from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const server = http.createServer()
const wss = new WebSocketServer({ noServer: true })

// Track connections with metadata
const clients = new Map<WebSocket, { userId: string; joinedAt: number }>()

server.on('upgrade', async (req, socket, head) => {
  const token = new URL(req.url!, 'http://x').searchParams.get('token')
  const user = await verify(token) // your auth
  if (!user) return socket.destroy()
  wss.handleUpgrade(req, socket, head, (ws) => {
    clients.set(ws, { userId: user.id, joinedAt: Date.now() })
    wss.emit('connection', ws, req)
  })
})

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = safeJsonParse(raw.toString())
    if (!msg) return ws.send(JSON.stringify({ type: 'error', code: 'BAD_JSON' }))
    // route by msg.type
  })
  ws.on('close', () => clients.delete(ws))
  ws.on('error', () => clients.delete(ws))
})

// Heartbeat — the only reliable way to detect dead TCP sockets
setInterval(() => {
  for (const ws of wss.clients) {
    if ((ws as any).isAlive === false) return ws.terminate()
    ;(ws as any).isAlive = false
    ws.ping()
  }
}, 30_000).unref()

wss.on('connection', (ws) => {
  ;(ws as any).isAlive = true
  ws.on('pong', () => ((ws as any).isAlive = true))
})

server.listen(3000)
```

<Callout type="warn" title="TCP does not tell you when a connection dies">
Laptops close their lids, phones change networks, middleboxes silently drop idle sockets. Without a heartbeat, your server will hold dead connections for hours. Ping every 30 seconds and terminate anything that missed the last pong.
</Callout>

## Socket.IO — batteries included

Socket.IO is not WebSockets. It is a protocol on top that adds namespaces, rooms, acknowledgements, automatic reconnection with state recovery, and transport fallback (long polling if WebSocket is blocked).

```ts
// src/socketio-server.ts
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const http = createServer()
const io = new Server(http, {
  cors: { origin: 'https://app.example.com' },
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
})

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token
  const user = await verify(token)
  if (!user) return next(new Error('UNAUTHENTICATED'))
  socket.data.user = user
  next()
})

io.on('connection', (socket) => {
  const { id: userId } = socket.data.user
  socket.join(`user:${userId}`)

  socket.on('conversation:join', (conversationId: string, ack) => {
    if (!canRead(userId, conversationId)) return ack({ ok: false, code: 'FORBIDDEN' })
    socket.join(`conversation:${conversationId}`)
    ack({ ok: true })
  })

  socket.on('message:send', async (payload, ack) => {
    const msg = await createMessage({ ...payload, senderId: userId })
    io.to(`conversation:${payload.conversationId}`).emit('message:new', msg)
    ack({ ok: true, id: msg.id })
  })

  socket.on('disconnect', () => {
    // presence update, cleanup
  })
})

http.listen(3000)
```

<Compare badLabel="Reinventing Socket.IO with `ws`" goodLabel="Using Socket.IO for the right shape">
<Fragment slot="bad">
Starting with `ws`, you write: your own message framing, a `type` field for routing, reconnection logic in the client, a manual room registry, an acknowledgement pattern, a heartbeat, and transport fallback for clients behind strict proxies. Three months later you have rebuilt Socket.IO badly.
</Fragment>
<Fragment slot="good">
Socket.IO gives you all of that on day one. The cost: a specific protocol (your clients use `socket.io-client`), slightly larger payloads, and some magic you must understand before you debug it. For chat, dashboards, and collaborative UIs, the cost is almost always worth it.
</Fragment>
</Compare>

<Compare badLabel="Socket.IO for a notifications stream" goodLabel="SSE for the same job">
<Fragment slot="bad">
```ts
io.on('connection', (socket) => {
  socket.on('notifications:subscribe', () => socket.join(`user:${socket.data.user.id}`))
})
```
A full Socket.IO stack, WebSocket fallback, heartbeats, a sticky-session load balancer — all to deliver one-way notifications.
</Fragment>
<Fragment slot="good">
```ts
app.get('/notifications/stream', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  const send = (event: string, data: unknown, id?: string) => {
    if (id) res.write(`id: ${id}\n`)
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  const off = notifications.subscribe(req.user.id, (n) => send('notification', n, n.id))
  req.on('close', off)
})
```
Plain HTTP, no framework, auto-reconnect in every browser, `Last-Event-ID` for replay.
</Fragment>
</Compare>

## Server-Sent Events in detail

SSE is an underappreciated tool. It is `text/event-stream`, it reconnects automatically, and it passes through HTTP/2 cleanly. The protocol is two headers and a newline-delimited payload.

```
event: message
id: 42
data: {"text":"hello"}

```

The client:

```ts
const es = new EventSource('/notifications/stream')
es.addEventListener('notification', (e) => {
  const n = JSON.parse(e.data)
  // ...
})
```

On disconnect, the browser reconnects with `Last-Event-ID: 42` in the request header. Your server can replay anything newer.

<Callout type="tip" title="SSE does not work over HTTP/1.1 behind a per-origin connection limit">
Browsers limit concurrent HTTP/1.1 connections per origin (typically 6). Open two SSE streams from two tabs and the third request stalls. Deploy behind HTTP/2 — this is free on any modern CDN or reverse proxy (nginx, Caddy, Cloudflare).
</Callout>

## Scaling across pods

One WebSocket server is fine. Two are a distributed-systems problem.

```
      ┌────────┐          ┌────────┐
  ──▶ │ pod 1  │          │ pod 2  │ ◀──
      │ 1k ws  │          │ 1k ws  │
      └───┬────┘          └────┬───┘
          │                    │
          └────── Redis ───────┘
             (pub/sub backplane)
```

When pod 1 receives a message destined for a user connected to pod 2, it cannot just `io.to(...).emit(...)` — pod 1 has no socket for that user. Publish to Redis; the adapter forwards.

```ts
// Socket.IO with Redis adapter
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pub = createClient({ url: process.env.REDIS_URL })
const sub = pub.duplicate()
await Promise.all([pub.connect(), sub.connect()])

io.adapter(createAdapter(pub, sub))
```

For raw `ws`, write the backplane yourself: one Redis subscriber per pod publishes messages to a fan-out channel keyed by `user:${id}`, every pod subscribes and delivers to its local sockets.

<Callout type="info" title="Sticky sessions are not optional">
A client that starts a handshake on pod 1 but lands on pod 2 mid-handshake will see the connection fail. Most real deployments terminate WebSockets at a load balancer with sticky sessions (by cookie or client IP). On Kubernetes: `sessionAffinity: ClientIP`.
</Callout>

## Rolling restarts without dropping the world

Your pods will restart. The question is whether users notice.

```ts
process.on('SIGTERM', async () => {
  // 1. Stop accepting new connections
  server.close()
  // 2. Tell existing clients to reconnect elsewhere
  for (const socket of io.sockets.sockets.values()) {
    socket.emit('server:drain', { reason: 'deploy' })
  }
  // 3. Give clients a moment to reconnect, then exit
  setTimeout(() => process.exit(0), 5_000).unref()
})
```

On the client, `server:drain` triggers an immediate `disconnect() + connect()`. A good load balancer already removed this pod from rotation before SIGTERM, so clients reconnect to a healthy pod without seeing a dropped message — provided you have the Redis backplane above.

## Common pitfalls

<Pitfall title="Broadcasting to everyone instead of to a room">
`io.emit('message:new', msg)` instead of `io.to('conversation:42').emit(...)`. Every user in the system receives every message. Fine with 10 users, catastrophic with 10,000. **Fix:** always emit to a room; only `io.emit` from admin scripts.
</Pitfall>

<Pitfall title="Reverse proxy strips the Upgrade header">
Client gets `200 OK` with an empty body, handshake fails, and the console shows &ldquo;WebSocket connection failed.&rdquo; **Fix:** in nginx, `proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_http_version 1.1;`. In load balancers, enable WebSocket support (`aws_lb` target group protocol, Cloudflare WebSocket toggle).
</Pitfall>

<Pitfall title="Storing state on the socket object">
`socket.cart = [...]` on a Socket.IO connection. Works until the client reconnects on another pod. **Fix:** state lives in Redis or the database; the socket is a delivery channel, not a session store.
</Pitfall>

<Pitfall title="No backpressure on broadcasts">
A chat room with 20,000 subscribers receives a message. `io.to(room).emit(...)` writes 20,000 payloads synchronously into socket buffers; the event loop blocks for hundreds of milliseconds. **Fix:** chunk large rooms, compress messages, and measure with `monitorEventLoopDelay` (see [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/)).
</Pitfall>

## Lab

<Lab title="Chat with rooms, presence, and a Redis backplane" duration="2 h" difficulty="Medium" stack="Node.js, TypeScript, Socket.IO, Redis, Vitest">

### Goal
Build a chat service where messages sent on one pod reach users connected to another pod, presence updates within 2 seconds of a disconnect, and a rolling restart drops no messages.

### Steps
1. Scaffold a Socket.IO server with JWT auth in `io.use`.
2. Model conversations as rooms (`conversation:${id}`). Gate `join` on DB authorization.
3. Add presence: on connect, `SADD presence:online ${userId}`; on disconnect, `SREM` and broadcast `presence:offline`.
4. Run two instances behind a local nginx with sticky sessions. Add the `@socket.io/redis-adapter`.
5. Implement `server:drain` on SIGTERM; verify the client reconnects seamlessly.
6. Write a load test with 500 clients and 100 messages per second; measure broadcast latency p99.

### Success criteria
- A client connected to pod A receives messages sent from pod B within 50 ms p99 locally
- Killing pod A (SIGTERM, 5 s drain) causes no visible message loss for its clients
- Event-loop lag p99 stays under 10 ms during the load test
- Presence changes propagate within 2 s

</Lab>

## Checkpoint

<Checkpoint>
1. What exactly happens between `GET /chat HTTP/1.1 Upgrade: websocket` and `101 Switching Protocols`? Name two things the proxy must pass through.
2. You need to push notifications from server to browser and nothing else. Pick the transport and defend it in two sentences.
3. Why does Socket.IO add heartbeats, and what breaks when you disable them?
4. Your chat works with one pod and fails with two. What is the first thing you suspect?
5. A room has 50,000 subscribers. A message is sent. What do you measure, and what do you change if it is slow?
</Checkpoint>

## Further reading

- [Queues, Jobs, Webhooks, and Event-Driven Flows](/learning/realtime/queues-jobs-webhooks-and-event-driven-flows/) — the async counterpart
- [Modern Real-Time Coverage](/learning/realtime/modern-realtime-coverage/) — the full ecosystem map
- [Performance, Profiling, and the Event Loop](/learning/performance/performance-profiling-event-loop/) — why broadcasting blocks the loop
