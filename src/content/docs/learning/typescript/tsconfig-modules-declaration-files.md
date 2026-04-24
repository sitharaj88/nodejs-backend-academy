---
title: tsconfig, Modules, and Declaration Files
slug: learning/typescript/tsconfig-modules-declaration-files
description: Learn tsconfig essentials, strict mode, module settings, path aliases, declaration files, ambient types, and how TypeScript integrates with packages and Node.js projects.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="TypeScript" prerequisites="Basic tsc usage, Node.js modules" />

Many TypeScript problems are not about syntax. They come from configuration or from mismatched expectations about the module system.

This page gives learners the mental model needed to make TypeScript projects behave correctly.

<Objectives>
- Write a strict `tsconfig.json` that catches real bugs without drowning the team
- Match `module` and `moduleResolution` to the Node.js runtime you actually ship
- Add path aliases that work in both the type checker and the runtime
- Write a `.d.ts` file that types an untyped package or augments an existing one
- Diagnose the typical import errors that turn out to be module-system mismatches
</Objectives>

## Why `tsconfig.json` Matters

`tsconfig.json` controls how TypeScript:

- checks code
- resolves modules
- emits JavaScript
- understands the project boundary

## A Good Strict Starter Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### Important options

- `strict`: enables the full strict family baseline
- `target`: controls output JavaScript target
- `module`: controls module emit expectations
- `moduleResolution`: controls how imports are resolved
- `outDir`: separates build output from source

## Strictness Options

Serious TypeScript teaching should discuss these explicitly:

- `strictNullChecks`
- `noImplicitAny`
- `noImplicitReturns`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`

These options expose real design issues early.

## ESM and CommonJS

TypeScript must align with the runtime module system.

If the project is modern Node.js with ESM, settings like `NodeNext` are usually appropriate. If the project is CommonJS, the settings should reflect that consistently.

### Teaching point

Many TypeScript import errors are really module-system mismatches.

<Callout type="info" title="Pick one module system and be consistent">
Your `package.json` `"type"` field, your `tsconfig` `"module"`, your Node.js version, and your bundler (if any) must all agree. If one of them disagrees, imports start resolving surprisingly or runtime explodes with `ERR_REQUIRE_ESM`.
</Callout>

<Compare badLabel="Loose config hides bugs" goodLabel="Strict config surfaces them early">
<Fragment slot="bad">
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": false,
    "esModuleInterop": true
  }
}
```
`noImplicitAny` off, `strictNullChecks` off — half the safety story is missing.
</Fragment>
<Fragment slot="good">
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```
Strict baseline catches undefined access, override drift, and case-sensitivity bugs before they reach CI.
</Fragment>
</Compare>

## Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}
```

Path aliases improve import readability, but the runtime or bundler must also understand them.

## Declaration Files

Declaration files describe types without implementing runtime code.

```ts
declare module 'legacy-payment-sdk' {
  export function charge(amount: number): Promise<string>
}
```

This is useful when a library has no built-in typings.

## `.d.ts` Files

Use `.d.ts` files to:

- type untyped third-party libraries
- declare global variables
- publish library types
- augment existing modules

## Ambient Declarations

```ts
declare const BUILD_ID: string
```

Ambient declarations describe values that exist somewhere else.

## Global Augmentation

Sometimes an application adds fields to framework request objects.

```ts
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}
```

Teach this carefully. It is powerful, but hidden global behavior should stay intentional.

## Third-Party Typings

Learners should understand:

- some packages ship their own types
- some rely on community types
- some need custom declarations

The compiler error usually tells you which category you are in.

## Emission and Type Checking

TypeScript can:

- type-check only
- emit JavaScript
- emit declarations

That matters in build pipelines and library publishing.

## Source Maps and Debugging

Enable source maps so debugging points back to TypeScript source rather than compiled JavaScript.

## Pitfalls

