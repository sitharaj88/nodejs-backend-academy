---
title: Modern Security Coverage
slug: learning/security/modern-security-coverage
description: Coverage map for the security learning track, including authentication, authorization, secrets, passwords, and API hardening.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'
import Compare from '../../../../components/Compare.astro'
import Pitfall from '../../../../components/Pitfall.astro'

<LessonMeta level="Intermediate" duration="10 min" track="Security" prerequisites="Express basics, auth and authz fundamentals" />

This page is an opinionated map of the Node.js security ecosystem: what each library is for, what it is not, and how the pieces fit. None of these is a silver bullet. The bullet is consistency — picking the same tools across services and using them correctly.

## Password hashing

- **argon2** (`argon2` package): argon2id with OWASP parameters. Default choice for new systems.
- **bcrypt** (`bcrypt`, `bcryptjs`): still acceptable with cost ≥ 12 if migrating an older system. Upgrade to argon2 opportunistically on login.
- **scrypt** (Node built-in): fine, slightly awkward API. Use if you need zero extra dependencies.
- **Never**: SHA-256, SHA-512, MD5, or any fast hash. They are not password hashes.

## Tokens and signing

- **jose**: the library for JWT, JWS, JWE, JWK, and JWKS. Supports Ed25519, EdDSA, RS256, ES256. Pin algorithms when verifying.
- **node:crypto**: for everything that is not JWT — session ids, CSRF tokens, HMAC signatures on webhooks.
- **Never**: roll your own JWT parser. Every hand-written implementation has an `alg: none` bug somewhere.

<Compare badLabel="Hand-rolled token parsing" goodLabel="jose with pinned algorithm">
<Fragment slot="bad">
```ts
const [h, p, s] = token.split('.')
const header = JSON.parse(Buffer.from(h, 'base64url').toString())
if (header.alg === 'HS256') verify(...)
```
</Fragment>
<Fragment slot="good">
```ts
import { jwtVerify } from 'jose'
const { payload } = await jwtVerify(token, publicKey, { algorithms: ['EdDSA'] })
```
</Fragment>
</Compare>

## Auth frameworks and platforms

- **Passport.js**: strategy-based middleware for Express. Large ecosystem of providers. Mature, but increasingly showing its age; consider alternatives for greenfield.
- **better-auth**: modern, TypeScript-first auth library with sessions, OIDC, 2FA, passkeys, rate limits. Good for teams who want a batteries-included local solution without outsourcing identity.
- **Clerk, Auth0, WorkOS, Stytch**: hosted identity platforms. You trade a bit of customization and a subscription fee for "2FA, SSO, passkeys, magic links all work tomorrow." Fit startups and teams where identity is table stakes, not a differentiator.
- **Lucia**: deprecated by its author in 2024; avoid for new work.
- **NextAuth / Auth.js**: acceptable when you are already in Next.js and want simple social login. Less control than better-auth for non-Next stacks.

<Callout type="tip" title="Build vs buy, honestly">
If identity is not your product, the total cost of a hosted platform is almost always lower than maintaining your own auth over three years. Count MFA, passkeys, account recovery, abuse handling, and compliance in the build estimate — not just login and logout.
</Callout>

## Authorization and policy

- **Typed functions**: a `can(actor, action, resource): boolean` module with tests. The right answer for most codebases up to a few dozen rules.
- **Cedar** (`@cedar-policy/cedar-wasm`): readable policy language, typed entities, local evaluation. Good when you want policies as code but not as TypeScript.
- **OPA / Rego**: general-purpose, used across app / infra / CI. Excellent when one engine serves many systems.
- **Oso**: library plus optional cloud service; uses Polar, a logic language. Good ergonomics for relationship-based access.
- **OpenFGA / SpiceDB**: Zanzibar-style relationship-based access control. Right fit for collaborative products (Notion-like, Figma-like, GitHub-like).

## Input validation

