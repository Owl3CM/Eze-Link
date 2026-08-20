import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError, ApiService } from "../index";

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
    await api.get({ url: "/test" }).catch(() => undefined);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("onError returning null resolves with undefined (no rejection)", async () => {
    const onError = vi.fn().mockReturnValue(null);
    mockFetch.mockReturnValue(errorResponse(404));
    const api = ApiService.create({ onError });
    const result = await api.get({ url: "/not-found" });
    expect(result).toBeUndefined();
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
    await api.get({ url: "/test" }).catch(() => undefined);
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

  it("exposes parsed error bodies through body, data, and legacy message fields", async () => {
    const payload = { code: "REQUEST_INVALID", detail: "Invalid request body" };
    mockFetch.mockReturnValue(errorResponse(400, payload));
    const api = ApiService.create({});
    try {
      await api.post({ url: "/bad-request", body: { value: true } });
      expect.unreachable();
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Bad Request");
      expect(err.body).toEqual(payload);
      expect(err.response.body).toEqual(payload);
      expect(err.response.data).toEqual(payload);
      expect(err.response.message).toEqual(payload);
    }
  });

  it("exposes native Response error bodies without mutating Response.body", async () => {
    const payload = { code: "REQUEST_INVALID", detail: "Invalid request body" };
    mockFetch.mockReturnValue(
      Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const api = ApiService.create({});
    try {
      await api.post({ url: "/native-bad-request", body: { value: true } });
      expect.unreachable();
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Bad Request");
      expect(err.body).toEqual(payload);
      expect(err.response.body).toEqual(payload);
      expect(err.response.data).toEqual(payload);
      expect(err.response.message).toEqual(payload);
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
  it("does not abort concurrent requests without an explicit abortId", async () => {
    const signals: AbortSignal[] = [];
    let firstResolve: ((value: any) => void) | null = null;
    mockFetch.mockImplementation((_url: string, opts: any) => {
      signals.push(opts.signal);
      if (signals.length === 1) {
        return new Promise((resolve) => {
          firstResolve = resolve;
        });
      }
      return jsonResponse({ second: true });
    });

    const api = ApiService.create({});
    const first = api.get({ url: "/test" });
    await new Promise((r) => setTimeout(r, 0));
    const second = api.get({ url: "/test" });
    await new Promise((r) => setTimeout(r, 0));

    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBe(false);
    const secondResult = await second;
    expect(secondResult.data).toEqual({ second: true });

    firstResolve?.({ ok: true, status: 200, json: () => Promise.resolve({ first: true }) });
    const firstResult = await first;
    expect(firstResult.data).toEqual({ first: true });
  });

  it("aborts previous request with same abortId", async () => {
    const signals: AbortSignal[] = [];
    mockFetch.mockImplementation((_url: string, opts: any) => {
      signals.push(opts.signal);
      if (signals.length === 1) {
        return new Promise(() => {
          // Hang until the next request aborts this signal.
        });
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

// ─── FormData Auto-Detect ───────────────────────────
describe("FormData Auto-Detect", () => {
  it("POST with FormData body does NOT JSON.stringify", async () => {
    mockFetch.mockReturnValue(jsonResponse({ ok: true }));
    const api = ApiService.create({});
    const formData = new FormData();
    formData.append("file", new Blob(["content"]), "test.txt");
    await api.post({ url: "/upload", body: formData });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.body).toBe(formData);
  });

  it("POST with FormData body does NOT set Content-Type: application/json", async () => {
    mockFetch.mockReturnValue(jsonResponse({ ok: true }));
    const api = ApiService.create({});
    const formData = new FormData();
    formData.append("name", "test");
    await api.post({ url: "/upload", body: formData });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["Content-Type"]).toBeUndefined();
  });

  it("PUT with FormData auto-detects correctly", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    const formData = new FormData();
    formData.append("file", new Blob(["data"]), "doc.pdf");
    await api.put({ url: "/files/1", body: formData });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.headers["Content-Type"]).toBeUndefined();
  });

  it("regular POST still JSON.stringifies non-FormData body", async () => {
    mockFetch.mockReturnValue(jsonResponse({}));
    const api = ApiService.create({});
    await api.post({ url: "/users", body: { name: "Ali" } });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.body).toBe(JSON.stringify({ name: "Ali" }));
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });
});

// ─── Upload Method ──────────────────────────────────
describe("Upload Method", () => {
  class MockXMLHttpRequest {
    static instances: MockXMLHttpRequest[] = [];
    upload: { onprogress?: (event: any) => void } = {};
    status = 0;
    responseText = "";
    timeout = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;
    ontimeout: (() => void) | null = null;
    open = vi.fn();
    setRequestHeader = vi.fn();
    send = vi.fn();
    abort = vi.fn(() => this.onabort?.());

    constructor() {
      MockXMLHttpRequest.instances.push(this);
    }
  }

  beforeEach(() => {
    MockXMLHttpRequest.instances = [];
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
  });

  it("creates an api instance with upload method", () => {
    const api = ApiService.create({});
    expect(api.upload).toBeTypeOf("function");
  });

  it("returns parsed data and reports upload progress", async () => {
    const onProgress = vi.fn();
    const api = ApiService.create({});
    const pending = api.upload({ url: "/upload", body: new FormData(), onProgress });
    await Promise.resolve();

    const xhr = MockXMLHttpRequest.instances[0];
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
    xhr.status = 201;
    xhr.responseText = JSON.stringify({ id: 7 });
    xhr.onload?.();

    await expect(pending).resolves.toEqual({ data: { id: 7 }, status: 201 });
    expect(onProgress).toHaveBeenCalledWith({ loaded: 5, total: 10, percent: 50 });
  });

  it("rejects upload failures with a typed error and parsed response body", async () => {
    const api = ApiService.create({});
    const pending = api.upload({ url: "/upload", body: new FormData() });
    await Promise.resolve();

    const xhr = MockXMLHttpRequest.instances[0];
    xhr.status = 422;
    xhr.responseText = JSON.stringify({ code: "FILE_INVALID" });
    xhr.onload?.();

    await expect(pending).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      body: { code: "FILE_INVALID" },
      response: { data: { code: "FILE_INVALID" } },
    });
  });

  it("rejects upload timeouts as ApiError", async () => {
    const api = ApiService.create({});
    const pending = api.upload({ url: "/upload", body: new FormData(), timeout: 50 });
    await Promise.resolve();

    const xhr = MockXMLHttpRequest.instances[0];
    xhr.ontimeout?.();

    await expect(pending).rejects.toBeInstanceOf(ApiError);
    await expect(pending).rejects.toMatchObject({ status: 408, statusMessage: "Request Timeout" });
  });
});

// Helper: creates a mock fetch that hangs forever but respects AbortSignal (like real fetch)
function hangingFetch() {
  return (_url: string, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new DOMException("The operation was aborted.", "AbortError");
        reject(err);
      });
    });
}

// ─── Timeout ────────────────────────────────────────
describe("Timeout", () => {
  it("rejects with Request Timeout when timeout expires", async () => {
    mockFetch.mockImplementation(hangingFetch());
    const api = ApiService.create({});
    try {
      await api.get({ url: "/slow", timeout: 50 });
      expect.unreachable();
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusMessage).toBe("Request Timeout");
      expect(err.response.status).toBe(408);
    }
  });

  it("default timeout applies to all requests", async () => {
    mockFetch.mockImplementation(hangingFetch());
    const api = ApiService.create({ timeout: 50 });
    try {
      await api.post({ url: "/slow", body: {} });
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Request Timeout");
    }
  });

  it("per-request timeout overrides default", async () => {
    mockFetch.mockImplementation(hangingFetch());
    const api = ApiService.create({ timeout: 5000 }); // large default
    try {
      await api.get({ url: "/slow", timeout: 50 }); // short override
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Request Timeout");
    }
  });

  it("timeout calls onError interceptor", async () => {
    mockFetch.mockImplementation(hangingFetch());
    const onError = vi.fn((err: any) => err);
    const api = ApiService.create({ onError });
    try {
      await api.get({ url: "/slow", timeout: 50 });
    } catch (_) {
      // Expected timeout rejection.
    }
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].statusMessage).toBe("Request Timeout");
  });

  it("does not timeout when request completes in time", async () => {
    mockFetch.mockReturnValue(jsonResponse({ ok: true }));
    const api = ApiService.create({ timeout: 5000 });
    const res = await api.get({ url: "/fast" });
    expect(res.data).toEqual({ ok: true });
  });
});

