import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiService } from "../index";

// ─── Mock fetch ─────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  });
}

function errorResponse(status: number, message?: any) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(message || {}),
    text: () => Promise.resolve(JSON.stringify(message || {})),
    blob: () => Promise.resolve(new Blob()),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── Creation ───────────────────────────────────────
describe("ApiService.create", () => {
  it("creates an api instance with all methods", () => {
    const api = ApiService.create({});
    expect(api.get).toBeTypeOf("function");
    expect(api.post).toBeTypeOf("function");
    expect(api.put).toBeTypeOf("function");
    expect(api.patch).toBeTypeOf("function");
    expect(api.delete).toBeTypeOf("function");
    expect(api.update).toBeTypeOf("function");
    expect(api.getBlob).toBeTypeOf("function");
    expect(api.postBlob).toBeTypeOf("function");
    expect(api.setHeader).toBeTypeOf("function");
    expect(api.setOnResponse).toBeTypeOf("function");
    expect(api.setOnError).toBeTypeOf("function");
    expect(api.setOnRequest).toBeTypeOf("function");
  });
});

// ─── HTTP Methods ───────────────────────────────────
describe("HTTP Methods", () => {
  it("GET sends correct method and url", async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1 }));
    const api = ApiService.create({});
    const res = await api.get({ url: "/api/users" });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/users");
    expect(opts.method).toBe("GET");
    expect(res.data).toEqual({ id: 1 });
  });

  it("POST sends body as JSON", async () => {
    mockFetch.mockReturnValue(jsonResponse({ created: true }));
    const api = ApiService.create({});
    await api.post({ url: "/api/users", body: { name: "Ali" } });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ name: "Ali" }));
  });

  it("PUT sends correct method", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    await api.put({ url: "/api/users/1", body: { name: "Updated" } });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("PUT");
  });

  it("PATCH sends correct method", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    await api.patch({ url: "/api/users/1", body: { name: "Patched" } });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("PATCH");
  });

  it("DELETE sends correct method", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    await api.delete({ url: "/api/users/1" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("DELETE");
  });

  it("UPDATE sends correct method", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    await api.update({ url: "/api/users/1", body: {} });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("UPDATE");
  });
});

// ─── Headers ────────────────────────────────────────
describe("Headers", () => {
  it("merges default headers into requests", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ headers: { Authorization: "Bearer abc" } as any });
    await api.get({ url: "/test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer abc");
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });

  it("per-request headers override defaults", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ headers: { Authorization: "Bearer old" } as any });
    await api.get({ url: "/test", headers: { Authorization: "Bearer new" } });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer new");
  });

  it("setHeader replaces headers for subsequent requests", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    api.setHeader({ Authorization: "Bearer token" } as any);
    await api.get({ url: "/test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer token");
  });

  it("setHeader with callback receives previous headers", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ headers: { Auth: "old", Other: "keep" } as any });
    api.setHeader((prev: any) => ({ ...prev, Auth: "new" }));
    await api.get({ url: "/test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Auth).toBe("new");
    expect(opts.headers.Other).toBe("keep");
  });
});

// ─── Options ────────────────────────────────────────
describe("Options", () => {
  it("passes options to JSON requests", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ options: { mode: "cors", credentials: "include" } });
    await api.get({ url: "/test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.mode).toBe("cors");
    expect(opts.credentials).toBe("include");
  });

  it("passes options to blob requests", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ options: { mode: "cors" } });
    await api.getBlob({ url: "/test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.mode).toBe("cors");
  });
});

// ─── Blob Methods ───────────────────────────────────
describe("Blob Methods", () => {
  it("getBlob returns a Blob", async () => {
    const blobData = new Blob(["hello"]);
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve(blobData) }));
    const api = ApiService.create({});
    const result = await api.getBlob({ url: "/file" });
    expect(result).toBeInstanceOf(Blob);
  });

  it("postBlob returns a Blob", async () => {
    const blobData = new Blob(["pdf-content"]);
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve(blobData) }));
    const api = ApiService.create({});
    const result = await api.postBlob({ url: "/report", body: { id: 1 } });
    expect(result).toBeInstanceOf(Blob);
  });

  it("blob requests do not set Content-Type: application/json", async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve(new Blob()) }));
    const api = ApiService.create({});
    await api.getBlob({ url: "/file" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["Content-Type"]).toBeUndefined();
  });

  it("blob methods reject on non-2xx with statusMessage", async () => {
    mockFetch.mockReturnValue(errorResponse(404));
    const api = ApiService.create({});
    try {
      await api.getBlob({ url: "/missing-file" });
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Not Found");
    }
  });
});

