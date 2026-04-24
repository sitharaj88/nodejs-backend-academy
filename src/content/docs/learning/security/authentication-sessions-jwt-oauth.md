---
title: Authentication, Sessions, JWT, and OAuth
slug: learning/security/authentication-sessions-jwt-oauth
description: Learn authentication models including sessions, token-based auth, JWT usage, and OAuth concepts in backend systems.
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

<LessonMeta level="Intermediate" duration="32 min" track="Security" prerequisites="Express, HTTP basics, cookies, async/await" />

Authentication is the process of proving who is asking. Everything in this page is about turning that proof into a small piece of state — a cookie, a token — that the rest of your service can trust. Get the crypto and the session model right; the rest of the stack follows.

<Objectives>
- Hash passwords correctly with a modern KDF and know why bcrypt/scrypt/argon2 exist
- Choose between server sessions, stateless JWTs, and rotating refresh tokens with a real reason
- Integrate OAuth 2.1 with PKCE and OpenID Connect without hand-rolling token logic
- Revoke credentials on logout, compromise, and password change — actually
</Objectives>

## Mental model

<Diagram caption="Authentication = prove identity → mint session state → present it on every request.">
  <svg viewBox="0 0 620 180" role="img" aria-label="Authentication flow">
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <rect x="20" y="60" width="130" height="60" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="85" y="84" text-anchor="middle" font-weight="800">1. Prove</text>
      <text x="85" y="102" text-anchor="middle" fill="#596579">password / code / IdP</text>

      <rect x="200" y="60" width="130" height="60" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="265" y="84" text-anchor="middle" font-weight="800">2. Mint</text>
      <text x="265" y="102" text-anchor="middle" fill="#596579">cookie or token</text>

      <rect x="380" y="60" width="130" height="60" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="445" y="84" text-anchor="middle" font-weight="800">3. Present</text>
      <text x="445" y="102" text-anchor="middle" fill="#596579">on every request</text>

      <rect x="540" y="60" width="60" height="60" rx="6" fill="#fde4e1" stroke="#b42318" />
      <text x="570" y="84" text-anchor="middle" font-weight="800">4. Revoke</text>
      <text x="570" y="102" text-anchor="middle" fill="#596579">on logout</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#arrow)">
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
          </marker>
        </defs>
        <path d="M150 90 L200 90" />
        <path d="M330 90 L380 90" />
        <path d="M510 90 L540 90" />
      </g>
    </g>
  </svg>
</Diagram>

<KeyConcept title="Authentication is a proof, not a user id">
The thing the client presents on every request is evidence of a past proof. The question you must be able to answer any day of the week is: how do I revoke this evidence the instant I stop trusting it?
</KeyConcept>

## Password hashing, done right

Passwords are not stored. Their **verifier** — a one-way hash with a salt and a cost — is stored. If your database leaks, the attacker should need decades per password, not seconds.

```ts
// src/auth/password.ts
import * as argon2 from 'argon2'

const hashOptions: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024, // 19 MB — OWASP 2024 recommendation
  timeCost: 2,
  parallelism: 1,
}

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, hashOptions)
}

export async function verifyPassword(stored: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(stored, plain)
  } catch {
    return false
  }
}
```

Three rules that are non-negotiable:

1. **Use argon2id, scrypt, or bcrypt with cost ≥ 12.** Never SHA-256 or MD5. Never "just hash it."
2. **Never log the plain password, not even in debug.** It will end up in a log aggregator you forgot existed.
3. **Rehash on login when parameters change.** If you upgrade `memoryCost`, users who log in with correct passwords get their hash re-written at the new cost.

<Callout type="warn" title="Timing-safe compare for codes, hash verify for passwords">
For comparing short secrets (API keys, one-time codes), use `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))`. For passwords, `argon2.verify` handles timing correctly on your behalf.
</Callout>

## Server-side sessions — the default

A server session is the simplest correct design: you store session state server-side (Redis, Postgres) and hand the client a random id in a secure cookie.

```ts
// src/auth/session.ts
import { randomBytes } from 'node:crypto'
import type { Redis } from 'ioredis'

const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function createSession(redis: Redis, userId: string) {
  const id = randomBytes(32).toString('base64url') // 256 bits of entropy
  await redis.set(`sess:${id}`, JSON.stringify({ userId, createdAt: Date.now() }), 'EX', TTL_SECONDS)
  return id
}

export async function readSession(redis: Redis, id: string) {
  const raw = await redis.get(`sess:${id}`)
  return raw ? JSON.parse(raw) as { userId: string; createdAt: number } : null
}

export async function destroySession(redis: Redis, id: string) {
  await redis.del(`sess:${id}`)
}
```

