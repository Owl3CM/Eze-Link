# Eze-Link

**Purpose:** HTTP client layer — low-level fetch wrapper (`ApiService`) with explicit abort control, opt-in retry, dedupe, and timeout; high-level CRUD builder (`ClientBuilder`) with paginated loading and caching; plus a storage abstraction (`Storable`) with TTL support.

## Quick Map

| Concept           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| **ApiService**    | Fetch wrapper factory with abort, retry, dedupe, timeout       |
| **ClientBuilder** | High-level CRUD + 3 paginator strategies + caching             |
| **Storable**      | Storage abstraction (localStorage/sessionStorage/memory) + TTL |

## Area Guide — Read Only What You Need

| Working on...               | Read this                   |
| --------------------------- | --------------------------- |
| Low-level HTTP calls        | `context/api-service.md`    |
| CRUD / pagination / caching | `context/client-builder.md` |
| Storage / caching layer     | `context/storable.md`       |

> **Need everything?** Read all `context/*.md` files — each is self-contained.

## API Surface

Entry point: `lib/index.ts` (barrel export)

**ApiService:** `ApiService` (default + named export) — factory object with `.create()`
**ClientBuilder:** `ClientBuilder` (default export)
**Storable:** `Storable` (default export)
**Errors:** `ApiError`
**Types:** `IApiService`, `IMethod`, `IUploadProps`, `RetryConfig`, `IStorable`

## Anti-Patterns

- ❌ Don't use `ClientBuilder` without configuring `roots` — all URLs will be malformed
- ❌ Don't expect implicit cancellation — supply the same `abortId` when a newer request should abort an older one
- ❌ Don't mix `cache` with mutation methods (PUT/PATCH/DELETE) — caching is for reads only
- ❌ Don't use `dedupe: true` on mutations — it deduplicates by `abortId`, could swallow writes

## Source Structure

```
lib/
├── index.ts          # Barrel export
├── ApiService.ts     # ApiService.create(), IApiService, IMethod, IUploadProps, RetryConfig
├── ClientBuilder.ts  # ClientBuilder class, paginator strategies, CRUD methods
├── Storable.ts       # Storable class, IStorable, memoryStorage
└── __tests__/        # Test files (Vitest)
```

## Testing

```bash
pnpm test    # Vitest
```
