---
title: Type System Foundations
slug: learning/typescript/type-system-foundations
description: Learn the TypeScript type system foundation, including annotations, inference, primitives, literals, tuples, enums, unknown, any, never, and assignability.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="20 min" track="TypeScript" prerequisites="Modern JavaScript, variables, primitives, objects" />

TypeScript becomes much easier once learners stop thinking only in terms of syntax and start thinking in terms of assignability. The question the compiler is really asking is: "can this value live in that slot?"

<Objectives>
- Distinguish annotation from inference and know when to prefer each
- Model a small domain with primitives, literal unions, tuples, and named aliases
- Choose between `any`, `unknown`, `never`, and `void` with intent
- Explain structural typing and how assignability differs from nominal inheritance
- Recognise when an assertion is hiding a modeling problem
</Objectives>

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

<Callout type="tip" title="Annotate the boundary, infer the interior">
Annotate function parameters, function return types on exported APIs, and module-level data shapes. Let inference handle locals, array callbacks, and obvious literals. This keeps diffs small and errors pointed at real boundaries.
</Callout>

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

<Compare badLabel="any hides bugs" goodLabel="unknown forces a check">
<Fragment slot="bad">
```ts
function handle(raw: any) {
  return raw.user.email.toLowerCase()
}

handle(null) // compiles, crashes at runtime
```
</Fragment>
<Fragment slot="good">
```ts
function handle(raw: unknown) {
  if (
    typeof raw === 'object' && raw !== null &&
    'user' in raw && typeof (raw as { user: unknown }).user === 'object'
  ) {
    const user = (raw as { user: { email?: unknown } }).user
    if (typeof user.email === 'string') {
      return user.email.toLowerCase()
    }
  }
  throw new Error('bad payload')
}
```
</Fragment>
</Compare>

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

<Callout type="info" title="Types disappear at runtime">
Every annotation you write is erased by the compiler. A handler typed as `(req: Request) => User` will still receive whatever the network actually sent. Types describe expectations; validation enforces them.
</Callout>

## Pitfalls

<Pitfall title="Defaulting to `any` to silence red squiggles">
A `fetch` result is typed `any` so the file compiles, then every downstream caller inherits `any`. Bugs appear far from the original cast. **Fix:** start external data as `unknown` and narrow once at the boundary. Never let `any` leak past a single function.
</Pitfall>

<Pitfall title="Confusing `unknown` with `any`">
Learners write `payload.name` after assigning `unknown` and are surprised that it errors. The whole point of `unknown` is to force a narrowing step. **Fix:** add a `typeof`, an `in` check, or a type guard. If you want the no-check behavior back, you actually wanted `any` — and you probably should not.
</Pitfall>

<Pitfall title="Choosing enums by default">
A string enum `UserRole` forces a runtime object that cannot be tree-shaken and that does not round-trip through JSON naturally. **Fix:** prefer `type Role = 'admin' | 'student'`. Reach for `enum` only when you want a stable numeric wire value.
</Pitfall>

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

## Lab

<Lab title="Model a small domain with literal unions and aliases" duration="30 min" difficulty="Easy" stack="TypeScript, Node.js, strict tsconfig">

### Goal
Take a loose JavaScript settings object and remodel it in strict TypeScript using literal unions, tuples, `readonly`, and named aliases — no `any`, no assertions.

### Steps
1. Start from `const config = { env: 'prod', port: '3000', retries: 3 }` and list every field's real constraint.
2. Introduce a `type Environment = 'development' | 'staging' | 'production'` and fix the value.
3. Convert `port` to `number`, add a `readonly host: string`, and model `retries` as `0 | 1 | 2 | 3`.
4. Build a `type AppConfig` alias and annotate a `loadConfig(): AppConfig` function that returns the object.
5. Enable `strict` and `noUncheckedIndexedAccess` in `tsconfig.json` and resolve every error without adding `any`.

### Success criteria
- `tsc --noEmit` passes under strict mode
- No `any`, `as`, or `!` appears in the solution
- Every literal union member corresponds to a runtime value you actually use
- A code review explains each annotation in one sentence

</Lab>

## Checkpoint

<Checkpoint>
1. When does annotating a variable add value over letting TypeScript infer the type?
2. Why is `unknown` safer than `any` when you parse a JSON payload?
3. Give one case where a literal union is a better fit than an enum, and one case where an enum is defensible.
4. What does structural typing allow you to do that a nominal system would reject?
5. Why does a non-null assertion (`!`) often hide a missing piece of modeling?
</Checkpoint>

## Further reading

- [Functions, Objects, and Arrays](/learning/typescript/functions-objects-arrays/) — applying these types to real shapes
- [Unions, Narrowing, and Type Guards](/learning/typescript/unions-narrowing-type-guards/) — turning broad values into safe ones
- [tsconfig, Modules, and Declaration Files](/learning/typescript/tsconfig-modules-declaration-files/) — enabling the strict options you rely on here
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — where the type system ends