```ts
// src/auth/routes.ts
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await users.findByEmail(email)
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
  }
  const sid = await createSession(redis, user.id)
  res.cookie('sid', sid, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
  res.json({ ok: true })
})

app.post('/logout', async (req, res) => {
  const sid = req.cookies.sid
  if (sid) await destroySession(redis, sid)
  res.clearCookie('sid')
  res.json({ ok: true })
})
```

The four cookie flags — `httpOnly`, `secure`, `sameSite`, `path` — are not decorative. Miss one and you have a real bug.

## JWTs — useful in specific cases

A JWT is a signed payload the server can verify without talking to a database. That is a feature when you have many stateless services that need to check auth; it is a bug when you want instant revocation.

```ts
// src/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose'
import { createPrivateKey, createPublicKey } from 'node:crypto'

const privateKey = createPrivateKey(process.env.JWT_PRIVATE_KEY!)
const publicKey = createPublicKey(process.env.JWT_PUBLIC_KEY!)

export async function issueAccessToken(userId: string) {
  return new SignJWT({ scope: 'user' })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer('https://api.example.com')
    .setAudience('web')
    .setExpirationTime('15m')
    .sign(privateKey)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: 'https://api.example.com',
    audience: 'web',
    algorithms: ['EdDSA'],
  })
  return payload
}
```

Notice: algorithm is pinned to `EdDSA`. That single line prevents the "none" algorithm attack and the "RSA vs HMAC" confusion attack.

<Compare badLabel="Long-lived JWT as the only credential" goodLabel="Short-lived access + rotating refresh">
<Fragment slot="bad">
```ts
// 30-day JWT stored in localStorage, no revocation mechanism
const token = await issueAccessToken(user.id, '30d')
return res.json({ token })
```
Lost device, stolen token, fired employee — the token keeps working for 30 days.
</Fragment>
<Fragment slot="good">
```ts
// 15-minute access token + long-lived refresh token bound to a session row
const accessToken = await issueAccessToken(user.id) // 15 min
const refreshToken = randomBytes(32).toString('base64url')
await redis.set(`refresh:${refreshToken}`, user.id, 'EX', 30 * 24 * 3600)
res.cookie('rt', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth' })
return res.json({ accessToken })
```
Revoke the refresh token and access stops in at most 15 minutes.
</Fragment>
</Compare>

## Refresh token rotation

Every time a refresh token is used, issue a new refresh token and invalidate the old one. If the same refresh token is ever used twice, assume compromise and revoke the whole family.

```ts
// src/auth/refresh.ts
import { randomBytes } from 'node:crypto'

export async function rotateRefresh(redis: Redis, oldToken: string) {
  const userId = await redis.get(`refresh:${oldToken}`)
  if (!userId) throw new Error('REFRESH_INVALID')

  // atomic replace — single-use
  const removed = await redis.del(`refresh:${oldToken}`)
  if (removed !== 1) {
    // Token was already used — likely replay. Nuke all refresh tokens for this family.
    await redis.del(`refresh_family:${userId}`)
    throw new Error('REFRESH_REUSE_DETECTED')
  }

  const newToken = randomBytes(32).toString('base64url')
  await redis.set(`refresh:${newToken}`, userId, 'EX', 30 * 24 * 3600)
  await redis.sadd(`refresh_family:${userId}`, newToken)
  return { userId, newToken }
}
```

## OAuth 2.1 with PKCE — the only flow worth learning

OAuth 2.1 consolidates a decade of hard-won lessons: PKCE is required for all public clients, implicit and password grants are dead. The shape of the flow for a web app:

1. Browser redirects user to the IdP with a `code_challenge` (hash of a random `code_verifier`).
2. User authenticates at the IdP, IdP redirects back to your server with a `code`.
3. Your server exchanges `code + code_verifier` for an access token (and optionally an ID token if you asked for `openid`).
4. Your server establishes a normal session for the user.

```ts
// src/auth/oauth.ts
import { createHash, randomBytes } from 'node:crypto'

function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

app.get('/auth/google/start', (req, res) => {
  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash('sha256').update(verifier).digest())
  const state = base64url(randomBytes(16))

  req.session.pkce = { verifier, state }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
  url.searchParams.set('redirect_uri', 'https://api.example.com/auth/google/callback')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', state)
  res.redirect(url.toString())
})

app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query as { code: string; state: string }
  const saved = req.session.pkce
  if (!saved || saved.state !== state) return res.status(400).send('Bad state')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: 'https://api.example.com/auth/google/callback',
    code_verifier: saved.verifier,
  })
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenRes.ok) return res.status(401).send('Token exchange failed')
  const { id_token } = await tokenRes.json()

  // Verify the ID token against Google's JWKS
  const claims = await verifyIdToken(id_token) // uses jose's createRemoteJWKSet
  const user = await users.upsertFromOidc(claims)

  const sid = await createSession(redis, user.id)
  res.cookie('sid', sid, { httpOnly: true, secure: true, sameSite: 'lax' })
  res.redirect('/')
  req.session.pkce = undefined
})
```

