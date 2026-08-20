const RETRY_DEFAULTS: Required<RetryConfig> = { limit: 1, delay: 1000, statusCodes: [408, 429, 500, 502, 503, 504] };

function resolveRetry(instance?: RetryConfig, request?: RetryConfig | false): Required<RetryConfig> | null {
  if (request === false) return null;
  const limit = request?.limit ?? instance?.limit;
  if (!limit || limit < 0) return null;
  return { ...RETRY_DEFAULTS, ...instance, ...request, limit };
}

export const ApiService = {
  create: <Headers>({ headers, onResponse, onError, onRequest, options = {}, timeout: defaultTimeout, retry: defaultRetry }: CreateApiProps<Headers>) => {
    const Aborts: { [key: string]: AbortController | null } = {};
    const Pending: { [key: string]: Promise<any> | null } = {};

    function createMethod(method: string, parseAs: "json" | "blob" = "json") {
      return ({ url, body, headers: _headers, abortId, timeout, retry, dedupe }: IMethod<Headers>): Promise<any> => {
        const requestKey = abortId ?? (dedupe ? `${method}-${url}` : "");
        if (requestKey && dedupe && Pending[requestKey]) return Pending[requestKey]!;

        const retryConfig = resolveRetry(defaultRetry, retry);
        let attempt = 0;

        const execute = async (): Promise<any> => {
          for (;;) {
            if (requestKey) {
              Aborts[requestKey]?.abort();
            }
            const controller = new AbortController();
            if (requestKey) {
              Aborts[requestKey] = controller;
            }

            const isFormData = body instanceof FormData;
            const props = {
              method: method.toUpperCase(),
              headers: {
                ...(parseAs === "json" && !isFormData ? { "Content-Type": "application/json" } : {}),
                ...headers,
                ..._headers,
              },
              body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
              signal: controller.signal,
              ...options,
            };

            const _timeout = timeout ?? defaultTimeout;
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            let timedOut = false;

            if (_timeout) {
              timeoutId = setTimeout(() => {
                timedOut = true;
                controller.abort();
              }, _timeout);
            }

            try {
              await onRequest?.(props as OnRequestProps<Headers>);
              const res = await fetch(url, props as RequestInit);
              if (timeoutId) clearTimeout(timeoutId);
              if (requestKey) {
                Aborts[requestKey] = null;
              }

              if (res.ok) {
                if (parseAs === "blob") {
                  const blob = await res.blob();
                  onResponse?.(res);
                  return blob;
                }
                try {
                  (res as any).data = await res.json();
                } catch (_) {
                  (res as any).data = null;
                }
                onResponse?.(res);
                return res;
              }

              // Non-2xx — parse once and expose the same body shape everywhere.
              let errorResponse: any = res;
              try {
                errorResponse = attachErrorBody(res as any, JSON.parse(await res.text()));
              } catch (_) {
                // Preserve the status-only error when the response body is not JSON.
              }
              (props as any).url = url;
              throw getErrorResponse(errorResponse, props);
            } catch (caught: any) {
              if (timeoutId) clearTimeout(timeoutId);
              let error = caught;

              if (error.name === "AbortError") {
                if (timedOut) {
                  error = getErrorResponse(
                    { status: 408 },
                    { method: method.toUpperCase(), url, headers: props.headers, body },
                  );
                } else {
                  // User abort — intentionally unsettled (by design)
                  if (requestKey) {
                    Pending[requestKey] = null;
                  }
                  return new Promise(() => {
                    // Intentionally pending for backward-compatible silent cancellation.
                  });
                }
              }

              // Auto-retry: retryable status, not timed out, not aborted
              if (retryConfig && !timedOut && error.response?.status && retryConfig.statusCodes.includes(error.response.status) && attempt++ < retryConfig.limit) {
                await new Promise((r) => setTimeout(r, retryConfig.delay));
                continue;
              }

              // All errors converge here: HTTP errors, timeout, network failures
              if (onError) error = await onError(error);
              if (error) throw error;
              return undefined;
            }
          }
        };

        if (dedupe) {
          const p = execute().finally(() => {
            if (requestKey) {
              Pending[requestKey] = null;
            }
          });
          if (requestKey) {
            Pending[requestKey] = p;
          }
          return p;
        }
        return execute();
      };
    }

    function createUploadMethod() {
      return async ({
        url,
        body,
        headers: _headers,
        abortId = `upload-${url.split("?")[0]}`,
        onProgress,
        method = "POST",
        timeout,
      }: IUploadProps<Headers>): Promise<any> => {
        Aborts[abortId]?.abort();

        const _method = method.toUpperCase();
        const mergedHeaders = { ...headers, ..._headers };
        const controller = new AbortController();
        Aborts[abortId] = controller;

        await onRequest?.({ method: _method, headers: mergedHeaders, body, signal: controller.signal } as OnRequestProps<Headers>);

        return new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          controller.signal.addEventListener("abort", () => xhr.abort());

          if (onProgress) {
            xhr.upload.onprogress = (e: ProgressEvent) => {
              if (e.lengthComputable) {
                onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
              }
            };
          }

          const handleError = async (caught: any) => {
            Aborts[abortId] = null;
            const error = onError ? await onError(caught) : caught;
            if (error) reject(error);
            else resolve(undefined);
          };

          xhr.onload = async () => {
            Aborts[abortId] = null;
            if (xhr.status >= 200 && xhr.status < 300) {
              let data: any = null;
              try {
                data = JSON.parse(xhr.responseText);
              } catch (_) {
                // A successful empty/non-JSON upload response has null data.
              }
              const res = { data, status: xhr.status };
              onResponse?.(res);
              resolve(res);
            } else {
              const response = attachErrorBody({ status: xhr.status }, parseJSON(xhr.responseText));
              handleError(getErrorResponse(response as any, { method: _method, url, headers: mergedHeaders, body }));
            }
          };

          xhr.onerror = () => handleError(getErrorResponse({ status: 0 } as any, { method: _method, url, headers: mergedHeaders, body }));

          xhr.onabort = () => {
            Aborts[abortId] = null;
          };

          const _timeout = timeout ?? defaultTimeout;
          if (_timeout) xhr.timeout = _timeout;

          xhr.ontimeout = () => handleError(getErrorResponse({ status: 408 }, { method: _method, url, headers: mergedHeaders, body }));

          xhr.open(_method, url, true);
          for (const [key, val] of Object.entries(mergedHeaders)) {
            if (val != null) xhr.setRequestHeader(key, String(val));
          }
          xhr.send(body as any);
        });
      };
    }

    const _apiService: IApiService<Headers> = {
      get: createMethod("get"),
      delete: createMethod("delete"),
      post: createMethod("post"),
      put: createMethod("put"),
      patch: createMethod("patch"),
      update: createMethod("update"),
      getBlob: createMethod("get", "blob"),
      postBlob: createMethod("post", "blob"),
      upload: createUploadMethod(),
      setHeader: (newHeaders: Headers | ((prev: Headers) => Headers)) => {
        headers = typeof newHeaders === "function" ? (newHeaders as Function)(headers) : newHeaders;
      },
      setOnResponse: (newOnResponse: OnResponse) => {
        onResponse = newOnResponse;
      },
      setOnError: (newOnError: OnError) => {
        onError = newOnError;
      },
      setOnRequest: (newOnRequest: OnRequest<Headers>) => {
        onRequest = newOnRequest;
      },
    };

    return _apiService as IApiService<Headers>;
  },
};

