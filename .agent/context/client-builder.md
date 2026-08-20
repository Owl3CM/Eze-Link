# ClientBuilder

High-level CRUD client with multi-root URL routing, paginated loading, and caching.

**Published declarations:** [ClientBuilder.d.ts](../../dist/ClientBuilder.d.ts)

---

## Constructor

```ts
new ClientBuilder<RootKey extends string>(props: IClientFunctionsConstructor)
```

### Constructor Props

```ts
{
  api?: IApiService;         // defaults to ApiService.create({})
  limit?: number;            // default 25
  storage?: "localStorage" | "sessionStorage" | "memoryStorage";
  storeKey?: string;         // enables caching when provided
  generateQuery?: (props: { url: string; query?: any }) => string;
  roots: { [key: string]: string };  // URL base map
}
```

- `roots` — map of named URL bases. First key is the default when `root` is omitted from a request
- `storeKey` — when provided, creates a `Storable` instance and enables caching
- `generateQuery` — custom query string builder (default filters out `undefined`/`"undefined"`/`"null"`/`""`/`"none"`/`"NaN"` values)

### Public Fields

| Field           | Type                | Description                   |
| --------------- | ------------------- | ----------------------------- |
| `api`           | `IApiService`       | The underlying API service    |
| `limit`         | `number`            | Default page size             |
| `storable`      | `IStorable \| null` | Storage instance (if caching) |
| `useCache`      | `boolean`           | Whether caching is enabled    |
| `roots`         | `{ [key]: string }` | URL base map                  |
| `generateQuery` | `(props) => string` | Query string builder          |

---

## CRUD Methods

All methods return `Promise<Response>`. All attach `.retry()` to thrown errors.

### `GET<Response>(props: IGet): Promise<Response>`

```ts
type IGet<RootKey> = {
  url: string;
  root?: RootKey | string;
  query?: IQuery;
  headers?: any;
  abortId?: string;
  cache?: { key?: string; clear?: boolean; ttl?: number };
  timeout?: number;
};
```

Supports caching: checks `storable.get()` first, falls back to API call, stores result via `storable.set()`.

### `POST<Response>(props: IPost): Promise<Response>`

```ts
type IPost<RootKey> = {
  url: string;
  body?: any;
  query?: IQuery;
  headers?: any;
  getHeaders?: (query: any) => any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  abortId?: string;
  cache?: CacheOptions;
  timeout?: number;
  root?: RootKey | string;
};
```

Supports caching (same as GET). Uses `headers ?? getHeaders?.(query)` for request headers. Calls `onSuccess` / `onError` callbacks.

### `PUT`, `UPDATE`, `PATCH`, `DELETE`

All created via `createMutationMethod`. Same signature as `IPost`. No caching. Call `onSuccess(res.data)` / `onError(error)`.

### `UPLOAD<Response>(props: IUpload): Promise<Response>`

```ts
type IUpload<RootKey> = {
  url: string;
  root?: RootKey | string;
  body: FormData;
  query?: IQuery;
  headers?: any;
  method?: "POST" | "PUT" | "PATCH";
  onProgress?: (event: { loaded; total; percent }) => void;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  abortId?: string;
  timeout?: number;
};
```

### `GET_Blob`, `POST_Blob`

Return `Promise<Blob>`. No caching. `POST_Blob` accepts `body`.

---

## Root Resolution

`getRoot({ root, url })`:

- No `root` → uses first key in `roots` map
- `root` matches a key in `roots` → uses that base
- `root` not found in `roots` → treats `root` as a raw URL prefix

---

## Paginators

### Factory Methods

| Method            | Strategy        | Load-more param    |
| ----------------- | --------------- | ------------------ |
| `OffsetPaginator` | offset-based    | `offset={n}`       |
| `Paginator`       | page-based      | `page={n}`         |
| `IdPaginator`     | cursor/id-based | `last_id={lastId}` |

### CreateLoadClientProps

```ts
({ url: string; getUrl?: null } | { url?: null; getUrl: (query?: T) => string }) & {
  getHeaders?: (query?: T) => any;
  limit?: number;
  abortId?: string;
  cache?: { key?: string; clear?: boolean; ttl?: number };
  root?: RootKey | string;
}
```

Either `url` (static) or `getUrl` (dynamic per-query) — mutually exclusive.

### Paginator Instance

```ts
{
  hasMore: boolean;
  limit: number;
  load(query?: T): Promise<Response>;
  loadMore(): Promise<Response>;
  goToPage(page: number): Promise<Response>;
  reload(query?: T): Promise<Response>;
  loadAll(query?: T): Promise<Response>;
}
```

- `load` — resets state, fetches first page. Checks cache if enabled.
- `loadMore` — appends strategy param to the URL, fetches next page. Inserts into cache via `storable.insert()`.
- `goToPage` — jumps to a one-based page for page/offset strategies. `IdPaginator.goToPage()` rejects because cursor pagination cannot jump to an arbitrary page.
- `reload` — sets `forceRefresh = true`, then calls `load()` (bypasses cache).
- `loadAll` — fetches with `limit: null` (no pagination).
- `hasMore` — `true` when `items.length >= limit`. Items extracted via `getItems()` helper (handles arrays and objects with array values).

---

## Cache & Clear

- `clearCache(storageKey?)` — instance method, clears by prefix
- `ClientBuilder.clearCache(key, storage?)` — static method, standalone clear without instance. `storage` defaults to `"sessionStorage"`

---

## Helper: `getItems(data)`

Extracts the array from response data:

1. If `data` is already an array → returns it
2. If `data` is an object → finds the first array value
3. Otherwise → returns `[]`
