---
title: tsconfig, Modules, and Declaration Files
slug: learning/typescript/tsconfig-modules-declaration-files
description: Learn tsconfig essentials, strict mode, module settings, path aliases, declaration files, ambient types, and how TypeScript integrates with packages and Node.js projects.
---

Many TypeScript problems are not about syntax. They come from configuration or from mismatched expectations about the module system.

This page gives learners the mental model needed to make TypeScript projects behave correctly.

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
