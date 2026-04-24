---
title: Auth, Security, and API Hardening
slug: learning/nodejs/express/auth-security-api-hardening
description: Learn authentication, authorization, CORS, security middleware, rate limiting awareness, headers, and API hardening patterns in Express.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="Express" prerequisites="Middleware, validation, HTTP basics" />

A professional Express application needs security thinking early, not as a late patch.

<Objectives>
- Separate authentication (who) from authorization (what) in middleware design
- Configure CORS with real origins, not wildcards
- Apply security headers, body-size limits, and rate limiting to protect from abuse
- Store secrets outside source files and handle token lifecycles deliberately
</Objectives>

## Authentication Versus Authorization

Authentication answers:

- who is this user

Authorization answers:

- what may this user do

Students must keep these concepts separate.

<KeyConcept title="Two middleware layers, not one">
Auth middleware proves identity and populates `req.user`. Authorization middleware (per route or route group) decides whether that identity may perform the action. Combining them hides bugs.
</KeyConcept>

## Auth Middleware

```js
function requireAuth(req, res, next) {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
```

This is a teaching baseline. Real systems will also validate token structure, signature, expiry, and user state.

## Authorization Middleware

```js
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
```

Role checks are common, but resource ownership rules often matter too.

## CORS

CORS should be taught as a browser-enforced access policy concern, not as random boilerplate.

<Compare badLabel="Wildcard CORS" goodLabel="Allowlisted CORS">
<Fragment slot="bad">
```js
import cors from 'cors'
app.use(cors({ origin: '*', credentials: true }))
```
Browsers reject `credentials: true` with `*` anyway; and wide-open CORS invites cross-site abuse when cookies are involved.
</Fragment>
<Fragment slot="good">
```js
const allowed = new Set([
  'https://app.example.com',
  'https://admin.example.com',
])

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
  credentials: true,
}))
```
Explicit origin list; cookies work; security review is one `Set` away.
</Fragment>
</Compare>

Learners should understand:

- allowed origins
- methods
- credentials
- why `*` is not always acceptable

## Security Headers

Applications should think about security headers and hardened defaults. Middleware can help, but students should know what problem each header solves.

<Callout type="tip" title="`helmet` first, tune later">
`app.use(helmet())` gives you sensible defaults for `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, and more. You can relax individual policies when you actually need to — but start hardened.
</Callout>

## Rate Limiting Awareness

Rate limiting helps protect:

- login endpoints
- expensive search endpoints
- public APIs
- password reset flows

Even if learners do not implement a full production limiter immediately, they should understand the operational need.

## Input Hardening

Validation protects structure, but security also requires thinking about:

- malicious payloads
- oversized bodies
- unsafe file uploads
- unescaped output in adjacent systems

## Secrets and Environment Variables

Do not hardcode secrets in Express applications.

Students should learn to use environment-based configuration and safe secret management habits.

<Callout type="warn" title="Do not check `.env` into git">
Add `.env` to `.gitignore` from the first commit. Rotate any secret that ever lived in a tracked file — assume it is compromised.
</Callout>

## Session and Token Risks

Security discussions should include:

- token expiry
- cookie security flags
- replay risk
- theft risk
- logout and revocation strategy awareness

## Common Pitfalls

<Pitfall title="Hardcoded token secret in source">
`jwt.sign(payload, 'supersecret')` lives in a committed file. Anyone who forks or leaks the repo can mint valid tokens for your service. **Fix:** load the secret from env; rotate immediately if the old one ever touched git history.
</Pitfall>

<Pitfall title="Using roles where ownership matters">
A user has role `customer` and calls `GET /orders/:id`. The auth middleware approves because they have the `customer` role — but the order belongs to a different customer. **Fix:** combine role checks with resource-level ownership checks, or return `404` for resources that do not belong to the caller.
</Pitfall>

<Pitfall title="Rate limit only on IP">
An attacker behind a CDN rotates source IPs; your IP-based limiter sees each request as a new client. **Fix:** rate limit on user ID (after auth) and account for trusted proxies with `app.set('trust proxy', ...)` correctly set.
</Pitfall>

## Common Mistakes

- using only authentication without proper authorization checks
- allowing broad CORS rules without understanding them
- exposing sensitive internal details in error responses
- ignoring body size limits and abuse resistance
- hardcoding secrets in source files

## Practice Ideas

- add auth and role-based auth middleware to a small API
- explain a safe versus unsafe CORS configuration
- add a body-size limit and discuss why it matters
- compare 401 and 403 responses in a real route flow

## Lab

<Lab title="Harden a small API" duration="60 min" difficulty="Medium" stack="Node.js 22+, Express, helmet, cors, express-rate-limit">

### Goal
Take a vanilla Express API and apply production hardening: auth, authorization, CORS, headers, rate limiting, and size limits.

### Steps
1. Add `helmet()` and remove the `X-Powered-By` header. Verify with `curl -I`.
2. Add `cors()` with an explicit origin allowlist driven by env.
3. Add `express.json({ limit: '100kb' })` and confirm `413` on oversized bodies.
4. Add `requireAuth` that validates a JWT using a secret loaded from env (never committed).
5. Add `requireOwner` authorization for `GET /orders/:id` so one user cannot read another user's order — returning `404`, not `403`.
6. Add `express-rate-limit` on `POST /auth/login` keyed on IP + email.

### Success criteria
- All headers from `helmet` appear in responses
- Cross-origin requests from a non-allowlisted origin fail at the browser
- A cross-user order fetch returns `404`
- Login is rate-limited per account, not just per IP
- No secret exists in a committed file

</Lab>

## Checkpoint

<Checkpoint>
1. Why is `cors({ origin: '*', credentials: true })` practically broken in modern browsers?
2. Name one specific attack `X-Content-Type-Options: nosniff` mitigates.
3. Why is ownership-based authorization not replaceable by role checks?
4. What is the operational risk of an IP-only rate limiter on a login endpoint?
5. A contractor commits `.env` by accident. What do you do besides removing the file?
</Checkpoint>

## Further reading

- [Validation and Error Handling](/learning/nodejs/express/validation-error-handling/)
- [Databases, Validation, and Auth](/learning/nodejs/databases-validation-auth/)
- [Performance and Production Delivery](/learning/nodejs/express/performance-and-production-delivery/)
