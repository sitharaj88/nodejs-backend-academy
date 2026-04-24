---
title: Node.js Versions and Ecosystem History
slug: learning/nodejs/nodejs-versions-ecosystem-history
description: Node.js version history, release model, major milestones, and ecosystem evolution from the early era through the current modern release lines.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="15 min" track="Node.js" prerequisites="Basic package.json familiarity" />

Node.js learners should understand the version timeline because older codebases can feel very different from modern runtime practice.

<Objectives>
- Read the Node.js release schedule and pick an LTS line with intent
- Recognise which milestones introduced platform features you rely on today
- Spot obsolete patterns in older tutorials and replace them with modern ones
- Write `engines` and Dockerfile base images that match your team's support policy
</Objectives>

This page explains:

- how the release model works
- which versions introduced major platform changes
- what "Current" and "LTS" actually mean

## Current Modern Release Picture

As of April 19, 2026:

- the latest release line is **Node.js 25.x** with status **Current**
- the latest LTS line shown on the official release page is **Node.js 24.x**

Production applications should generally prefer an LTS line rather than chasing the latest Current release by default.

<KeyConcept title="LTS is the production default, not Current">
Current gives you the newest features. LTS gives you ~30 months of security support and stable behavior. For a service that has to run at 3 a.m. next November, LTS is the only answerable choice.
</KeyConcept>

## How the Release Model Works

Historically, Node.js majors entered **Current** first. After about six months:

- odd-numbered lines became unsupported
- even-numbered lines moved to **LTS**

The official release materials also note a schedule change beginning with 27.x, where Node.js moves to one major release per year and every release becomes LTS later in the year.

## Why LTS Matters

LTS means:

- longer support window
- production-oriented stability
- more predictable upgrade planning

This is why serious backend training should teach students to check runtime support status, not just version numbers.

## Early History

### Node.js 0.x

The early era established the platform and its event-driven server identity.

### Node.js 4.x

This era matters historically because it followed the io.js merger and reset a more stable release story. Many older enterprise codebases still remember the 4.x to 8.x style of Node usage.

## Important Modern Milestones

### Node.js 6 and 8

These lines helped establish more reliable LTS-oriented enterprise adoption.

### Node.js 10 and 12

Node.js became more standard in enterprise backend environments, CI systems, and cloud deployment workflows.

### Node.js 14 and 16

Modern JavaScript support improved substantially, and ESM conversations became more practical in real teams.

### Node.js 18

A major modern milestone.

Important themes included:

- built-in `fetch` enabled by default
- the built-in test runner entering the platform story
- continued ESM maturity

### Node.js 20

This line became a major modern baseline for many projects and tooling ecosystems.

### Node.js 22

Another important LTS-era line in the modern platform story, especially for teams standardizing on recent runtime features.

### Node.js 24

The latest LTS line shown on the official release page as of April 19, 2026.

### Node.js 25

The latest Current line shown on the official release page as of April 19, 2026.

This is useful for experimentation and early adoption, but not always the first production choice.

## Ecosystem Evolution

<Compare badLabel="Older Node.js code" goodLabel="Modern Node.js code">
<Fragment slot="bad">
```js
const request = require('request')
const fs = require('fs')

request('https://api.example.com/users', (err, _res, body) => {
  if (err) return console.error(err)
  fs.writeFile('out.json', body, () => {})
})
```
Callbacks, deprecated `request`, CommonJS, no timeouts, error swallowed.
</Fragment>
<Fragment slot="good">
```js
import { writeFile } from 'node:fs/promises'

const ac = new AbortController()
setTimeout(() => ac.abort(), 5_000).unref()

const res = await fetch('https://api.example.com/users', { signal: ac.signal })
if (!res.ok) throw new Error(`upstream ${res.status}`)
await writeFile('out.json', await res.text())
```
Built-in `fetch`, ESM, `AbortController`, explicit error path.
</Fragment>
</Compare>

Older Node.js code often shows:

- heavy callback usage
- CommonJS everywhere
- more third-party packages for tasks now partly covered by the runtime
- weaker built-in testing and web-platform alignment

Modern Node.js code more often shows:

