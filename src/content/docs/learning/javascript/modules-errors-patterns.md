---
title: Modules, Errors, and Code Patterns
description: Learn JavaScript modules, exports, imports, error handling, reusable patterns, and practical code organization.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="25 min" track="JavaScript" prerequisites="Functions, Scope, Closures, and This; Asynchronous JavaScript" />

Code that runs is only half the job. Code that other people can read, change, and trust is the other half. Modules, typed errors, guard clauses, and small reusable patterns are the tools that scale your JavaScript from a file to a team codebase.

<Objectives>
- Choose between named exports, default exports, and dynamic imports with intent
- Design module boundaries around responsibility, not convenience
- Throw custom errors that carry meaning to callers and logs
- Replace nested `if` chains with guard clauses
- Pick between throwing and returning a Result object by recoverability
</Objectives>

## Why Modules Matter

Without modules, code becomes one large file:

- harder to test
- harder to reuse
- harder to read
- easier to break

Modules let you split logic into purposeful files.

## ES Modules

### Named export

```js
export function formatCurrency(value) {
  return `Rs. ${value}`
}
```

### Import

```js
import { formatCurrency } from './money.js'
```

### Default export

```js
export default function greet(name) {
  return `Hello, ${name}`
}
```

```js
import greet from './greet.js'
```

<Callout type="tip" title="Prefer named exports in shared code">
Named exports rename consistently across the codebase, autocomplete correctly, and make `grep`/`rg` usage easier. Default exports are fine for single-purpose files and required for a few frameworks, but do not mix them in the same module.
</Callout>

## Dynamic `import()`

Modules can also be loaded lazily.

```js
async function loadAnalytics() {
  const module = await import('./analytics.js')
  module.trackVisit()
}
```

This is useful when code should load only when needed.

## `import.meta`

ES modules expose module metadata through `import.meta`.

```js
console.log(import.meta.url)
```

Learners do not need to memorize every `import.meta` usage immediately, but they should know it exists in module-based JavaScript.

## CommonJS

Students should still know the older Node.js style.

```js
module.exports = { formatCurrency }
```

```js
const { formatCurrency } = require('./money')
```

<Pitfall title="Mixing ESM and CommonJS without a strategy">
A `.js` file's module system depends on the nearest `package.json`'s `"type"` field. Importing a CommonJS module from ESM works (mostly), but ESM from CommonJS needs dynamic `import()`. **Fix:** pick one style per package; when interop is needed, use `.mjs`/`.cjs` extensions deliberately and keep a short `interop.md` note.
</Pitfall>

## Top-Level `await` in Modules

Top-level `await` works in ES modules.

```js
const settings = await fetchSettings()

export function getSettings() {
  return settings
}
```

This is one reason module context matters. The same code would not work in traditional CommonJS files.

## Module Design

A good module should:

- have one clear responsibility
- expose a small surface area
- avoid mixing unrelated utilities
- be easy to test

### Unique example

Instead of one `helpers.js` file with fifty random functions, split code into:

- `formatters.js`
- `validators.js`
- `math-utils.js`
- `user-service.js`

That gives names meaning.

## Error Handling

JavaScript errors can be created and thrown directly.

```js
throw new Error('Invalid enrollment')
```

### `try`, `catch`, and `finally`

```js
try {
  const result = riskyOperation()
  console.log(result)
} catch (error) {
  console.error('Operation failed', error)
} finally {
  console.log('cleanup complete')
}
```

## Custom Errors

Custom errors help express meaning clearly.

