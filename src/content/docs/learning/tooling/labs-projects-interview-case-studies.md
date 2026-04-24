---
title: Labs, Projects, Interview Questions, and Case Studies
slug: learning/tooling/labs-projects-interview-case-studies
description: Tooling labs, reusable starter projects, interview drills, and real stories of projects saved and sunk by their package.json.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Lab from '../../../../components/Lab.astro'
import Callout from '../../../../components/Callout.astro'

<LessonMeta level="Beginner" duration="18 min" track="Tooling" />

Tooling is invisible when it works and catastrophic when it doesn't. These labs, projects, interview questions, and case studies make it visible on purpose.

## Labs

<Lab title="15-minute onboarding" duration="60 min" difficulty="Easy" stack="pnpm, TypeScript, Vitest, Express">
Build a repo that a stranger can clone, install, and curl a `/health` endpoint in under 15 minutes. Use pnpm, `type: module`, Zod-validated config, `tsx` dev loop, `tsc` build, Vitest, ESLint 9 flat config, Prettier, and a single `check` script.

**Success criteria:** fresh clone → `pnpm install --frozen-lockfile && pnpm check && pnpm dev` all green within 15 min on a timed run.
</Lab>

<Lab title="Rescue a messy project" duration="75 min" difficulty="Medium" stack="pnpm, ESLint 9, Prettier, TypeScript">
Start from a provided repo with scattered scripts, missing lockfile, `dotenv.config()` in production, and `any` sprinkled everywhere. Fix each problem with a focused commit. Each commit's message must name the failure mode it prevents.

**Success criteria:** lockfile committed, `pnpm check` green, zero `any` added, `.env.example` complete, prod `NODE_ENV=production pnpm start` works without `.env`.
</Lab>

<Lab title="Monorepo with Turborepo" duration="90 min" difficulty="Medium" stack="pnpm workspaces, Turborepo, TypeScript">
Create a monorepo with two services (`api`, `worker`) and a shared `lib` package. Cache builds and tests with Turborepo. Share a base `tsconfig.json`. Verify that changing `lib` invalidates both services in the Turborepo graph.

**Success criteria:** `turbo run build test --filter=api...` only runs affected packages, cached second run in under 5 s.
</Lab>

<Lab title="Minimal publishable library" duration="60 min" difficulty="Medium" stack="tsup, Changesets, GitHub Actions">
Build a tiny library (`@yourname/retry`) with dual ESM/CJS output, types, and an automated release pipeline using Changesets + GitHub Actions.

**Success criteria:** `npm pack` produces a tarball under 20 KB with both CJS and ESM entries, types resolvable from both, changelog generated on release.
</Lab>

## Mini projects

- **Team starter template** — clone-ready Express + TypeScript backend with all the tooling wired. Publish as a GitHub template repo.
- **Bench the stack** — build the same small API in Express, Fastify, Hono. Measure cold start, memory, and throughput with `autocannon`. Write up the tradeoffs.
- **Tooling audit** — take an existing project, run `knip`, `depcheck`, `npm audit`. Document what to delete, what to update, and why.

## Interview questions

1. What does `^1.4.2` match and why is it different from `~1.4.2`?
2. You see `package-lock.json` deleted in a PR. What do you ask?
3. When should a dependency live in `dependencies` vs `devDependencies`? Give two examples.
4. Why prefer `npm ci` over `npm install` in CI?
5. Explain what `"type": "module"` changes in Node.js.
6. Why should env vars be read once at boot instead of throughout the code?
7. You have 90 scripts in `package.json`. Is that a problem?
8. Name three failure modes a pre-commit hook should catch and three it should not.
9. Your production build is 220 MB. Name three things you would check first.
10. What's the difference between a bundler and a transpiler, and when does a backend service need each?

## Production case studies

### Case 1 — The missing lockfile

A hotfix worked in staging and broke in production. Investigation: the project had no committed lockfile. Staging had installed a transitive dependency at v3.4.1; production pulled v3.4.2 which had a regression. The fix was a one-line commit: `git add package-lock.json`.

**Lesson:** lockfiles aren't optional. Commit them. Always.

### Case 2 — The script landslide

A mature project accumulated 90 scripts across six years. Nobody knew which was the real deployment command. Two near-miss deploys used the wrong one. A 2-hour audit cut the list to 12 scripts, each with a one-line comment. Onboarding dropped from two days to two hours.

**Lesson:** `package.json` is a UI. Treat script names like API names — consistent, documented, minimal.

### Case 3 — The all-purpose `dependencies`

A service ran `npm ci --omit=dev` in production. Type-check tooling, test runners, and fixtures were all in `dependencies` &ldquo;to keep things simple.&rdquo; The production image was 480 MB and took 90 s to start. Moving tooling to `devDependencies` dropped the image to 110 MB and cold start to 18 s.

**Lesson:** `--omit=dev` is free performance. Earn it.

### Case 4 — The auto-update wipeout

A Renovate bot upgraded Jest. Tests failed on an obscure timer behavior change. CI went red on main for 9 hours because nobody was watching the bot PRs. After that, the team grouped patch updates into a weekly PR with a designated owner.

**Lesson:** automated upgrades still need human ownership.

### Case 5 — The unbundled Lambda

A Lambda function took 3.2 s to cold start. Tracing showed it was reading 700 files from `node_modules`. Switching to `tsup` with a single-file bundle dropped cold start to 220 ms.

**Lesson:** bundlers earn their keep at serverless boundaries. Don't bundle a regular Node service.

<Callout type="tip" title="Tooling as a teaching subject">
Every learner in a serious program should be able to explain the seven scripts in their own `package.json` in plain English, justify every dependency, and defend the contents of `tsconfig.json`.
</Callout>

## Teaching tips

- Run the 15-minute onboarding drill with a stopwatch. Surface friction.
- Demand a one-line justification for every new dependency in PR reviews.
- Periodically run `knip` as a class exercise. Delete the ceremony.
- Tie tooling decisions back to production: &ldquo;if this breaks at 2 a.m., will we know why?&rdquo;
