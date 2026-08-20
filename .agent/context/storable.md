# Storable

Storage abstraction with TTL support, key namespacing, and in-memory fallback for SSR/tests.

**Published declarations:** [Storable.d.ts](../../dist/Storable.d.ts)

---

## Constructor

```ts
new Storable({ storage?, storeKey? }: StorableConstructor)
```

| Param      | Type                                                               | Default            |
| ---------- | ------------------------------------------------------------------ | ------------------ |
| `storage`  | `"localStorage" \| "sessionStorage" \| "memoryStorage" \| Storage` | `"sessionStorage"` |
| `storeKey` | `string`                                                           | `"storable"`       |

- `"memoryStorage"` creates a `Map`-based `Storage` implementation (SSR/tests)
- Accepts a raw `Storage` instance for custom backends

---

## Public Fields

| Field      | Type      | Description              |
| ---------- | --------- | ------------------------ |
| `storage`  | `Storage` | Resolved storage backend |
| `storeKey` | `string`  | Prefix for all keys      |

---

## Methods

### `set(key: string, data: any, ttl?: number)`

Stores JSON. When `ttl` is provided, wraps in `{ __data, __exp: Date.now() + ttl }`. Removes entry if data is `null` or an empty object.

### `get(key: string): any | null`

Retrieves and parses JSON. Auto-detects TTL envelope (`__exp`). If expired → removes entry and returns `null`.

### `insert(key: string, value: Array | Object)`

Merges `value` into existing stored data:

- **Arrays** → concatenates
- **Objects** → shallow merges, with nested array/object properties merged recursively (one level deep)
- **Preserves TTL** — if the stored entry has a `__exp` envelope, re-wraps after merge
- **Expired entries** — treats an expired envelope as missing and stores only the incoming value without inheriting the expired deadline

### `remove(key: string)`

Removes a single entry.

### `clear(storageKey?: string)`

Removes all entries whose key starts with the given prefix (or `storeKey` if omitted). Iterates in reverse to safely remove during iteration.

### `select(key: string, value: any): any`

Shortcut: `get(key)?.[value]` — index into cached data.

---

## Key Namespacing

All keys are prefixed with `storeKey` + sanitized input. The sanitizer replaces `?`, `&`, `=`, `/`, `!` with `-`.

---

## Static Method

### `Storable.clear(storage: "localStorage" | "sessionStorage", storageKey: string)`

Standalone clear without needing an instance. Iterates storage and removes matching keys.

---

## Memory Storage

`getMemoryStorage()` (internal, not exported) — creates a `Map`-based `Storage` implementation:

| Member          | Behavior                          |
| --------------- | --------------------------------- |
| `getItem(key)`  | `_data.get(key) ?? null`          |
| `setItem(k, v)` | `_data.set(k, v)`                 |
| `removeItem(k)` | `_data.delete(k)`                 |
| `key(index)`    | `Array.from(_data.keys())[index]` |
| `length`        | Getter → `_data.size`             |

---

## Types

```ts
type IStorable = InstanceType<typeof Storable>;
type StorageType = "localStorage" | "sessionStorage" | "memoryStorage" | Storage;
type StorableConstructor = { storage?: StorageType; storeKey?: string };
```
