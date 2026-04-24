---
title: Interfaces, Classes, and OOP
slug: learning/typescript/interfaces-classes-oop
description: Learn interfaces, interface extension, class typing, implements, access modifiers, abstract classes, and how TypeScript shapes object-oriented code.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="22 min" track="TypeScript" prerequisites="Functions & Objects, Generics" />

TypeScript improves object-oriented code by making object contracts explicit.

That does not mean every project should be class-heavy. It means the code becomes clearer when structure matters.

<Objectives>
- Choose between `type`, `interface`, and `class` for a given contract
- Use `implements` to pin a class to a structural contract
- Apply access modifiers and parameter properties without hiding real design
- Prefer composition over inheritance and recognise when inheritance earns its keep
- Understand the difference between TypeScript `private` and JavaScript `#private`
</Objectives>

## Interfaces

Interfaces describe object shapes.

```ts
interface User {
  id: string
  name: string
  email: string
}
```

## `type` Versus `interface`

Both can describe objects.

Use `interface` when:

- the focus is a named object contract
- extension feels natural
- `implements` will be used with classes

Use `type` when:

- unions are needed
- intersections are needed
- the shape is part of a broader type expression

Real codebases often use both.

## Extending Interfaces

```ts
interface Person {
  id: string
  name: string
}

interface Trainer extends Person {
  expertise: string[]
}
```

## Interfaces for Function Shapes

```ts
interface Slugifier {
  (title: string): string
}
```

This is useful in libraries and dependency injection patterns.

## Classes

```ts
class CourseService {
  constructor(private readonly baseUrl: string) {}

  getAll() {
    return `${this.baseUrl}/courses`
  }
}
```

TypeScript adds structure, but the runtime behavior is still JavaScript class behavior.

## Access Modifiers

TypeScript supports:

- `public`
- `private`
- `protected`
- `readonly`

```ts
class Wallet {
  private balance = 0

  deposit(amount: number) {
    this.balance += amount
  }

  getBalance() {
    return this.balance
  }
}
```

## Parameter Properties

This is a compact class pattern.

```ts
class EnrollmentService {
  constructor(private readonly repository: string) {}
}
```

The property is declared and assigned in one place.

## `implements`

Classes can promise that they satisfy an interface.

```ts
interface Logger {
  info(message: string): void
}

class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(message)
  }
}
```

<Callout type="info" title="`implements` does not widen the class's type">
`implements` only checks that the class satisfies the interface at declaration time. Inside the class, properties and methods keep their full types. That means `implements` is a conformance check, not a narrowing mechanism.
</Callout>

<Compare badLabel="Inheritance reaching for reuse" goodLabel="Composition with injected collaborators">
<Fragment slot="bad">
```ts
class BaseService {
  protected http = new HttpClient()
  protected cache = new Cache()
  protected log(msg: string) { /* ... */ }
}
class UserService extends BaseService {
  async get(id: string) { /* uses this.http, this.cache */ }
}
```
Tests must spin up the full base; new subclasses inherit dependencies they do not need.
</Fragment>
<Fragment slot="good">
```ts
class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly cache: Cache,
    private readonly logger: Logger,
  ) {}
  async get(id: string) { /* ... */ }
}
```
Dependencies are explicit, swappable in tests, and each class owns only what it uses.
</Fragment>
</Compare>

## Abstract Classes

Abstract classes define shared behavior plus required methods.

```ts
abstract class Job {
  abstract run(): Promise<void>

  logStart() {
    console.log('job started')
  }
}
```

Use abstract classes when you want a shared base with concrete behavior. Use interfaces when you want a pure contract.

## Interface Merging

TypeScript interfaces can merge across declarations.

```ts
interface AppConfig {
  appName: string
}

interface AppConfig {
  port: number
}
```

This is powerful, but learners should know it exists without overusing it in application code.

## Implements Versus Inheritance

- `implements` means the class satisfies a shape
- `extends` means the class inherits behavior from another class

