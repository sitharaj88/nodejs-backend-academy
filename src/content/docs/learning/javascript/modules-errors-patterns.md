---
title: Modules, Errors, and Code Patterns
description: Learn JavaScript modules, exports, imports, error handling, reusable patterns, and practical code organization.
---

Once students know the core language, they need to organize it into maintainable code.

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

## What To Remember

- modules keep code organized
- clear exports improve maintainability
- errors should carry meaning
- small patterns become very powerful in larger projects
- modern modules also include dynamic import, `import.meta`, and top-level `await`
