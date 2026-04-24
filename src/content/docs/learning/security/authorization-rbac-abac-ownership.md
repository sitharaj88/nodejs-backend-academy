---
title: Authorization, RBAC, ABAC, and Ownership
slug: learning/security/authorization-rbac-abac-ownership
description: Learn authorization models including roles, attributes, ownership checks, and how access control should be expressed in backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="28 min" track="Security" prerequisites="Authentication basics, Express middleware, async/await" />

Authentication proves who is asking. **Authorization** answers what they may do. Almost every security incident involving data exposure is authorization failing somewhere — the token was valid, the user was real, but the system let them read or change the wrong thing. This page is about getting the answer right.

<Objectives>
- Separate authentication from authorization at the layer boundary
- Pick between RBAC, ABAC, and ReBAC for a given domain
- Enforce ownership and tenancy as query predicates, not runtime checks
- Reach for a policy engine (Cedar, OPA) when your access rules grow past a hundred lines
</Objectives>

## Mental model

<KeyConcept title="Authorization is a function, not a middleware">
`can(actor, action, resource) → allow | deny` — always. Middleware is one good place to call it; it is not the definition. Write the function, test it in isolation, and call it from routes, background jobs, GraphQL resolvers, and CLIs alike.
</KeyConcept>

Two rules that cut 90% of authorization bugs:

1. **Deny by default.** If no rule says "allow," the answer is no.
2. **Check on the resource instance, not just the type.** "Users can read posts" is not enough — they can read their own posts, or posts in teams they belong to, or published posts.

## Models: RBAC, ABAC, ReBAC

### RBAC — roles bundle permissions

Users get roles; roles grant permissions. Good when the domain has a short, stable set of job-shaped labels (admin, editor, viewer).

```ts
type Role = 'owner' | 'editor' | 'viewer'
type Permission = 'notes:read' | 'notes:write' | 'notes:delete' | 'team:manage'

const permissionsByRole: Record<Role, Permission[]> = {
  owner:  ['notes:read', 'notes:write', 'notes:delete', 'team:manage'],
  editor: ['notes:read', 'notes:write'],
  viewer: ['notes:read'],
}

export function can(roles: Role[], permission: Permission): boolean {
  return roles.some((r) => permissionsByRole[r].includes(permission))
}
```

RBAC falls over the moment you need "editor, but only in team X" — then you are reinventing ABAC with string parsing.

### ABAC — rules over attributes

You compose decisions from attributes of the subject, resource, action, and environment. More expressive, more to get wrong without a policy engine.

```ts
type Actor = { id: string; roles: string[]; teamIds: string[] }
type Note = { id: string; ownerId: string; teamId: string; visibility: 'private' | 'team' | 'public' }

export function canReadNote(actor: Actor, note: Note): boolean {
  if (note.visibility === 'public') return true
  if (note.ownerId === actor.id) return true
  if (note.visibility === 'team' && actor.teamIds.includes(note.teamId)) return true
  return false
}
```

### ReBAC — relationships decide

Google's Zanzibar, SpiceDB, and OpenFGA model access as graph relationships: "user X is a member of team Y; team Y is a collaborator on document Z; therefore X can read Z." Excellent fit for collaborative products (Notion, Figma, GitHub) where access comes from a web of sharing rather than a flat role list.

<Compare badLabel="Role label with implicit scope" goodLabel="Explicit rule function">
<Fragment slot="bad">
```ts
if (user.role === 'admin' || user.role === 'editor') {
  return update(noteId, body)
}
```
Silent assumption that "editor" implies membership in the right team. One new role and every route must be audited.
</Fragment>
<Fragment slot="good">
```ts
const note = await notes.findById(noteId)
if (!canWriteNote(actor, note)) return res.status(403).json({ error: 'FORBIDDEN' })
return update(noteId, body)
```
The rule is a function. Adding a role changes one file.
</Fragment>
</Compare>

## Ownership and tenancy — enforce in the query

The safest authorization is the one the database refuses to violate. Instead of "load, then check," make the query itself impossible to answer with a row the actor cannot see.

```ts
// src/notes/notes.repo.ts
export async function findNoteForActor(actor: Actor, id: string) {
  const { rows } = await pool.query(
    `select *
       from notes
      where id = $1
        and (
          owner_id = $2
          or (visibility = 'team' and team_id = any($3::uuid[]))
          or visibility = 'public'
        )`,
    [id, actor.id, actor.teamIds],
  )
  return rows[0] ?? null
}
```

Two wins:

- A missing `WHERE` clause returns 404, not 200 with someone else's data.
- An attacker who guesses an id learns nothing — the response is indistinguishable from "id does not exist."

### Multi-tenant systems: tenant id is non-negotiable

Every row in a multi-tenant app carries a `tenant_id`. Every query filters on it. The application never ships a query without one; ideally the database enforces it with **row-level security**.

```sql
-- Postgres RLS
alter table notes enable row level security;

create policy tenant_isolation on notes
  using (tenant_id = current_setting('app.tenant_id')::uuid);
```

```ts
// Set the tenant id at the start of every request
await client.query(`set local app.tenant_id = $1`, [actor.tenantId])
// From here, every query in this transaction sees only this tenant's rows
```

<Callout type="warn" title="Tenant id in a JWT claim is not enough">
A claim says "this user belongs to tenant X." It does not stop a buggy query from reading from tenant Y. RLS or a repository that takes `tenantId` as a required argument prevents the mistake at the layer where it matters.
</Callout>

## Policy engines — when the code is too big

At some point your `canX` functions cover hundreds of rules, spread across the codebase, with no central audit. That is the signal to introduce a policy engine.

