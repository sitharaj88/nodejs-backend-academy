---
title: Mapped, Conditional, and Template Literal Types
slug: learning/typescript/mapped-conditional-template-literal-types
description: Learn mapped types, utility types, conditional types, infer, indexed access, key remapping, and template literal types in TypeScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Advanced" duration="26 min" track="TypeScript" prerequisites="Generics, Interfaces & OOP" />

This page covers the part of TypeScript where the type system starts behaving like a language of its own.

Teach it slowly. These features are powerful, but they should still serve readability and domain modeling.

<Objectives>
- Use built-in utility types to express DTOs, patches, and summaries without duplication
- Build mapped types that transform keys and values in a readable way
- Read and write conditional types with `infer` to extract shapes from library APIs
- Model string-shaped domains (routes, events, cache keys) with template literal types
- Know when to stop — and when a simple explicit type is worth more than a clever one
</Objectives>

## Mapped Types

Mapped types transform existing types.

```ts
type ReadonlyCourse<T> = {
  readonly [K in keyof T]: T[K]
}
```

This pattern loops over keys at the type level.

## Built-In Utility Types

Important utilities every serious learner should know:

- `Partial<T>`
- `Required<T>`
- `Readonly<T>`
- `Pick<T, K>`
- `Omit<T, K>`
- `Record<K, T>`
- `Exclude<T, U>`
- `Extract<T, U>`
- `NonNullable<T>`
- `Parameters<T>`
- `ReturnType<T>`
- `Awaited<T>`

### Unique example

```ts
type Course = {
  id: string
  title: string
  published: boolean
}

type CoursePatch = Partial<Course>
type CourseSummary = Pick<Course, 'id' | 'title'>
```

<Callout type="tip" title="Derive, do not duplicate">
Every manually duplicated DTO is a future bug waiting for the source type to drift. Use `Pick`, `Omit`, and `Partial` to derive related shapes — your summary, patch, and create types stay honest automatically.
</Callout>

<Compare badLabel="Parallel types drift" goodLabel="Derived types follow the source">
<Fragment slot="bad">
```ts
type Course = { id: string; title: string; published: boolean }
type CourseSummary = { id: string; title: string }
type CoursePatch = { title?: string; published?: boolean }
```
Add a field to `Course` and both child types silently fall behind.
</Fragment>
<Fragment slot="good">
```ts
type Course = { id: string; title: string; published: boolean }
type CourseSummary = Pick<Course, 'id' | 'title'>
type CoursePatch = Partial<Omit<Course, 'id'>>
```
One source of truth; the derivatives update with it.
</Fragment>
</Compare>

## Conditional Types

Conditional types model branching logic at the type level.

```ts
type ResponseData<T> = T extends { data: infer D } ? D : never
```

This asks: if `T` has a `data` property, extract it. Otherwise return `never`.

## `infer`

`infer` lets TypeScript capture a type from inside another type expression.

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
```

This is common in reusable utility types.

## Template Literal Types

Template literal types build string types from other types.

```ts
type HttpMethod = 'GET' | 'POST'
type Route = `/api/${string}`
type CacheKey = `${HttpMethod}:${Route}`
```

This is excellent for route conventions, event names, cache keys, and configuration keys.

## Key Remapping

Mapped types can rename keys.

```ts
type GetterMethods<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
```

This is advanced, but it helps learners understand how some framework typings are generated.

## Indexed Access and Reuse

```ts
type User = {
  profile: {
    name: string
    level: number
  }
}

