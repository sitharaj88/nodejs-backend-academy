---
title: Prototypes, Classes, and OOP
description: Learn prototype-based inheritance, classes, constructors, methods, inheritance, encapsulation ideas, and object-oriented patterns in JavaScript.
---

JavaScript is prototype-based. Classes exist, but under the hood they build on prototypes.

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

## What To Remember

- JavaScript is prototype-based
- classes are syntax built on prototype behavior
- inheritance is useful, but composition is often simpler
- choose object-oriented patterns only when they improve clarity
