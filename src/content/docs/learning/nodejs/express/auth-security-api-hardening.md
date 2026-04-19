---
title: Auth, Security, and API Hardening
slug: learning/nodejs/express/auth-security-api-hardening
description: Learn authentication, authorization, CORS, security middleware, rate limiting awareness, headers, and API hardening patterns in Express.
---

A professional Express application needs security thinking early, not as a late patch.

## Authentication Versus Authorization

Authentication answers:

- who is this user

Authorization answers:

- what may this user do

Students must keep these concepts separate.

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

Learners should understand:

- allowed origins
- methods
- credentials
- why `*` is not always acceptable

## Security Headers

Applications should think about security headers and hardened defaults. Middleware can help, but students should know what problem each header solves.

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

## Session and Token Risks

Security discussions should include:

- token expiry
- cookie security flags
- replay risk
- theft risk
- logout and revocation strategy awareness

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

## What To Remember

- authentication and authorization are different layers
- API hardening includes CORS, headers, limits, and secret discipline
- security middleware should be purposeful, not copied blindly
- abuse resistance is part of backend design
- Express apps become professional when trust boundaries are explicit
