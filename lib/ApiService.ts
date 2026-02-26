export const ApiService = {
  create: <Headers>({ headers, onResponse, onError, onRequest, options = {} }: CreateApiProps<Headers>) => {
    const Aborts: { [key: string]: AbortController | null } = {};

    function createMethod(method: string, parseAs: "json" | "blob" = "json") {
      return ({ url, body, headers: _headers, abortId = `${method}-${url.split("?")[0]}` }: IMethod<Headers>) => {
        if (Aborts[abortId]) {
          Aborts[abortId]!.abort();
        }
        Aborts[abortId] = new AbortController();
        const props = {
          method: method.toUpperCase(),
          headers: {
            ...(parseAs === "json" ? { "Content-Type": "application/json" } : {}),
            ...headers,
            ..._headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: Aborts[abortId]!.signal,
          ...options,
        };

        return new Promise<any>(async (resolve, reject) => {
          try {
            await onRequest?.(props as OnRequestProps<Headers>);
            const res = await fetch(url, props as RequestInit);
            Aborts[abortId] = null;
            if (res.ok) {
              if (parseAs === "blob") {
                const blob = await res.blob();
                onResponse?.(res);
                resolve(blob);
              } else {
                try {
                  (res as any).data = await res.json();
                } catch (_) {
                  (res as any).data = null;
                }
                onResponse?.(res);
                resolve(res);
              }
            } else {
              try {
                (res as any).message = JSON.parse(await res.text());
              } catch (_) {}
              (props as any).url = url;
              let err = getErrorResponse(res, props);

              if (onError) err = await onError(err);
              if (err) reject(err);
            }
          } catch (err: any) {
            if (err.name === "AbortError") return;
            if (onError) err = await onError(err);
            if (err) reject(err);
          }
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

const getErrorResponse = (response: any, props: any) => ({ props, response, statusMessage: (StatusCodeByMessage as any)[response.status] || "Unknown Error" });

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
