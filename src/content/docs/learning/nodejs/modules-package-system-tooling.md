---
title: Modules, Package System, and Tooling
slug: learning/nodejs/modules-package-system-tooling
description: Learn CommonJS, ES modules, npm, semver, package.json, scripts, dependency strategy, and modern Node.js project tooling decisions.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="18 min" track="Node.js" prerequisites="Basic Node.js runtime understanding" />

The Node.js ecosystem is shaped heavily by how code is packaged, loaded, and shared.

<Objectives>
- Read a `package.json` and predict how a file will resolve
- Choose ESM or CommonJS with a runtime-level reason
- Distinguish runtime dependencies, dev dependencies, and lockfile behavior
- Use `node:` specifiers and modern tooling without cargo-culting
</Objectives>

## Why Modules Matter

Without modules, Node.js applications become one huge file with no boundaries. Modules allow:

- separation of concerns
- reusable services
- testable units
- clearer imports and exports

## CommonJS

CommonJS is the older Node.js module system.

```js
const fs = require('node:fs')

module.exports = {
  readConfig,
}
```

Learners still need to recognize it because many older tutorials and packages use it.

## ES Modules

Modern Node.js supports ES modules.

```js
import fs from 'node:fs/promises'

export async function readConfig() {
  return fs.readFile('config.json', 'utf8')
}
```

### Teaching point

Students should understand that ESM is now a first-class Node.js story, not a browser-only feature.

<KeyConcept title="The module system is a file-level property, not a project one">
Node.js decides whether a `.js` file is ESM or CommonJS based on the nearest `package.json`'s `type` field. `.mjs` is always ESM; `.cjs` is always CommonJS. Mixing the two in one project works — but each file only speaks one dialect.
</KeyConcept>

## Choosing Between CommonJS and ESM

<Compare badLabel="Historical default (CJS-only)" goodLabel="Modern default (ESM-first)">
<Fragment slot="bad">
```json
{
  "name": "legacy-api",
  "main": "src/server.js"
}
```
```js
// src/server.js
const express = require('express')
const { readConfig } = require('./config')
```
Works, but you cannot use top-level `await`, and dynamic-only packages require workarounds.
</Fragment>
<Fragment slot="good">
```json
{
  "name": "modern-api",
  "type": "module",
  "exports": "./src/server.js",
  "engines": { "node": ">=22" }
}
```
```js
// src/server.js
import express from 'express'
import { readConfig } from './config.js'
const config = await readConfig()
```
Top-level `await`, clean `import` syntax, and better alignment with modern tooling.
</Fragment>
</Compare>

Use ESM when:

- building modern applications
- aligning with newer JavaScript tooling
- using top-level `await`
- preferring standard `import` and `export`

CommonJS still matters for:

- legacy codebases
- older package compatibility
- some migration scenarios

## `package.json`

`package.json` is the heart of a Node.js project.

It describes:

- project name and version
- scripts
- dependencies
- module type
- engines and metadata

## Key Fields

### `type`

```json
{
  "type": "module"
}
```

This affects whether `.js` files are treated as ESM or CommonJS.

