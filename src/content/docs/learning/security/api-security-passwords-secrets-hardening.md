---
title: API Security, Passwords, Secrets, and Hardening
slug: learning/security/api-security-passwords-secrets-hardening
description: Learn password handling, secrets management, rate limiting awareness, validation-related hardening, and practical API security controls.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="32 min" track="Security" prerequisites="Express, HTTP headers, cookies, JSON request bodies" />

Auth is the door. Everything else in this page is the building — input validation, rate limits, headers, secrets, CSRF, CORS. Most public security incidents are not crypto bugs; they are a missing validator, a leaked `.env`, a wide-open CORS, or an endpoint that forgot to check ownership. This page walks the OWASP API Top 10 with real Node.js code you can ship.

<Objectives>
- Apply the OWASP API Top 10 as a checklist against any new endpoint
- Validate every input with a schema that rejects unknown fields
- Store and rotate secrets without writing them to disk or logs
- Harden headers, CORS, CSRF, and rate limits with named defaults you can justify
</Objectives>

## Mental model

<KeyConcept title="Attackers send the request you did not test for">
Every endpoint has three inputs: headers, query, body. Every one of them can be hostile. The question for each endpoint is: does the server behave correctly when each field is missing, too long, the wrong type, or a hostile value for its type? If you cannot answer from the code, the test suite, and the schema — the endpoint is unsafe.
</KeyConcept>

## OWASP API Top 10 as a checklist

The 2023 list, with the Node.js fix for each:

| ID | Risk | Fix in this stack |
| --- | --- | --- |
| API1 | Broken Object-Level Auth | Load-with-predicate, see [authorization page](/learning/security/authorization-rbac-abac-ownership/) |
| API2 | Broken Authentication | argon2id, rotated refresh tokens, see [auth page](/learning/security/authentication-sessions-jwt-oauth/) |
| API3 | Broken Object-Property Auth | Zod schemas + field-level allowlists in mass-assignment |
| API4 | Unrestricted Resource Consumption | Rate limits, body-size limits, query timeouts |
| API5 | Broken Function-Level Auth | Per-route `authorize()` middleware, not just "must be logged in" |
| API6 | Unrestricted Access to Sensitive Flows | Step-up auth (re-auth) on dangerous actions |
| API7 | Server-Side Request Forgery | Allowlist hostnames, never follow redirects to internal IPs |
| API8 | Security Misconfiguration | Helmet, CSP, CORS allowlist, no default credentials |
| API9 | Improper Inventory Management | One source of truth for routes; no forgotten `/v1/old/*` |
| API10 | Unsafe Consumption of APIs | Validate responses from third parties as hostile input |

## Input validation with Zod

Validation is not "it feels nice to have types." It is the layer that prevents trusted code from running on attacker-shaped data.

```ts
// src/routes/notes.ts
import { z } from 'zod'
import { Router } from 'express'

const CreateNoteBody = z.object({
  title: z.string().min(1).max(200).trim(),
  body:  z.string().min(1).max(50_000),
  visibility: z.enum(['private', 'team', 'public']).default('private'),
  teamId: z.string().uuid().optional(),
}).strict() // reject unknown keys

const router = Router()

router.post('/notes', async (req, res, next) => {
  const parsed = CreateNoteBody.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({
      error: 'VALIDATION_FAILED',
      details: parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        rule: i.code,
      })),
    })
  }
  const note = await notes.create(req.user.id, parsed.data)
  res.status(201).json(note)
})
```

The three decisions in that schema:

- `.strict()` rejects unknown fields. Without it, `{ title, body, isAdmin: true }` happily ignores `isAdmin` — until a future version passes `req.body` to an ORM and mass-assigns it.
- Field-level limits (`max(200)`, `max(50_000)`) cap payload size per field so an attacker cannot send a 50 MB title.
- `teamId: z.string().uuid().optional()` — typed at the boundary so your repository never sees arbitrary strings.

<Callout type="tip" title="Two schemas: input and output">
Define `CreateNoteBody` for input and `NotePublic` for output. The output schema strips `password_hash`, `internal_notes`, and anything else that must never be serialized. Forgetting a field in the output schema is a contract break, not a runtime crash.
</Callout>

## Mass assignment — the silent exploit

