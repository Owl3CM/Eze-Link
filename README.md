# Eze-Link

Typed HTTP client for TypeScript — fetch wrapper with abort control, multi-root URL routing, query building, caching, pagination, and file uploads with progress tracking.

## Installation

```bash
npm install eze-link
# or
pnpm add eze-link
```

### Agent documentation

The package ships a self-contained agent guide. After installation, start at
`node_modules/eze-link/.agent/_index.md`; it routes to focused HTTP, client-builder,
and storage references without requiring access to the source repository.

## Quick Start

```typescript
import { ApiService, ClientBuilder } from "eze-link";

// 1. Create a low-level HTTP client
const api = ApiService.create({
  headers: { Authorization: "Bearer token" },
  timeout: 10000,
  onError: async (err) => {
    if (err.response?.status === 401) {
      // refresh token logic
    }
    return err; // rethrow — or return null to suppress
  },
});

// 2. Wrap it with ClientBuilder for CRUD + pagination
const client = new ClientBuilder({
  roots: { main: "/api", billing: "/api/billing" },
  api,
  storeKey: "my-app", // enables caching
  storage: "sessionStorage", // "localStorage" | "sessionStorage" | "memoryStorage"
});
```

## ApiService

Factory that creates a fetch-based HTTP client with interceptors, abort control, timeout, and upload support.

### Create

```typescript
const api = ApiService.create({
  headers: { Authorization: "Bearer token" },
  onRequest: (props) => {
    /* modify before send */
  },
  onResponse: (res) => {
    /* post-process response */
  },
  onError: async (err) => {
    /* handle errors — return null to suppress */
  },
  options: { mode: "cors", credentials: "include" },
  timeout: 10000, // ms — default timeout for all requests
});
```

### HTTP Methods

```typescript
const res = await api.get({ url: "/users" }); // res.data = parsed JSON
await api.post({ url: "/users", body: { name: "Ali" } });
await api.put({ url: "/users/1", body: { name: "Updated" } });
await api.patch({ url: "/users/1", body: { active: true } });
await api.delete({ url: "/users/1" });
```

### Blob Responses

```typescript
const blob = await api.getBlob({ url: "/files/report.pdf" });
const blob = await api.postBlob({ url: "/reports", body: { type: "summary" } });
```

### Upload with Progress

Uses XHR internally for cross-browser upload progress tracking.

```typescript
await api.upload({
  url: "/api/files",
  body: formData,
  method: "POST", // or "PUT" | "PATCH"
  onProgress: ({ loaded, total, percent }) => {
    console.log(`${percent}% uploaded`);
  },
});
```

### Abort Control

Requests run independently unless you explicitly provide an `abortId`. If a
second request uses the same `abortId`, it silently aborts the first request.
The aborted promise intentionally remains pending for backward compatibility,
so callers should treat the newer request as the authoritative result.

```typescript
// Custom abortId to control abort scope
await api.get({ url: "/search?q=hello", abortId: "search" });
await api.get({ url: "/search?q=world", abortId: "search" }); // aborts the first
```

### Request Deduplication

Set `dedupe: true` to share one in-flight promise instead of aborting it. With an
explicit `abortId`, that value is the dedupe key. Without one, Eze-Link derives a
key from the HTTP method and full URL. Do not deduplicate mutation requests.

```typescript
const first = api.get({ url: "/users?page=1", dedupe: true });
const second = api.get({ url: "/users?page=1", dedupe: true });
console.log(first === second); // true
```

### Timeout

Configurable at instance level and per-request. Timed-out requests produce a `{ response: { status: 408 }, statusMessage: "Request Timeout" }` error.

```typescript
const api = ApiService.create({ timeout: 10000 }); // 10s default
await api.get({ url: "/slow", timeout: 30000 }); // override: 30s
```

### Automatic Retry

Automatic retry is opt-in: configure a positive `limit` on the service or
request. Request options merge over service options. Once enabled, omitted
options default to `delay: 1000` and status codes `408, 429, 500, 502, 503, 504`.
Use `retry: false` to disable an instance policy for one request.

```typescript
const api = ApiService.create({ retry: { limit: 2, delay: 250 } });
await api.get({ url: "/flaky" });
await api.get({ url: "/single-attempt", retry: false });
```

HTTP, upload, and timeout failures reject with `ApiError`, exposing `status`,
`statusMessage`, `body`, `response`, and request `props`. Parsed server bodies
are available through `body`, `response.body`, `response.data`, and the legacy
`response.message` alias.

### Dynamic Configuration

```typescript
api.setHeader({ Authorization: "Bearer new-token" });
api.setHeader((prev) => ({ ...prev, "X-Custom": "value" }));
api.setOnResponse((res) => {
  /* new handler */
});
api.setOnError((err) => {
  /* new handler */
});
api.setOnRequest((props) => {
  /* new handler */
});
```

---