### `scripts`

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "test": "node --test"
  }
}
```

### `engines`

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

This helps communicate runtime expectations.

## npm Basics

npm handles:

- package installation
- dependency resolution
- script execution
- version publishing

### Core commands

- `npm install`
- `npm run <script>`
- `npm test`
- `npm outdated`
- `npm audit`

<Callout type="tip" title="Prefer `npm ci` in CI">
`npm install` can mutate your lockfile silently. `npm ci` does a clean install strictly from `package-lock.json` and fails if they disagree — which is exactly what a reproducible build should do.
</Callout>

## Dependencies Versus Dev Dependencies

- runtime dependencies are needed by the application when it runs
- development dependencies support building, linting, testing, or generating code

Teach students not to treat these categories casually.

## Semantic Versioning

Semver matters deeply in Node.js:

- major: breaking change
- minor: backward-compatible feature
- patch: backward-compatible fix

Understanding version ranges helps learners avoid dependency confusion.

## Lockfiles

Lockfiles make installs reproducible.

Serious projects should commit the lockfile because dependency drift creates real debugging problems.

<Callout type="warn" title="Lockfile drift is a reliability bug">
Two developers with the same `package.json` can end up with different `node_modules` trees if one of them runs `npm install` without committing the lockfile. Treat lockfile conflicts as first-class merge conflicts, not afterthoughts.
</Callout>

## Modern Tooling Choices

Modern Node.js projects often include:

- TypeScript
- ESLint
- Prettier or equivalent formatting
- test runners
- environment variable management
- bundling only when actually needed

### Teaching point

Do not teach tools as ritual. Teach why each tool exists and what failure it prevents.

## `node:` Specifiers

Modern code can import built-in modules explicitly:

```js
import path from 'node:path'
```

This makes it clearer that the module is part of the runtime, not a package from npm.

## `npx` and Task Execution

`npx` or equivalent task execution patterns help run local project tools without global installation habits.

## Common Pitfalls

<Pitfall title="Mixing `require` and `import` in the same file">
A CommonJS file tries `import { x } from './esm.js'` and crashes with `ERR_REQUIRE_ESM`. The opposite — ESM calling `require()` — fails unless you create `require` via `createRequire`. **Fix:** pick a module system per file; use `createRequire(import.meta.url)` only as a bridge during migration.
</Pitfall>

<Pitfall title="Unpinned transitive dependency breaks the build">
A minor bump in an indirect dependency flips behavior overnight. You have no lockfile committed, so CI was green yesterday and red today. **Fix:** commit `package-lock.json`, use `npm ci` in CI, and open a renovate PR instead of letting installs drift.
</Pitfall>

<Pitfall title="`dependencies` vs `devDependencies` confusion">
Tests pass locally and fail in production because `dotenv` was accidentally listed under `devDependencies`. `NODE_ENV=production npm install` skips dev deps. **Fix:** audit what runs at startup; anything imported by the deployed process belongs in `dependencies`.
</Pitfall>

## Common Mistakes

- mixing ESM and CommonJS without understanding the runtime rules
- depending on too many packages for things Node.js already provides
- ignoring lockfiles
- treating `package.json` as a random dump of scripts
- not documenting the supported Node.js version

## Practice Ideas

- create one project in CommonJS and one in ESM
- add a clean `package.json` with purposeful scripts
- compare built-in `fetch` with a third-party HTTP dependency strategy
- explain whether each dependency belongs in `dependencies` or `devDependencies`

## Lab

<Lab title="Ship a clean ESM package" duration="45 min" difficulty="Easy" stack="Node.js 22+, npm">

### Goal
Produce a small, modern Node.js package with a correct `package.json`, ESM entry point, and reproducible install.

### Steps
1. Scaffold a fresh project with `npm init -y` and add `"type": "module"` plus `"engines": { "node": ">=22" }`.
2. Write one ESM file `src/greet.js` exporting `greet(name)` and one test using the built-in `node --test`.
3. Add `"scripts"` for `dev`, `test`, and `lint` (use `eslint --init` or leave a placeholder).
4. Commit `package-lock.json`. Run `npm ci` in a fresh clone to prove reproducibility.
5. Add an `"exports"` field restricting imports to your entry point and verify that `import` from the package works, but `import` from a private internal file does not.

### Success criteria
- `npm ci` completes cleanly in a fresh clone
- `node --test` passes
- Changing `"type"` to `"commonjs"` produces a specific, explainable error
- The `"exports"` field rejects deep imports that used to work

</Lab>

## Checkpoint

<Checkpoint>
1. Given a `package.json` with `"type": "module"`, what happens to `require('./x.js')` inside the same project?
2. What exact problem does committing `package-lock.json` solve that `package.json` alone does not?
3. Why is `node:fs` preferable to `fs` in new code?
4. You see `"engines": { "node": ">=22" }`. Does Node enforce this? What does it actually do?
5. A teammate moves `express` to `devDependencies`. Tests still pass. What fails, and when?
</Checkpoint>

## Further reading

- [Runtime Fundamentals](/learning/nodejs/runtime-fundamentals/)
- [File System, Path, Buffer, and Process](/learning/nodejs/filesystem-path-buffer-process/)
- [Node.js Versions and Ecosystem History](/learning/nodejs/nodejs-versions-ecosystem-history/)