<Compare badLabel="Pass req.body to the ORM" goodLabel="Explicit field list">
<Fragment slot="bad">
```ts
// An attacker posts { title, body, role: 'admin' } and gets promoted.
app.post('/users/:id', async (req, res) => {
  const user = await User.update(req.params.id, req.body)
  res.json(user)
})
```
</Fragment>
<Fragment slot="good">
```ts
const UpdateUserBody = z.object({
  displayName: z.string().min(1).max(80).trim(),
  bio: z.string().max(500).optional(),
}).strict()

app.post('/users/:id', async (req, res) => {
  const parsed = UpdateUserBody.parse(req.body)
  const user = await User.update(req.params.id, parsed) // role cannot be set from here
  res.json(user)
})
```
</Fragment>
</Compare>

## Rate limits and body-size limits

Every public endpoint has a cost ceiling. Pick a number and enforce it.

```ts
// src/middleware/limits.ts
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import type { Redis } from 'ioredis'

export const globalLimiter = (redis: Redis) =>
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
    keyGenerator: (req) => req.ip ?? 'unknown',
  })

export const loginLimiter = (redis: Redis) =>
  rateLimit({
    windowMs: 15 * 60_000,
    limit: 10,
    store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
    keyGenerator: (req) => `${req.ip}:${req.body?.email ?? ''}`,
  })
```

```ts
// Mount with body-size limits appropriate for the route
app.use(express.json({ limit: '100kb' }))
app.post('/upload', express.raw({ limit: '5mb', type: 'application/octet-stream' }), handler)
```

Rules:

- Limit by the dimension you care about. Login should limit per IP **and** per email, so one IP cannot test a million passwords across accounts.
- Body-size limits are per-route. A default `100 KB` on the JSON parser, `5 MB` on upload routes, and explicit rejection everywhere else.
- Behind a proxy, `trust proxy` must be set or `req.ip` is the proxy's IP — and your limiter is useless.

## Helmet and secure headers

```ts
import helmet from 'helmet'

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'connect-src': ["'self'", 'https://api.example.com'],
        'img-src': ["'self'", 'data:', 'https://cdn.example.com'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
  }),
)
```

The CSP is the big lever. Start strict, loosen with named exceptions, never use `unsafe-inline` or `unsafe-eval` in production.

## CORS, as narrow as possible

```ts
import cors from 'cors'

const allowlist = new Set(['https://app.example.com', 'https://admin.example.com'])

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true) // same-origin, curl, mobile
      cb(null, allowlist.has(origin))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    maxAge: 600,
  }),
)
```

<Pitfall title="`Access-Control-Allow-Origin: *` with `credentials: true`">
Browsers refuse this combination at runtime, but older middleware silently sets both. The result is that credentialed requests from any origin go through — or do not — depending on browser version. **Fix:** an explicit allowlist of origins, or `credentials: false` for truly public APIs.
</Pitfall>

## CSRF in 2026

If your API only authenticates via `Authorization: Bearer ...` and never via cookies, you are not vulnerable to CSRF. If you use session cookies, you are.

Two good defenses:

1. **`SameSite=Lax` or `Strict`** on the session cookie (modern browsers do the work).
2. **Double-submit token** for state-changing requests from browsers. The cookie carries a random token; the JS reads it and sends it back in a header; the server compares.

```ts
import { randomBytes } from 'node:crypto'

app.use((req, res, next) => {
  if (!req.cookies.csrf) {
    const token = randomBytes(32).toString('base64url')
    res.cookie('csrf', token, { sameSite: 'lax', secure: true, path: '/' })
  }
  next()
})

app.use((req, res, next) => {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    if (!req.cookies.csrf || req.headers['x-csrf-token'] !== req.cookies.csrf) {
      return res.status(403).json({ error: 'CSRF' })
    }
  }
  next()
})
```

## Secrets, actually

Secrets never live in the repository, never in an image, and never in a log line. The operator of the service provides them at runtime.

```ts
// src/config.ts
import { z } from 'zod'

const Env = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(100),
  SESSION_SECRET: z.string().min(32),
  GOOGLE_CLIENT_SECRET: z.string().min(20),
})

export const env = Env.parse(process.env) // fails fast at boot if anything is missing
```

Production options, in order of preference:

1. **Cloud secrets manager** (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault). Service reads at startup; secrets rotate without code changes.
2. **Kubernetes secrets mounted as files**, encrypted at rest with a KMS provider.
3. **Platform env vars** (Heroku, Vercel, Fly), used for small deployments where the platform operator is trusted.

Never:
- `process.env.DATABASE_URL` written to an access log.
- `console.log({ ...env })` at boot to "debug config."
- Secrets committed to `.env` in the repo (even on a "private" branch).

<Callout type="warn" title="Scan your own history">
Run `gitleaks detect` or `trufflehog git file://.` on every repo. Secrets committed yesterday must be rotated today, not after you remove the commit.
</Callout>

