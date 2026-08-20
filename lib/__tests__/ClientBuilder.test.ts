import { describe, it, expect, vi } from "vitest";
import { ClientBuilder } from "../index";
import type { IApiService } from "../ApiService";

// ─── Mock API ───────────────────────────────────────
function createMockApi(): IApiService<any> {
  return {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { created: true } }),
    put: vi.fn().mockResolvedValue({ data: { updated: true } }),
    patch: vi.fn().mockResolvedValue({ data: { patched: true } }),
    delete: vi.fn().mockResolvedValue({ data: { deleted: true } }),
    update: vi.fn().mockResolvedValue({ data: { updated: true } }),
    getBlob: vi.fn().mockResolvedValue(new Blob(["data"])),
    postBlob: vi.fn().mockResolvedValue(new Blob(["data"])),
    upload: vi.fn().mockResolvedValue({ data: { uploaded: true } }),
    setHeader: vi.fn(),
    setOnResponse: vi.fn(),
    setOnError: vi.fn(),
    setOnRequest: vi.fn(),
  };
}

function createBuilder(overrides: any = {}) {
  const api = createMockApi();
  const builder = new ClientBuilder({
    api,
    roots: { main: "https://api.test.com", auth: "https://auth.test.com" },
    ...overrides,
  });
  return { builder, api };
}

// ─── Constructor ────────────────────────────────────
describe("ClientBuilder Constructor", () => {
  it("stores roots", () => {
    const { builder } = createBuilder();
    expect(builder.roots).toEqual({ main: "https://api.test.com", auth: "https://auth.test.com" });
  });

  it("uses default limit of 25", () => {
    const { builder } = createBuilder();
    expect(builder.limit).toBe(25);
  });

  it("accepts custom limit", () => {
    const { builder } = createBuilder({ limit: 10 });
    expect(builder.limit).toBe(10);
  });

  it("accepts custom generateQuery", () => {
    const customQuery = vi.fn(({ url }: any) => url);
    const { builder } = createBuilder({ generateQuery: customQuery });
    expect(builder.generateQuery).toBe(customQuery);
  });

  it("sets useCache when storeKey is provided", () => {
    const api = createMockApi();
    const builder = new ClientBuilder({ api, roots: { main: "https://api.test.com" }, storeKey: "test", storage: "memoryStorage" });
    expect(builder.useCache).toBe(true);
  });

  it("useCache is false when no storeKey", () => {
    const { builder } = createBuilder();
    expect(builder.useCache).toBe(false);
  });
});

// ─── Root Resolution ────────────────────────────────
describe("Root Resolution", () => {
  it("resolves named root", async () => {
    const { builder, api } = createBuilder();
    await builder.GET({ root: "main" as any, url: "/users" });
    expect((api.get as any).mock.calls[0][0].url).toContain("https://api.test.com/users");
  });

  it("resolves different named root", async () => {
    const { builder, api } = createBuilder();
    await builder.GET({ root: "auth" as any, url: "/login" });
    expect((api.get as any).mock.calls[0][0].url).toContain("https://auth.test.com/login");
  });

  it("defaults to first root when root is omitted", async () => {
    const { builder, api } = createBuilder();
    await builder.GET({ url: "/test" } as any);
    expect((api.get as any).mock.calls[0][0].url).toContain("https://api.test.com/test");
  });
});

// ─── CRUD Methods ───────────────────────────────────
describe("CRUD Methods", () => {
  it("GET resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const result = await builder.GET({ root: "main" as any, url: "/users" });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("POST sends body and resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.post as any).mockResolvedValue({ data: { id: 99 } });
    const result = await builder.POST({
      root: "main" as any,
      url: "/users",
      body: { name: "New User" },
    });
    expect(result).toEqual({ id: 99 });
    expect((api.post as any).mock.calls[0][0].body).toEqual({ name: "New User" });
  });

  it("POST calls onSuccess callback", async () => {
    const { builder, api } = createBuilder();
    (api.post as any).mockResolvedValue({ data: { done: true } });
    const onSuccess = vi.fn();
    await builder.POST({ root: "main" as any, url: "/items", body: {}, onSuccess });
    expect(onSuccess).toHaveBeenCalledWith({ done: true });
  });

  it("PUT resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.put as any).mockResolvedValue({ data: { updated: true } });
    const result = await builder.PUT({
      root: "main" as any,
      url: "/users/1",
      body: { name: "Updated" },
    });
    expect(result).toEqual({ updated: true });
  });

  it("PATCH resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.patch as any).mockResolvedValue({ data: { patched: true } });
    const result = await builder.PATCH({
      root: "main" as any,
      url: "/users/1",
      body: { name: "Patched" },
    });
    expect(result).toEqual({ patched: true });
  });

  it("DELETE resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.delete as any).mockResolvedValue({ data: { deleted: true } });
    const result = await builder.DELETE({ root: "main" as any, url: "/users/1" });
    expect(result).toEqual({ deleted: true });
  });

  it("UPDATE resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.update as any).mockResolvedValue({ data: { updated: true } });
    const result = await builder.UPDATE({ root: "main" as any, url: "/users/1", body: { status: "active" } });
    expect(result).toEqual({ updated: true });
  });
});

