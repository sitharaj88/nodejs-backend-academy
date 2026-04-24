---
title: CI, CD, Release Flow, and Deployment
slug: learning/devops/ci-cd-release-flow-and-deployment
description: Learn CI/CD basics, release flow, deployment strategy, rollback thinking, and how quality gates connect to runtime delivery.
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

<LessonMeta level="Intermediate" duration="28 min" track="DevOps" prerequisites="Docker basics, Git branching, a Node.js service" />

A CI/CD pipeline is not a pile of YAML. It is the answer to three questions: **what do we ship, how do we know it is safe, and what do we do when it is not?** This page walks through a real GitHub Actions workflow for a Node.js service, the release strategies you actually see in production, and the rollback path you rehearse before you need it.

<Objectives>
- Design a CI workflow that fails fast, caches aggressively, and parallelises the slow parts
- Build one container image per commit and promote it unchanged through environments
- Pick between blue-green, rolling, and canary — and know which problem each solves
- Wire a rollback path that is one command and costs you under a minute of downtime
- Use feature flags to separate "deployed" from "released"
</Objectives>

## Mental model: the pipeline is a contract

<KeyConcept title="Deployed is not the same as released">
"Deployed" means the new code is running in production. "Released" means users see its behaviour. Feature flags, traffic splits, and dark launches let you separate the two so a deploy does not have to be a product event.
</KeyConcept>

A solid pipeline for a Node.js service has four stages, each with one job: **verify** (tests pass), **build** (one immutable artifact), **deploy** (promote that artifact), **observe** (confirm the release is healthy and be ready to undo).

<Diagram caption="Four stages, one artifact, one promotion path.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Pipeline stages">
    <defs>
      <marker id="p" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="12" fill="#0d1220">
      <rect x="20" y="80" width="130" height="60" rx="6" fill="#dff5e5" stroke="#2f8f46" stroke-width="1.5" />
      <text x="85" y="105" text-anchor="middle" font-weight="800">verify</text>
      <text x="85" y="125" text-anchor="middle" font-size="11" fill="#596579">lint, test, typecheck</text>

      <rect x="170" y="80" width="130" height="60" rx="6" fill="#e9f4fb" stroke="#087ea4" stroke-width="1.5" />
      <text x="235" y="105" text-anchor="middle" font-weight="800">build</text>
      <text x="235" y="125" text-anchor="middle" font-size="11" fill="#596579">one image, sha-tagged</text>

      <rect x="320" y="80" width="130" height="60" rx="6" fill="#fef3d7" stroke="#b7791f" stroke-width="1.5" />
      <text x="385" y="105" text-anchor="middle" font-weight="800">deploy</text>
      <text x="385" y="125" text-anchor="middle" font-size="11" fill="#596579">canary, rolling, b/g</text>

      <rect x="470" y="80" width="150" height="60" rx="6" fill="#e8e4ff" stroke="#6d4aff" stroke-width="1.5" />
      <text x="545" y="105" text-anchor="middle" font-weight="800">observe</text>
      <text x="545" y="125" text-anchor="middle" font-size="11" fill="#596579">SLOs, auto-rollback</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#p)">
        <path d="M150 110 L170 110" />
        <path d="M300 110 L320 110" />
        <path d="M450 110 L470 110" />
        <path d="M545 140 Q 540 190 400 190 Q 260 190 85 190 Q 85 160 85 140" stroke-dasharray="4 4" />
      </g>
      <text x="320" y="205" text-anchor="middle" font-size="11" fill="#596579">feedback: alerts, error budget, auto-revert</text>
    </g>
  </svg>
</Diagram>

## A real GitHub Actions workflow

Save as `.github/workflows/ci.yml`. It runs on every push and pull request, matrix-tests two Node versions, caches dependencies, and publishes one image tagged with the commit SHA.

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  packages: write
  id-token: write  # needed for OIDC to cloud providers