These are different design tools.

## Private Fields Versus TypeScript `private`

JavaScript private fields use `#`.

```ts
class SessionStore {
  #secret = 'token'
}
```

TypeScript `private` is enforced by the type system, while `#private` is a JavaScript runtime feature.

## Pitfalls

<Pitfall title="TypeScript `private` treated as a runtime guarantee">
A field declared `private balance = 0` is still writable from plain JavaScript at runtime — the check only exists at compile time. **Fix:** use `#balance` when the invariant must hold even against untyped callers (tests that import compiled output, libraries bundled alongside).
</Pitfall>

<Pitfall title="Deep inheritance chains">
`AdminUser extends PowerUser extends User extends Entity` makes every small change ripple through four files. **Fix:** flatten to composition — inject the capabilities each class actually needs, and reserve inheritance for genuine "is-a" relationships.
</Pitfall>

<Pitfall title="Abstract classes misused as pure contracts">
An `abstract class Logger { abstract info(msg: string): void }` with no concrete methods is a disguised interface that forces `extends` and blocks multiple conformance. **Fix:** use an `interface Logger` unless there is shared concrete behavior worth sharing.
</Pitfall>

<Callout type="tip" title="Use `interface` for public contracts, `type` for composition">
Public exports that other modules implement deserve an `interface` — it supports `implements` and declaration merging. Internal compositions with unions and intersections usually read better as `type`.
</Callout>

## Common Mistakes

- using classes where plain objects would be simpler
- confusing `implements` with `extends`
- choosing inheritance before trying composition
- overusing interface merging
- assuming TypeScript `private` and JavaScript `#private` are identical

## Practice Ideas

- create an interface for a repository contract
- implement that interface with an in-memory class
- compare an abstract base class and an interface-based design
- refactor a class-heavy example into composition and discuss tradeoffs

## What To Remember

- interfaces describe contracts clearly
- classes are useful when behavior belongs with state
- `implements` checks conformance, `extends` reuses behavior
- access modifiers improve readability and intent
- composition is often simpler than inheritance

## Lab

<Lab title="Design a repository contract two ways" duration="40 min" difficulty="Medium" stack="TypeScript, Node.js, Vitest">

### Goal
Express a `UserRepository` contract as both an `interface` and an `abstract class`, implement each, and compare the tradeoffs in testability and composition.

### Steps
1. Define `interface UserRepository { findById(id: string): Promise<User | null>; create(input: Omit<User, 'id'>): Promise<User> }`.
2. Implement `class InMemoryUserRepository implements UserRepository` using a `Map`.
3. Define `abstract class UserRepositoryBase` with the same two methods as `abstract` plus a shared `protected log(msg: string)` helper.
4. Implement `class InMemoryUserRepositoryBase extends UserRepositoryBase`.
5. Write a tiny `UserService` that takes any `UserRepository` via its constructor and use both implementations with it.

### Success criteria
- The service file does not import any concrete repository class
- The in-memory implementation can be swapped for a stub in tests with no changes
- You can articulate, in one paragraph, when the abstract class adds value over the interface
- Neither class exposes fields other callers can accidentally mutate

</Lab>

## Checkpoint

<Checkpoint>
1. When would you choose `interface` over `type` for an object contract?
2. What is the difference in runtime behaviour between TypeScript `private` and JavaScript `#private`?
3. Why does `implements` not change the class's public type?
4. Give one situation where `extends` is the right tool and inheritance genuinely pays off.
5. What signals tell you a class has become a junk drawer and should be split?
</Checkpoint>

## Further reading

- [Generics, Inference, and Constraints](/learning/typescript/generics-inference-constraints/) — parameterising `Repository<T>`
- [Mapped, Conditional, and Template Literal Types](/learning/typescript/mapped-conditional-template-literal-types/) — deriving update types with `Omit` and `Partial`
- [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/) — branded IDs and typed results inside services
- [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/) — validating data as it enters your service boundary
