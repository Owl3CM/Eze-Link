import ApiService, { IApiService } from "./ApiService";
import Storable, { IStorable } from "./Storable";

type GetRoot<RootKey extends string> = { url: string } & AmRoot<RootKey>;

export default class ClientBuilder<RootKey extends string> {
  readonly limit: number;
  readonly storable: IStorable | null;
  readonly api: IApiService<any>;
  generateQuery = defaultGenerateQuery;
  readonly useCache: boolean;
  readonly roots: { [key: string]: string };

  private getRoot = ({ root, url }: GetRoot<RootKey>) => {
    if (!root) return this.roots[Object.keys(this.roots)[0]] + url;
    const _root = this.roots[root as any];
    return _root ? _root + url : root + url;
  };

  clearCache = (storageKey?: string) => this.storable?.clear(storageKey);

  static clearCache = (storageKey: string, storage: "localStorage" | "sessionStorage" = "sessionStorage") => {
    Storable.clear(storage, storageKey);
  };

  constructor({ api = ApiService.create({}), limit = 25, storage, storeKey, generateQuery, roots }: IClientFunctionsConstructor) {
    this.roots = roots;
    this.useCache = !!storeKey;
    this.storable = this.useCache ? new Storable({ storage, storeKey }) : null;
    this.api = api;
    this.limit = limit;
    if (generateQuery) this.generateQuery = generateQuery;
  }

  // ─── Blob Methods ──────────────────────────────────

  GET_Blob = async ({ root, url, query, headers, abortId, timeout }: IGet<RootKey>): Promise<Blob> => {
    const retry = () => this.GET_Blob({ root, url, query, headers, abortId, timeout });
    try {
      const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
      return await this.api.getBlob({ url: queryUrl, headers, abortId, timeout });
    } catch (error) {
      (error as IError).retry = retry;
      throw error;
    }
  };

  POST_Blob = async ({ root, url, query, headers, body, abortId, timeout }: IPost<RootKey>): Promise<Blob> => {
    const retry = () => this.POST_Blob({ root, url, query, headers, body, abortId, timeout });
    try {
      const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
      return await this.api.postBlob({ url: queryUrl, body, headers, abortId, timeout });
    } catch (error) {
      (error as IError).retry = retry;
      throw error;
    }
  };

  // ─── Paginator Factory ─────────────────────────────

