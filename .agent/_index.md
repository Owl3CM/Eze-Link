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

> **Need everything?** Read the three focused context files listed above; each is self-contained.

## API Surface

Published runtime entry point: `dist/index.js`

Published TypeScript declaration entry point: `dist/index.d.ts`

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

## Published Package Structure

```
dist/
├── index.js          # Public ESM runtime entry point
├── index.d.ts        # Public TypeScript declaration entry point
├── ApiService.d.ts   # ApiService declarations
├── ClientBuilder.d.ts
└── Storable.d.ts
.agent/
├── _index.md         # This guide
└── context/          # Focused API references
AGENTS.md             # Installed-agent pointer
CHANGELOG.md          # Release history
LICENSE
README.md
package.json
```

Repository source files and test suites are intentionally excluded from the
published package. Installed guidance describes only files available inside the
package and the public API exposed by its runtime and declaration entry points.
