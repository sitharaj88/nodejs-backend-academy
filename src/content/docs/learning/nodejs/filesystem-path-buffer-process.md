---
title: File System, Path, Buffer, and Process
slug: learning/nodejs/filesystem-path-buffer-process
description: Learn Node.js file system APIs, path handling, buffers, process state, environment variables, and the runtime boundaries that matter in backend systems.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Objectives from '../../../../components/Objectives.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'
import Callout from '../../../../components/Callout.astro'
import Pitfall from '../../../../components/Pitfall.astro'
import Compare from '../../../../components/Compare.astro'
import Lab from '../../../../components/Lab.astro'
import Checkpoint from '../../../../components/Checkpoint.astro'

<LessonMeta level="Beginner" duration="20 min" track="Node.js" prerequisites="Runtime fundamentals, async/await" />

Real backend applications constantly touch runtime boundaries such as files, paths, binary data, and process configuration.

<Objectives>
- Choose between sync, callback, and promise file APIs with a runtime reason
- Build cross-platform paths without string concatenation
- Use `Buffer` for binary data without treating it like a string
- Configure a service from `process.env` with safe parsing
- Handle `SIGTERM` so the process shuts down without dropping requests
</Objectives>

## File System APIs

Node.js exposes both callback and promise-based file system APIs.

### Promise-based example

```js
import fs from 'node:fs/promises'

async function loadTemplate() {
  return fs.readFile('./templates/welcome.html', 'utf8')
}
```

For modern teaching, promise-based APIs are usually easier to explain and compose.

## When Synchronous APIs Are Acceptable

<Compare badLabel="Sync in hot path" goodLabel="Sync at startup only">
<Fragment slot="bad">
```js
app.get('/welcome', (_req, res) => {
  const html = fs.readFileSync('./templates/welcome.html', 'utf8')
  res.type('html').send(html)
})
```
Blocks the loop on every request.
</Fragment>
<Fragment slot="good">
```js
// at startup — one-time, no traffic yet
const welcomeHtml = fs.readFileSync('./templates/welcome.html', 'utf8')

app.get('/welcome', (_req, res) => {
  res.type('html').send(welcomeHtml)
})
```
Sync is fine before the server starts accepting traffic.
</Fragment>
</Compare>

Synchronous calls like `readFileSync()` are not evil by default. They are often acceptable in:

- startup scripts
- small CLI tools
- one-time configuration bootstrapping

They are usually a bad idea in hot request paths.

## Writing Files Safely

```js
import fs from 'node:fs/promises'

await fs.writeFile('./logs/app.log', 'started\n', { flag: 'a' })
```

Teach learners to think about:

- overwrite versus append
- encoding
- path safety
- concurrency and race conditions

## Directory Operations

Learners should know how to:

- create directories
- read directory contents
- detect whether a path exists
- avoid brittle relative-path assumptions

## `path`

Use the `path` module to build portable file paths.

```js
import path from 'node:path'

const filePath = path.join(process.cwd(), 'storage', 'report.json')
```

### Teaching point

String concatenation for file paths is a code smell in cross-platform applications.

<KeyConcept title="`cwd()` is not your module's directory">
`process.cwd()` is where the `node` command was launched. In ESM, the module's directory is `path.dirname(fileURLToPath(import.meta.url))`. In CJS it is `__dirname`. Picking the wrong one is one of the top reasons tests pass locally and fail in Docker.
</KeyConcept>

## Absolute Versus Relative Paths

Students should understand:

- `process.cwd()` is the current working directory
- `__dirname` exists in CommonJS
- ESM handles module location differently

This is a major source of confusion during migration.

## Buffers

Buffers represent binary data.

```js
const buffer = Buffer.from('Node.js')
console.log(buffer)
```

Use buffers when handling:

- file uploads
- image or PDF content
- TCP data
- encoding or decoding work

## Encoding Awareness

Common encodings learners should recognize:

- `utf8`
- `base64`
- binary data represented in buffers

Teach students not to treat text and binary data as interchangeable.

<Callout type="info" title="Text is not bytes">
`'€'.length` is 1 in JavaScript but `Buffer.byteLength('€', 'utf8')` is 3. When you build a body-size limit or a slice offset, you almost always want byte counts, not code-point counts.
</Callout>

## `process`

The `process` object exposes runtime information and control.

Common uses:

