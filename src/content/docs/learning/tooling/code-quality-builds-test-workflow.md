---
title: Code Quality, Builds, and Test Workflow
slug: learning/tooling/code-quality-builds-test-workflow
description: Wire format, lint, type-check, test, and build as one coherent quality gate — fast on every laptop, identical in CI, impossible to bypass by accident.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="20 min" track="Tooling" prerequisites="Project setup, npm scripts" />

Quality gates exist so nobody has to remember them. This page builds a pipeline in layers — each catching a different class of failure — and wires it so local `check` and CI `check` are literally the same command.

<Objectives>
- Pick a formatter and stop debating style in PRs
- Use the linter to catch behavior bugs, not cosmetic noise
- Make TypeScript strict and keep it that way
- Compose the local and CI pipelines from the same script
</Objectives>

## The quality pyramid

<KeyConcept title="Five layers, increasing cost">
Format catches the cheapest mistakes. Lint catches patterns. Type check catches contract breaks. Tests catch behavior. Build catches packaging. Keep each layer fast and focused — don't make the linter do what the type checker already does.
</KeyConcept>

```
format   → lint   → typecheck → test    → build
(ms)       (s)      (s)          (s-m)    (s-m)
```

## Formatting — Prettier or Biome, not both

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

```
# .prettierignore
dist/
coverage/
*.lock
```

<Callout type="tip" title="Stop arguing about style">
Commit the Prettier config. Run `prettier --check .` in CI. Debates move to version control history where they belong.
</Callout>

**Biome** (rust-based, one tool for lint + format) is the modern alternative. It's ~10× faster than ESLint+Prettier. If you're starting fresh and don't need niche ESLint plugins, prefer Biome.

## Linting — ESLint with flat config

```js
// eslint.config.js (flat config, ESLint 9+)
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  unicorn.configs.recommended,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
]
```

The rules that matter most for backend Node.js code:

- `no-floating-promises` — unhandled promises are silent bugs.
- `no-misused-promises` — passing an async function where a sync one is expected.
- `no-console` — logs belong in a logger, not `console.log`.
- `consistent-type-imports` — keeps type-only imports from polluting the runtime graph.

<Compare badLabel="Lint noise" goodLabel="Lint signal">
<Fragment slot="bad">
```
error  Line too long (200 chars)
error  Trailing whitespace
error  Prefer const over let
```
400 errors of cosmetic drift on every PR. People start ignoring the linter.
</Fragment>
<Fragment slot="good">
```
error  'result' is defined but never used
error  Possibly misused promise: call to async fn in non-async scope
error  Unexpected floating promise
```
Every error is a potential bug. Zero cosmetic rules.
</Fragment>
</Compare>

## Type checking — strict, always

```json
// tsconfig.json — the strict knobs that actually matter
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Run `tsc --noEmit` as a separate script. Tests can pass with type errors in other files — the type-check step makes the whole project green.

<Callout type="warn" title="`as any` is a code smell, not a fix">
Every `any` is a known hole. A few are pragmatic; clusters point to a modeling problem. Grep the codebase regularly: `grep -r "as any\|: any" src | wc -l` should trend down.
</Callout>

## Test workflow

Vitest as the default. Two configs: unit (fast, parallel) and integration (real containers, serial).

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
```

```ts
// vitest.int.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    include: ['src/**/*.int.test.ts', 'test/int/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } }, // avoid DB race
    globalSetup: ['./test/int/global-setup.ts'],
    testTimeout: 30_000,
  },
})
```

## Build — just `tsc` for services

Backend Node.js services do **not** need a bundler. Run `tsc` to emit `dist/`, ship it, done. Reach for a bundler only when:

- You want single-file output for Lambda cold start (`esbuild`, `tsup`).
- You ship a library to npm (`tsup`, `unbuild`).

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prestart": "npm run build",
    "start": "node dist/server.js"
  }
}
```

## Pre-commit hooks

Hooks should run what you have **already** committed to running. Install **lint-staged** and **husky**:

```json
// package.json
{
  "lint-staged": {
    "*.ts": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

<Callout type="tip" title="Don't run tests in the pre-commit hook">
Tests belong in CI and in your editor's watch mode. A 30-second pre-commit kills flow. Keep hooks under 2 seconds.
</Callout>

## CI parity

```yaml
# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push: { branches: [main] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm check        # same command humans run
  integration:
    runs-on: ubuntu-latest
    needs: check
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_PASSWORD: postgres }
        ports: ['5432:5432']
        options: >-
          --health-cmd="pg_isready"
          --health-interval=10s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:int
```

## Pitfalls

<Pitfall title="Format churn in every PR">
Half the team on auto-format, half off. Every PR includes 60 lines of whitespace drift. **Fix:** commit the Prettier config, add a `format:check` step to CI, and ask editor-setup for format-on-save to become a README prerequisite.
</Pitfall>

<Pitfall title="Lint rules that don't match the team">
A template ships with 400 rules, the team knows 5. People blanket-add `// eslint-disable`. **Fix:** delete any rule you wouldn't enforce in code review. Small, active rule set beats large, ignored one.
</Pitfall>

<Pitfall title="`tsc` in `devDependencies` but `build` in `dependencies`">
Production install (`--omit=dev`) has no TypeScript compiler but your build script calls `tsc`. Builds fail in production. **Fix:** build happens in CI, not on the production host. Push the `dist/` artifact, not the source.
</Pitfall>

## Lab

<Lab title="One-command quality gate" duration="45 min" difficulty="Easy" stack="pnpm, TypeScript, ESLint, Prettier, Vitest, GitHub Actions">

### Goal
Add format, lint, typecheck, and test to a repo, wire them to a single `check` script, and make CI run exactly that command.

### Steps
1. Install Prettier; commit `.prettierrc` and `.prettierignore`.
2. Install ESLint 9 + `typescript-eslint`; write `eslint.config.js` with the four rules listed above.
3. Enable the strict `tsconfig` knobs; fix anything that breaks.
4. Add `check` script = typecheck + lint + format:check + test.
5. Add GitHub Actions workflow that runs `pnpm check`.
6. Break one file on purpose (drop an `await`) and confirm CI fails.

### Success criteria
- Local `pnpm check` runs in under 30 seconds on a small project
- Removing an `await` fails the lint step, not just the test step
- Missing env var documented in `.env.example` fails the test step
- CI yaml is under 40 lines

</Lab>

## Checkpoint

<Checkpoint>
1. Which layer catches a floating promise: format, lint, typecheck, or test?
2. Why run `tsc --noEmit` as a separate script even if `vitest` compiles TypeScript?
3. When does a Node.js service need a bundler, and when is `tsc` alone enough?
4. Name one rule a pre-commit hook should enforce and one it should not.
5. You inherit a repo with 500 `as any` casts. What's a week-one plan?
</Checkpoint>

## Further reading

- [Modern Tooling Coverage](/learning/tooling/modern-tooling-coverage/)
- [Testing: unit, integration, API](/learning/testing/unit-integration-api-testing/)
- [DevOps: CI / CD](/learning/devops/ci-cd-release-flow-and-deployment/)
