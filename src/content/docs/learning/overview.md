---
title: Learning Overview
slug: learning/overview
description: The deep-study section of the academy. Concept-by-concept pages, runnable code, diagrams, labs, and checkpoints — built to be revisited, not just read once.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Callout from '../../../components/Callout.astro'
import TopicGrid from '../../../components/TopicGrid.astro'

<LessonMeta level="All levels" track="All tracks" />

This is the learner-facing section of the academy. Every page here has the same shape — learning objectives at the top, a mental model, runnable code, good-vs-bad comparisons, pitfalls, a lab with success criteria, and a five-question checkpoint — so your attention goes to the content, not the formatting.

<Callout type="tip" title="How to use this section">
Read an overview to pick a track. Do the concept pages in order. Do the lab. Use the checkpoint to decide whether to move on. Come back to any page later — they are built as reference, not lectures.
</Callout>

## Pick a learning path

<TopicGrid topics={[
  { eyebrow: 'Language', title: 'JavaScript', description: 'Scope, async, modules, OOP, advanced patterns.', href: '/learning/javascript/overview/' },
  { eyebrow: 'Types', title: 'TypeScript', description: 'Generics, narrowing, mapped & conditional types, validation.', href: '/learning/typescript/overview/' },
  { eyebrow: 'Runtime', title: 'Node.js', description: 'Event loop, streams, filesystem, process, HTTP.', href: '/learning/nodejs/overview/' },
  { eyebrow: 'Setup', title: 'Tooling', description: 'Package management, project setup, quality gates.', href: '/learning/tooling/overview/' },
  { eyebrow: 'Data', title: 'Databases', description: 'SQL + NoSQL modeling, queries, transactions, migrations.', href: '/learning/databases/overview/' },
  { eyebrow: 'Safety', title: 'Security', description: 'Auth, sessions, JWT, authorization, hardening.', href: '/learning/security/overview/' },
  { eyebrow: 'Design', title: 'Architecture', description: 'Layered, clean, modular monolith, modern patterns.', href: '/learning/architecture/overview/' },
  { eyebrow: 'Quality', title: 'Testing', description: 'Unit, integration, API, mocks, contracts, debugging.', href: '/learning/testing/overview/' },
  { eyebrow: 'Speed', title: 'Performance', description: 'Event loop, profiling, caching, scaling, capacity.', href: '/learning/performance/overview/' },
  { eyebrow: 'Live', title: 'Real-Time', description: 'WebSockets, SSE, queues, GraphQL, gRPC.', href: '/learning/realtime/overview/' },
  { eyebrow: 'Ops', title: 'DevOps', description: 'Docker, CI/CD, observability, runbooks.', href: '/learning/devops/overview/' },
  { eyebrow: 'Scale', title: 'System Design', description: 'Scalability, microservices, messaging, resilience.', href: '/learning/system-design/overview/' },
]} />

## Recommended order if you are starting fresh

1. **Language foundations** — [JavaScript](/learning/javascript/overview/) → [TypeScript](/learning/typescript/overview/)
2. **Runtime fluency** — [Node.js](/learning/nodejs/overview/) (includes the [Express](/learning/nodejs/express/overview/) path)
3. **Project discipline** — [Tooling](/learning/tooling/overview/)
4. **Building APIs** — [Databases](/learning/databases/overview/) → [Security](/learning/security/overview/)
5. **Designing for change** — [Architecture](/learning/architecture/overview/) → [Testing](/learning/testing/overview/)
6. **Scaling up** — [Performance](/learning/performance/overview/) → [Real-Time](/learning/realtime/overview/)
7. **Shipping to users** — [DevOps](/learning/devops/overview/) → [System Design](/learning/system-design/overview/)

## JavaScript path