## SSRF and redirect handling

When your server fetches URLs supplied by users (webhooks, link previews, image proxies), an attacker can aim the fetch at `http://169.254.169.254/` (AWS metadata) or `http://localhost:6379/` (your Redis).

```ts
// src/net/safeFetch.ts
import { lookup } from 'node:dns/promises'
import { isIP, isIPv4 } from 'node:net'

const PRIVATE_V4 = [
  /^10\./, /^127\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^169\.254\./, /^0\./,
]

function isPrivate(addr: string) {
  if (isIPv4(addr)) return PRIVATE_V4.some((r) => r.test(addr))
  return addr === '::1' || addr.startsWith('fc') || addr.startsWith('fd') || addr.startsWith('fe80')
}

export async function safeFetch(url: string, init?: RequestInit) {
  const u = new URL(url)
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('BAD_PROTOCOL')
  const addr = isIP(u.hostname) ? u.hostname : (await lookup(u.hostname)).address
  if (isPrivate(addr)) throw new Error('PRIVATE_ADDRESS')

  return fetch(url, { ...init, redirect: 'manual' }) // never follow redirects to another host
}
```

## Common pitfalls

<Pitfall title="`express.json()` with no body limit">
Default body-parser limit is 100 KB in recent versions, but older setups default to 1 MB or unlimited. An attacker POSTs a 500 MB JSON payload and your service OOMs. **Fix:** explicit `express.json({ limit: '100kb' })`, and increase only for routes that need it with a reason in code review.
</Pitfall>

<Pitfall title="Logging request bodies">
The team adds `app.use((req) => logger.info({ body: req.body }))` for debugging. Every password, token, and credit card field is now in the log aggregator, indexed, and replicated. **Fix:** never log raw bodies. If you must, run through a redaction list (`password`, `token`, `authorization`, `card`).
</Pitfall>

<Pitfall title="Generic 500 error messages that leak stack traces">
An exception handler returns `res.json({ error: err.stack })`. The stack exposes file paths, library versions, and sometimes SQL text. **Fix:** in production, return `{ error: 'INTERNAL' }` with a request id; log the stack server-side and correlate via the id.
</Pitfall>

## Lab

<Lab title="Harden a notes API end to end" duration="120 min" difficulty="Medium" stack="Node.js, Express, Zod, helmet, Redis, Vitest, supertest">

### Goal
Take an Express notes API with basic auth already in place and add validation, rate limits, helmet, CORS, CSRF, and secrets management. Prove each control with a failing-then-passing test.

### Steps
1. Wrap every route body and query with a Zod schema using `.strict()`. Add an output schema per resource and use it in serialization.
2. Apply `helmet()` with a strict CSP and confirm via supertest that `content-security-policy` and `strict-transport-security` headers are present.
3. Add global rate limiting (300/min/IP), a tighter login limiter (10/15min/IP+email), and per-route body-size limits (100 KB default, 5 MB for uploads).
4. Implement the double-submit CSRF pattern and verify state-changing requests without the header return 403.
5. Move every secret into `env` parsed by Zod at boot; add a `.env.example` with placeholders and a `gitleaks` pre-commit hook.
6. Add an `safeFetch()` and use it for any user-supplied URL (e.g. link preview). Test that `http://127.0.0.1:6379` is refused.

### Success criteria
- `supertest` tests cover: missing field returns 422, unknown field returns 422, oversized body returns 413, rate limit returns 429, CSRF failure returns 403, SSRF attempt returns error.
- Removing any one hardening middleware fails a dedicated test, and no other tests.
- Running `gitleaks detect --staged` produces zero findings.
- The CSP header contains no `unsafe-inline` or `unsafe-eval`.

</Lab>

## Checkpoint

<Checkpoint>
1. Walk through the OWASP API Top 10 in your own words, and name one defense you would add for each in an Express app.
2. Why is `.strict()` on your Zod schemas not cosmetic?
3. What two dimensions should the login rate limiter track, and why is per-IP-only not enough?
4. When does CSRF matter in 2026 and when does it not?
5. A webhook endpoint fetches user-supplied URLs. Name the two safeguards you must add before shipping it.
</Checkpoint>

## Further reading

- [Authentication, Sessions, JWT, and OAuth](/learning/security/authentication-sessions-jwt-oauth/)
- [Authorization, RBAC, ABAC, and Ownership](/learning/security/authorization-rbac-abac-ownership/)
- [Modern Security Coverage](/learning/security/modern-security-coverage/)
