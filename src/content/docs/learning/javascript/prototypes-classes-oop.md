---
title: Prototypes, Classes, and OOP
description: Learn prototype-based inheritance, classes, constructors, methods, inheritance, encapsulation ideas, and object-oriented patterns in JavaScript.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="26 min" track="JavaScript" prerequisites="Functions, Scope, Closures, and This; Arrays, Objects, and Destructuring" />

JavaScript's object model is prototype-based, and classes are syntax built on top of it. Understanding that one layer down explains why `instanceof` works the way it does, why methods inherit, and when a class is the right tool versus a factory function.

<Objectives>
- Explain prototype lookup and predict which method runs for a given object
- Read a class definition and name every member — constructor, instance, static, private
- Use `super` correctly in a subclass constructor
- Pick between class inheritance and composition with a reason, not a reflex
- Use private fields (`#name`) to protect true invariants
</Objectives>

## Objects and Prototypes

When you access a property on an object, JavaScript checks:

1. the object itself
2. then its prototype
3. then the next prototype in the chain

```js
const items = []
console.log(items.push) // comes from Array.prototype
```

This explains why arrays have methods even when you did not define them manually.

<Callout type="info" title="The chain ends at `null`">
Every prototype chain terminates at `Object.prototype`, whose prototype is `null`. If the engine walks the whole chain without finding a property, you get `undefined`. There is no global method lookup — only the chain.
</Callout>

## Constructor Functions

Before classes, JavaScript often used constructor functions.

```js
function User(name, role) {
  this.name = name
  this.role = role
}

User.prototype.describe = function () {
  return `${this.name} is a ${this.role}`
}
```

### Teaching point

This is useful for understanding prototypes, even if students later prefer class syntax.

## Classes

Classes provide cleaner syntax for object-oriented code.

```js
class User {
  constructor(name, role) {
    this.name = name
    this.role = role
  }

  describe() {
    return `${this.name} is a ${this.role}`
  }
}
```

### Key concepts

- constructor
- instance properties
- instance methods
- class readability

## Inheritance

Classes can inherit from other classes.

```js
class User {
  constructor(name) {
    this.name = name
  }
}

class Trainer extends User {
  constructor(name, topic) {
    super(name)
    this.topic = topic
  }

  describe() {
    return `${this.name} teaches ${this.topic}`
  }
}
```

### Teaching point

Inheritance can be useful, but students should also learn composition. Not every hierarchy should become a subclass tree.

## `super`

`super` is used to call the parent constructor or parent methods.

It must be called before using `this` in a subclass constructor.

<Pitfall title="Using `this` before `super()` in a subclass constructor">
```js
class Trainer extends User {
  constructor(name, topic) {
    this.topic = topic // ReferenceError
    super(name)
  }
}
```
`this` is uninitialized until `super()` runs. **Fix:** always call `super()` first, then set subclass-specific fields.
</Pitfall>

## Static Members

Static members belong to the class itself, not the instance.

```js
class MathHelper {
  static double(value) {
    return value * 2
  }
}

MathHelper.double(10)
```

## Encapsulation

JavaScript does not enforce classical OOP in the same way as some other languages, but you can still teach encapsulation ideas:

- hide internal details
- expose clear public methods
- reduce unnecessary direct mutation

### Private fields

```js
class Wallet {
  #balance = 0

  deposit(amount) {
    this.#balance += amount
  }

  getBalance() {
    return this.#balance
  }
}
```

<Callout type="tip" title="`#field` is a real guarantee">
Private fields prefixed with `#` are not just a convention — they are a hard syntax-level error if accessed from outside the class. No `Object.keys`, no `Reflect`, no prototype walk reaches them.
</Callout>

### Public class fields

Modern JavaScript also allows fields to be declared directly in the class body.

```js
class CourseTracker {
  enrolled = 0

  addStudent() {
    this.enrolled += 1
  }
}
```

This keeps instance shape close to the class definition instead of scattering assignments inside the constructor.

### Static initialization blocks

Advanced learners should also recognize static blocks.

