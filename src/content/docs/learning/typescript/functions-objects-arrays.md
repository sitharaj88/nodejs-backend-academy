---
title: Functions, Objects, and Arrays
slug: learning/typescript/functions-objects-arrays
description: Learn to type functions, parameters, return values, optional properties, arrays, tuples, readonly data, and object-heavy backend structures in TypeScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="22 min" track="TypeScript" prerequisites="Type System Foundations" />

Most TypeScript work is really about three things:

- functions
- object shapes
- collections of data

If learners can model these clearly, most application code becomes easier.

<Objectives>
- Type function parameters and return values explicitly on exported APIs
- Model object shapes with optional, readonly, and index-signature fields when appropriate
- Choose between tuples, arrays of objects, and indexed objects for a given dataset
- Decide when a union parameter beats an overload
- Protect configuration data from accidental mutation with `readonly`
</Objectives>

## Typing Function Parameters and Returns

```ts
function createWelcomeMessage(name: string, batch: number): string {
  return `Welcome ${name}, batch ${batch}`
}
```

This is the baseline pattern every learner should master.

## Optional Parameters

```ts
function formatPrice(value: number, currency?: string): string {
  return currency ? `${currency} ${value}` : `${value}`
}
```

Optional parameters become `T | undefined`.

## Default Parameters

```ts
function createUser(name: string, role = 'student') {
  return { name, role }
}
```

Default values often reduce the need for broad optional branching.

## Function Type Expressions

```ts
type Validator = (value: string) => boolean
```

This is useful when functions are stored, passed, or reused.

## Call Signatures in Objects

```ts
type Formatter = {
  (value: number): string
  label: string
}
```

This is advanced, but it helps learners read libraries that expose callable objects.

## Optional Object Properties

```ts
type Student = {
  id: string
  name: string
  githubUrl?: string
}
```

Optional properties are common in APIs and form-driven systems.

<Callout type="info" title="Optional is not the same as nullable">
With `exactOptionalPropertyTypes`, `githubUrl?: string` means the key may be absent, not that it may be `null`. If your API actually sends `null`, model it as `githubUrl: string | null` — that distinction carries through to validation and to the JSON you emit.
</Callout>

## Readonly Objects

```ts
type AppConfig = {
  readonly appName: string
  readonly port: number
}
```

Readonly helps signal that configuration should not drift during runtime.

## Index Signatures

Sometimes keys are not known in advance.

```ts
type ErrorBag = {
  [field: string]: string
}
```

Use this carefully. If the keys are actually known, a more precise type is usually better.

## Arrays

```ts
const lessonTitles: string[] = ['Scope', 'Closures', 'Promises']
```

Arrays should reflect the actual element type clearly.

## Readonly Arrays

```ts
const tracks: readonly string[] = ['backend', 'frontend', 'data']
```

This prevents mutation like `push()`.

## Arrays of Objects

```ts
type Lesson = {
  id: string
  title: string
  isPublished: boolean
}

const lessons: Lesson[] = [
  { id: 'l1', title: 'Closures', isPublished: true },
  { id: 'l2', title: 'Promises', isPublished: false },
]
```

This is one of the most common backend modeling patterns.

## Tuples in Real Systems

Tuples are useful when positions matter.

```ts
type DbResult = [rows: number, durationMs: number]
```

Named tuple elements improve readability without switching to full objects.

## Rest Parameters

```ts
function totalScores(...scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0)
}
```

## Destructuring with Types

```ts
type Enrollment = {
  studentName: string
  courseTitle: string
  isPaid: boolean
}

function printEnrollment({ studentName, courseTitle }: Enrollment) {
  console.log(`${studentName} enrolled in ${courseTitle}`)
}
```

## Function Overloads

Use overloads when one function intentionally supports multiple call shapes.

```ts
function getLabel(value: string): string
function getLabel(value: number): string
function getLabel(value: string | number): string {
  return `Label: ${value}`
}
```

Overloads should be used when they genuinely improve clarity, not as a default habit.

