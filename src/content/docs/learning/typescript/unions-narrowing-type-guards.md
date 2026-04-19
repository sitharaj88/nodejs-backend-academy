---
title: Unions, Narrowing, and Type Guards
slug: learning/typescript/unions-narrowing-type-guards
description: Learn union types, discriminated unions, control-flow narrowing, custom type guards, exhaustive checks, and safer branching in TypeScript.
---

This page is one of the most important in the entire TypeScript path.

TypeScript becomes powerful when learners understand that a value can start broad and become narrower as the code proves more about it.

## Union Types

```ts
type Id = string | number
```

This means the value can be either type, but not both at the same time.

## Why Unions Matter

Real applications often have values like:

- request states
- user roles
- input that may be missing
- APIs that return success or error shapes

Unions model this reality directly.

## Narrowing with `typeof`

```ts
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
    return
  }

  console.log(id.toFixed(0))
}
```

Inside each branch, TypeScript narrows the type.

## Narrowing with Truthiness

```ts
function printName(name?: string) {
  if (!name) {
    console.log('missing name')
    return
  }

  console.log(name.toUpperCase())
}
```

This is common, but learners should remember that truthiness is broader than only `undefined`.

## Narrowing with Equality Checks

```ts
function handleStatus(status: 'draft' | 'published') {
  if (status === 'draft') {
    return 'work in progress'
  }

  return 'visible to students'
}
```

## Narrowing with `in`

```ts
type ApiError = { error: string }
type ApiSuccess = { data: string[] }

function handleResponse(response: ApiError | ApiSuccess) {
  if ('error' in response) {
    return response.error
  }

  return response.data.join(', ')
}
```

## Discriminated Unions

This is one of the cleanest TypeScript patterns.

```ts
type LoadingState = { status: 'loading' }
type SuccessState = { status: 'success'; data: string[] }
type ErrorState = { status: 'error'; message: string }

type RequestState = LoadingState | SuccessState | ErrorState
```

Then branch on the shared discriminator:

```ts
function renderState(state: RequestState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return state.data.join(', ')
    case 'error':
      return state.message
  }
}
```

This pattern is excellent for API results, reducers, workflows, and domain state machines.

## User-Defined Type Guards

You can create reusable narrowing functions.

```ts
type Trainer = {
  name: string
  expertise: string[]
}

function isTrainer(value: unknown): value is Trainer {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'expertise' in value
  )
}
```

Now the caller gets a safer type after the check.

## Assertion Functions

Sometimes code should throw when a condition fails.

```ts
function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string')
  }
}
```

This is useful at trusted boundaries where invalid input should stop execution.

## Exhaustive Checking with `never`

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

function render(state: RequestState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return state.data.join(', ')
    case 'error':
      return state.message
    default:
      return assertNever(state)
  }
}
```

If a new state is added later, the compiler will complain until the switch is updated.

## Nullable Data

Many backend values are nullable.

```ts
type StudentProfile = {
  bio: string | null
}
```

Teach learners to model `null` explicitly rather than pretending the field is always present.

## Intersections

Intersections combine shapes.

```ts
type Timestamped = {
  createdAt: Date
  updatedAt: Date
}

type Course = {
  id: string
  title: string
}

type AuditedCourse = Course & Timestamped
```

## Common Mistakes

- using assertions when narrowing would be safer
- modeling all states in one giant object with optional fields
- forgetting exhaustive checks in discriminated unions
- using truthiness checks when `0` or `''` should remain valid
- writing weak type guards that do not really prove the shape

## Practice Ideas

- model an API result as a discriminated union
- write a safe parser from `unknown` to a known object shape
- add exhaustive checking to a workflow state switch
- replace unsafe assertions with user-defined type guards

## What To Remember

- unions model real-world variation directly
- narrowing is how TypeScript turns broad values into safe values
- discriminated unions are one of the best design tools in TypeScript
- `never` helps enforce completeness
- good type guards prove something meaningful, not superficial
