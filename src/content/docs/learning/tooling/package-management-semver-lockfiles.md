---
title: Package Management, Semver, and Lockfiles
slug: learning/tooling/package-management-semver-lockfiles
description: Read a package.json like a senior, understand semver ranges in detail, trust lockfiles, and keep the supply chain boring on purpose.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="20 min" track="Tooling" prerequisites="Node.js installed" />

Package management is operational reliability dressed as a configuration file. Get it right and upgrades are boring. Get it wrong and your builds are random, your deploys fail on specific days, and your security advisories feel like chaos.

<Objectives>
- Read every field in `package.json` and explain why it is there
- Decode semver ranges (`^`, `~`, `>=`, `1.x`, `*`) from memory
- Trust the lockfile: when it helps, when it traps you, when to delete it
- Keep dependency count intentional; audit without panic
</Objectives>

## `package.json` — the contract

```json
{
  "name": "orders-service",
  "version": "1.4.2",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20.11" },
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pino": "^9.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "tsx": "^4.7.2",
    "typescript": "^5.4.5",
    "vitest": "^1.5.0"
  }
}
```

<KeyConcept title="`dependencies` ships, `devDependencies` does not">
In production, `npm ci --omit=dev` installs only `dependencies`. Anything your running service uses at runtime belongs there. Build tools, test runners, and type definitions do not.
</KeyConcept>

Common misplacements:

- `typescript` in `dependencies` — unless the service literally runs `.ts` at runtime.
- `@types/*` in `dependencies` — type declarations are compile-time only.
- `nodemon` / `tsx` in `dependencies` — they're dev loops.

## Semver, exactly

```
1.4.2
^ ^ ^
major.minor.patch
```

- **Major** — breaking changes, intentional.
- **Minor** — new features, backward-compatible.
- **Patch** — bug fixes only.

Ranges:

| Range | Matches |
| --- | --- |
| `1.4.2` | exactly 1.4.2 |
| `~1.4.2` | 1.4.x where x ≥ 2 |
| `^1.4.2` | 1.y.z where y ≥ 4 (**not** 2.0.0) |
| `^0.4.2` | 0.4.x where x ≥ 2 (caret of 0.x is tight) |
| `>=1.4.2 <2` | same as `^1.4.2` |
| `*` or `"latest"` | any version ever |

<Callout type="warn" title="0.x is different">
Below 1.0, every minor bump can be breaking. `^0.4.2` is treated as `~0.4.2`. Libraries marked 0.x should be pinned tighter than you think.
</Callout>

## Lockfiles — the reproducibility contract

`package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), and `yarn.lock` (yarn) record the **exact** resolution of every dependency and transitive dependency — including integrity hashes. Without a lockfile:

1. Your CI and your laptop install different versions.
2. "Works on my machine" becomes a weekly event.
3. Malicious packages can slip in via auto-resolved patch bumps.

<Compare badLabel="Install on CI" goodLabel="Install on CI">
<Fragment slot="bad">
```bash
npm install          # resolves fresh, may mutate lockfile
```
Different runs can produce different trees.
</Fragment>
<Fragment slot="good">
```bash
npm ci               # fails if lockfile disagrees with package.json
```
Deterministic; matches the lockfile or fails loudly.
</Fragment>
</Compare>

**Rules of thumb:**

- Commit the lockfile. Always. Applications and libraries.
- Use `npm ci` (or `pnpm install --frozen-lockfile`) in CI.
- When you update a dep, commit the lockfile change in the same PR.
- Conflicts on the lockfile are real conflicts. Don't "regenerate to fix" — understand what changed.

## Choosing a package manager

| | npm | pnpm | yarn (Berry) | bun |
| --- | --- | --- | --- | --- |
| Disk usage | ×1 | ×0.3 (content-addressed store) | ×0.6 | ×0.3 |
| Speed | ok | fast | fast | fastest |
| Monorepo support | workspaces | workspaces + `filter` | workspaces + plugins | workspaces |
| Hoisting behavior | flat | strict (safer) | flat or PnP | flat |
| Ecosystem quirks | safest default | occasionally tripped by hoist-flat assumptions | PnP breaks some tools | young, some gaps |

<Callout type="tip" title="Default recommendation">
**pnpm** for new projects: fast, strict hoisting catches phantom dependencies, excellent monorepo story. Use **npm** when you want zero surprises or onboarding the lowest-common-denominator contributor.
</Callout>

## Supply chain hygiene

- Fewer dependencies, fewer problems. Read the source of anything you add.
- Pin major versions with `^`, not with `*` or `latest`.
- Run `npm audit` regularly but don't treat every alert as a page. Most are `dev` tree noise.
- Use **Dependabot** or **Renovate** with automated PRs for patch/minor; human review on major.
- Prefer packages with recent activity, clear maintainers, and narrow scope.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      patches: { update-types: [patch] }
      minor-deps: { update-types: [minor] }
```

## Pitfalls

<Pitfall title="Installing without saving">
`npm install foo` (without `--save`) has been the default since npm 5 — but habits from older docs sometimes result in packages in `node_modules` that aren't in `package.json`. **Fix:** grep for `require('foo')` that doesn't appear in `package.json`, add it or remove the import.
</Pitfall>

<Pitfall title="Deleting the lockfile to &ldquo;unstick&rdquo; a build">
Lockfile conflict on a PR? Deleting and regenerating hides what changed. **Fix:** rebase, inspect the diff, keep one resolution, commit.
</Pitfall>

<Pitfall title="Globals everywhere">
`npm i -g tsc` or `npm i -g vitest` — now "works on my machine" means "works if you installed the same global." **Fix:** every tool in `devDependencies`; run via `npx` / `pnpm exec` / package scripts.
</Pitfall>

## Lab

<Lab title="Set up a pnpm workspace from scratch" duration="45 min" difficulty="Easy" stack="pnpm, TypeScript, Vitest">

### Goal
Create a clean Node.js + TypeScript project using pnpm with lint, format, type-check, and test wired to one script surface.

### Steps
1. `mkdir service && cd service && pnpm init`
2. Add `engines`, `type: "module"`, `private: true` to `package.json`.
3. Install: `pnpm add express pino zod`; `pnpm add -D typescript tsx vitest @types/node @types/express eslint prettier`.
4. Add a `.npmrc` with `engine-strict=true` and `save-exact=false`.
5. Create scripts: `dev`, `build`, `start`, `test`, `lint`, `typecheck`, `format`.
6. Commit `pnpm-lock.yaml`. Run `pnpm install --frozen-lockfile` to verify.

### Success criteria
- Fresh clone + `pnpm install --frozen-lockfile` + `pnpm test` passes
- `pnpm typecheck` and `pnpm lint` run green on an empty source tree
- `engines.node` rejects Node < 20
- No global CLI tools used

</Lab>

## Checkpoint

<Checkpoint>
1. What does `^0.4.2` match, and why is it different from `^1.4.2`?
2. When should `@types/express` live in `dependencies`?
3. You inherit a repo with no lockfile. What's your first commit?
4. `npm audit` reports a high-severity issue in a `devDependency`. How do you prioritize it?
5. Name two signs that a package you're about to add is risky.
</Checkpoint>

## Further reading

- [Project Setup, Scripts, and Configuration](/learning/tooling/project-setup-scripts-configuration/)
- [Code Quality, Builds, and Test Workflow](/learning/tooling/code-quality-builds-test-workflow/)
- [Modern Tooling Coverage](/learning/tooling/modern-tooling-coverage/)
