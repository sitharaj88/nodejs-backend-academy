---
title: API Security, Passwords, Secrets, and Hardening
slug: learning/security/api-security-passwords-secrets-hardening
description: Learn password handling, secrets management, rate limiting awareness, validation-related hardening, and practical API security controls.
---

API security is broader than auth middleware.

## Password Handling

Students should understand:

- hashing
- salting
- verification
- never storing raw passwords

## Secrets Management

Secrets should come from environment or secret-management systems, not source code.

Examples:

- database credentials
- JWT secrets
- API keys
- encryption keys

## API Hardening

Important controls include:

- input validation
- body-size limits
- rate limiting awareness
- secure headers
- careful error responses

## Common Mistakes

- hardcoding secrets
- logging sensitive auth data
- exposing internal errors to clients
- ignoring abuse-resistance on public endpoints

## What To Remember

- passwords and secrets are critical trust assets
- API hardening includes validation, limits, and safe error behavior
- secure systems require layered controls