1. [Syntax, Types, and Variables](/learning/javascript/syntax-types-variables/)
2. [Operators, Conditions, and Loops](/learning/javascript/operators-conditions-loops/)
3. [Functions, Scope, Closures, and This](/learning/javascript/functions-scope-closures-this/)
4. [Arrays, Objects, and Destructuring](/learning/javascript/arrays-objects-destructuring/)
5. [Prototypes, Classes, and OOP](/learning/javascript/prototypes-classes-oop/)
6. [Asynchronous JavaScript](/learning/javascript/asynchronous-javascript/)
7. [Modules, Errors, and Code Patterns](/learning/javascript/modules-errors-patterns/)
8. [Advanced JavaScript Concepts](/learning/javascript/advanced-javascript-concepts/)
9. [Modern JavaScript Coverage](/learning/javascript/modern-javascript-coverage/)
10. [JavaScript Versions and ECMAScript History](/learning/javascript/javascript-versions-history/)

## TypeScript path

1. [Type System Foundations](/learning/typescript/type-system-foundations/)
2. [Functions, Objects, and Arrays](/learning/typescript/functions-objects-arrays/)
3. [Unions, Narrowing, and Type Guards](/learning/typescript/unions-narrowing-type-guards/)
4. [Generics, Inference, and Constraints](/learning/typescript/generics-inference-constraints/)
5. [Interfaces, Classes, and OOP](/learning/typescript/interfaces-classes-oop/)
6. [Mapped, Conditional, and Template Literal Types](/learning/typescript/mapped-conditional-template-literal-types/)
7. [tsconfig, Modules, and Declaration Files](/learning/typescript/tsconfig-modules-declaration-files/)
8. [Runtime Validation and Node.js Integration](/learning/typescript/runtime-validation-nodejs-integration/)
9. [Advanced TypeScript Patterns](/learning/typescript/advanced-typescript-patterns/)
10. [Modern TypeScript Coverage](/learning/typescript/modern-typescript-coverage/)

## Node.js path

1. [Runtime Fundamentals](/learning/nodejs/runtime-fundamentals/)
2. [Modules, Package System, and Tooling](/learning/nodejs/modules-package-system-tooling/)
3. [File System, Path, Buffer, and Process](/learning/nodejs/filesystem-path-buffer-process/)
4. [Events, Streams, and Async Patterns](/learning/nodejs/events-streams-async-patterns/)
5. [HTTP Server, APIs, and Express](/learning/nodejs/http-server-apis-express/)
6. [Express Overview](/learning/nodejs/express/overview/) → continue through the Express sub-path
7. [Databases, Validation, and Auth](/learning/nodejs/databases-validation-auth/)
8. [Testing, Debugging, and Error Handling](/learning/nodejs/testing-debugging-error-handling/)
9. [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
10. [Node.js Versions and Ecosystem History](/learning/nodejs/nodejs-versions-ecosystem-history/)

## Backend engineering tracks

Once language + runtime are solid, work across the backend tracks in the order that matches your role:

- **API engineer** — Databases → Security → Testing → Performance
- **Platform / infra** — Tooling → DevOps → System Design → Architecture
- **Product engineer** — Architecture → Testing → Real-Time → Performance
- **Tech-lead prep** — all of the above, plus [Capstone Projects](/projects/capstone-projects/)

## Anatomy of a page

Every concept page contains, in this order:

1. **LessonMeta** — level, estimated read time, prerequisites.
2. **Objectives** — what you will be able to do by the end.
3. **Mental model** — the minimum picture in your head.
4. **Runnable code** — paste-into-Node-and-it-works examples.
5. **Good vs bad comparisons** — `<Compare>` blocks showing the wrong shape next to the right one.
6. **Pitfalls** — traps you will actually hit, each with a named fix.
7. **Lab** — hands-on work with explicit success criteria.
8. **Checkpoint** — five questions to test understanding.
9. **Further reading** — where to go next.

<Callout type="success" title="Finished a track?">
Move on when you can answer every checkpoint question out loud and you've completed at least one lab. &ldquo;I read it&rdquo; is not the same as &ldquo;I can do it.&rdquo;
</Callout>
