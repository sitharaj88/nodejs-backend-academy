---
title: Generics, Inference, and Constraints
slug: learning/typescript/generics-inference-constraints
description: Learn TypeScript generics, inference, constraints, default type parameters, generic utilities, and how to write reusable typed abstractions without losing readability.
---

Generics are where many learners first feel that TypeScript is becoming abstract.

The right way to teach them is simple: generics let types stay connected across inputs and outputs.

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