- **zod**: ergonomic schemas, excellent TypeScript inference, `safeParse` for error handling. Default choice.
- **valibot**: smaller bundle than zod, similar API. Good for edge workers and bundle-sensitive environments.
- **arktype**: fastest of the bunch for large schemas; growing ecosystem.
- **ajv**: JSON Schema validator. Reach for it when the schema is authored in JSON Schema (OpenAPI, external contracts).

## HTTP hardening

- **helmet**: sets a pile of secure headers in one line. Configure CSP explicitly; do not trust defaults.
- **cors**: the `cors` package with an explicit allowlist function.
- **express-rate-limit** + `rate-limit-redis`: rate limiting that survives multiple instances.
- **express-slow-down**: exponentially increase response latency to attackers without hard-blocking.
- **csrf-csrf**: modern CSRF library if you do not want to hand-roll the double-submit pattern.

## Secrets management

- **dotenv-flow**, **dotenv**: for local dev only. Never ship to production.
- **@aws-sdk/client-secrets-manager**, **@google-cloud/secret-manager**: read secrets at startup from the cloud provider.
- **HashiCorp Vault** + **node-vault**: when you need fine-grained policies and dynamic secrets.
- **gitleaks**, **trufflehog**: scan repos and commits for leaked secrets. Run in pre-commit and CI.
- **SOPS** + **age/gpg**: encrypt secrets in Git with per-team keys if you insist on storing them in a repo.

<Pitfall title="Rotating keys without rotating consumers">
You rotate a JWT signing key and forget that four internal services cache the old public key for 24 hours. Half your fleet rejects valid tokens. **Fix:** publish a JWKS endpoint with the `kid` of each key, support multiple active keys during rotation, and measure cache freshness.
</Pitfall>

## Supply chain and SBOM

- **npm audit** / **pnpm audit**: baseline vulnerability check, prone to noise. Use, but do not rely on.
- **Socket** (`socket.dev`): detects malicious packages and suspicious install scripts at the dependency graph level.
- **Snyk**, **Dependabot**, **Renovate**: automated vulnerability alerts and PRs.
- **cyclonedx-bom**, **syft**: generate an SBOM (Software Bill of Materials). Ship with your artifact.
- **SLSA**: provenance levels for your build pipeline. Aim for SLSA 2–3 on anything you deploy.
- **sigstore / cosign**: sign your container images and attestations; verify at deploy time.

## 2FA, passkeys, and modern identity

- **@simplewebauthn/server** + **@simplewebauthn/browser**: WebAuthn / FIDO2 / passkeys. The post-password future.
- **speakeasy** or **otpauth**: TOTP (authenticator apps).
- **twilio** / **@aws-sdk/client-sns**: SMS codes — last-resort second factor, not recommended as primary.

<Callout type="info" title="Passkeys over SMS">
SMS 2FA is better than no 2FA, but vulnerable to SIM swaps. For new systems, ship passkeys first, TOTP as a fallback, SMS only if regulation requires it.
</Callout>

## Observability for security

- **pino** or **winston** with a redaction list (`password`, `token`, `authorization`, `cookie`, `card`).
- **OpenTelemetry** traces with auth decisions as span attributes.
- **audit log** — a separate append-only table or store for security-relevant events (login, logout, password change, permission grant, role change). Not the same as application logs.

## How to pick, in one paragraph

For a new Node.js service in 2026: argon2 for passwords, jose for tokens, better-auth or a hosted platform for identity, zod for validation, helmet with a strict CSP, express-rate-limit on Redis, Cedar or a typed `can()` module for authorization, AWS/GCP Secrets Manager for secrets, Socket plus Dependabot for supply chain, passkeys first with TOTP fallback for 2FA, pino with redaction for logs, and an audit-log table no one argues about.

## Further reading

- [Authentication, Sessions, JWT, and OAuth](/learning/security/authentication-sessions-jwt-oauth/)
- [Authorization, RBAC, ABAC, and Ownership](/learning/security/authorization-rbac-abac-ownership/)
- [API Security, Passwords, Secrets, and Hardening](/learning/security/api-security-passwords-secrets-hardening/)
- [Labs, Projects, Interview Questions, Case Studies](/learning/security/labs-projects-interview-case-studies/)