jobs:
  verify:
    runs-on: ubuntu-24.04
    strategy:
      fail-fast: false
      matrix:
        node: ['20', '22']
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm

      - run: npm ci --prefer-offline --no-audit --no-fund
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --reporter=dot

      - name: Upload coverage
        if: matrix.node == '22'
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
          retention-days: 7

  integration:
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: postgres:16.4-alpine
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: app
          POSTGRES_DB: app_test
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U app -d app_test"
          --health-interval 3s --health-retries 10
      redis:
        image: redis:7.4-alpine
        ports: ['6379:6379']
    env:
      DATABASE_URL: postgres://app:app@localhost:5432/app_test
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: ci-secret-at-least-32-characters-long
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: npm }
      - run: npm ci --prefer-offline --no-audit --no-fund
      - run: npm run migrate
      - run: npm run test:integration

  build:
    needs: [verify, integration]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-24.04
    outputs:
      image: ${{ steps.meta.outputs.tags }}
      digest: ${{ steps.push.outputs.digest }}
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch

      - id: push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true
          sbom: true

  deploy-staging:
    needs: build
    runs-on: ubuntu-24.04
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: ./scripts/deploy.sh staging ${{ needs.build.outputs.digest }}
        env:
          DEPLOY_TOKEN: ${{ secrets.STAGING_DEPLOY_TOKEN }}

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-24.04
    environment:
      name: production
      url: https://api.example.com  # required approval configured in repo settings
    steps:
      - uses: actions/checkout@v4
      - name: Deploy canary 10%
        run: ./scripts/deploy.sh production ${{ needs.build.outputs.digest }} --canary=10
      - name: Wait & verify SLOs
        run: ./scripts/verify-slos.sh --window=10m
      - name: Promote to 100%
        run: ./scripts/deploy.sh production ${{ needs.build.outputs.digest }} --canary=100
```

Three non-obvious things this workflow does right:

1. **`concurrency` cancels superseded runs.** You push twice; the first run does not waste minutes producing an image you will never deploy.
2. **`verify` and `integration` run in parallel.** Lint + unit tests finish while the DB starts up. The matrix-built Node.js versions catch Node-specific bugs before merge.
3. **One artifact, promoted.** `build` tags the image with the commit SHA. `deploy-staging` and `deploy-prod` deploy that same digest. Production never rebuilds.

<Callout type="tip" title="OIDC to AWS/GCP, not long-lived keys">
`permissions: id-token: write` plus the `aws-actions/configure-aws-credentials` action lets the workflow assume an IAM role via OIDC. No access keys in GitHub Secrets. Rotate the trust policy, not the password.
</Callout>

## Release strategies

<Compare badLabel="Big bang deploy" goodLabel="Progressive rollout">
<Fragment slot="bad">
All pods replaced in one step. Every user hits the new version simultaneously. A regression affects 100% of traffic for as long as it takes to notice, decide, and roll back. Typical recovery: 5–15 minutes.
</Fragment>
<Fragment slot="good">
New version runs alongside the old. Traffic shifts in small, observable steps. A regression affects 1–10% of traffic and auto-reverts on SLO breach. Typical recovery: under a minute.
</Fragment>
</Compare>

### Rolling

The platform replaces pods N at a time. Kubernetes' default `RollingUpdate` with `maxSurge=1 maxUnavailable=0` is fine for stateless services. Good for small changes. Bad for database migrations that make the old version incompatible.

### Blue-green

Two full environments (`blue` and `green`). You deploy to the idle one, smoke-test it with production data, then flip the load balancer. Rollback is another flip. Expensive (2x capacity) and the best fit when a release includes schema or infrastructure changes you want to stage.

### Canary

The new version starts at 1% of traffic, then 10%, then 50%, then 100%. Between each step you check error rate, latency p99, and business metrics. If any breach an SLO, automatically pin at the previous step or revert. This is what most large-scale web backends do.

```bash
# Example: Flagger/Argo Rollouts-style step
./scripts/deploy.sh production <digest> --canary=1
./scripts/verify-slos.sh --window=5m --error-rate=0.5% --latency-p99=300ms
./scripts/deploy.sh production <digest> --canary=10
./scripts/verify-slos.sh --window=10m
./scripts/deploy.sh production <digest> --canary=50
./scripts/verify-slos.sh --window=10m
./scripts/deploy.sh production <digest> --canary=100
```

<Callout type="info" title="Canary honest about sample size">
1% of traffic on a service doing 10 rps is one request every 10 seconds. You cannot measure a p99 from that. If your canary step is too small to produce signal, either hold it longer or start at a higher percentage.
</Callout>

## Database migrations: the expand/contract dance

The hardest part of progressive rollout is schema changes. The rule is: **the old version and the new version must both work against the new schema for the duration of the rollout.**

1. **Expand** — add the new column, nullable, with a default. Deploy code that writes to both old and new. Backfill.
2. **Migrate reads** — deploy code that reads from new, with old as fallback.
3. **Contract** — once the old code is gone, drop the old column in a later release.

A single-step `ALTER TABLE users RENAME COLUMN name TO full_name` is a coordinated outage. Do not do this.

## Rollback

<KeyConcept title="Rollback is a deploy">
If your "rollback" is an ssh session, a hotfix branch, and a prayer, it is not a rollback. It is an incident. A real rollback is: one command, one previous-known-good SHA, zero manual steps.
</KeyConcept>

```bash
# Roll back to the digest that was deployed before the current one
./scripts/deploy.sh production <previous_digest> --canary=100
```

Two preconditions make this work:

- **The previous image still exists.** Never garbage-collect images younger than 30 days.
- **The previous version still works against the current schema.** Expand/contract, feature flags, and reversible migrations make this true by construction.

## Feature flags: separate deploy from release

Flags are the seatbelt between "we shipped it" and "users see it."

```ts
// src/flags.ts
import { Unleash } from 'unleash-client'

