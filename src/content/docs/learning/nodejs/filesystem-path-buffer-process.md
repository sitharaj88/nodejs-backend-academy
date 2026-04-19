---
title: File System, Path, Buffer, and Process
slug: learning/nodejs/filesystem-path-buffer-process
description: Learn Node.js file system APIs, path handling, buffers, process state, environment variables, and the runtime boundaries that matter in backend systems.
---

Real backend applications constantly touch runtime boundaries such as files, paths, binary data, and process configuration.

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

## What To Remember

- Node.js applications live at runtime boundaries
- file work should be deliberate about sync versus async usage
- `path` exists to prevent brittle path logic
- `Buffer` is fundamental for binary data
- `process` is central to configuration and shutdown behavior
