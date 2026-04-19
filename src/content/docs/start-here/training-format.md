---
title: Training Format
description: Recommended weekly rhythm, phase delivery model, labs, assessments, and teaching workflow for the full Node.js training program.
---

This page translates the brochure into a teachable operating model. Use it to decide how sessions run, what students build, and how to assess progress.

## Recommended Weekly Rhythm

| Session block | Purpose |
| --- | --- |
| Concept session | Introduce the technical idea, trade-offs, and common mistakes |
| Live build session | Implement the pattern in code from scratch |
| Lab session | Learners reproduce or extend the example independently |
| Review session | Evaluate code quality, debugging process, and architectural choices |

## Phase-by-Phase Delivery Plan

### Phase 1: Foundation and Runtime

- Keep sessions highly demonstrative
- Use small scripts, CLI tools, and runtime experiments
- Emphasize debugging and reading runtime output
- Ask students to explain the event loop and module systems in their own words

### Phase 2: APIs, Data, and Security

- Shift toward repository-based coding exercises
- Introduce route conventions, validation, database models, and auth flows
- Use mini projects after every two modules
- Begin pull request-style review of student work

### Phase 3: Architecture, Quality, and Scale

- Start comparing different implementations instead of one “correct” answer
- Require tests for new features
- Introduce performance reasoning and architecture diagrams
- Make students defend design decisions during reviews

### Phase 4: Delivery and Career Readiness

- Operate more like a product team than a classroom
- Expect README quality, deployment quality, and branch discipline
- Review capstones against engineering outcomes, not just feature completion
- Include mock interviews and architecture walkthroughs

## Assessment Model

Use four types of checkpoints across the program:

- Concept checks: short oral or written explanations of runtime and architecture topics
- Lab checks: practical implementation tasks with time limits
- Review checks: feedback on code quality, naming, structure, and failure handling
- Milestone checks: phase-end deliverables and capstone readiness

## Suggested Deliverables By Phase

| Phase | Deliverable |
| --- | --- |
| Phase 1 | Node.js script collection, project scaffold, runtime cheat sheet |
| Phase 2 | Secure CRUD API with validation, documentation, and persistence |
| Phase 3 | Tested service with logs, cache strategy, and advanced integration |
| Phase 4 | Deployable capstone with CI, documentation, and walkthrough demo |

## Recommended Teaching Stack

- GitHub repositories for every phase and capstone
- Postman or Bruno collections for API exploration
- VS Code with debugger configuration
- Docker Desktop or equivalent container runtime
- A shared issue tracker for capstone planning

## Live Demo Strategy

When teaching backend topics, do not only show the final version. Show these moments explicitly:

- first failing run
- validation errors
- unexpected runtime behavior
- logging and debugging steps
- refactoring from naive structure to cleaner structure

Students learn backend work faster when they see the failure path, not just the polished answer.

## Review Rubric

Use this checklist repeatedly:

- Is the naming clear?
- Is input validated?
- Are errors handled intentionally?
- Is the logic placed in the right layer?
- Is the change testable?
- Would this survive real team review?

Next, move into the [Phase Roadmap](/roadmap/phase-1-foundation-runtime/).