export class ApiError extends Error {
  props: any;
  response: any;
  statusMessage: string;
  status?: number;
  body?: any;

  constructor(response: any, props: any) {
    const body = getAttachedErrorBody(response);
    const statusMessage = (StatusCodeByMessage as any)[response?.status] || "Unknown Error";
    super(statusMessage);
    this.name = "ApiError";
    this.props = props;
    this.response = attachErrorBody(response ?? {}, body);
    this.statusMessage = statusMessage;
    this.status = response?.status;
    this.body = body;
  }
}

const getErrorResponse = (response: any, props: any) => new ApiError(response, props);

function attachErrorBody<T extends Record<string, any>>(response: T, body: any): T & { body?: any; data?: any; message?: any } {
  if (body === undefined) return response;
  const target = cloneResponseForError(response);
  target.body = body;
  target.data = body;
  target.message = body;
  return target as T & { body?: any; data?: any; message?: any };
}

function getAttachedErrorBody(response: any) {
  if (!response) return undefined;
  if (!isNativeResponse(response) && Object.prototype.hasOwnProperty.call(response, "body")) {
    return response.body;
  }
  if (Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data;
  }
  if (Object.prototype.hasOwnProperty.call(response, "message")) {
    return response.message;
  }
  return undefined;
}

function cloneResponseForError<T extends Record<string, any>>(response: T): T & { body?: any; data?: any; message?: any } {
  if (!isNativeResponse(response)) {
    return { ...response } as T & { body?: any; data?: any; message?: any };
  }
  const res = response as unknown as Response;
  return {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    redirected: res.redirected,
    type: res.type,
    url: res.url,
    headers: res.headers,
  } as unknown as T & { body?: any; data?: any; message?: any };
}

