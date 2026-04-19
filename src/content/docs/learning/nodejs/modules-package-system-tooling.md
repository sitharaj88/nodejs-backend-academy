---
title: Modules, Package System, and Tooling
slug: learning/nodejs/modules-package-system-tooling
description: Learn CommonJS, ES modules, npm, semver, package.json, scripts, dependency strategy, and modern Node.js project tooling decisions.
---

The Node.js ecosystem is shaped heavily by how code is packaged, loaded, and shared.

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

## Choosing Between CommonJS and ESM

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

## What To Remember

- modules define the shape of the codebase
- ESM is part of modern Node.js, but CommonJS still exists
- `package.json` is operational metadata, not decoration
- semver and lockfiles affect reliability
- many Node.js project problems start as tooling or dependency discipline problems