```js
class FeatureFlags {
  static all = new Set()

  static {
    this.all.add('dark-mode')
    this.all.add('cohort-dashboard')
  }
}
```

This is useful when a class needs one-time setup logic during definition.

## Composition Versus Inheritance

Composition means combining objects or behavior rather than inheriting from a parent class.

```js
function withTimestamps(entity) {
  return {
    ...entity,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
```

<Compare badLabel="Deep inheritance tree" goodLabel="Composition with small helpers">
<Fragment slot="bad">
```js
class Entity { /* id, createdAt */ }
class Auditable extends Entity { /* updatedBy */ }
class SoftDeletable extends Auditable { /* deletedAt */ }
class User extends SoftDeletable { /* email */ }
```
Adding one concern means creating or resequencing a class.
</Fragment>
<Fragment slot="good">
```js
const user = withTimestamps(
  withSoftDelete(
    withAudit({ email: 'ada@example.com' })
  )
)
```
Each concern is one small function; mix as needed.
</Fragment>
</Compare>

### Teaching point

Prefer composition when it keeps code simpler and avoids forced hierarchies.

## When Classes Make Sense

Classes are useful when:

- you have many similar objects
- behavior belongs clearly to the object
- the model benefits from method grouping

Plain objects and functions are often enough when:

- data is simple
- behavior is limited
- composition is easier

<Pitfall title="Subclassing `Error` and losing the name">
```js
class ValidationError extends Error {}
throw new ValidationError('bad input')
// err.name is still 'Error' in some environments
```
Without setting `this.name`, stack traces and type checks behave oddly. **Fix:** set `this.name = 'ValidationError'` inside the constructor after calling `super(message)`.
</Pitfall>

## Common Mistakes

- using classes everywhere out of habit
- misunderstanding prototype inheritance
- creating inheritance trees that are too deep
- confusing instance members and static members

## Practice Ideas

- build a `User` and `Trainer` class pair
- rewrite a class as a factory function and compare
- add a private field for internal state
- inspect inherited methods on arrays and objects

## Lab

<Lab title="Wallet with real invariants" duration="45 min" difficulty="Medium" stack="Node.js REPL or any scratch file">

### Goal
Build a `Wallet` class that cannot have its balance corrupted from outside, add an audited subclass, and then rewrite it as a factory function with closures to compare.

### Steps
1. Implement `Wallet` with a `#balance` field, `deposit(amount)`, `withdraw(amount)`, and `getBalance()`. Reject negative amounts and overdrafts by throwing.
2. Add `AuditedWallet extends Wallet` with a `#log` private array and a `history()` method that returns a copy. Use `super()` correctly.
3. Attempt to read `#balance` from outside the class and observe the syntax error.
4. Rewrite the same API as a factory function using closures: `createWallet()` returns an object with the same methods.
5. Compare: which version prevents tampering more strongly? Which is easier to test?

### Success criteria
- External code cannot change `#balance` or `#log` directly
- Overdrafts throw with a descriptive message
- `history()` returns a copy, not a live reference
- Both the class and the closure version pass the same 6 unit tests

</Lab>

## Checkpoint

<Checkpoint>
1. Given `const arr = [1, 2]`, trace how `arr.push(3)` is resolved step by step through the prototype chain.
2. Why must `super()` be called before `this` in a subclass constructor?
3. Name three things `#balance` protects against that a convention like `_balance` does not.
4. When would you pick a factory function with closures over a class for the same behavior?
5. `class A { m() {} }; class B extends A { m() { super.m() } }`. What object is `super.m()` called on?
</Checkpoint>

## What To Remember

- JavaScript is prototype-based
- classes are syntax built on prototype behavior
- inheritance is useful, but composition is often simpler
- choose object-oriented patterns only when they improve clarity

## Further reading

- [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/) — custom error classes in practice
- [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/) — proxies, reflection, and meta-programming
- [Functions, Scope, Closures, and This](/learning/javascript/functions-scope-closures-this/) — the scope foundation underneath classes
- [MDN: Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
