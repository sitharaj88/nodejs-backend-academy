---
title: Authorization, RBAC, ABAC, and Ownership
slug: learning/security/authorization-rbac-abac-ownership
description: Learn authorization models including roles, attributes, ownership checks, and how access control should be expressed in backend systems.
---

Authorization answers what an authenticated user may do.

## RBAC

Role-based access control is common:

- admin
- trainer
- student

It is simple to teach, but real systems often need more.

## ABAC

Attribute-based access control considers user, resource, or context attributes such as:

- account status
- region
- subscription level
- feature flags

## Ownership Checks

Many real permissions are resource-level:

- can this user edit this course
- does this order belong to this customer

Ownership often matters more than broad roles.

## Common Mistakes

- confusing authentication with authorization
- using only roles when resource ownership matters
- spreading authorization logic across unrelated controllers

## What To Remember

- access control should match business rules
- roles are useful, but often incomplete
- ownership and context checks matter in serious apps