// ─── Error + Retry ──────────────────────────────────
describe("Error + Retry", () => {
  it("attaches retry function on GET error", async () => {
    const { builder, api } = createBuilder();
    const error: any = new Error("Network fail");
    (api.get as any).mockRejectedValue(error);
    try {
      await builder.GET({ root: "main" as any, url: "/fail" });
      expect.unreachable();
    } catch (err: any) {
      expect(err.retry).toBeTypeOf("function");
    }
  });

  it("attaches retry function on POST error", async () => {
    const { builder, api } = createBuilder();
    (api.post as any).mockRejectedValue(new Error("fail"));
    try {
      await builder.POST({ root: "main" as any, url: "/fail", body: {} });
      expect.unreachable();
    } catch (err: any) {
      expect(err.retry).toBeTypeOf("function");
    }
  });

  it("POST calls onError callback on failure", async () => {
    const { builder, api } = createBuilder();
    (api.post as any).mockRejectedValue(new Error("fail"));
    const onError = vi.fn();
    try {
      await builder.POST({ root: "main" as any, url: "/fail", body: {}, onError });
    } catch (_) {
      // Expected rejection; callback assertion follows.
    }
    expect(onError).toHaveBeenCalledOnce();
  });
});

// ─── Query Generation ───────────────────────────────
describe("Query Generation", () => {
  it("generates query string from params", async () => {
    const { builder, api } = createBuilder();
    (api.get as any).mockResolvedValue({ data: [] });
    await builder.GET({ root: "main" as any, url: "/users", query: { status: "active", role: "admin" } as any });
    const url = (api.get as any).mock.calls[0][0].url;
    expect(url).toContain("status=active");
    expect(url).toContain("role=admin");
  });

  it("filters out null/undefined/NaN values", async () => {
    const { builder, api } = createBuilder();
    (api.get as any).mockResolvedValue({ data: [] });
    await builder.GET({ root: "main" as any, url: "/users", query: { a: "real", b: "null", c: "undefined" } as any });
    const url = (api.get as any).mock.calls[0][0].url;
    expect(url).toContain("a=real");
    expect(url).not.toContain("b=null");
    expect(url).not.toContain("c=undefined");
  });
});

// ─── Blob Methods ───────────────────────────────────
describe("Blob Methods", () => {
  it("GET_Blob resolves with Blob", async () => {
    const { builder, api } = createBuilder();
    const blob = new Blob(["content"]);
    (api.getBlob as any).mockResolvedValue(blob);
    const result = await builder.GET_Blob({ root: "main" as any, url: "/file" });
    expect(result).toBeInstanceOf(Blob);
  });

  it("POST_Blob resolves with Blob", async () => {
    const { builder, api } = createBuilder();
    const blob = new Blob(["report"]);
    (api.postBlob as any).mockResolvedValue(blob);
    const result = await builder.POST_Blob({ root: "main" as any, url: "/report", body: {} });
    expect(result).toBeInstanceOf(Blob);
  });
});

