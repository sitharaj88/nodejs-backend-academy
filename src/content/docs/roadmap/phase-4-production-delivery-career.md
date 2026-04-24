---
title: Phase 4 - Production Delivery and Career Readiness
description: Phase 4 roadmap for DevOps, deployment, system design, collaboration, and portfolio readiness.
---

import LessonMeta from '../../../components/LessonMeta.astro'
import Objectives from '../../../components/Objectives.astro'
import Callout from '../../../components/Callout.astro'
import TopicGrid from '../../../components/TopicGrid.astro'
import Stats from '../../../components/Stats.astro'

<LessonMeta level="Advanced" duration="5 weeks" track="Phase roadmap" prerequisites="Phase 3 complete" />

The final phase turns the curriculum into a professional finish. Students learn how to ship, collaborate, describe trade-offs, and package their work for real-world teams.

<Stats items={[
  { value: '5', label: 'Weeks' },
  { value: '3', label: 'Modules' },
  { value: '1', label: 'Deployed capstone' },
]} />

<Objectives>
- Containerize and deploy Node.js applications with environment-aware configuration
- Use system design vocabulary for queues, retries, event-driven processing, and service boundaries
- Run Git workflows, code reviews, and documentation practices expected in modern backend teams
- Deliver a capstone that is demonstrable, reviewable, and portfolio-ready
</Objectives>

## Modules in this phase

<TopicGrid topics={[
  { eyebrow: 'Module 11', title: 'DevOps & Deployment', description: 'Docker, Nginx, CI/CD, PM2, health checks, and production hygiene.', href: '/modules/module-11-devops-deployment-production-readiness/' },
  { eyebrow: 'Module 12', title: 'System Design & Microservices', description: 'Queues, retries, idempotency, and service boundary trade-offs.', href: '/modules/module-12-system-design-microservices-basics/' },
  { eyebrow: 'Module 13', title: 'Collaboration & Career Readiness', description: 'Git workflows, pull requests, README quality, and interview prep.', href: '/modules/module-13-collaboration-career-readiness/' },
]} />

## Weekly plan

| Week | Focus |
| --- | --- |
| 23 | Linux basics, Docker, runtime environments, and deployment preparation |
| 24 | Nginx, PM2, health checks, GitHub Actions, and release workflows |
| 25 | System design, queues, service communication, retries, and failure handling |
| 26 | Collaboration flows, pull requests, documentation, and interview preparation |
| 27 | Capstone completion, deployment review, and final presentation |

## Live examples to teach

- Containerizing a Node.js API with Docker
- Running a CI workflow with lint, test, and build gates
- Reverse proxy basics with Nginx
- Modeling a queue-driven workflow for order processing
- Running a final README and architecture walkthrough

## Lab work

- Deploy a service to a VPS or cloud runtime
- Add PM2 or equivalent process management
- Draft an architecture explanation for a capstone system
- Practice pull request review using a real repository

## Completion criteria

Students should finish with:

- one deployed backend capstone
- one repository with clean README and setup instructions
- one presentation or walkthrough of architecture and trade-offs
- one clear explanation of where they are ready to contribute as backend developers

<Callout type="tip" title="Run Phase 4 like a team, not a classroom">
The step change in Phase 4 is cultural, not technical. Stop being an instructor and start being a tech lead reviewing pull requests. The students who will pass interviews are the ones whose repos already look like work.
</Callout>

<Callout type="success" title="Where next">
Continue into the detailed [Module Library](/modules/module-01-javascript-foundation/) or move to [Capstone Projects](/projects/capstone-projects/).
</Callout>