## ClientBuilder

High-level API client wrapping `ApiService`. Provides typed CRUD methods, URL root resolution, query string generation, caching, and 3 pagination strategies.

### CRUD Methods

All return unwrapped `.data` — not the full response object.

```typescript
const users = await client.GET({ root: "main", url: "/users" });
const user = await client.POST({ root: "main", url: "/users", body: { name: "Ali" } });
await client.PUT({ root: "main", url: "/users/1", body: { name: "Updated" } });
await client.PATCH({ root: "main", url: "/users/1", body: { active: true } });
await client.DELETE({ root: "main", url: "/users/1" });
```

### Callbacks

`POST`, `PUT`, `PATCH`, `DELETE`, and `UPLOAD` support `onSuccess` and `onError` callbacks:

```typescript
await client.POST({
  root: "main",
  url: "/users",
  body: { name: "Ali" },
  onSuccess: (data) => console.log("Created:", data),
  onError: (err) => console.error("Failed:", err),
});
```

### Caching

Caching activates when **both** `storeKey` is set in the constructor **and** `cache` is provided in the request. Otherwise, `cache` is silently ignored.

```typescript
// No cache — always hits API
client.GET({ root: "main", url: "/users" });

// Cache with auto-key
client.GET({ root: "main", url: "/users", cache: {} });

// Cache with custom key + force refresh
client.GET({ root: "main", url: "/users", cache: { key: "users", clear: true } });
```

### Blob Methods

```typescript
const blob = await client.GET_Blob({ root: "main", url: "/files/report.pdf" });
const blob = await client.POST_Blob({ root: "main", url: "/reports", body: { type: "pdf" } });
```

### Upload

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

await client.UPLOAD({
  root: "main",
  url: "/files",
  body: formData,
  method: "PUT", // default: "POST"
  onProgress: ({ percent }) => console.log(`${percent}%`),
  onSuccess: (data) => console.log("Uploaded:", data),
  onError: (err) => console.error("Failed:", err),
});
```

> **Tip**: You can also pass `FormData` to regular `POST`/`PUT`/`PATCH` — they auto-detect it and skip `JSON.stringify`. Use `UPLOAD` when you need progress tracking.

### Retry

All methods attach a `retry()` function to the rejected error:

```typescript
try {
  await client.GET({ root: "main", url: "/users" });
} catch (err) {
  // err.retry() retries with the exact same parameters
  const data = await err.retry();
}
```

### Root Resolution

`root` selects which base URL to prepend. If omitted, the first root is used.

```typescript
const client = new ClientBuilder({
  roots: { main: "/api", billing: "/api/billing" },
  api,
});

client.GET({ root: "main", url: "/users" }); // → /api/users
client.GET({ root: "billing", url: "/invoices" }); // → /api/billing/invoices
client.GET({ url: "/users" }); // → /api/users (first root)
```

### Paginators

3 pagination strategies, all returning `{ load, loadMore, goToPage, reload, loadAll, hasMore, limit }`:

| Paginator         | Tracks  | `loadMore` param |
| ----------------- | ------- | ---------------- |
| `OffsetPaginator` | offset  | `offset=N`       |
| `Paginator`       | page    | `page=N`         |
| `IdPaginator`     | last_id | `last_id=X`      |

```typescript
const pag = client.OffsetPaginator({ root: "main", url: "/users", cache: {} });

const firstPage = await pag.load({ status: "active" }); // first page
const nextPage = await pag.loadMore(); // next page
const fourthPage = await pag.goToPage(4); // page/offset strategies
const refreshed = await pag.reload(); // force re-fetch
const all = await pag.loadAll(); // all items (no pagination)
console.log(pag.hasMore); // boolean
```

### Clear Cache

```typescript
client.clearCache(); // clear all cached data
client.clearCache("users"); // clear specific key
ClientBuilder.clearCache("key"); // static: clear without instance
```

---

## Storable

Key-value storage abstraction over `localStorage`, `sessionStorage`, or in-memory.

```typescript
import { Storable } from "eze-link";

const store = new Storable({ storage: "memoryStorage", storeKey: "app" });

store.set("users", [{ id: 1, name: "Ali" }]);
store.get("users"); // [{ id: 1, name: "Ali" }]
store.insert("users", [{ id: 2 }]); // appends → [{ id: 1, ... }, { id: 2 }]
store.select("users", 0); // { id: 1, name: "Ali" }
store.remove("users"); // deletes entry
store.clear(); // clears all entries with storeKey prefix
```

**Storage types**: `"localStorage"` | `"sessionStorage"` | `"memoryStorage"` (in-memory `Map`, useful for testing/SSR).

---

## Type Exports

```typescript
import { ApiError } from "eze-link";
import type { IApiService, IMethod, IUploadProps, RetryConfig, IStorable } from "eze-link";
```

## License

MIT. See [LICENSE](./LICENSE).