// ─── GET with Cache ─────────────────────────────────
describe("GET with cache option", () => {
  function createCachedBuilder() {
    const api = createMockApi();
    const builder = new ClientBuilder({
      api,
      roots: { main: "https://api.test.com" },
      storeKey: "test",
      storage: "memoryStorage",
    });
    return { builder, api };
  }

  it("returns cached data on second call", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    await builder.GET({ root: "main" as any, url: "/items", cache: {} });
    await builder.GET({ root: "main" as any, url: "/items", cache: {} });
    expect(api.get).toHaveBeenCalledOnce();
  });

  it("bypasses cache when clear=true", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    await builder.GET({ root: "main" as any, url: "/items", cache: {} });
    await builder.GET({ root: "main" as any, url: "/items", cache: { clear: true } });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("ignores cache option when useCache is false", async () => {
    const { builder, api } = createBuilder(); // no storeKey
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    await builder.GET({ root: "main" as any, url: "/items", cache: {} });
    await builder.GET({ root: "main" as any, url: "/items", cache: {} });
    // No storable configured — both hit API
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});

// ─── POST with Cache ────────────────────────────────
describe("POST with cache option", () => {
  function createCachedBuilder() {
    const api = createMockApi();
    const builder = new ClientBuilder({
      api,
      roots: { main: "https://api.test.com" },
      storeKey: "posttest",
      storage: "memoryStorage",
    });
    return { builder, api };
  }

  it("returns .data like POST does", async () => {
    const { builder, api } = createCachedBuilder();
    (api.post as any).mockResolvedValue({ data: { id: 1 }, status: 200 });
    const result = await builder.POST({
      root: "main" as any,
      url: "/items",
      body: { name: "test" },
      cache: {},
    });
    expect(result).toEqual({ id: 1 });
    expect(result).not.toHaveProperty("status");
  });

  it("calls onSuccess on both API hit and cache hit", async () => {
    const { builder, api } = createCachedBuilder();
    (api.post as any).mockResolvedValue({ data: { id: 1 } });
    const onSuccess1 = vi.fn();

    await builder.POST({
      root: "main" as any,
      url: "/items",
      body: { name: "test" },
      onSuccess: onSuccess1,
      cache: {},
    });
    expect(onSuccess1).toHaveBeenCalledOnce();
    expect(onSuccess1).toHaveBeenCalledWith({ id: 1 });

    const onSuccess2 = vi.fn();
    await builder.POST({
      root: "main" as any,
      url: "/items",
      body: { name: "test" },
      onSuccess: onSuccess2,
      cache: {},
    });
    expect(onSuccess2).toHaveBeenCalledOnce();
    expect(onSuccess2).toHaveBeenCalledWith({ id: 1 });
  });

  it("caches and serves from cache on second call", async () => {
    const { builder, api } = createCachedBuilder();
    (api.post as any).mockResolvedValue({ data: { id: 1 } });
    await builder.POST({ root: "main" as any, url: "/items", body: {}, cache: {} });
    await builder.POST({ root: "main" as any, url: "/items", body: {}, cache: {} });
    expect(api.post).toHaveBeenCalledOnce();
  });
});

// ─── Paginators ─────────────────────────────────────
describe("OffsetPaginator", () => {
  it("load returns data and sets hasMore", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    const data = await paginator.load();
    expect(data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(paginator.hasMore).toBe(true);
  });

  it("hasMore is false when fewer items than limit", async () => {
    const { builder, api } = createBuilder({ limit: 10 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    expect(paginator.hasMore).toBe(false);
  });

  it("loadMore appends offset to url", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();

    (api.get as any).mockResolvedValue({ data: [{ id: 3 }] });
    await paginator.loadMore();
    const secondUrl = (api.get as any).mock.calls[1][0].url;
    expect(secondUrl).toContain("offset=2");
  });

  it("goToPage converts a one-based page into an offset", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    await paginator.goToPage(4);

    expect((api.get as any).mock.calls[1][0].url).toContain("offset=6");
  });

  it("hasMore transitions from true to false", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    expect(paginator.hasMore).toBe(true);

    (api.get as any).mockResolvedValue({ data: [{ id: 3 }] });
    await paginator.loadMore();
    expect(paginator.hasMore).toBe(false);
  });

  it("reload resets offset and refetches", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    await paginator.loadMore();
    (api.get as any).mockResolvedValue({ data: [{ id: 10 }, { id: 11 }] });
    const data = await paginator.reload();
    expect(data).toEqual([{ id: 10 }, { id: 11 }]);
  });
});

describe("Paginator (page-based)", () => {
  it("load returns data and increments page", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.Paginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    expect(paginator.hasMore).toBe(true);
  });

  it("loadMore uses page parameter", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.Paginator({ root: "main" as any, url: "/items" });
    await paginator.load();

    (api.get as any).mockResolvedValue({ data: [{ id: 3 }] });
    await paginator.loadMore();
    const secondUrl = (api.get as any).mock.calls[1][0].url;
    expect(secondUrl).toContain("page=2");
  });

  it("goToPage loads the requested page and advances subsequent loadMore", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.Paginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    await paginator.goToPage(4);
    await paginator.loadMore();

    expect((api.get as any).mock.calls[1][0].url).toContain("page=4");
    expect((api.get as any).mock.calls[2][0].url).toContain("page=5");
  });
});