  private createPaginator<T = IQuery, Response = any[]>(
    strategy: PaginatorStrategy,
    { root, url, getUrl, getHeaders, limit = this.limit, abortId, cache }: CreateLoadClientProps<T, RootKey>,
  ) {
    const state = strategy.init();
    let queryUrl = "";
    let headers: any = null;
    let storeKey = "";
    let forceRefresh = false;

    const buildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });
    const canCache = cache && this.useCache;

    const paginator = {
      hasMore: false,
      limit,
      load: async (query?: T): Promise<Response> => {
        strategy.reset(state);
        try {
          headers = getHeaders?.(query);
          queryUrl = this.generateQuery({ url: buildUrl(query), query: { limit: paginator.limit, ...query } });
          storeKey = (cache?.key ?? "") + queryUrl;

          let data: any;
          if (canCache) {
            data = cache?.clear || forceRefresh ? null : this.storable!.get(storeKey);
            forceRefresh = false;
            if (!data) {
              data = (await this.api.get({ url: queryUrl, headers, abortId })).data;
              this.storable!.set(storeKey, data, cache?.ttl);
            }
          } else {
            data = (await this.api.get({ url: queryUrl, headers, abortId })).data;
          }

          strategy.afterLoad(state, paginator, data);
          return data as Response;
        } catch (err: any) {
          err.retry = () => paginator.load(query);
          throw err;
        }
      },
      loadMore: async (): Promise<Response> => {
        try {
          const sep = queryUrl.includes("?") ? "&" : "?";
          const moreUrl = queryUrl + `${sep}${strategy.loadMoreParam(state)}`;
          const { data } = await this.api.get({ url: moreUrl, headers, abortId });
          strategy.afterLoad(state, paginator, data);
          if (canCache && this.storable!.get(storeKey) !== null) {
            this.storable!.insert(storeKey, data);
          }
          return data as Response;
        } catch (err: any) {
          err.retry = () => paginator.loadMore();
          throw err;
        }
      },
      goToPage: async (page: number): Promise<Response> => {
        try {
          strategy.goToPage(state, page, paginator.limit);
          const sep = queryUrl.includes("?") ? "&" : "?";
          const pageUrl = queryUrl + `${sep}${strategy.loadMoreParam(state)}`;
          const { data } = await this.api.get({ url: pageUrl, headers, abortId });
          strategy.afterLoad(state, paginator, data);
          return data as Response;
        } catch (err: any) {
          err.retry = () => paginator.goToPage(page);
          throw err;
        }
      },
      reload: (query?: T) => {
        forceRefresh = true;
        return paginator.load(query);
      },
      loadAll: async (query?: T): Promise<Response> => {
        try {
          headers = getHeaders?.(query);
          const allUrl = this.generateQuery({ url: buildUrl(query), query: { ...query, limit: null } });
          const { data } = await this.api.get({ url: allUrl, headers });
          return data as Response;
        } catch (err: any) {
          err.retry = () => paginator.loadAll(query);
          throw err;
        }
      },
    };
    return paginator;
  }

  OffsetPaginator = <T = IQuery, Response = any[]>(props: CreateLoadClientProps<T, RootKey>) => this.createPaginator<T, Response>(offsetStrategy, props);

  Paginator = <T = IQuery, Response = any[]>(props: CreateLoadClientProps<T, RootKey>) => this.createPaginator<T, Response>(pageStrategy, props);

  IdPaginator = <T = IQuery, Response = any[]>(props: CreateLoadClientProps<T, RootKey>) => this.createPaginator<T, Response>(idStrategy, props);

  // ─── CRUD Methods ──────────────────────────────────

  GET = async <Response = any>({ root, url, query, headers, cache, abortId, timeout }: IGet<RootKey>): Promise<Response> => {
    const retry = () => this.GET({ root, url, query, headers, cache, abortId, timeout });
    try {
      const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
      let data: any;

      if (cache && this.useCache) {
        const storeKey = (cache.key ?? "") + queryUrl;
        data = cache.clear ? null : this.storable!.get(storeKey);
        if (!data) {
          data = (await this.api.get({ url: queryUrl, headers, abortId, timeout })).data;
          this.storable!.set(storeKey, data, cache.ttl);
        }
      } else {
        data = (await this.api.get({ url: queryUrl, headers, abortId, timeout })).data;
      }

      return data;
    } catch (error) {
      (error as IError).retry = retry;
      throw error;
    }
  };

  POST = async <Response = any>({
    root,
    url,
    query,
    headers,
    getHeaders,
    body,
    onSuccess,
    onError,
    abortId,
    cache,
    timeout,
  }: IPost<RootKey>): Promise<Response> => {
    const retry = () => this.POST({ root, url, query, headers, getHeaders, body, onSuccess, onError, abortId, cache, timeout });
    try {
      const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
      let data: any;

      if (cache && this.useCache) {
        const storeKey = (cache.key ?? "") + queryUrl;
        data = cache.clear ? null : this.storable!.get(storeKey);
        if (!data) {
          data = (await this.api.post({ url: queryUrl, body, headers: headers ?? getHeaders?.(query), abortId, timeout })).data;
          this.storable!.set(storeKey, data, cache.ttl);
        }
      } else {
        data = (await this.api.post({ url: queryUrl, body, headers: headers ?? getHeaders?.(query), abortId, timeout })).data;
      }

      onSuccess?.(data);
      return data;
    } catch (error) {
      (error as IError).retry = retry;
      onError?.(error);
      throw error;
    }
  };

  private createMutationMethod = (methodName: "PUT" | "UPDATE" | "PATCH" | "DELETE", apiMethod: "put" | "update" | "patch" | "delete") => {
    return async <Response = any>(props: IPost<RootKey>): Promise<Response> => {
      const { root, url, query, headers, body, getHeaders, onError, onSuccess, abortId, timeout } = props;
      const retry = () => (this[methodName] as any)(props);
      try {
        const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api[apiMethod]({ url: queryUrl, body, headers: headers ?? getHeaders?.(query), abortId, timeout });
        onSuccess?.(res.data);
        return res.data;
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        throw error;
      }
    };
  };

  PUT = this.createMutationMethod("PUT", "put");
  UPDATE = this.createMutationMethod("UPDATE", "update");
  PATCH = this.createMutationMethod("PATCH", "patch");
  DELETE = this.createMutationMethod("DELETE", "delete");

  UPLOAD = async <Response = any>({
    root,
    url,
    query,
    headers,
    body,
    onProgress,
    onSuccess,
    onError,
    abortId,
    method,
    timeout,
  }: IUpload<RootKey>): Promise<Response> => {
    const retry = () => this.UPLOAD({ root, url, query, headers, body, onProgress, onSuccess, onError, abortId, method, timeout });
    try {
      const queryUrl = this.generateQuery({ url: this.getRoot({ root, url }), query });
      const res = await this.api.upload({ url: queryUrl, body, headers, onProgress, abortId, method, timeout });
      onSuccess?.(res.data);
      return res.data;
    } catch (error) {
      (error as IError).retry = retry;
      onError?.(error);
      throw error;
    }
  };
}

// ─── Paginator Strategies ─────────────────────────────

