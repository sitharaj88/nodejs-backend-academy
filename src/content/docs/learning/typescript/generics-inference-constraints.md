---
title: Generics, Inference, and Constraints
slug: learning/typescript/generics-inference-constraints
description: Learn TypeScript generics, inference, constraints, default type parameters, generic utilities, and how to write reusable typed abstractions without losing readability.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="24 min" track="TypeScript" prerequisites="Functions & Objects, Unions & Narrowing" />

Generics are where many learners first feel that TypeScript is becoming abstract.

The right way to teach them is simple: generics let types stay connected across inputs and outputs.

<Objectives>
- Write generic functions that let inference carry the caller's type through
- Constrain type parameters with `extends`, `keyof`, and indexed access
- Model reusable envelopes like `ApiResponse<T>` and `Repository<T>` cleanly
- Add default type parameters where they reduce friction without hiding intent
- Recognise generic abstractions that have become cleverer than the problem they solve
</Objectives>

## A Basic Generic Function

```ts
function identity<T>(value: T): T {
  return value
}
```

If the input is a string, the output is a string. If the input is a number, the output is a number.

## Let Inference Work

```ts
const course = identity('TypeScript')
```

You usually do not need to write `identity<string>('TypeScript')`. TypeScript can infer it.

<Callout type="tip" title="Explicit generics are a code smell when inference already works">
If you find yourself writing `identity<string>('x')`, ask why inference is failing. The usual cause is an overly wide parameter annotation upstream. Fix that instead of patching the call site with explicit generics.
</Callout>

## Generic Arrays

```ts
function firstItem<T>(items: T[]): T | undefined {
  return items[0]
}
```

This works for any array element type.

## Multiple Type Parameters

```ts
function pair<K, V>(key: K, value: V) {
  return { key, value }
}
```

Use descriptive names when that helps readability.

## Constraints with `extends`

Sometimes a generic type must have a required shape.

```ts
function getId<T extends { id: string }>(entity: T): string {
  return entity.id
}
```

This says the function is generic, but only for values that contain an `id`.

## `keyof`

`keyof` produces the property names of a type.

```ts
type Student = {
  id: string
  name: string
  batch: number
}

type StudentKey = keyof Student
```

`StudentKey` becomes `'id' | 'name' | 'batch'`.

## Indexed Access Types

```ts
type StudentName = Student['name']
```

This is useful when types should stay connected to existing shapes rather than duplicated manually.

## Generic Property Access

```ts
function getValue<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key]
}
```

This is one of the most important generic patterns in TypeScript.

<Compare badLabel="Untyped lookup" goodLabel="Constrained generic lookup">
<Fragment slot="bad">
```ts
function getValue(object: any, key: string): any {
  return object[key]
}

const n = getValue({ id: 'u1', age: 30 }, 'agE') // any, typo allowed
```
Typos pass, return type is `any`, downstream callers inherit the damage.
</Fragment>
<Fragment slot="good">
```ts
function getValue<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key]
}

const age = getValue({ id: 'u1', age: 30 }, 'age') // number
// getValue({ id: 'u1' }, 'agE') fails at compile time
```
Keys are checked, return type flows precisely.
</Fragment>
</Compare>

## Generic Type Aliases

```ts
type ApiResponse<T> = {
  success: boolean
  data: T
}
```

Now different endpoints can reuse the same response envelope.

## Generic Interfaces

```ts
interface Repository<T> {
  findById(id: string): Promise<T | null>
  create(input: T): Promise<T>
}
```

This pattern is common in data access layers.

## Default Type Parameters

```ts
type ApiResult<T = unknown> = {
  ok: boolean
  data?: T
  error?: string
}
```

Defaults keep generic APIs usable without forcing callers to specify everything.