// ─── Interceptors ───────────────────────────────────
describe("Interceptors", () => {
  it("onRequest is called before fetch", async () => {
    const onRequest = vi.fn();
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ onRequest });
    await api.get({ url: "/test" });
    expect(onRequest).toHaveBeenCalledOnce();
    expect(onRequest).toHaveBeenCalledBefore(mockFetch);
  });

  it("onResponse is called on success", async () => {
    const onResponse = vi.fn();
    mockFetch.mockReturnValue(jsonResponse({ ok: true }));
    const api = ApiService.create({ onResponse });
    await api.get({ url: "/test" });
    expect(onResponse).toHaveBeenCalledOnce();
  });

  it("onError is called on failure", async () => {
    const onError = vi.fn((err: any) => err); // return error to reject
    mockFetch.mockReturnValue(errorResponse(500));
    const api = ApiService.create({ onError });
    await api.get({ url: "/test" }).catch(() => {});
    expect(onError).toHaveBeenCalledOnce();
  });

  it("onError returning null suppresses rejection", async () => {
    const onError = vi.fn().mockReturnValue(null);
    mockFetch.mockReturnValue(errorResponse(404));
    const api = ApiService.create({ onError });
    const promise = api.get({ url: "/not-found" });
    // Race against a timeout — if promise doesn't reject in 50ms, it's suppressed
    const result = await Promise.race([promise.then(() => "resolved").catch(() => "rejected"), new Promise((r) => setTimeout(() => r("pending"), 50))]);
    expect(result).toBe("pending");
    expect(onError).toHaveBeenCalled();
  });

  it("setOnRequest replaces the request handler", async () => {
    const first = vi.fn();
    const second = vi.fn();
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({ onRequest: first });
    api.setOnRequest(second);
    await api.get({ url: "/test" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("setOnError replaces the error handler", async () => {
    const first = vi.fn((err: any) => err);
    const second = vi.fn((err: any) => err);
    mockFetch.mockReturnValue(errorResponse(500));
    const api = ApiService.create({ onError: first });
    api.setOnError(second);
    await api.get({ url: "/test" }).catch(() => {});
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});

// ─── Error Handling ─────────────────────────────────
describe("Error Handling", () => {
  it("rejects with statusMessage on non-2xx", async () => {
    mockFetch.mockReturnValue(errorResponse(404));
    const api = ApiService.create({});
    try {
      await api.get({ url: "/missing" });
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Not Found");
      expect(err.response.status).toBe(404);
    }
  });

  it("rejects with statusMessage for 500", async () => {
    mockFetch.mockReturnValue(errorResponse(500));
    const api = ApiService.create({});
    try {
      await api.get({ url: "/error" });
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Internal Server Error");
    }
  });
});

// ─── JSON Parse Failure ─────────────────────────────
describe("JSON Parse Failure", () => {
  it("sets data to null when response is not valid JSON", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("Unexpected end of JSON")),
      }),
    );
    const api = ApiService.create({});
    const res = await api.get({ url: "/empty" });
    expect(res.data).toBeNull();
  });
});

// ─── Abort ──────────────────────────────────────────
describe("Abort", () => {
  it("aborts previous request with same abortId", async () => {
    const signals: AbortSignal[] = [];
    mockFetch.mockImplementation((_url: string, opts: any) => {
      signals.push(opts.signal);
      if (signals.length === 1) {
        return new Promise(() => {}); // hang forever
      }
      return jsonResponse({ second: true });
    });

    const api = ApiService.create({});
    // Fire first request (will hang)
    api.get({ url: "/test", abortId: "same" });
    // Need to wait a tick for the first async executor to call fetch
    await new Promise((r) => setTimeout(r, 0));
    // Fire second with same abortId — should abort first
    const second = api.get({ url: "/test", abortId: "same" });
    await new Promise((r) => setTimeout(r, 0));

    // First signal should be aborted
    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBe(true);
    const result = await second;
    expect(result.data).toEqual({ second: true });
  });
});