type PaginatorStrategy = {
  init: () => any;
  reset: (state: any) => void;
  goToPage: (state: any, page: number, limit: number) => void;
  loadMoreParam: (state: any) => string;
  afterLoad: (state: any, funcs: { hasMore: boolean; limit: number }, data: any) => void;
};

const offsetStrategy: PaginatorStrategy = {
  init: () => ({ offset: 0 }),
  reset: (s) => {
    s.offset = 0;
  },
  goToPage: (s, page, limit) => {
    s.offset = (page - 1) * limit;
  },
  loadMoreParam: (s) => `offset=${s.offset}`,
  afterLoad: (s, funcs, data) => {
    s.offset += setHasMore(funcs, data);
  },
};

const pageStrategy: PaginatorStrategy = {
  init: () => ({ page: 1 }),
  reset: (s) => {
    s.page = 1;
  },
  goToPage: (s, page) => {
    s.page = page;
  },
  loadMoreParam: (s) => `page=${s.page}`,
  afterLoad: (s, funcs, data) => {
    if (setHasMore(funcs, data) > 0) s.page++;
  },
};

const idStrategy: PaginatorStrategy = {
  init: () => ({ lastId: "" }),
  reset: (s) => {
    s.lastId = "";
  },
  goToPage: () => {
    throw new Error("IdPaginator does not support goToPage");
  },
  loadMoreParam: (s) => `last_id=${s.lastId}`,
  afterLoad: (s, funcs, data) => {
    const items = getItems(data);
    if (items.length > 0) s.lastId = items[items.length - 1].id;
    funcs.hasMore = items.length >= funcs.limit;
  },
};

// ─── Helpers ──────────────────────────────────────────

const getItems = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return (Object.values(data).find((v) => Array.isArray(v)) as any[]) ?? [];
  return [];
};

const setHasMore = (func: { hasMore: boolean; limit: number }, data: any) => {
  const items = getItems(data);
  func.hasMore = items.length >= func.limit;
  return items.length;
};

const defaultGenerateQuery = ({ url, query }: GenerateQuery) => {
  if (!query) return url;
  const sep = url.includes("?") ? "&" : "?";
  let queryUrl = `${url}${sep}`;
  if (typeof query.query === "object") query = query.query;
  new URLSearchParams(query).forEach((value, key) => {
    if (hasValue(value)) queryUrl += `${key}=${value}&`;
  });
  if (queryUrl.endsWith("&")) queryUrl = queryUrl.slice(0, -1);
  return queryUrl;
};

const hasValue = (value: any) => ![undefined, "undefined", "null", "", "none", "NaN"].includes(value);

// ─── Types ────────────────────────────────────────────

type GenerateQuery = { url: string; query?: any };
type IQuery = { [key: string]: any };
type CacheOptions = { key?: string; clear?: boolean; ttl?: number };

type CreateLoadClientProps<T, RootKey extends string> = ({ url: string; getUrl?: null } | { url?: null; getUrl: (query?: T) => string }) & {
  getHeaders?: (query?: T) => any;
  limit?: number;
  abortId?: string;
  cache?: CacheOptions;
} & AmRoot<RootKey>;

type IClientFunctionsConstructor =
  | {
      api?: IApiService<any>;
      limit?: number;
      storeKey?: string;
      storage?: undefined;
      generateQuery?: (props: GenerateQuery) => string;
      roots: { [key: string]: string };
    }
  | {
      api?: IApiService<any>;
      limit?: number;
      storeKey: string;
      storage?: "localStorage" | "sessionStorage" | "memoryStorage";
      generateQuery?: (props: GenerateQuery) => string;
      roots: {};
    }
  | {
      api?: IApiService<any>;
      limit?: number;
      storeKey: string;
      storage: "localStorage" | "sessionStorage" | "memoryStorage";
      generateQuery?: (props: GenerateQuery) => string;
      roots: {};
    };

interface IError extends Error {
  retry: () => Promise<any>;
}

type AmRoot<RootKey extends string> = { root?: RootKey | (string & {}) };

type IGet<RootKey extends string> = {
  url: string;
  query?: IQuery;
  headers?: any;
  abortId?: string;
  cache?: CacheOptions;
  timeout?: number;
} & AmRoot<RootKey>;

type IPost<RootKey extends string> = {
  url: string;
  body?: any;
  query?: IQuery;
  headers?: any;
  getHeaders?: (query: any) => any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  abortId?: string;
  cache?: CacheOptions;
  timeout?: number;
} & AmRoot<RootKey>;

type IUpload<RootKey extends string> = {
  url: string;
  body: FormData;
  query?: IQuery;
  headers?: any;
  method?: "POST" | "PUT" | "PATCH";
  onProgress?: (event: { loaded: number; total: number; percent: number }) => void;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  abortId?: string;
  timeout?: number;
} & AmRoot<RootKey>;