<Pitfall title="Path aliases the runtime ignores">
`@core/*` resolves fine under `tsc`, but `node dist/server.js` throws `ERR_MODULE_NOT_FOUND` because Node.js does not read `paths`. **Fix:** add `tsc-alias`, use `tsconfig-paths`, or configure your bundler (esbuild, tsup, Vite) to rewrite the aliases.
</Pitfall>

<Pitfall title="Disabling strict to unblock a merge">
A broken migration leaves 40 `noImplicitAny` errors, someone flips `"strict": false`, and the errors never come back. **Fix:** leave `strict: true` on, commit a single `// @ts-expect-error` with a TODO comment per site, and convert them back individually.
</Pitfall>

<Pitfall title="`skipLibCheck: false` in a large project">
You turn lib checking on to be safe, and suddenly a bad `@types/third-party` package breaks your whole build. **Fix:** keep `skipLibCheck: true` for application code; turn it off only when publishing a library so you catch type regressions in your own surface.
</Pitfall>

<Callout type="tip" title="Use `tsc --showConfig` when in doubt">
When `tsconfig.json` inheritance and project references get tangled, `tsc --showConfig` prints the fully resolved config the compiler is actually using. It is faster than guessing which `extends` chain wins.
</Callout>

## Common Mistakes

- turning off strict options too quickly
- mixing ESM and CommonJS assumptions
- adding path aliases without runtime support
- using `skipLibCheck` as a cure for unrelated project issues
- patching over missing types with `any` instead of proper declarations

## Practice Ideas

- build a strict starter `tsconfig`
- create a `.d.ts` file for a fake untyped package
- switch a small project from loose settings to strict mode and document the errors found
- add a path alias and wire it correctly in the runtime setup

## What To Remember

- many TypeScript issues are configuration issues
- strict mode is part of the learning path, not an optional extra
- module settings must match runtime reality
- declaration files describe types for code that lives elsewhere
- typing infrastructure matters as much as syntax in real projects

## Lab

<Lab title="Convert a loose project to strict NodeNext" duration="50 min" difficulty="Medium" stack="TypeScript, Node.js 22, package.json, .d.ts">

### Goal
Migrate a small Express service from a loose `tsconfig` and CommonJS output to strict NodeNext ESM — with working path aliases and one `.d.ts` file for an untyped dependency.

### Steps
1. Start from a project with `"strict": false`, `"module": "CommonJS"`, and relative imports.
2. Switch `tsconfig.json` to the strict NodeNext example above; set `"type": "module"` in `package.json`.
3. Fix every new error without adding `any` or `!`. Turn implicit nulls into explicit `T | null`.
4. Add `paths: { "@app/*": ["src/*"] }` and wire runtime resolution with `tsc-alias` or your bundler.
5. Create `src/types/legacy-sdk.d.ts` with `declare module 'legacy-sdk' { export function charge(amount: number): Promise<string> }` and import it in one route.

### Success criteria
- `tsc --noEmit` passes under strict NodeNext
- `node --enable-source-maps dist/server.js` boots without `ERR_MODULE_NOT_FOUND`
- Every path alias resolves at both type-check and runtime
- The untyped dependency is used from application code with full IntelliSense

</Lab>

## Checkpoint

<Checkpoint>
1. Why does `strict: true` not imply `noUncheckedIndexedAccess`? When should you enable the extra option?
2. What has to be true across `package.json`, `tsconfig`, and Node.js version for an ESM project to resolve imports cleanly?
3. A colleague adds `paths` and the runtime crashes. What are the two usual ways to make aliases work at runtime?
4. When is a `.d.ts` file the right fix, and when is it a sign the dependency should be replaced?
5. Why is `skipLibCheck: true` appropriate for an application but risky for a published library?
</Checkpoint>

## Further reading

- [Type System Foundations](/learning/typescript/type-system-foundations/) — the options strict mode turns on
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — what strict mode does and does not protect
- [Modern TypeScript Coverage](/learning/typescript/modern-typescript-coverage/) — the feature set this config is tuned for
- [TypeScript Versions and Feature History](/learning/typescript/typescript-versions-history/) — which TypeScript release added each flag
