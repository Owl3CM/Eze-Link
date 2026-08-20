import { describe, it, expect, beforeEach, vi } from "vitest";
import Storable from "../Storable";

// ─── Helpers ────────────────────────────────────────
function createMemoryStorable(storeKey = "test") {
  return new Storable({ storage: "memoryStorage", storeKey });
}

// ─── Basic CRUD ─────────────────────────────────────
describe("Storable", () => {
  let store: InstanceType<typeof Storable>;

  beforeEach(() => {
    store = createMemoryStorable();
  });

  describe("set / get", () => {
    it("stores and retrieves an object", () => {
      store.set("users", { name: "Ali" });
      expect(store.get("users")).toEqual({ name: "Ali" });
    });

    it("stores and retrieves an array", () => {
      store.set("items", [1, 2, 3]);
      expect(store.get("items")).toEqual([1, 2, 3]);
    });

    it("returns null for missing keys", () => {
      expect(store.get("missing")).toBeNull();
    });

    it("set with empty array deletes the entry (known behavior)", () => {
      // Known: Object.values([]).length === 0 triggers remove
      store.set("items", [1, 2]);
      expect(store.get("items")).toEqual([1, 2]);
      store.set("items", []);
      expect(store.get("items")).toBeNull();
    });

    it("set with empty object deletes the entry (known behavior)", () => {
      store.set("obj", { a: 1 });
      store.set("obj", {});
      expect(store.get("obj")).toBeNull();
    });
  });

  describe("remove", () => {
    it("removes a stored entry", () => {
      store.set("key", { a: 1 });
      store.remove("key");
      expect(store.get("key")).toBeNull();
    });
  });

  describe("insert (merge)", () => {
    it("appends arrays", () => {
      store.set("arr", [1, 2]);
      store.insert("arr", [3, 4]);
      expect(store.get("arr")).toEqual([1, 2, 3, 4]);
    });

    it("creates array if key does not exist", () => {
      store.insert("new", [10, 20]);
      expect(store.get("new")).toEqual([10, 20]);
    });

    it("preserves existing-only keys during merge", () => {
      store.set("obj", { a: 1, b: 2 });
      store.insert("obj", { b: 3, c: 4 });
      expect(store.get("obj")).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("merges nested arrays inside objects", () => {
      store.set("data", { items: [1, 2] });
      store.insert("data", { items: [3, 4] });
      expect(store.get("data")).toEqual({ items: [1, 2, 3, 4] });
    });
  });

  describe("select", () => {
    it("selects item at index from stored array", () => {
      store.set("list", [10, 20, 30]);
      expect(store.select("list", 1)).toBe(20);
    });

    it("returns undefined for out-of-bounds", () => {
      store.set("list", [10]);
      expect(store.select("list", 5)).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("clears all entries with the storable prefix", () => {
      store.set("a", { v: 1 });
      store.set("b", { v: 2 });
      store.clear();
      expect(store.get("a")).toBeNull();
      expect(store.get("b")).toBeNull();
    });

    it("clears only entries matching specific storageKey", () => {
      store.set("users-list", { v: 1 });
      store.set("posts-list", { v: 2 });
      store.clear("users");
      expect(store.get("users-list")).toBeNull();
      expect(store.get("posts-list")).toEqual({ v: 2 });
    });
  });

  describe("key sanitization", () => {
    it("replaces special characters in keys", () => {
      store.set("a?b&c=d/e!f", { v: 1 });
      // Key is sanitized — retrieving with same input should work
      expect(store.get("a?b&c=d/e!f")).toEqual({ v: 1 });
    });
  });
});

// ─── Memory Storage Isolation ───────────────────────
describe("Memory Storage", () => {
  it("does not leak method names into key list", () => {
    const store = createMemoryStorable("iso");
    store.set("mykey", { data: true });

    // Storage length should be 1 (only our data key)
    expect(store.storage.length).toBe(1);

    // The first key should be our data key, not "getItem" or similar
    const firstKey = store.storage.key(0);
    expect(firstKey).not.toBe("getItem");
    expect(firstKey).not.toBe("setItem");
    expect(firstKey).toContain("iso"); // prefixed with storeKey
  });

  it("tracks length accurately with set/remove", () => {
    const store = createMemoryStorable("len");
    expect(store.storage.length).toBe(0);

    store.set("a", { v: 1 });
    store.set("b", { v: 2 });
    expect(store.storage.length).toBe(2);

    store.remove("a");
    expect(store.storage.length).toBe(1);

    store.remove("b");
    expect(store.storage.length).toBe(0);
  });

  it("overwriting does not double-count length", () => {
    const store = createMemoryStorable("ow");
    store.set("key", { v: 1 });
    store.set("key", { v: 2 });
    expect(store.storage.length).toBe(1);
    expect(store.get("key")).toEqual({ v: 2 });
  });
});

// ─── Primitive / Null Handling ──────────────────────
describe("Storable set with primitives and null", () => {
  let store: InstanceType<typeof Storable>;

  beforeEach(() => {
    store = createMemoryStorable("prim");
  });

  it("set with null removes the entry", () => {
    store.set("key", { a: 1 });
    store.set("key", null);
    expect(store.get("key")).toBeNull();
  });

  it("set with number stores the number", () => {
    store.set("key", 42);
    expect(store.get("key")).toBe(42);
  });

  it("set with string stores the string", () => {
    store.set("key", "hello");
    expect(store.get("key")).toBe("hello");
  });

  it("set with boolean stores the boolean", () => {
    store.set("key", true);
    expect(store.get("key")).toBe(true);
  });

  it("set with undefined removes the entry", () => {
    store.set("key", { a: 1 });
    store.set("key", undefined);
    expect(store.get("key")).toBeNull();
  });
});

// ─── Cache TTL ──────────────────────────────────────
describe("Storable TTL", () => {
  let store: InstanceType<typeof Storable>;

  beforeEach(() => {
    store = createMemoryStorable("ttl");
  });

  it("non-expired TTL entry returns cached data", () => {
    store.set("key", { name: "Ali" }, 60000); // 60s TTL
    expect(store.get("key")).toEqual({ name: "Ali" });
  });

  it("expired TTL entry returns null", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValueOnce(now); // set
    store.set("key", { name: "Ali" }, 100); // 100ms TTL

    vi.spyOn(Date, "now").mockReturnValueOnce(now + 200); // get — 200ms later
    expect(store.get("key")).toBeNull();
  });

  it("expired TTL entry is removed from storage", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValueOnce(now);
    store.set("key", [1, 2, 3], 100);

    vi.spyOn(Date, "now").mockReturnValueOnce(now + 200);
    store.get("key"); // triggers removal
    expect(store.storage.length).toBe(0);
  });

  it("no TTL = infinite cache (current behavior)", () => {
    store.set("key", { v: 1 });
    expect(store.get("key")).toEqual({ v: 1 });
    // No __exp envelope — behaves exactly like before
  });

  it("TTL works with primitive values", () => {
    store.set("num", 42, 60000);
    expect(store.get("num")).toBe(42);
  });

  it("insert() preserves TTL envelope", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValueOnce(now);
    store.set("arr", [1, 2], 500); // 500ms TTL

    store.insert("arr", [3, 4]);
    // Data merged correctly
    expect(store.get("arr")).toEqual([1, 2, 3, 4]);

    // TTL still active — expired read returns null
    vi.spyOn(Date, "now").mockReturnValueOnce(now + 600);
    expect(store.get("arr")).toBeNull();
  });

  it("insert() treats an expired TTL entry as missing instead of losing fresh data", () => {
    const now = Date.now();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);
    store.set("arr", [1, 2], 100);

    nowSpy.mockReturnValue(now + 200);
    store.insert("arr", [3, 4]);

    expect(store.get("arr")).toEqual([3, 4]);
    nowSpy.mockRestore();
  });
});