- `process.env`
- `process.argv`
- `process.cwd()`
- `process.exitCode`
- signal handling

## Environment Variables

```js
const port = Number(process.env.PORT ?? '3000')
```

Environment variables are strings or undefined. They should be parsed and validated intentionally.

<Callout type="tip" title="Validate config at startup, not at request time">
Load and parse environment variables once at boot. If `PORT` is not a number, crash immediately with a clear message — do not discover it on the first request at 3 a.m.
</Callout>

## Signals and Graceful Shutdown

Production systems need clean shutdown behavior.

```js
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully')
})
```

This matters when running under containers, process managers, or orchestration systems.

## Child Process Awareness

Node.js can launch external commands, but this should be treated carefully for:

- security
- shell escaping
- resource control
- portability

Learners do not need to master every child-process API immediately, but they should know that Node.js can act as an orchestrator, not just a request handler.

## Common Pitfalls

<Pitfall title="Path injection through `path.join`">
A route builds `path.join('./uploads', req.params.name)` and serves whatever it finds. A request for `../../etc/passwd` resolves into a path outside `./uploads`. **Fix:** resolve to absolute, then check that it still starts with the upload directory using `path.resolve` and a prefix comparison.
</Pitfall>

<Pitfall title="Trusting `process.env` as typed data">
`process.env.MAX_UPLOAD_MB` is `'50mb'` (a typo in `.env`). `Number('50mb')` is `NaN`, your limit silently becomes `NaN`, and a comparison always returns `false`. **Fix:** parse with a schema (zod, envalid) or at minimum throw on `Number.isNaN(value)`.
</Pitfall>

<Pitfall title="Skipping graceful shutdown">
Kubernetes sends `SIGTERM`, the process exits instantly, and in-flight requests return 502s. **Fix:** stop accepting new connections, wait for current handlers to finish with a bounded timeout, then close database pools before exit.
</Pitfall>

## Common Mistakes

- using synchronous file APIs in high-traffic request paths
- building paths manually with string concatenation
- trusting environment variables without validation
- confusing working-directory paths with module-relative paths
- mishandling text and binary data

## Practice Ideas

- read a JSON config file safely at startup
- build a portable path to a storage directory
- convert text to a buffer and back
- implement a graceful shutdown hook for a simple server

## Lab

<Lab title="Config, paths, and graceful shutdown" duration="40 min" difficulty="Easy" stack="Node.js 22+, built-in modules only">

### Goal
Build a minimal HTTP server that loads validated config from `process.env`, serves a file from a safe path, and shuts down cleanly on `SIGTERM`.

### Steps
1. Create `src/config.js` that reads `PORT`, `UPLOAD_DIR`, and `NODE_ENV` from `process.env`, parses them with explicit type conversion, and throws at startup if anything is missing or invalid.
2. Create `src/server.js` using `http.createServer`. Add a route `GET /file?name=...` that serves files from `UPLOAD_DIR` — but rejects any resolved path that escapes `UPLOAD_DIR`.
3. Handle `SIGTERM` and `SIGINT`: stop `server.listen`, wait up to 10 seconds for in-flight requests, then exit.
4. Use `autocannon -c 10 -d 5` while sending `SIGTERM` mid-run. Confirm no request returns a socket error.

### Success criteria
- Bad config crashes the process before it starts listening
- A request for `../../etc/passwd` returns 400, not file contents
- `kill -TERM <pid>` during load drops zero requests
- All file reads use `fs/promises`, no sync I/O in the request path

</Lab>

## Checkpoint

<Checkpoint>
1. Why is `readFileSync` fine in `src/config.js` but wrong in a route handler?
2. You see `path.join('./uploads', req.params.name)`. Name the attack it enables and one way to block it.
3. `process.env.TIMEOUT_MS` is `undefined`. Your code uses `Number(process.env.TIMEOUT_MS)`. What value does a downstream comparison see?
4. In ESM, how do you get the directory of the current file?
5. Your container gets `SIGKILL` after 30 seconds despite your `SIGTERM` handler. What is the likely misconfiguration?
</Checkpoint>

## Further reading

- [Runtime Fundamentals](/learning/nodejs/runtime-fundamentals/)
- [Events, Streams, and Async Patterns](/learning/nodejs/events-streams-async-patterns/)
- [Performance, Scaling, and Production Readiness](/learning/nodejs/performance-scaling-production-readiness/)
