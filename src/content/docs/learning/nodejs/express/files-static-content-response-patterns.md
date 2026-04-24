---
title: Files, Static Content, and Response Patterns
slug: learning/nodejs/express/files-static-content-response-patterns
description: Learn file upload awareness, static files, downloads, content negotiation basics, response helpers, and practical response design patterns in Express.
---

import LessonMeta from '../../../../../components/LessonMeta.astro'
import Objectives from '../../../../../components/Objectives.astro'
import KeyConcept from '../../../../../components/KeyConcept.astro'
import Callout from '../../../../../components/Callout.astro'
import Pitfall from '../../../../../components/Pitfall.astro'
import Compare from '../../../../../components/Compare.astro'
import Lab from '../../../../../components/Lab.astro'
import Checkpoint from '../../../../../components/Checkpoint.astro'

<LessonMeta level="Intermediate" duration="20 min" track="Express" prerequisites="Routing, middleware, streams" />

Express is not only for JSON APIs. It also handles files, static assets, downloads, and varied response shapes.

<Objectives>
- Serve static assets with caching headers and size discipline
- Accept file uploads with size and type limits, not just "whatever the client sends"
- Stream downloads instead of buffering multi-megabyte responses
- Design consistent JSON shapes for lists, details, and pagination
</Objectives>

## Static Files

Express can serve static files directly.

```js
app.use('/public', express.static('public'))
```

This is useful for simple assets, but learners should also understand when static delivery belongs behind a CDN or dedicated edge layer.

<KeyConcept title="Origin serves static at your peril">
Static assets served directly from Node burn CPU, memory, and connection slots that your API needs. Put a CDN, Nginx, or platform edge in front of anything more serious than a few KB of demo assets.
</KeyConcept>

## File Downloads

Express response helpers support file delivery.

```js
app.get('/report', (_req, res) => {
  res.download('./exports/report.pdf')
})
```

Teach students to think about:

- path safety
- file existence
- access control
- content type behavior

## File Upload Awareness

Uploads are a boundary with both performance and security implications.

Students should think about:

- size limits
- allowed file types
- storage strategy
- memory versus disk buffering
- malware scanning and trust concerns in real systems

<Callout type="warn" title="Uploads should stream, not buffer">
A handler that reads the full upload into a `Buffer` before writing to disk pins memory proportional to upload size. Use `multer` with disk storage or pipe the stream directly to your object store.
</Callout>

## JSON Response Design

Most Express services still return JSON most of the time.

Good JSON response design favors:

- stable structure
- predictable field naming
- clear success and error separation
- minimal accidental leakage

## Empty Responses

`204 No Content` is useful when a response body is unnecessary.

```js
res.status(204).end()
```

## Response Consistency

<Compare badLabel="Drifting list shapes" goodLabel="One envelope everywhere">
<Fragment slot="bad">
```js
app.get('/users', (_req, res) => res.json(users))                    // bare array
app.get('/orders', (_req, res) => res.json({ orders, total: 98 }))    // ad-hoc wrap
app.get('/courses', (_req, res) => res.json({ data: courses, meta })) // different shape
```
Every client library writes three different result readers.
</Fragment>
<Fragment slot="good">
```js
const paginated = (items, page, pageSize, total) => ({
  data: items,
  meta: { page, pageSize, total, hasMore: page * pageSize < total },
})

app.get('/users',   (req, res) => res.json(paginated(users,   1, 20, 98)))
app.get('/orders',  (req, res) => res.json(paginated(orders,  1, 20, 240)))
app.get('/courses', (req, res) => res.json(paginated(courses, 1, 20, 15)))
```
One envelope, predictable pagination, clients write one reader.
</Fragment>
</Compare>

For example, decide intentionally:

- whether list routes wrap results in a `data` object
- how pagination metadata is returned
- whether timestamps are normalized

## Caching Headers Awareness

Even basic Express applications should understand response headers related to caching and content behavior.

<Callout type="tip" title="`ETag` and `Cache-Control` do real work">
For static-ish JSON (catalog, config), an `ETag` plus `Cache-Control: private, max-age=60` can cut origin traffic by 10x with zero app-logic changes. Set them deliberately.
</Callout>

## Streaming Responses

Some responses should stream instead of buffering everything first.

This matters for:

- reports
- large exports
- proxied content
- server-sent event style flows

## Common Pitfalls

<Pitfall title="Path traversal via `res.sendFile`">
`res.sendFile(path.join('./files', req.params.name))` serves whatever resolves — including `../../etc/passwd`. **Fix:** resolve to an absolute path and assert it starts with the intended directory. Prefer `res.sendFile(..., { root })` which enforces this.
</Pitfall>

<Pitfall title="Buffering a large export">
A CSV export does `res.send(csvString)` where `csvString` is 500 MB. The process OOMs under concurrency. **Fix:** stream with `pipeline(source, res)` and set `Content-Type` + `Content-Disposition` explicitly.
</Pitfall>

<Pitfall title="Accepting any file type on upload">
Users upload `.exe`, `.svg` with scripts, or oversized images. Storage fills; XSS vectors appear. **Fix:** enforce allowed MIME types server-side (do not trust the `Content-Type` header alone — sniff the bytes), size limits, and antivirus scanning for untrusted input.
</Pitfall>

## Common Mistakes

- serving sensitive files without proper access checks
- treating uploads as simple form data instead of a trust and resource problem
- returning inconsistent response shapes
- buffering large responses when streaming is more appropriate
- exposing internal file paths in errors

## Practice Ideas

- serve a small static directory
- add a download endpoint with access control
- design a consistent paginated JSON response shape
- compare a buffered export endpoint with a streamed response design

## Lab

<Lab title="Upload safely, export via stream" duration="60 min" difficulty="Medium" stack="Node.js 22+, Express, multer, node:stream/promises">

### Goal
Build a `POST /attachments` endpoint with hard limits and a `GET /exports/orders.csv` endpoint that streams a synthetic 200 MB export.

### Steps
1. Configure `multer` with disk storage, `limits: { fileSize: 10 * 1024 * 1024 }`, and a `fileFilter` that allows only `image/png` and `application/pdf`.
2. Return `413` for oversized uploads, `415` for disallowed types, both in the shared error shape.
3. Write `GET /exports/orders.csv` that generates rows via a `Readable` and uses `pipeline` to stream to `res` with `Content-Disposition: attachment; filename="orders.csv"`.
4. Run `autocannon -c 20 -d 30` on the export; RSS should stay flat.
5. Add `res.sendFile(..., { root: uploadsDir })` for downloads and test that `../../etc/passwd` returns `404`, not file contents.

### Success criteria
- Oversized uploads never buffer fully; they reject at the edge
- Only the allowed MIME types reach storage
- The export endpoint serves 200 MB with RSS under 200 MB
- Path traversal attempts are rejected

</Lab>

## Checkpoint

<Checkpoint>
1. When is `express.static` the right answer, and when is it a production smell?
2. Name two failure modes of a handler that calls `res.send(largeString)` for an export.
3. Why must you validate file type server-side even if the client already did?
4. A client claims pagination is broken. Your list routes use three different envelopes. What is the real bug?
5. A download endpoint uses `res.sendFile(path.join(root, req.params.name))`. What is the specific attack you defend against, and how?
</Checkpoint>

## Further reading

- [Events, Streams, and Async Patterns](/learning/nodejs/events-streams-async-patterns/)
- [Auth, Security, and API Hardening](/learning/nodejs/express/auth-security-api-hardening/)
- [Performance and Production Delivery](/learning/nodejs/express/performance-and-production-delivery/)
