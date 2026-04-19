---
title: Mapped, Conditional, and Template Literal Types
slug: learning/typescript/mapped-conditional-template-literal-types
description: Learn mapped types, utility types, conditional types, infer, indexed access, key remapping, and template literal types in TypeScript.
---

This page covers the part of TypeScript where the type system starts behaving like a language of its own.

Teach it slowly. These features are powerful, but they should still serve readability and domain modeling.

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