<Compare badLabel="Overload for a trivial split" goodLabel="One signature with a union">
<Fragment slot="bad">
```ts
function greet(name: string): string
function greet(name: null): string
function greet(name: string | null): string {
  return name ? `hi ${name}` : 'hi guest'
}
```
Three declarations for no added type information.
</Fragment>
<Fragment slot="good">
```ts
function greet(name: string | null): string {
  return name ? `hi ${name}` : 'hi guest'
}
```
Callers get the same type safety, readers see one signature.
</Fragment>
</Compare>

## `this` Parameters

TypeScript can type `this` in functions.

```ts
type Counter = {
  value: number
  increment(this: Counter): void
}
```

This is useful when teaching object methods and callback context.

## Pitfalls

<Pitfall title="A forest of optional properties">
A `User` type ends up with twelve `?:` fields because several are only present during signup, others only after email verification. Every caller is forced into null checks that do not reflect real states. **Fix:** split into explicit states — `PendingUser`, `VerifiedUser`, `SuspendedUser` — as a union.
</Pitfall>

<Pitfall title="Index signatures that hide typos">
`type Config = { [key: string]: string }` lets `config.hst` compile just as happily as `config.host`. **Fix:** list the known keys explicitly; use a `Record<K, V>` with a finite `K` when you truly want a keyed map.
</Pitfall>

<Pitfall title="Forgotten return-type annotations on exports">
An exported helper loses its return type when its implementation changes, and a downstream file silently starts receiving `any[]`. **Fix:** annotate return types on every exported function. Treat inference there as a regression, not a convenience.
</Pitfall>

<Callout type="tip" title="Readonly at the boundary">
Declare public APIs with `readonly` arrays and `readonly` object fields. Internal code can still assemble the values mutably — but once handed out, the data cannot be accidentally mutated by a caller.
</Callout>

## Common Mistakes

- using broad object types when a named type would be clearer
- making too many properties optional instead of modeling separate states
- overusing index signatures
- writing overloads when a union parameter would be simpler
- forgetting `readonly` when mutation should be prevented

## Practice Ideas

- type a paginated API response
- create a reusable validator function type
- refactor a loosely shaped settings object into a clear named type
- model an array of lessons with readonly data where appropriate

## What To Remember

- functions should describe both inputs and outputs
- optional properties model missing data, but too many optional fields can hide bad design
- arrays of objects are a core TypeScript skill
- overloads are useful, but unions are often simpler
- `readonly` communicates intent clearly

## Lab

<Lab title="Type a paginated lessons API" duration="35 min" difficulty="Easy" stack="TypeScript, Node.js, strict tsconfig">

### Goal
Model a paginated API response and a small helper function around it — end-to-end typed, with zero `any` and no assertions.

### Steps
1. Create `type Lesson = { id: string; title: string; isPublished: boolean; tags: readonly string[] }`.
2. Create `type Page<T> = { items: readonly T[]; pageInfo: { cursor: string | null; hasNext: boolean } }` and use it as `Page<Lesson>`.
3. Write a `function findLesson(page: Page<Lesson>, id: string): Lesson | undefined` that uses `Array#find` and returns a correctly typed result.
4. Write a `function printLessonRow(lesson: Lesson): void` that destructures fields safely.
5. Turn on `noUncheckedIndexedAccess` and fix any `T | undefined` narrowing the compiler forces.

### Success criteria
- No `any`, no `as`, no non-null assertions
- `Lesson[]` does not appear anywhere — everything goes through `readonly` arrays
- Calling `findLesson(page, 'missing')` is statically known to possibly return `undefined`
- A reader can tell from types alone what a paginated response looks like

</Lab>

## Checkpoint

<Checkpoint>
1. When should an exported function declare an explicit return type instead of relying on inference?
2. A `User` shape has eight optional fields. What design smell does that suggest?
3. Name one place where an index signature is genuinely the right tool.
4. Why would you prefer a union parameter over a pair of overloads for `greet(name: string | null)`?
5. How does `readonly` on a public return type protect the rest of your codebase?
</Checkpoint>

## Further reading

- [Unions, Narrowing, and Type Guards](/learning/typescript/unions-narrowing-type-guards/) — modeling the split states those optional fields pointed at
- [Generics, Inference, and Constraints](/learning/typescript/generics-inference-constraints/) — reusing the `Page<T>` pattern
- [Interfaces, Classes, and OOP](/learning/typescript/interfaces-classes-oop/) — when a contract is better described as an `interface`
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — confirming the shape once the payload lands