## Constraints with String Keys

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}
```

This is a practical teaching example because it feels like real application code.

## Inference from Objects

Type inference often improves when object literals are modeled carefully.

```ts
const config = {
  retries: 3,
  mode: 'strict',
}
```

TypeScript infers the shape automatically, but sometimes `as const` or `satisfies` is needed to preserve exactness more intentionally.

## When Generics Become Too Clever

Generics should clarify relationships. If a generic abstraction makes the code harder to understand, it is probably too abstract for the problem.

<Callout type="warn" title="Every generic parameter is a promise">
Adding `<T>` tells readers the function's output depends on its input type. If nothing changes with `T`, you are leaking complexity for no safety. Prefer a concrete signature.
</Callout>

## Pitfalls

<Pitfall title="Generics without a relationship">
`function log<T>(x: T): void` is just `(x: unknown): void` with extra ceremony — `T` is not used in the return. **Fix:** drop the generic. Only introduce `T` when two or more positions in the signature share it.
</Pitfall>

<Pitfall title="Over-constrained generics">
`function first<T extends { id: string; email: string; createdAt: Date }>(xs: T[]): T | undefined` excludes plenty of valid callers. **Fix:** require only the fields the function actually reads — here, nothing, so the constraint can be removed.
</Pitfall>

<Pitfall title="Explicit generics because inference fails silently">
You had to write `save<User>(row)` because `row` came in as `unknown` from `JSON.parse`. **Fix:** validate and narrow at the boundary so `row` has a real type; then inference works everywhere downstream.
</Pitfall>

## Common Mistakes

- writing explicit generic arguments when inference already works
- using single-letter names where clearer names would help
- adding generics to code that has no type relationship to preserve
- using very broad constraints that do not really protect anything
- building library-style complexity in ordinary app code

## Practice Ideas

- create a generic API response type
- write a reusable `pluck()` helper
- type a repository interface for multiple entities
- refactor duplicated object-access logic into one constrained generic function

## What To Remember

- generics preserve relationships between types
- inference is usually the first choice
- constraints make generic code safer
- `keyof` and indexed access types are core tools
- reusable abstractions should still stay readable

## Lab

<Lab title="Build a typed in-memory repository" duration="40 min" difficulty="Medium" stack="TypeScript, Node.js, Vitest">

### Goal
Design a `Repository<T>` generic interface and implement an in-memory store — without casts, with full inference at every call site.

### Steps
1. Declare `interface Entity { id: string }` and `interface Repository<T extends Entity> { findById(id: string): Promise<T | null>; create(input: Omit<T, 'id'>): Promise<T>; list(): Promise<readonly T[]> }`.
2. Write `class InMemoryRepo<T extends Entity> implements Repository<T>` using a `Map<string, T>`.
3. Use it as `new InMemoryRepo<User>()` and confirm `repo.create({ name: 'Ada' })` does not accept `id` and that `findById` returns `User | null`.
4. Write a generic helper `pluck<T, K extends keyof T>(items: readonly T[], key: K): readonly T[K][]` and test it against `User[]`.
5. Add `noImplicitAny` and verify no explicit generic arguments are needed anywhere except the class instantiation.

### Success criteria
- No `any`, no casts, no explicit generic arguments at call sites
- `create` cannot be called with an `id` field
- `pluck(users, 'naem')` fails at compile time
- Replacing `User` with a different entity type requires zero changes to the repo code

</Lab>

## Checkpoint

<Checkpoint>
1. What relationship does `function map<T, U>(xs: T[], f: (x: T) => U): U[]` preserve between its arguments?
2. When should you add a constraint like `<T extends { id: string }>`?
3. Give an example where a generic is unnecessary because no relationship is preserved.
4. What does `T[K]` give you in `function get<T, K extends keyof T>(o: T, k: K): T[K]`?
5. When is a default type parameter (`<T = unknown>`) useful and when does it hide a modeling gap?
</Checkpoint>

## Further reading

- [Mapped, Conditional, and Template Literal Types](/learning/typescript/mapped-conditional-template-literal-types/) — type-level transformations that build on generics
- [Interfaces, Classes, and OOP](/learning/typescript/interfaces-classes-oop/) — generic interfaces and class contracts
- [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/) — `Result<T, E>` and typed builders
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — grounding generics in real runtime data