describe("IdPaginator", () => {
  it("load extracts lastId from array response", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: "a" }, { id: "b" }] });

    const paginator = builder.IdPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    expect(paginator.hasMore).toBe(true);
  });

  it("loadMore uses last_id parameter", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: "a" }, { id: "b" }] });

    const paginator = builder.IdPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();

    (api.get as any).mockResolvedValue({ data: [{ id: "c" }] });
    await paginator.loadMore();
    const secondUrl = (api.get as any).mock.calls[1][0].url;
    expect(secondUrl).toContain("last_id=b");
  });

  it("hasMore transitions from true to false with id paginator", async () => {
    const { builder, api } = createBuilder({ limit: 2 });
    (api.get as any).mockResolvedValue({ data: [{ id: "a" }, { id: "b" }] });

    const paginator = builder.IdPaginator({ root: "main" as any, url: "/items" });
    await paginator.load();
    expect(paginator.hasMore).toBe(true);

    (api.get as any).mockResolvedValue({ data: [{ id: "c" }] });
    await paginator.loadMore();
    expect(paginator.hasMore).toBe(false);
  });

  it("rejects goToPage because cursor pagination cannot jump to a page", async () => {
    const { builder } = createBuilder({ limit: 2 });
    const paginator = builder.IdPaginator({ root: "main" as any, url: "/items" });

    await expect(paginator.goToPage(3)).rejects.toThrow("IdPaginator does not support goToPage");
  });
});

// ─── Cached Paginator ───────────────────────────────
describe("OffsetPaginator with cache", () => {
  function createCachedBuilder() {
    const api = createMockApi();
    const builder = new ClientBuilder({
      api,
      roots: { main: "https://api.test.com" },
      storeKey: "pagtest",
      storage: "memoryStorage",
    });
    return { builder, api };
  }

  it("caches load result and serves from cache on second load", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items", cache: {} });
    await paginator.load();
    await paginator.load();
    expect(api.get).toHaveBeenCalledOnce();
  });

  it("reload bypasses cache", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items", cache: {} });
    await paginator.load();
    (api.get as any).mockResolvedValue({ data: [{ id: 99 }] });
    const data = await paginator.reload();
    expect(data).toEqual([{ id: 99 }]);
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("load after reload uses cache again (forceRefresh resets)", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items", cache: {} });
    await paginator.load(); // call 1 — API hit, caches
    await paginator.reload(); // call 2 — bypasses cache, refetches
    await paginator.load(); // call 3 — should use cache (forceRefresh reset)
    expect(api.get).toHaveBeenCalledTimes(2); // only 2, not 3
  });

  it("does not cache a loadMore page when the cached first page has expired", async () => {
    const { builder, api } = createCachedBuilder();
    let now = 1000;
    const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => now);
    (api.get as any)
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: [{ id: 2 }] })
      .mockResolvedValueOnce({ data: [{ id: 3 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items", cache: { ttl: 10 } });
    await paginator.load();
    now = 1011;
    await paginator.loadMore();
    const fresh = await paginator.load();

    expect(fresh).toEqual([{ id: 3 }]);
    expect(api.get).toHaveBeenCalledTimes(3);
    nowSpy.mockRestore();
  });

  it("loadAll fetches without limit or offset", async () => {
    const { builder, api } = createCachedBuilder();
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items", cache: {} });
    const data = await paginator.loadAll();
    expect(data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const url = (api.get as any).mock.calls[0][0].url;
    expect(url).not.toContain("limit");
  });
});

// ─── UPLOAD ─────────────────────────────────────────
describe("UPLOAD", () => {
  it("resolves with .data", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockResolvedValue({ data: { id: 1, file: "photo.jpg" } });
    const result = await builder.UPLOAD({ root: "main" as any, url: "/files", body: new FormData() });
    expect(result).toEqual({ id: 1, file: "photo.jpg" });
  });

  it("calls onSuccess callback", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockResolvedValue({ data: { uploaded: true } });
    const onSuccess = vi.fn();
    await builder.UPLOAD({ root: "main" as any, url: "/files", body: new FormData(), onSuccess });
    expect(onSuccess).toHaveBeenCalledWith({ uploaded: true });
  });

  it("attaches retry on error", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockRejectedValue(new Error("Upload failed"));
    try {
      await builder.UPLOAD({ root: "main" as any, url: "/files", body: new FormData() });
      expect.unreachable();
    } catch (err: any) {
      expect(err.retry).toBeTypeOf("function");
    }
  });

  it("calls onError callback on failure", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockRejectedValue(new Error("fail"));
    const onError = vi.fn();
    try {
      await builder.UPLOAD({ root: "main" as any, url: "/files", body: new FormData(), onError });
    } catch (_) {
      // Expected rejection; callback assertion follows.
    }
    expect(onError).toHaveBeenCalledOnce();
  });

  it("passes onProgress to api.upload", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockResolvedValue({ data: {} });
    const onProgress = vi.fn();
    await builder.UPLOAD({ root: "main" as any, url: "/files", body: new FormData(), onProgress });
    expect((api.upload as any).mock.calls[0][0].onProgress).toBe(onProgress);
  });

  it("resolves correct URL with root", async () => {
    const { builder, api } = createBuilder();
    (api.upload as any).mockResolvedValue({ data: {} });
    await builder.UPLOAD({ root: "main" as any, url: "/upload", body: new FormData() });
    const calledUrl = (api.upload as any).mock.calls[0][0].url;
    expect(calledUrl).toContain("https://api.test.com/upload");
  });
});

