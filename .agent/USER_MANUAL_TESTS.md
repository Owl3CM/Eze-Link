# Eze-Link — Manual Runtime Tests

> These tests verify behaviors that can't be confirmed from source code alone.
> Each test describes what to do and what "pass" looks like.

---

## ApiService Tests

### 1. Explicit Abort on Duplicate Requests

**Do:** Fire two `api.get({ url: "/slow-endpoint", abortId: "slow-endpoint" })` calls rapidly.
**Pass:** Only the second request completes. The first is silently aborted (no rejection, no error callback).

### 2. Requests Without `abortId` Stay Independent

**Do:** Fire two `api.get({ url: "/endpoint" })` calls concurrently without an `abortId`.
**Pass:** Neither request aborts the other; both settle with their own response.

### 3. Timeout Produces 408 Error

**Do:** Call `ApiService.create({ timeout: 50 })`, then `api.get({ url: "/slow" })` where the server takes >50ms.
**Pass:** Error thrown with `{ response: { status: 408 }, statusMessage: "Request Timeout" }`.

### 4. Per-Request Timeout Overrides Instance Default

**Do:** Create API with `timeout: 5000`, then call `api.get({ url: "/slow", timeout: 50 })`.
**Pass:** Times out at ~50ms, not 5000ms.

### 5. Retry on 500

**Do:** Create API with `retry: { limit: 2, delay: 100 }`. Hit an endpoint that returns 500 twice then 200.
**Pass:** Request succeeds on third attempt. Two retries with ~100ms delay each.

### 6. `retry: false` Disables Retry

**Do:** Create API with `retry: { limit: 3 }`. Call `api.get({ url: "/500", retry: false })`.
**Pass:** Fails immediately on first 500 — no retries.

### 7. Dedupe Returns Same Promise

**Do:** Call `api.get({ url: "/endpoint", dedupe: true, abortId: "dedup-test" })` twice concurrently.
**Pass:** Both calls return the exact same Promise instance (`===` check). Only one network request is made.

### 8. FormData Skips Content-Type

**Do:** Call `api.post({ url: "/upload", body: new FormData() })`. Inspect outgoing request headers.
**Pass:** No `Content-Type: application/json` header. Body is raw FormData (not JSON-stringified).

### 9. onError Returning Undefined Swallows Error

**Do:** Create API with `onError: () => undefined`. Call `api.get({ url: "/404" })`.
**Pass:** Promise resolves with `undefined` — no rejection thrown.

### 10. Upload Progress Tracking

**Do:** Call `api.upload({ url: "/upload", body: largeFormData, onProgress: console.log })`.
**Pass:** `onProgress` fires multiple times with `{ loaded, total, percent }`. `percent` increases from 0 to 100.

---

## ClientBuilder Tests

### 11. Root Resolution — No Root

**Do:** Create `ClientBuilder({ roots: { main: "/api", other: "/v2" } })`. Call `client.GET({ url: "/users" })`.
**Pass:** Request goes to `/api/users` (first root used as default).

### 12. Root Resolution — Unknown Root as Literal

**Do:** Call `client.GET({ root: "https://external.com", url: "/data" })`.
**Pass:** Request goes to `https://external.com/data` (unknown root used as literal prefix).

### 13. OffsetPaginator — Load + LoadMore

**Do:** Create `client.OffsetPaginator({ url: "/items", root: "main" })`. Call `load()` then `loadMore()`.
**Pass:** First request: `/api/items?limit=25`. Second request: `/api/items?limit=25&offset=25` (or the count from response). `hasMore` reflects whether items.length >= limit.

### 14. Page Paginator — Page Increment

**Do:** Create `client.Paginator({ url: "/items", root: "main" })`. Call `load()` then `loadMore()`.
**Pass:** First request has no page param. Second request appends `&page=2`.

### 15. IdPaginator — Last ID Tracking

**Do:** Create `client.IdPaginator({ url: "/items", root: "main" })`. Return `[{ id: "abc" }, { id: "xyz" }]` from first load.
**Pass:** `loadMore()` appends `&last_id=xyz` (last item's id).

### 16. Paginator `reload` Bypasses Cache

**Do:** Create a cached paginator (`storeKey` set, `cache: {}`). Call `load()` (caches), then `reload()`.
**Pass:** `reload()` fetches from API despite cached data. Subsequent `load()` uses cache again.

### 17. `loadAll` Ignores Pagination

**Do:** Call `paginator.loadAll()`.
**Pass:** Request has `limit=null` in query (or no limit). Returns all items. `hasMore` is not affected.

### 18. Query Filter — Undefined/Empty Values

**Do:** Call `client.GET({ url: "/users", query: { name: "test", age: undefined, status: "", role: "admin" } })`.
**Pass:** URL is `/api/users?name=test&role=admin`. `age` (undefined) and `status` ("") are filtered out.

### 19. Error `.retry()` Function

**Do:** Call `client.GET({ url: "/flaky" })` where it fails. Catch the error and call `error.retry()`.
**Pass:** Same request is re-executed. `retry()` returns a new Promise for the same params.

### 20. Cache TTL Expiry

**Do:** Create `ClientBuilder({ storeKey: "test", ... })`. Call `client.GET({ url: "/data", cache: { ttl: 100 } })`. Wait 200ms. Call again with same `cache` option.
**Pass:** Second call hits the API (not cache) because TTL expired.

---

## Storable Tests

### 21. TTL Envelope — Auto-Expiry

**Do:** `store.set("key", { a: 1 }, 100)`. Wait 200ms. Call `store.get("key")`.
**Pass:** Returns `null`. Entry auto-removed from storage.

### 22. Insert — Array Concatenation

**Do:** `store.set("key", [1, 2])`. Then `store.insert("key", [3, 4])`.
**Pass:** `store.get("key")` returns `[1, 2, 3, 4]`.

### 23. Insert — Object Merge with Nested Arrays

**Do:** `store.set("key", { items: [1, 2], meta: { count: 2 } })`. Then `store.insert("key", { items: [3], meta: { total: 10 } })`.
**Pass:** Result: `{ items: [1, 2, 3], meta: { count: 2, total: 10 } }`.

### 24. Memory Storage — SSR Compatibility

**Do:** Create `new Storable({ storage: "memoryStorage" })`. Use `set`/`get`/`clear`.
**Pass:** All operations work without `localStorage`/`sessionStorage` being available.

### 25. Key Sanitization

**Do:** Call `store.set("/api/users?page=1&limit=25", data)`. Check the actual storage key.
**Pass:** Key is `{storeKey}-api-users-page-1-limit-25` (special chars replaced with `-`).
