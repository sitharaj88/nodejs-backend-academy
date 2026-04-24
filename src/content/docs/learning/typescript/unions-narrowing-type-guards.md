---
title: Unions, Narrowing, and Type Guards
slug: learning/typescript/unions-narrowing-type-guards
description: Learn union types, discriminated unions, control-flow narrowing, custom type guards, exhaustive checks, and safer branching in TypeScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'
import Diagram from '../../../../components/Diagram.astro'

<LessonMeta level="Intermediate" duration="24 min" track="TypeScript" prerequisites="Type System Foundations, Functions & Objects" />

This page is one of the most important in the entire TypeScript path.

TypeScript becomes powerful when learners understand that a value can start broad and become narrower as the code proves more about it.

<Objectives>
- Read and design discriminated unions for API, state, and workflow data
- Narrow values with `typeof`, `in`, equality, custom guards, and assertion functions
- Enforce exhaustive handling of every state with `never`
- Distinguish unions from intersections and pick the right tool for each
- Spot weak type guards that only look like they prove something
</Objectives>

## Mental model: narrowing is a flow

<Diagram caption="A value enters broad; each check peels a case off until a single type remains.">
  <svg viewBox="0 0 640 220" role="img" aria-label="Narrowing flow diagram">
    <defs>
      <marker id="nar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="#596579" />
      </marker>
    </defs>
    <g font-family="Manrope" font-size="11" fill="#0d1220">
      <rect x="20" y="90" width="150" height="40" rx="6" fill="#f6f8fb" stroke="#596579" />
      <text x="95" y="107" text-anchor="middle" font-weight="800">input: unknown</text>
      <text x="95" y="122" text-anchor="middle" fill="#596579">request body</text>

      <rect x="210" y="20" width="170" height="40" rx="6" fill="#dff5e5" stroke="#2f8f46" />
      <text x="295" y="37" text-anchor="middle" font-weight="800">typeof === 'object'</text>
      <text x="295" y="52" text-anchor="middle" fill="#596579">object &amp; not null</text>

      <rect x="210" y="160" width="170" height="40" rx="6" fill="#fde4e1" stroke="#b42318" />
      <text x="295" y="177" text-anchor="middle" font-weight="800">reject 400</text>
      <text x="295" y="192" text-anchor="middle" fill="#596579">non-object payload</text>

      <rect x="420" y="20" width="200" height="40" rx="6" fill="#e9f4fb" stroke="#087ea4" />
      <text x="520" y="37" text-anchor="middle" font-weight="800">'kind' in value</text>
      <text x="520" y="52" text-anchor="middle" fill="#596579">discriminator present</text>

      <rect x="420" y="90" width="200" height="40" rx="6" fill="#e8e4ff" stroke="#6d4aff" />
      <text x="520" y="107" text-anchor="middle" font-weight="800">kind === 'signup'</text>
      <text x="520" y="122" text-anchor="middle" fill="#596579">Signup branch</text>

      <rect x="420" y="160" width="200" height="40" rx="6" fill="#fef3d7" stroke="#b7791f" />
      <text x="520" y="177" text-anchor="middle" font-weight="800">kind === 'login'</text>
      <text x="520" y="192" text-anchor="middle" fill="#596579">Login branch</text>

      <g stroke="#596579" stroke-width="1.3" fill="none" marker-end="url(#nar)">
        <path d="M170 105 Q 200 70 210 40" />
        <path d="M170 120 Q 200 155 210 180" />
        <path d="M380 40 Q 400 40 420 40" />
        <path d="M520 60 Q 520 75 520 90" />
        <path d="M520 60 Q 540 110 480 160" />
      </g>
    </g>
  </svg>
</Diagram>

<Callout type="info" title="Each check is a type-level fact">
`typeof x === 'string'` is not only a runtime check. Inside that branch, TypeScript **removes** every non-string member of the union. Narrowing is the compiler reading your guards and trusting what they prove.
</Callout>

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

<Compare badLabel="Giant optional grab-bag" goodLabel="Discriminated union">
<Fragment slot="bad">
```ts
type RequestState = {
  loading?: boolean
  data?: string[]
  error?: string
}
```
Every branch needs to re-check every field; impossible combinations compile fine.
</Fragment>
<Fragment slot="good">
```ts
type RequestState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }
```
The discriminator makes each branch exact; illegal combinations cannot be constructed.
</Fragment>
</Compare>

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

## Pitfalls

<Pitfall title="Weak type guards that lie">
`function isTrainer(v: any): v is Trainer { return 'name' in v }` returns `true` for `{ name: 42 }`. Narrowing is only as strong as the check. **Fix:** verify each field's type, not just its presence: `typeof v.name === 'string' && Array.isArray(v.expertise)`.
</Pitfall>

<Pitfall title="Truthiness swallowing real values">
`if (!count) return` treats `0` as "missing", even when `0` is a valid count. **Fix:** compare explicitly — `if (count === undefined) return` — so that `0` flows through.
</Pitfall>

<Pitfall title="Switches without a default">
A new `RequestState` case is added, the compiler stays quiet because the existing `switch` has no exhaustive `default`, and a branch silently falls through. **Fix:** always end discriminated switches with `default: return assertNever(state)`.
</Pitfall>

<Callout type="tip" title="Assertion functions are for trusted boundaries">
Use `asserts x is T` when the caller is at a boundary where invalid data should crash the process — startup config, a CLI entry point, a queue worker on bad messages. Prefer `is T` guards inside normal business code so callers can branch instead of throw.
</Callout>

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

## Lab

<Lab title="Discriminated unions for an order workflow" duration="45 min" difficulty="Medium" stack="TypeScript, Node.js, Vitest">

### Goal
Model an order lifecycle as a discriminated union, write a reducer that transitions between states, and prove the model is exhaustive with `assertNever`.

### Steps
1. Define `type Order = Draft | Submitted | Paid | Shipped | Cancelled`, each carrying the fields that only make sense in that state (e.g. `paidAt` exists only on `Paid`).
2. Write `function transition(order: Order, event: OrderEvent): Order` with a switch on `order.status`.
3. Add `function assertNever(value: never): never` and use it as the `default` branch to catch missed cases.
4. Write unit tests that try every legal transition plus one illegal one — the illegal case should not compile.
5. Add a new state `Refunded` and watch the compiler list every switch that must be updated.

### Success criteria
- Illegal field combinations (e.g. `paidAt` on a `Draft`) are impossible to construct
- Removing one case in the switch produces a compile error, not a runtime fall-through
- Tests prove the happy path; types prove the unhappy path
- Every guard is a real structural check, not just a presence check

</Lab>

## Checkpoint

<Checkpoint>
1. What does narrowing do to a `string | number` value inside a `typeof x === 'string'` block?
2. Why is a discriminated union usually clearer than a single object with optional fields?
3. How does `assertNever` turn a new variant into a compile error?
4. When is an `asserts` function the right tool and when is a `value is T` guard better?
5. Write the shortest guard that actually proves a value matches `{ name: string; email: string }`.
</Checkpoint>

## Further reading

- [Generics, Inference, and Constraints](/learning/typescript/generics-inference-constraints/) — reusable guards and generic result types
- [Mapped, Conditional, and Template Literal Types](/learning/typescript/mapped-conditional-template-literal-types/) — conditional types that branch on shape
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — turning narrow guards into real request validators
- [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/) — `Result<T, E>` and state-safe builders