Two details that matter:

- The `state` parameter is CSRF protection for the callback. Store it server-side and require an exact match.
- `id_token` (OIDC) is a JWT from the IdP. Verify its signature against the IdP's JWKS, and check `iss`, `aud`, `exp`, `nonce`.

<Callout type="info" title="Let the library verify the ID token">
`jose`'s `createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))` pulls and caches the IdP's signing keys. Never hand-roll JWKS fetching — get the caching and kid rotation wrong and you silently break logins.
</Callout>

## Revocation, actually

List every way your credentials can become invalid. For each, confirm you handle it:

- User clicks logout → destroy session row and clear cookie.
- Password change → invalidate all sessions, not just the current one.
- "Sign out all devices" → list and delete every session for the user.
- Admin disables user → sessions stop working on next check.
- Token leaked in log → rotate the signing key (all tokens invalidated).

```ts
export async function invalidateAllSessions(redis: Redis, userId: string) {
  const keys = await redis.smembers(`sessions_by_user:${userId}`)
  if (keys.length) await redis.del(...keys.map((k) => `sess:${k}`))
  await redis.del(`sessions_by_user:${userId}`)
}
```

## Common pitfalls

<Pitfall title="JWTs stored in localStorage">
A `localStorage.setItem('token', jwt)` is readable by any XSS. Every third-party script you load can exfiltrate it. **Fix:** put tokens in `httpOnly; secure; sameSite` cookies, or use a BFF that keeps tokens server-side.
</Pitfall>

<Pitfall title="`alg: none` and algorithm confusion">
A library verifies a JWT and trusts the algorithm in the header. An attacker sends `alg: none` or swaps `RS256` for `HS256` using the public key as an HMAC secret. **Fix:** always pin algorithms when verifying (`algorithms: ['EdDSA']`). Use `jose`, not hand-written code.
</Pitfall>

<Pitfall title="Long-lived refresh token that never rotates">
A refresh token lasts 90 days and is reusable. When it leaks, you have no way to tell — both client and attacker can refresh forever. **Fix:** rotate on every use, detect reuse (same token used twice), and revoke the entire refresh-token family on detected replay.
</Pitfall>

## Lab

<Lab title="Ship login, refresh, and OIDC for a notes app" duration="120 min" difficulty="Medium" stack="Node.js, Express, Redis, jose, argon2">

### Goal
Implement password login with argon2id, a server session in Redis, a refresh-token rotation endpoint, and Google sign-in via OIDC with PKCE. Prove each control works with a test.

### Steps
1. Implement `POST /signup` and `POST /login` using argon2id. Rehash on login if cost has changed.
2. Issue a session cookie with the four required flags. Write a middleware that loads `req.user` from the session and a `/me` route protected by it.
3. Add access tokens (15 min) and refresh tokens (30 days) stored in Redis. Implement `/auth/refresh` with single-use rotation and replay detection.
4. Add Google OIDC with PKCE and state CSRF. Verify the `id_token` against Google's JWKS using `jose`.
5. Write a test that verifies: logout destroys the session, password change invalidates all sessions, refresh-token replay returns 401 and nukes the family.

### Success criteria
- No password, plaintext or hashed, appears in any log.
- A session cookie is rejected by a browser without `secure` (test with `sameSite=strict` and a subdomain redirect).
- `/auth/refresh` called twice with the same token returns 401 and leaves the user with no working refresh tokens.
- Removing algorithm pinning from `jwtVerify` causes a dedicated test to fail.

</Lab>

## Checkpoint

<Checkpoint>
1. Name two reasons to choose server sessions over JWTs for a typical web app.
2. A teammate proposes storing the access token in `localStorage` "so the frontend can read it." What is your counter-proposal and why?
3. Walk through the PKCE flow: what is the `code_verifier` for, and what attack does it prevent?
4. You detect that a refresh token was used twice. What do you do in the next 100 ms?
5. After a password change, how do you make sure the user is signed out of every other device?
</Checkpoint>

## Further reading

- [Authorization, RBAC, ABAC, and Ownership](/learning/security/authorization-rbac-abac-ownership/) — after you know who, decide what they can do
- [API Security, Passwords, Secrets, and Hardening](/learning/security/api-security-passwords-secrets-hardening/) — the surface around auth
- [Modern Security Coverage](/learning/security/modern-security-coverage/) — argon2, jose, passport, Clerk, Auth0
