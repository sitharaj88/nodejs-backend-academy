---
title: Type System Foundations
slug: learning/typescript/type-system-foundations
description: Learn the TypeScript type system foundation, including annotations, inference, primitives, literals, tuples, enums, unknown, any, never, and assignability.
---

TypeScript becomes much easier once learners stop thinking only in terms of syntax and start thinking in terms of assignability.

## What TypeScript Adds

TypeScript adds:

- static analysis before runtime
- a structural type system
- stronger editor tooling
- safer refactoring support

It still produces JavaScript. The types do not run in production.

## Type Annotations

```ts
const courseName: string = 'Node.js Backend Academy'
const studentCount: number = 42
const isPublished: boolean = true
```

Annotations make intent explicit.

## Type Inference

TypeScript can often infer the type without an annotation.

```ts
const port = 3000
const host = 'localhost'
```

The compiler already understands these values.

### Teaching point

Good TypeScript is not about annotating every line. It is about adding annotations where they improve clarity or preserve correctness.

## Primitive Types

Core primitive types include:

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `bigint`
- `symbol`

## Literal Types

Sometimes the exact value matters, not only the general category.

```ts
type Environment = 'development' | 'staging' | 'production'

let env: Environment = 'production'
```

This is much safer than allowing any string.

## Arrays and Tuples

### Arrays

```ts
const modules: string[] = ['javascript', 'typescript', 'nodejs']
```

### Tuples

Tuples describe fixed positions.

```ts
const httpStatus: [number, string] = [200, 'OK']
```

Use tuples when order carries meaning.

## Objects

```ts
const trainer: { name: string; experience: number } = {
  name: 'Meena',
  experience: 8,
}
```

This works, but repeated object shapes should usually become named types or interfaces.

## `type` Aliases

```ts
type Trainer = {
  name: string
  experience: number
}
```

Named types make code easier to read and reuse.

## `any`

`any` disables type safety for that value.

```ts
let data: any = 'hello'
data = 100
data = { ok: true }
```

### Rule

Use `any` only when there is a strong reason and a clear boundary. It is an escape hatch, not a default.

## `unknown`

`unknown` is safer than `any`.

```ts
let payload: unknown
payload = JSON.parse(input)
```

You must narrow `unknown` before using it.

## `void`

`void` is commonly used for functions that do not return a meaningful value.

```ts
function logMessage(message: string): void {
  console.log(message)
}
```

## `never`

`never` represents something that cannot happen.

```ts
function fail(message: string): never {
  throw new Error(message)
}
```

It also appears in exhaustive checks.

## `readonly`

```ts
type Config = {
  readonly appName: string
}
```

This protects properties from reassignment after creation.

## Enums

TypeScript supports enums, but they should be taught carefully.

```ts
enum UserRole {
  Admin = 'admin',
  Trainer = 'trainer',
  Student = 'student',
}
```

In many codebases, string literal unions are preferred because they are simpler and align better with plain JavaScript.

## Assignability

TypeScript asks questions like:

- can this value be assigned to that variable
- does this object meet that shape
- can this function be used where that function is expected

This is the core idea behind most compiler errors.

## Structural Typing

TypeScript cares about shape, not explicit inheritance.

```ts
type HasEmail = { email: string }

const admin = {
  name: 'Riya',
  email: 'riya@example.com',
}

const user: HasEmail = admin
```

This works because `admin` has the required shape.

## Type Assertions

```ts
const input = document.querySelector('#search') as HTMLInputElement | null
```

An assertion tells TypeScript to trust you. That means it can be useful, but also dangerous.

## Non-Null Assertion

```ts
const apiKey = process.env.API_KEY!
```

This removes `undefined` from the type, but only use it when the guarantee is real.

## Common Mistakes

- adding `any` too early
- confusing `unknown` with `any`
- overusing assertions instead of modeling the data properly
- choosing enums when a literal union would be clearer
- forgetting that types disappear at runtime

## Practice Ideas

- replace magic strings with a literal union
- model an API response with a type alias
- convert a loose tuple into a named object and compare readability
- change an `any` to `unknown` and add safe narrowing

## What To Remember

- TypeScript is about assignability and shape
- inference is useful, not a weakness
- `unknown` is safer than `any`
- literal unions often model domains better than broad strings
- types help before runtime, not during runtime
