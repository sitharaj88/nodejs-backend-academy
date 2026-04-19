---
title: Functions, Objects, and Arrays
slug: learning/typescript/functions-objects-arrays
description: Learn to type functions, parameters, return values, optional properties, arrays, tuples, readonly data, and object-heavy backend structures in TypeScript.
---

Most TypeScript work is really about three things:

- functions
- object shapes
- collections of data

If learners can model these clearly, most application code becomes easier.

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

## `this` Parameters

TypeScript can type `this` in functions.

```ts
type Counter = {
  value: number
  increment(this: Counter): void
}
```

This is useful when teaching object methods and callback context.

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