// ─── retry() completeness ───────────────────────────
describe("retry() captures all params", () => {
  it("PUT retry sends same headers", async () => {
    const { builder, api } = createBuilder();
    const error: any = new Error("fail");
    (api.put as any).mockRejectedValueOnce(error).mockResolvedValue({ data: { ok: true } });

    const customHeaders = { "X-Custom": "value" } as any;
    try {
      await builder.PUT({ root: "main" as any, url: "/test", body: {}, headers: customHeaders });
      expect.unreachable();
    } catch (err: any) {
      await err.retry();
      // Second call should have the same headers
      const secondCall = (api.put as any).mock.calls[1][0];
      expect(secondCall.headers).toEqual(customHeaders);
    }
  });

  it("POST retry calls onSuccess", async () => {
    const { builder, api } = createBuilder();
    const error: any = new Error("fail");
    (api.post as any).mockRejectedValueOnce(error).mockResolvedValue({ data: { id: 1 } });

    const onSuccess = vi.fn();
    try {
      await builder.POST({ root: "main" as any, url: "/test", body: {}, onSuccess });
      expect.unreachable();
    } catch (err: any) {
      await err.retry();
      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    }
  });
});

// ─── setHasMore null guard ──────────────────────────
describe("setHasMore null guard", () => {
  it("paginator load does not crash when API returns null", async () => {
    const { builder, api } = createBuilder({ limit: 10 });
    (api.get as any).mockResolvedValue({ data: null });

    const paginator = builder.OffsetPaginator({ root: "main" as any, url: "/items" });
    const data = await paginator.load();
    expect(data).toBeNull();
    expect(paginator.hasMore).toBe(false);
  });
});

// ─── Cache TTL via ClientBuilder ────────────────────
describe("GET with cache TTL", () => {
  function createCachedBuilder() {
    const api = createMockApi();
    const builder = new ClientBuilder({
      api,
      roots: { main: "https://api.test.com" },
      storeKey: "ttltest",
      storage: "memoryStorage",
    });
    return { builder, api };
  }

  it("TTL cache expires and refetches", async () => {
    const { builder, api } = createCachedBuilder();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValueOnce(now); // set
    (api.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    await builder.GET({ root: "main" as any, url: "/items", cache: { ttl: 100 } });

    // Second call — not expired, should serve from cache
    vi.spyOn(Date, "now").mockReturnValueOnce(now + 50); // get
    (api.get as any).mockResolvedValue({ data: [{ id: 2 }] });
    const cached = await builder.GET({ root: "main" as any, url: "/items", cache: { ttl: 100 } });
    expect(cached).toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledTimes(1);

    // Third call — expired, should refetch
    vi.spyOn(Date, "now").mockReturnValueOnce(now + 200); // get (expired)
    vi.spyOn(Date, "now").mockReturnValueOnce(now + 200); // set (re-cache)
    const fresh = await builder.GET({ root: "main" as any, url: "/items", cache: { ttl: 100 } });
    expect(fresh).toEqual([{ id: 2 }]);
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