- `async` or `await`
- ESM awareness
- built-in `fetch`
- built-in test runner usage
- `AbortController`
- stronger TypeScript adoption
- cleaner observability and production discipline

## Teaching Advice

When students read older tutorials, teach them to ask:

- is this runtime advice still current
- is this package still necessary in modern Node.js
- is this using CommonJS because it is required, or just old
- does this assume a Node version that is no longer supported

<Callout type="tip" title="Pin the base image, not just `node`">
`FROM node:22` floats to the latest 22.x and can pick up glibc-level breaking changes. Prefer `FROM node:22.11.0-bookworm-slim` in production Dockerfiles and bump intentionally.
</Callout>

## Which Version Milestones Matter Most

High-value milestones to recognize:

- **4.x**:
  post-merge stabilization era
- **8.x to 12.x**:
  strong enterprise and LTS growth period
- **14.x and 16.x**:
  modern JavaScript and ESM transition period
- **18.x**:
  built-in `fetch` and stronger modern platform direction
- **20.x and 22.x**:
  common current production baselines
- **24.x**:
  latest LTS line as of April 19, 2026
- **25.x**:
  latest Current line as of April 19, 2026

## Official Release References

The most useful official references are:

- Node.js releases page
- Node.js download page
- Node.js release schedule announcements

<Callout type="info" title="Check end-of-life dates, not just release dates">
A version leaving LTS is more operationally significant than a new version arriving. Calendar your end-of-life dates and plan upgrades one minor cycle in advance.
</Callout>

## Common Pitfalls

<Pitfall title="Running on an EOL Node line">
Your service is happily humming on Node 16 — which left all support in 2023. A CVE in libuv ships a patch for 18+ only. **Fix:** track end-of-life dates; treat staying current on LTS as security work, not optional.
</Pitfall>

<Pitfall title="Using a Current line in production">
You pin to Node 25 because it has a feature you want. Six months later it becomes unsupported before you upgrade. **Fix:** use only Active or Maintenance LTS lines in production; experiment with Current in dev.
</Pitfall>

<Pitfall title="No `engines` field, mixed environments">
Developers run Node 20, CI runs 22, production runs 18. Obscure bugs appear only in one place. **Fix:** set `"engines": { "node": ">=22" }` in `package.json`, match in CI, and pin the Docker base image.
</Pitfall>

## Lab

<Lab title="Audit a Node.js upgrade" duration="30 min" difficulty="Easy" stack="Node.js, npm, an existing repo">

### Goal
Take a real or sample project and produce a written upgrade plan from its current Node version to the latest LTS.

### Steps
1. Record the current Node version from `.nvmrc`, Dockerfile, and `package.json#engines`. Note any drift.
2. Check the Node.js release schedule and identify the current Active LTS line and its end-of-life date.
3. Run the test suite on the target LTS version (use `nvm use` or a Docker tag) and capture failures.
4. List breaking changes between the two majors from the release notes and map each to a file you touch.
5. Propose a sequenced upgrade: pin `.nvmrc`, update CI, update Docker, bump `engines`, and merge.

### Success criteria
- One document lists every place the Node version is declared
- You can cite the EOL date for both current and target versions
- The plan names every breaking change and how you handle it
- CI runs the test suite on the target version before merge

</Lab>

## Checkpoint

<Checkpoint>
1. What exactly is the difference between Current, Active LTS, and Maintenance LTS?
2. Why is `FROM node:22` in a production Dockerfile a hidden risk?
3. Your team runs Node 18. A CVE is fixed in 22.x only. What is the correct next step?
4. Name three ecosystem patterns that mark "old Node.js" code and the modern equivalents.
5. When, if ever, does it make sense to run a Current (odd) release in production?
</Checkpoint>

## What To Remember

- production teams should track support status, not just version numbers
- LTS lines are usually the right default for backend systems
- modern Node.js is very different from older callback-heavy tutorials
- the latest official release line as of April 19, 2026 is 25.x, while the latest LTS line is 24.x

## Further reading

- [Modules, Package System, and Tooling](/learning/nodejs/modules-package-system-tooling/)
- [Modern Node.js Coverage](/learning/nodejs/modern-nodejs-coverage/)
- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
