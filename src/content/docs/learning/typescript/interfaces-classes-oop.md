---
title: Interfaces, Classes, and OOP
slug: learning/typescript/interfaces-classes-oop
description: Learn interfaces, interface extension, class typing, implements, access modifiers, abstract classes, and how TypeScript shapes object-oriented code.
---

TypeScript improves object-oriented code by making object contracts explicit.

That does not mean every project should be class-heavy. It means the code becomes clearer when structure matters.

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