function isNativeResponse(response: any): response is Response {
  return typeof Response !== "undefined" && response instanceof Response;
}

function parseJSON(value: string) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (_) {
    return null;
  }
}

interface CreateApiProps<Headers = any> {
  headers?: Headers;
  onResponse?: OnResponse;
  onError?: OnError;
  onRequest?: OnRequest<Headers>;
  options?: {
    mode?: RequestMode;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    redirect?: RequestRedirect;
    referrerPolicy?: ReferrerPolicy;
  };
  timeout?: number;
  retry?: RetryConfig;
}

type OnResponse = (res: any) => any;
type OnError = (err: any) => Promise<any> | any;
type OnRequest<T> = (props: OnRequestProps<T>) => void;

type OnRequestProps<Headers> = {
  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "UPDATE";
  signal: AbortSignal;
  body?: any;
  headers: Headers;
};

export interface IMethod<Headers> {
  url: string;
  body?: any;
  headers?: Headers;
  abortId?: string;
  timeout?: number;
  retry?: RetryConfig | false;
  dedupe?: boolean;
}

export type RetryConfig = { limit?: number; delay?: number; statusCodes?: number[] };
export interface IUploadProps<Headers> extends IMethod<Headers> {
  onProgress?: (event: { loaded: number; total: number; percent: number }) => void;
  method?: string;
}
export interface IApiService<Headers = any> {
  get: (props: IMethod<Headers>) => Promise<any>;
  delete: (props: IMethod<Headers>) => Promise<any>;
  post: (props: IMethod<Headers>) => Promise<any>;
  put: (props: IMethod<Headers>) => Promise<any>;
  patch: (props: IMethod<Headers>) => Promise<any>;
  update: (props: IMethod<Headers>) => Promise<any>;
  getBlob: (props: IMethod<Headers>) => Promise<Blob>;
  postBlob: (props: IMethod<Headers>) => Promise<Blob>;
  upload: (props: IUploadProps<Headers>) => Promise<any>;
  setHeader: (headers: Headers | ((prev: Headers) => Headers)) => void;
  setOnResponse: (onResponse: OnResponse) => void;
  setOnError: (onError: OnError) => void;
  setOnRequest: (onRequest: OnRequest<Headers>) => void;
}

const StatusCodeByMessage = {
  0: "There Is No Response From Server Body Is Empty Connection May Be Very Slow",

  100: "Continue",
  101: "Switching protocols",
  102: "Processing",
  103: "Early Hints",

  //2xx Succesful
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",

  //3xx Redirection
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found (Previously 'Moved Temporarily')",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  //4xx Client Error
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Headers Fields Too Large",
  451: "Unavailable For Legal Reasons",

  //5xx Server Error
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

export default ApiService;