const client = new Unleash({
  url: config.UNLEASH_URL,
  appName: 'api',
  customHeaders: { Authorization: config.UNLEASH_TOKEN },
})

export function flag(name: string, ctx?: { userId?: string; tenantId?: string }) {
  return client.isEnabled(name, ctx)
}
```

```ts
// in a handler
if (flag('new-checkout-flow', { userId: user.id })) {
  return newCheckout(req, res)
}
return oldCheckout(req, res)
```

With flags, you deploy the code off by default, turn it on for internal users, then employees, then 1% of customers, then everyone — without a single extra deploy.

## Pitfalls

<Pitfall title="Rebuilding on promote">
Staging was tested against image `sha-abc123`. Production builds from the same branch and gets `sha-def456` because a transitive dependency published a new version. You just deployed code you never tested. **Fix:** build once in CI, promote the digest — never the branch.
</Pitfall>

<Pitfall title="Secrets in CI logs">
A debug `echo $DATABASE_URL` scatters production credentials across GitHub Actions logs, searchable by anyone with read access. **Fix:** use `::add-mask::`, mark job outputs as secret, and audit logs weekly. Never `printenv` in CI.
</Pitfall>

<Pitfall title="No `maxUnavailable=0` during rolling updates">
Default Kubernetes rolling updates allow 25% of pods to be unavailable at once. Combined with an in-flight deploy that also fails its readiness probe, you can serve errors for minutes before anyone notices. **Fix:** `maxUnavailable: 0, maxSurge: 1` for user-facing services.
</Pitfall>

## Lab

<Lab title="Build a CI pipeline with a canary deploy and a rehearsed rollback" duration="90 min" difficulty="Hard" stack="Node.js, Docker, GitHub Actions, GHCR, Unleash (or LaunchDarkly)">

### Goal
Wire a pipeline that verifies, builds, promotes one image through staging and production via canary, and can roll back in under a minute. Rehearse the rollback so it is muscle memory.

### Steps
1. Add the workflow above. Replace the deploy scripts with ones for your target (Fly.io, ECS, Kubernetes).
2. Enable branch protection: PRs must pass `verify` and `integration` before merge.
3. Register two GitHub Environments — `staging` (auto-deploy) and `production` (required review).
4. Add a feature flag for a new log field. Ship the code to production with the flag off; verify no log change. Flip the flag for 10% of tenants; verify the field appears only for them.
5. Intentionally introduce a bug (e.g., a 500 on `POST /orders`). Push to main. Watch the canary step detect elevated error rate and auto-hold at 10%.
6. Roll back to the previous digest with a single command. Time it.
7. Write a `ROLLBACK.md` runbook with the exact commands and expected output.

### Success criteria
- Pipeline green-to-production in under 15 minutes
- Canary step automatically refuses to promote when error rate exceeds 0.5%
- Rollback completes in under 60 seconds with zero data loss
- `ROLLBACK.md` is clear enough that a teammate who has never deployed the service can execute it
- No secret appears in any CI log (check with `gh run view --log | grep -i secret`)

</Lab>

## Checkpoint

<Checkpoint>
1. Why is "build once, promote the digest" better than "rebuild on each environment"?
2. You have a 30-second rolling deploy of 20 pods and a 10-second readiness probe. What is the worst-case unavailability and how do you cut it?
3. When is blue-green worth the doubled infra cost over canary?
4. A feature flag is on for 10% of users. A bug appears for users in Germany only. What is your first action — rollback, flag off, or deploy a fix?
5. Name two things that must be true of a migration for rollback to be safe.
</Checkpoint>

## Further reading

- [Environment, Config, Docker, and Containers](/learning/devops/environment-config-docker-containers/) — the artifact this pipeline ships
- [Observability, Runtime Operations, and Runbooks](/learning/devops/observability-runtime-operations-and-runbooks/) — how `verify-slos.sh` actually works
- [Modern DevOps Coverage](/learning/devops/modern-devops-coverage/) — Argo Rollouts, Flagger, LaunchDarkly, Unleash