// ─── Auto-Retry ─────────────────────────────────────
describe("Auto-Retry", () => {
  it("does not retry unless retry is explicitly configured", async () => {
    mockFetch.mockImplementation(() => errorResponse(500));
    const api = ApiService.create({});
    await expect(api.get({ url: "/no-default-retry" })).rejects.toMatchObject({ status: 500 });
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("merges a request override with the instance retry configuration", async () => {
    mockFetch.mockReturnValueOnce(errorResponse(500)).mockReturnValueOnce(jsonResponse({ ok: true }));
    const api = ApiService.create({ retry: { limit: 1, delay: 1000, statusCodes: [500] } });
    const result = await api.get({ url: "/inherit-retry", retry: { delay: 0 } });
    expect(result.data).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("succeeds after N transient failures", async () => {
    let calls = 0;
    mockFetch.mockImplementation(() => {
      calls++;
      if (calls <= 2) return errorResponse(500);
      return jsonResponse({ ok: true });
    });
    const api = ApiService.create({});
    const res = await api.get({ url: "/flaky", retry: { limit: 3, delay: 10 } });
    expect(res.data).toEqual({ ok: true });
    expect(calls).toBe(3);
  });

  it("rejects when max retries exceeded", async () => {
    mockFetch.mockImplementation(() => errorResponse(500));
    const api = ApiService.create({});
    try {
      await api.get({ url: "/fail", retry: { limit: 2, delay: 10 } });
      expect.unreachable();
    } catch (err: any) {
      expect(err.response.status).toBe(500);
    }
    // limit: 2 means 2 retries → 1 initial + 2 retries = 3 total
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("only retries matching status codes", async () => {
    mockFetch.mockImplementation(() => errorResponse(400));
    const api = ApiService.create({});
    try {
      await api.get({ url: "/bad-request", retry: { limit: 3, delay: 10 } });
      expect.unreachable();
    } catch (err: any) {
      expect(err.response.status).toBe(400);
    }
    // 400 is not in default retry codes → no retry
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retry: false disables instance-level retry", async () => {
    mockFetch.mockImplementation(() => errorResponse(500));
    const api = ApiService.create({ retry: { limit: 3, delay: 10 } });
    try {
      await api.get({ url: "/no-retry", retry: false });
      expect.unreachable();
    } catch (err: any) {
      expect(err.response.status).toBe(500);
    }
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry timeout errors", async () => {
    mockFetch.mockImplementation(hangingFetch());
    const api = ApiService.create({});
    try {
      await api.get({ url: "/timeout", timeout: 50, retry: { limit: 3, delay: 10 } });
      expect.unreachable();
    } catch (err: any) {
      expect(err.statusMessage).toBe("Request Timeout");
    }
  });
});

// ─── Smart Dedup ────────────────────────────────────
describe("Smart Dedup", () => {
  it("dedupe: true returns same promise for same abortId", async () => {
    let calls = 0;
    mockFetch.mockImplementation(() => {
      calls++;
      return new Promise((resolve) => setTimeout(() => resolve({ ok: true, status: 200, json: () => Promise.resolve({ call: calls }) }), 50));
    });
    const api = ApiService.create({});
    const p1 = api.get({ url: "/data", abortId: "dedup-test", dedupe: true });
    const p2 = api.get({ url: "/data", abortId: "dedup-test", dedupe: true });
    expect(p1).toBe(p2);
    const res = await p1;
    expect(res.data).toEqual({ call: 1 });
    expect(calls).toBe(1);
  });

  it("explicit abortId with no dedupe aborts previous request", async () => {
    const signals: AbortSignal[] = [];
    mockFetch.mockImplementation((_url: string, opts: any) => {
      signals.push(opts.signal);
      if (signals.length === 1) {
        return new Promise(() => {
          // Hang until the next request aborts this signal.
        });
      }
      return jsonResponse({ second: true });
    });
    const api = ApiService.create({});
    api.get({ url: "/test", abortId: "no-dedup" });
    await new Promise((r) => setTimeout(r, 0));
    const second = api.get({ url: "/test", abortId: "no-dedup" });
    await new Promise((r) => setTimeout(r, 0));
    expect(signals[0].aborted).toBe(true);
    const result = await second;
    expect(result.data).toEqual({ second: true });
  });

  it("dedup clears after resolution — next call fetches fresh", async () => {
    let calls = 0;
    mockFetch.mockImplementation(() => {
      calls++;
      return jsonResponse({ call: calls });
    });
    const api = ApiService.create({});
    const res1 = await api.get({ url: "/data", abortId: "dedup-clear", dedupe: true });
    expect(res1.data).toEqual({ call: 1 });
    // After settlement, Pending should be cleared
    const res2 = await api.get({ url: "/data", abortId: "dedup-clear", dedupe: true });
    expect(res2.data).toEqual({ call: 2 });
    expect(calls).toBe(2);
  });

  it("non-dedup abort clears Pending — next dedup call works fresh", async () => {
    let calls = 0;
    mockFetch.mockImplementation((_url: string, opts: any) => {
      calls++;
      return new Promise((resolve, reject) => {
        opts.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        if (calls > 1) setTimeout(() => resolve({ ok: true, status: 200, json: () => Promise.resolve({ call: calls }) }), 10);
      });
    });
    const api = ApiService.create({});
    // Fire dedup request — hangs
    const p1 = api.get({ url: "/data", abortId: "zombie", dedupe: true });
    expect(p1).toBeInstanceOf(Promise);
    await new Promise((r) => setTimeout(r, 0));

    // Non-dedup call on same abortId — aborts the first
    const p2 = api.get({ url: "/data", abortId: "zombie" });
    const res = await p2;
    expect(res.data).toEqual({ call: 2 });

    // Next dedup call should NOT return zombie promise — should fetch fresh
    const p3 = api.get({ url: "/data", abortId: "zombie", dedupe: true });
    const res3 = await p3;
    expect(res3.data).toEqual({ call: 3 });
    expect(calls).toBe(3);
  });

  it("dedup error rejection is shared across callers", async () => {
    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => setTimeout(() => resolve({ ok: false, status: 500, text: () => Promise.resolve("{}") }), 20));
    });
    const api = ApiService.create({});
    const p1 = api.get({ url: "/fail", abortId: "dedup-err", dedupe: true });
    const p2 = api.get({ url: "/fail", abortId: "dedup-err", dedupe: true });
    expect(p1).toBe(p2);
    await expect(p1).rejects.toMatchObject({ response: { status: 500 } });
  });
});