```js
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

### Why this matters

Different failures should not always look identical. A validation problem is not the same as a database problem.

<Callout type="info" title="Use `cause` to preserve the original error">
`throw new ValidationError('bad payload', { cause: err })` keeps the low-level error attached to the thrown one. Logs and stack trace tooling can follow the chain without losing context.
</Callout>

## Guard Clauses

Guard clauses reduce nesting and improve clarity.

```js
function enroll(student, course) {
  if (!student) throw new Error('Student is required')
  if (!course) throw new Error('Course is required')
  if (!course.isPublished) throw new Error('Course is not available')

  return `${student.name} enrolled in ${course.title}`
}
```

## Reusable Patterns

### Factory functions

```js
function createLogger(label) {
  return {
    info(message) {
      console.log(`[${label}] ${message}`)
    },
  }
}
```

### Configuration objects

```js
function createButton({ text, disabled = false, type = 'button' }) {
  return { text, disabled, type }
}
```

### Result objects

```js
function divide(a, b) {
  if (b === 0) {
    return { ok: false, error: 'Cannot divide by zero' }
  }

  return { ok: true, value: a / b }
}
```

This can be a useful alternative to exceptions in some scenarios.

<Compare badLabel="Throw for expected outcomes" goodLabel="Result object for expected outcomes">
<Fragment slot="bad">
```js
function parseAge(input) {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0) throw new Error('bad age')
  return n
}

// Callers must try/catch for something that is not exceptional.
```
</Fragment>
<Fragment slot="good">
```js
function parseAge(input) {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0) return { ok: false, reason: 'bad age' }
  return { ok: true, value: n }
}

const r = parseAge(req.body.age)
if (!r.ok) return res.status(422).send(r)
```
Expected failure is expressed in the return type, not the stack.
</Fragment>
</Compare>

<Pitfall title="Catching every error and logging only the message">
```js
try { ... } catch (e) { logger.error(e.message) }
```
You lose the stack, the `cause`, the error class. Any downstream diagnostics are gone. **Fix:** log the full error object (`logger.error({ err })`) and rethrow if this layer cannot recover.
</Pitfall>

## Practical Organization Advice

Students should learn to separate:

- domain logic
- formatting helpers
- validation helpers
- configuration
- side-effect-heavy code

## Common Mistakes

- giant utility files with no theme
- inconsistent export styles in the same codebase
- forgetting that top-level `await` depends on module context
- using dynamic imports without a clear reason
- catching all errors too early
- using exceptions for everything without thinking about recoverability

## Practice Ideas

- split one large file into three focused modules
- create a custom validation error
- build a small logger factory
- compare thrown errors versus returned result objects

## Lab

<Lab title="Split, type the errors, ship the pattern" duration="50 min" difficulty="Medium" stack="Node.js, ES modules">

### Goal
Take a 150-line `helpers.js` grab bag, split it into focused modules, introduce a typed error class, and decide per function whether to throw or return a Result.

### Steps
1. Start with a single file that mixes currency formatting, user validation, date parsing, and a HTTP helper. Identify four responsibilities.
2. Create four modules: `formatters.js`, `validators.js`, `time.js`, `http.js`. Export by name.
3. Introduce `ValidationError extends Error` with a `.name`, `.field`, and `.cause`. Use it in `validators.js`.
4. For each function, decide: is failure expected (return Result) or exceptional (throw)? Write one sentence of justification in a comment per function.
5. Add one call site per module that uses the public API and handles errors correctly.
6. Delete the original `helpers.js` only after every caller imports from the new modules.

### Success criteria
- No module exports more than one concept group
- Every thrown error is either an `Error` subclass with a `.name` or a domain error with `.field`
- At least one function uses a Result return instead of throwing, with a comment explaining why
- A `grep` for `helpers.js` returns zero imports

</Lab>

## Checkpoint

<Checkpoint>
1. When would you reach for a dynamic `import()` instead of a top-of-file static import?
2. Why should a custom error class explicitly set `this.name`?
3. Write one sentence that decides, for a given function, whether to throw or return a Result.
4. What problem does top-level `await` solve, and what problem can it create for consumers of your module?
5. You have a `helpers.js` file exporting 40 things. What is your first refactor move, and why?
</Checkpoint>

## What To Remember

- modules keep code organized
- clear exports improve maintainability
- errors should carry meaning
- small patterns become very powerful in larger projects
- modern modules also include dynamic import, `import.meta`, and top-level `await`

## Further reading

- [Asynchronous JavaScript](/learning/javascript/asynchronous-javascript/) — where top-level `await` and dynamic imports shine
- [Prototypes, Classes, and OOP](/learning/javascript/prototypes-classes-oop/) — the class rules behind your custom errors
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — `Promise.withResolvers` and newer helpers
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
