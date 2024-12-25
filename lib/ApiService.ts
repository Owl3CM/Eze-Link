export const ApiService = {
  create: <Headers>({ headers, onResponse, onError, onRequest }: CreateApiProps<Headers>) => {
    const _apiService: IApiService<Headers> = {
      get: createMethod("get"),
      delete: createMethod("delete"),
      post: createMethod("post"),
      put: createMethod("put"),
      patch: createMethod("patch"),
      update: createMethod("update"),
      getBlob: createBlobMethod("get"),
      postBlob: createBlobMethod("post"),
      setHeader: (newHeaders: Headers | ((headers: Headers) => Headers)) => {
        headers = typeof newHeaders === "function" ? (newHeaders as any)(headers) : newHeaders;
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
    const Aborts: { [key: string]: AbortController | null } = {};
    function createMethod(method: string) {
      return ({ url, body, headers: _headers }: IMethod<Headers>) => {
        const abortId = `${method}-${url.split("?")[0]}`;
        if (Aborts[abortId]) {
          console.warn("A B O R T E D \n" + abortId + "\n?" + url.split("?")[1]);
          Aborts[abortId]!.abort();
        }
        Aborts[abortId] = new AbortController();
        const props = {
          method: method.toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ..._headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: Aborts[abortId]!.signal,
        };

        return new Promise<any>(async (resolve, reject) => {
          try {
            await onRequest?.(props as OnRequestProps<Headers>);
            const res = await fetch(url, props as RequestInit);
            Aborts[abortId] = null;
            if (res.ok) {
              try {
                // jsonRes = (await res.blob()) ?? (await res.json());
                (res as any).data = await res.json();
              } catch (er) {}
              onResponse?.(res);
              resolve(res);
            } else {
              try {
                (res as any).message = JSON.parse(await res.text());
              } catch (e) {}
              (props as any).url = url;
              let err = getErrorRespoinse(res, props);

              if (onError) err = onError(err);
              if (err) reject(err);
            }
          } catch (err: any) {
            if (err.name === "AbortError") return;
            if (onError) err = onError(err);
            if (err) reject(err);
          }
        });
      };
    }
    function createBlobMethod(method: string) {
      return ({ url, body, headers: _headers }: IMethod<Headers>) => {
        const abortId = `${method}-${url.split("?")[0]}`;
        if (Aborts[abortId]) {
          console.warn("A B O R T E D \n" + abortId + "\n?" + url.split("?")[1]);
          Aborts[abortId]!.abort();
        }
        Aborts[abortId] = new AbortController();
        const props = {
          method: method.toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ..._headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: Aborts[abortId]!.signal,
        };

        return new Promise<Blob>(async (resolve, reject) => {
          try {
            // Execute onRequest hook if defined
            await onRequest?.(props as OnRequestProps<Headers>);

            // Perform fetch call
            const res = await fetch(url, props as RequestInit);

            // Reset abort controller
            Aborts[abortId] = null;

            // Handle response
            if (res.ok) {
              const blob = await res.blob(); // Parse response as Blob
              onResponse?.(res);
              resolve(blob);
            } else {
              try {
                (res as any).message = JSON.parse(await res.text());
              } catch (e) {}
              (props as any).url = url;
              let err = getErrorRespoinse(res, props);

              if (onError) err = onError(err);
              if (err) reject(err);
            }
          } catch (err: any) {
            if (err.name === "AbortError") return;
            if (onError) err = onError(err);
            if (err) reject(err);
          }
        });
      };
    }

    return _apiService as IApiService<Headers>;
  },
};
const getErrorRespoinse = (response: any, props: any) => ({ props, response, statusMessage: (StatusCodeByMessage as any)[response.status] || "Unknown Error" });

interface CreateApiProps<Headers = any> {
  headers?: Headers;
  onResponse?: OnResponse;
  onError?: OnError;
  onRequest?: OnRequest<Headers>;
}

type OnResponse = (res: any) => any;
type OnError = (err: any) => any;
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
  setHeader: (headers: Headers) => void;
  setOnResponse: (onResponse: OnResponse) => void;
  setOnError: (onError: OnError) => void;
  setOnRequest: (onRequest: OnRequest<Headers>) => void;
}

// export type IApiService<Headers> = typeof ApiService.create<Headers>;
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