### Cedar — readable rule language

```cedar
permit(
  principal in Role::"editor",
  action in [Action::"read", Action::"write"],
  resource
) when {
  resource has teamId &&
  principal.teamIds.contains(resource.teamId)
};

forbid(
  principal,
  action == Action::"delete",
  resource
) unless {
  principal in Role::"owner" &&
  resource.ownerId == principal.id
};
```

The engine evaluates rules against typed entities. The rules live in a file; deploying a policy change does not require a code deploy.

### OPA — general-purpose, Rego language

OPA (Open Policy Agent) solves the same problem with a broader scope. Good when you need one engine to make policy decisions for your app, your Kubernetes cluster, and your Terraform plan.

```rego
package app.authz

default allow = false

allow {
  input.action == "read"
  input.resource.visibility == "public"
}

allow {
  input.action in {"read", "write"}
  input.resource.owner_id == input.actor.id
}
```

### When to adopt one

Reach for a policy engine when three things are true:

1. You have more than ~100 permission rules, or rules that change more often than once a release.
2. Non-engineers (security team, compliance) need to review or author policy.
3. You want an audit log of policy decisions that is independent of the app code.

Before that, a typed `can()` module with tests is easier to reason about.

## Middleware patterns that do not lie

```ts
// src/auth/authz.ts
import type { RequestHandler } from 'express'

export function authorize(check: (req: any) => Promise<boolean> | boolean): RequestHandler {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'UNAUTHENTICATED' })
      const ok = await check(req)
      if (!ok) return res.status(403).json({ error: 'FORBIDDEN' })
      next()
    } catch (err) {
      next(err)
    }
  }
}

// Usage — the check loads the resource first so it can decide on its attributes
app.patch(
  '/notes/:id',
  authorize(async (req) => {
    const note = await notes.findById(req.params.id)
    req.resource = note
    return !!note && canWriteNote(req.user, note)
  }),
  async (req, res) => {
    const updated = await notes.update(req.resource, req.body)
    res.json(updated)
  },
)
```

Two points:

- The authorization middleware loads the resource and stashes it on `req` so the handler does not fetch it twice.
- `404` vs `403` is a choice. For resources the user cannot prove exist, `404` leaks less.

## Common pitfalls

<Pitfall title="Front-end hides the button, back-end has no check">
A developer removes the admin menu for non-admins and considers the feature done. A user reads the network tab, sends the same request with curl, and succeeds. **Fix:** every privileged action has a server-side authorization check. The UI is a courtesy, not a control.
</Pitfall>

<Pitfall title="Object reference attacks (IDOR)">
A route `GET /invoices/:id` loads the invoice by id and returns it if the user is logged in. There is no check that the invoice belongs to the user. **Fix:** load-with-predicate. `findInvoiceForActor(actor, id)` returns `null` if the invoice exists but belongs to someone else. Never load then check.
</Pitfall>

<Pitfall title="Roles that grow by copy-paste">
The product keeps asking for new roles: "editor-but-no-delete," "viewer-plus-comments," "finance-viewer." After six months you have 23 roles and no one can explain the difference. **Fix:** move to ABAC or ReBAC and let attributes or relationships do the work. Roles should be job titles, not permission bundles.
</Pitfall>

## Lab

<Lab title="Build a tenant-safe notes service" duration="90 min" difficulty="Medium" stack="Node.js, Express, Postgres, Zod, Vitest">

### Goal
Implement a notes service where every read and write is scoped to the actor's tenant and ownership, enforced both in the code and in Postgres RLS.

### Steps
1. Schema: `tenants`, `users`, `teams`, `team_members`, `notes`. Every application table carries a `tenant_id` and a foreign key.
2. Write a `can(actor, action, resource)` module with rules for `read`, `write`, `delete` on notes. Unit-test at least eight cases including denials.
3. Implement `findNoteForActor` and `updateNoteForActor` as repository functions that take the actor and embed the authorization predicate in the SQL.
4. Enable Postgres RLS on `notes`. Set `app.tenant_id` at the start of every request transaction. Write a test that proves a query with the wrong tenant id returns zero rows even when the SQL has no tenant filter.
5. Wire an Express route `PATCH /notes/:id` with an `authorize(...)` middleware that loads the resource and calls `can()`. Test: owner edits succeed, team member edits succeed when visibility is team, other tenants get 404.

### Success criteria
- A deliberate removal of RLS causes one dedicated test to fail, and no other tests.
- Hitting a note in another tenant's space returns 404, not 403 or 200.
- The `can()` module has 100% branch coverage; the middleware has its own integration test.
- Adding a new role requires editing only the `can()` module.

</Lab>

## Checkpoint

<Checkpoint>
1. Explain the difference between authentication and authorization in one sentence each.
2. When does ABAC beat RBAC? Give a product example where RBAC starts to break.
3. How does "load-with-predicate" prevent IDOR, and what is the 404 vs 403 decision?
4. What does Postgres RLS buy you that a WHERE clause in the repository does not?
5. Name three signals that it is time to introduce a policy engine like Cedar or OPA.
</Checkpoint>

## Further reading

- [Authentication, Sessions, JWT, and OAuth](/learning/security/authentication-sessions-jwt-oauth/) — you need identity before you can authorize
- [API Security, Passwords, Secrets, and Hardening](/learning/security/api-security-passwords-secrets-hardening/) — OWASP API1:2023 is a broken-object-level authorization problem
- [Modern Security Coverage](/learning/security/modern-security-coverage/) — Cedar, OPA, Oso, OpenFGA
