---
title: Modern Tooling Coverage
slug: learning/tooling/modern-tooling-coverage
description: The modern Node.js backend tooling stack — pnpm, tsx, Vitest, Biome, Changesets, Turborepo, and what each one replaces. Opinionated picks.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="12 min" track="Tooling" />

The Node.js tooling world finally has good defaults. This page is an opinionated 2025 stack — what to pick, what each tool replaces, and where the landscape is still in motion.

## Package managers

| Pick | Why |
| --- | --- |
| **pnpm** | Content-addressed store (disk-efficient), strict hoisting (no phantom deps), great monorepo support with workspaces. |
| **npm** | Shipped with Node, zero onboarding, &ldquo;just works&rdquo; for most app projects. |
| **bun** | Fastest, bundles a runtime+package manager+test runner. Watch for edge cases in larger projects. |
| yarn (Berry) | Less common in new projects. Still solid if you're already invested. |

## Runners and dev loops

| | Use it for |
| --- | --- |
| **tsx** | Run TypeScript directly in dev (`tsx watch src/server.ts`). Fast, alias-aware. |
| **ts-node** | Older equivalent. Slower cold start; prefer `tsx`. |
| **bun run** | When your whole stack is Bun. |
| **node --import tsx/esm** | If you want `node` directly; requires `tsx` on the import hook path. |

## Test runners

| | Best for |
| --- | --- |
| **Vitest** | Default. Jest-compatible API, ESM-native, great watch mode, integrates with Vite if you need it. |
| **node:test** | Zero-dep, ships with Node. Perfect for libraries you publish. |
| **Jest** | Still fine; migrate to Vitest when you can. |
| **Playwright** | API + browser E2E. Single runner for multiple target browsers. |

## Linters and formatters

| | Pick when |
| --- | --- |
| **ESLint 9 (flat config) + Prettier** | You need the ESLint plugin ecosystem (React, security, import rules). |
| **Biome** | New projects that don't need ESLint plugins. One binary, ~10× faster, lint + format in one. |
| **dprint** | Format only; very fast. Pair with ESLint or Biome for lint. |

```bash
# Biome — one tool, minimal config
npx @biomejs/biome init
npx @biomejs/biome check --apply .
```

## TypeScript & build

| | Use for |
| --- | --- |
| **tsc** | Services. Emit `dist/`, ship. No bundler needed. |
| **tsup** | Libraries for npm. Dual CJS/ESM builds, declaration files, zero config. |
| **esbuild** | Custom pipelines where you want precise control. |
| **unbuild** | Another library-oriented option; good for Nuxt ecosystem. |

## Monorepos

| | Pick when |
| --- | --- |
| **pnpm workspaces** | Small to medium monorepos. Built-in, nothing extra. |
| **Turborepo** | Caching, task pipelines across many packages. Good for teams. |
| **Nx** | Full-featured — graph, generators, affected builds. Feature-rich, slightly heavier. |
| **Moon** | Rust-based, fast; newer, smaller ecosystem. |

## Release & versioning

| | Use for |
| --- | --- |
| **Changesets** | Monorepos; explicit version decisions per package. |
| **release-please** | Convention-driven (conventional commits → versions + changelog). |
| **semantic-release** | Fully automated. Works well for libraries published to npm. |

## Misc

- **tsx** for dev-time TypeScript
- **cross-env** for cross-platform env vars in scripts
- **concurrently** for running multiple dev processes
- **lint-staged** + **husky** for pre-commit hooks
- **knip** to find unused files, exports, and deps — run monthly

```bash
npx knip  # eye-opening on a mature codebase
```

<Callout type="tip" title="The opinionated 2025 default stack">
**pnpm** + **tsx** + **Vitest** + **ESLint 9 (or Biome)** + **Prettier** + **tsc** (build) + **GitHub Actions** + **Changesets** (if you publish). Boring, fast, well-documented.
</Callout>

## Editor setup — not optional

- VS Code with the **ESLint**, **Prettier**, **Vitest** extensions.
- Format on save + ESLint auto-fix on save.
- A `.vscode/settings.json` committed to the repo so everyone matches:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.useFlatConfig": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Further reading

- [Package Management, Semver, Lockfiles](/learning/tooling/package-management-semver-lockfiles/)
- [Project Setup, Scripts, Configuration](/learning/tooling/project-setup-scripts-configuration/)
- [Code Quality, Builds, Test Workflow](/learning/tooling/code-quality-builds-test-workflow/)
- [DevOps: CI/CD](/learning/devops/ci-cd-release-flow-and-deployment/)