type Profile = User['profile']
```

This prevents duplication and keeps types aligned with source shapes.

## `Record`

`Record` is a useful shortcut.

```ts
type RolePermissions = Record<'admin' | 'trainer' | 'student', string[]>
```

## Distributive Conditional Types

Conditional types distribute across unions by default.

```ts
type ToArray<T> = T extends any ? T[] : never
type Result = ToArray<string | number>
```

`Result` becomes `string[] | number[]`.

Teach this because it explains many advanced utility behaviors.

## When To Stop

If a type takes several minutes to decode, it may be too clever for the team using it.

Advanced type programming should remove duplication or increase safety. It should not turn application code into a puzzle.

<Callout type="warn" title="Two readers, two minutes">
A good mental limit: any teammate should be able to explain what a type does in under two minutes. If your mapped-conditional chain fails that test, write a named helper type with a comment — or keep the explicit version.
</Callout>

## Pitfalls

<Pitfall title="Recursive conditional types with no base case">
`type Deep<T> = T extends object ? { [K in keyof T]: Deep<T[K]> } : T` looks fine until it hits cycles in real objects, causing the compiler to spin. **Fix:** bound recursion with a depth-limit tuple (`type Deep<T, D extends number = 5> = ...`) or model only the shapes you actually need.
</Pitfall>

<Pitfall title="Template literal types that explode combinatorially">
`type All = `${HttpMethod}:${'/a'|'/b'|'/c'|...}:${ContentType}`` multiplies into thousands of members and slows the language server. **Fix:** keep one axis dynamic (`string`) and constrain only the axes you actually branch on.
</Pitfall>

<Pitfall title="Distributive conditionals you did not want">
`type ToArray<T> = T extends any ? T[] : never` turns `string | number` into `string[] | number[]`, not `(string | number)[]`. **Fix:** wrap the parameter in a tuple to block distribution: `type ToArray<T> = [T] extends [any] ? T[] : never`.
</Pitfall>

## Common Mistakes

- using advanced type features before basic modeling is strong
- writing clever mapped types when a simple explicit type is clearer
- overengineering utility types for one-time problems
- forgetting that utility types can hide domain meaning if names are too generic
- treating type-level programming as a goal instead of a tool

## Practice Ideas

- create DTO update types with `Partial`
- derive response item types with indexed access
- model route strings with template literal types
- build one small conditional utility and explain it in plain language

## What To Remember

- mapped types transform existing shapes
- utility types solve many common problems without custom complexity
- conditional types model branching at the type level
- template literal types are great for string-based conventions
- advanced typing should still stay teachable and maintainable

## Lab

<Lab title="Derive DTOs from a single source type" duration="45 min" difficulty="Medium" stack="TypeScript, strict tsconfig">

### Goal
Start from one domain type and derive every DTO your API needs — create input, update patch, public summary, and a typed event name — using utility and template literal types.

### Steps
1. Define `type Order = { id: string; userId: string; total: number; status: 'pending' | 'paid' | 'shipped'; createdAt: Date }`.
2. Derive `type CreateOrder = Omit<Order, 'id' | 'createdAt'>`.
3. Derive `type UpdateOrder = Partial<Pick<Order, 'status' | 'total'>>`.
4. Derive `type OrderSummary = Readonly<Pick<Order, 'id' | 'status' | 'total'>>`.
5. Define `type OrderEvent = `order.${Order['status']}.${string}`` and use it as the type of an event name parameter.
6. Add a mapped type `type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }` and derive `type OrderGetters = Getters<Order>`.

### Success criteria
- Changing a field on `Order` updates every derived type automatically
- `CreateOrder` forbids `id` and `createdAt` at compile time
- `OrderEvent` accepts `'order.paid.analytics'` but rejects `'order.done.x'`
- Every derived type has a one-sentence docstring explaining its purpose

</Lab>

## Checkpoint

<Checkpoint>
1. Why does `Partial<Course>` age more gracefully than a hand-written patch type?
2. What does `infer` let you do inside a conditional type? Give one concrete example.
3. How do distributive conditional types behave differently from non-distributive ones?
4. When is a template literal type better than a plain `string` alias?
5. What signal tells you a mapped-conditional chain has become harder to read than the problem it solves?
</Checkpoint>

## Further reading

- [Generics, Inference, and Constraints](/learning/typescript/generics-inference-constraints/) — the building blocks these features compose with
- [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/) — `satisfies`, branded types, typed `Result`
- [tsconfig, Modules, and Declaration Files](/learning/typescript/tsconfig-modules-declaration-files/) — configuring strict projects where these types shine
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — pairing derived types with runtime schemas
