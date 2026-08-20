# ApiService

Low-level fetch wrapper factory with explicit abort control, opt-in retry, dedupe, timeout, and upload support.

**Source:** `lib/ApiService.ts`

---

## `ApiService.create<Headers>(props): IApiService<Headers>`

Factory function. Returns an `IApiService` instance. Not a class — a closure-based object.

### CreateApiProps

```ts
{
  headers?: Headers;
  onResponse?: (res: any) => any;
  onError?: (err: any) => Promise<any> | any;
  onRequest?: (props: OnRequestProps<Headers>) => void;
  options?: { mode?; cache?; credentials?; redirect?; referrerPolicy? };
  timeout?: number;
  retry?: RetryConfig;
}
```

- `headers` — default headers merged into every request
- `onResponse` — called after every successful response
- `onError` — called on every error. If it returns a value, that value is thrown. If it returns `undefined`, the error is swallowed and the request resolves to `undefined`
- `onRequest` — called before every fetch, receives `{ method, signal, body?, headers }`
- `options` — spread into every `fetch()` call
- `timeout` — default timeout in ms for all requests
- `retry` — default retry config for all requests

---

## IApiService Methods

| Method                        | HTTP         | Returns         | Notes                 |
| ----------------------------- | ------------ | --------------- | --------------------- |
| `get(props: IMethod)`         | GET          | `Promise<any>`  | Response with `.data` |
| `post(props: IMethod)`        | POST         | `Promise<any>`  | Response with `.data` |
| `put(props: IMethod)`         | PUT          | `Promise<any>`  | Response with `.data` |
| `patch(props: IMethod)`       | PATCH        | `Promise<any>`  | Response with `.data` |
| `delete(props: IMethod)`      | DELETE       | `Promise<any>`  | Response with `.data` |
| `update(props: IMethod)`      | UPDATE       | `Promise<any>`  | Response with `.data` |
| `getBlob(props: IMethod)`     | GET          | `Promise<Blob>` | Parses as blob        |
| `postBlob(props: IMethod)`    | POST         | `Promise<Blob>` | Parses as blob        |
| `upload(props: IUploadProps)` | configurable | `Promise<any>`  | Uses XHR for progress |

### Setters

| Method                     | Effect                                       |
| -------------------------- | -------------------------------------------- |
| `setHeader(headers \| fn)` | Replace or update headers (accepts function) |
| `setOnResponse(fn)`        | Replace the `onResponse` callback            |
| `setOnError(fn)`           | Replace the `onError` callback               |
| `setOnRequest(fn)`         | Replace the `onRequest` callback             |

---

## IMethod

```ts
interface IMethod<Headers> {
  url: string;
  body?: any;
  headers?: Headers;
  abortId?: string;
  timeout?: number;
  retry?: RetryConfig | false;
  dedupe?: boolean;
}
```

---

## Key Behaviors

### Explicit Abort Control

Every request gets its own `AbortController`, but requests run independently by
default. When `abortId` is supplied, a new request using the same key **aborts
the previous one**. The aborted promise intentionally remains pending for
backward compatibility; consumers should use the newer request as the result.

User-initiated abort (not timeout) returns an **unsettled Promise** — by design, not a rejection.

### Retry

Configurable per-instance (`CreateApiProps.retry`) and per-request (`IMethod.retry`). Set `retry: false` on a request to disable.

```ts
type RetryConfig = { limit?: number; delay?: number; statusCodes?: number[] };
```

Retry is disabled unless an instance or request policy supplies `limit > 0`.
When enabled, omitted fields default to
`{ delay: 1000, statusCodes: [408, 429, 500, 502, 503, 504] }`.

Request fields merge over instance fields, which merge over field defaults. Set
`retry: false` to disable the instance policy for one request.

### Dedupe

When `dedupe: true`, concurrent requests with the same key return the **same
Promise**. An explicit `abortId` is the key; otherwise Eze-Link derives one from
the method and full URL. The pending map is cleared on resolve/reject via
`.finally()`.

### Timeout

Uses `setTimeout` + abort. Rejects with an `ApiError` whose status is `408` and
whose `statusMessage` is `"Request Timeout"`.

### FormData Detection

When `body instanceof FormData`, skips the `Content-Type: application/json` header.

### Error Shape

`ApiError` extends `Error` and exposes `{ props, response, status,
statusMessage, body }`. Parsed error bodies are mirrored to `response.body`,
`response.data`, and legacy `response.message`.

Includes a full HTTP status code → message map (0–511).

---

## Upload (XHR)

```ts
interface IUploadProps<Headers> extends IMethod<Headers> {
  onProgress?: (event: { loaded: number; total: number; percent: number }) => void;
  method?: string; // default "POST"
}
```

Uses `XMLHttpRequest` for progress tracking. Supports abort via `AbortController.signal` → `xhr.abort()`. Timeout is set via `xhr.timeout`. Error handling follows the same `onError` flow as fetch methods.

---

## Types

```ts
type OnRequestProps<Headers> = {
  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "UPDATE";
  signal: AbortSignal;
  body?: any;
  headers: Headers;
};
```

---

**Source links:**

- [Published ApiService declarations](../../dist/ApiService.d.ts)
