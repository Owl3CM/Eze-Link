import ApiService, { IApiService } from "./ApiService";
import Storable, { IStorable } from "./Storable";

type GetRoot<RootKey> = {
  url: string;
} & AmRoot<RootKey>;

export default class ClientBuilder<RootKey extends string> {
  limit = 25;
  storable: IStorable;
  api: IApiService<any>;
  generateQuery = defaultGenerateQuery;
  useCash = false;
  roots: {
    [key: string]: string;
  };

  private getRoot = ({ root, url }: GetRoot<RootKey>) => {
    if (!root) return this.roots[Object.keys(this.roots)[0]] + url;
    const _root = this.roots[root as any];
    return _root ? _root + url : root + url;
  };

  clearCash = (storageKey?: string) => this.storable?.clear(storageKey);

  static clearCash = (storageKey: string, storage: "localStorage" | "sessionStorage" = "sessionStorage") => {
    Storable.clear(storage, storageKey);
  };

  constructor({ api = ApiService.create({}), limit, storage, storeKey, generateQuery, roots }: IClientFunctionsConstructor) {
    this.roots = roots;
    this.useCash = !!storeKey;
    this.storable = this.useCash ? new Storable({ storage, storeKey }) : (null as any);
    if (!this.useCash) {
      this.GET_WithCash = this.GET;
      this.POST_WithCash = this.POST;
      this.PaginatorWithCash = this.Paginator;
      this.OffsetPaginatorWithCash = this.OffsetPaginator as any;
      this.IdPaginatorWithCash = this.IdPaginator;
    }
    this.api = api;
    if (generateQuery) this.generateQuery = generateQuery;
    if (limit) this.limit = limit;
  }

  OffsetPaginatorWithCash = <T = IQuery, Response = any[]>({
    root,
    url,
    getUrl,
    getHeaders,
    limit = this.limit,
    storageKey = "",
  }: CreateCashedLoadCleintProps<T, RootKey>) => {
    let offset = 0;
    let queryUrl = "";
    let headers: any = null;
    let _storeKey = "";

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T, clearCash?: boolean) =>
        new Promise<Response>(async (resolve, reject) => {
          offset = 0;
          try {
            headers = getHeaders?.(query);
            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            _storeKey = storageKey + queryUrl;
            const _url = queryUrl;
            let stored = clearCash ? null : this.storable.get(_storeKey);
            if (!stored) {
              stored = (await this.api.get({ url: _url, headers })).data;
              loadsFunctions.hasMore = stored.length >= loadsFunctions.limit;

              this.storable.set(_storeKey, stored);
            } else {
              loadsFunctions.hasMore = true;
            }
            // await new Promise((res) => setTimeout(res, 100));
            offset += stored.length;
            resolve(stored as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query, clearCash);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            const _url = queryUrl + `&offset=${offset}`;
            const { data } = await this.api.get({ url: _url, headers });
            offset += data.length;
            loadsFunctions.hasMore = data.length >= loadsFunctions.limit;
            this.storable.insert(_storeKey, data);
            resolve(data as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query, true),
      // insert: (data: Response[]) => {
      //     offset += data.length;
      //     this.storage.insert(_storeKey, data);
      // },
      // update: (data: Response[]) => {
      //     const _data = this.storage.get(_storeKey);
      //     _data.push(...data);
      //     this.storage.set(_storeKey, _data);
      // },
    };
    return loadsFunctions;
  };
  OffsetPaginator = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders, limit = this.limit }: CreateLoadCleintProps<T, RootKey>) => {
    let offset = 0;
    let queryUrl = "";
    let headers: any = null;

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T) =>
        new Promise<Response>(async (resolve, reject) => {
          offset = 0;
          try {
            headers = getHeaders?.(query);
            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            const _url = queryUrl;
            const { data } = await this.api.get({ url: _url, headers });
            const items = (Array.isArray(data) ? data : Object.values(data).find((v) => Array.isArray(v))) as any[];
            offset += items.length;
            loadsFunctions.hasMore = items.length >= loadsFunctions.limit;
            resolve(data as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            const _url = queryUrl + `&offset=${offset}`;
            const { data } = await this.api.get({ url: _url, headers });
            offset += data.length;
            loadsFunctions.hasMore = data.length >= loadsFunctions.limit;
            resolve(data);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query),
    };
    return loadsFunctions;
  };

  PaginatorWithCash = <T = IQuery, Response = any[]>({
    root,
    url,
    getUrl,
    getHeaders,
    limit = this.limit,
    storageKey = "",
  }: CreateCashedLoadCleintProps<T, RootKey>) => {
    let page = 0;
    let queryUrl = "";
    let headers: any = null;
    let _storeKey = "";

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T, clearCash?: boolean) =>
        new Promise<Response>(async (resolve, reject) => {
          page = 0;
          try {
            headers = getHeaders?.(query);
            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            _storeKey = storageKey + queryUrl;
            const _url = queryUrl;
            let stored = clearCash ? null : this.storable.get(_storeKey);
            if (!stored) {
              stored = (await this.api.get({ url: _url, headers })).data;
              loadsFunctions.hasMore = stored.length >= loadsFunctions.limit;

              this.storable.set(_storeKey, stored);
            }
            page++;
            resolve(stored as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query, clearCash);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            const _url = queryUrl + `&page=${page}`;
            const { data } = await this.api.get({ url: _url, headers });
            page++;
            loadsFunctions.hasMore = data.length >= loadsFunctions.limit;
            this.storable.insert(_storeKey, data);
            resolve(data);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query, true),
      // insert: (data: Response[]) => {
      //     this.storage.insert(_storeKey, data);
      // },
      // update: (data: Response[]) => {
      //     const _data = this.storage.get(_storeKey);
      //     _data.push(...data);
    };
    return loadsFunctions;
  };
  Paginator = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders, limit = this.limit }: CreateLoadCleintProps<T, RootKey>) => {
    let page = 0;
    let queryUrl = "";
    let headers: any = null;

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T) =>
        new Promise<Response>(async (resolve, reject) => {
          page = 0;
          try {
            headers = getHeaders?.(query);
            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            const _url = queryUrl;
            const { data } = await this.api.get({ url: _url, headers });
            page++;
            loadsFunctions.hasMore = data.length >= loadsFunctions.limit;
            resolve(data as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            const _url = queryUrl + `&page=${page}`;
            const { data } = await this.api.get({ url: _url, headers });
            page++;
            loadsFunctions.hasMore = data.length >= loadsFunctions.limit;
            resolve(data);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query),
    };
    return loadsFunctions;
  };

  IdPaginatorWithCash = <T = IQuery, Response = any[]>({
    root,
    url,
    getUrl,
    getHeaders,
    limit = this.limit,
    storageKey = "",
  }: CreateCashedLoadCleintProps<T, RootKey>) => {
    let lastId = "";
    let queryUrl = "";
    let headers: any = null;
    let _storeKey = "";

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    let idDirection = "IdGt";
    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T, clearCash?: boolean) =>
        new Promise<Response>(async (resolve, reject) => {
          lastId = "";
          try {
            headers = getHeaders?.(query);
            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            idDirection = queryUrl.split("sort")[1]?.split("&")[0].includes("-id") ? "IdLt" : "IdGt";

            _storeKey = storageKey + queryUrl;
            const _url = queryUrl;
            let stored = clearCash ? null : this.storable.get(_storeKey);
            if (!stored) {
              stored = (await this.api.get({ url: _url, headers })).data;
              this.storable.set(_storeKey, stored);
            }
            const items = (Array.isArray(stored) ? stored : Object.values(stored).find((v) => Array.isArray(v))) as any[];
            if (items.length > 0) lastId = items[items.length - 1].id;
            loadsFunctions.hasMore = items.length >= loadsFunctions.limit;
            resolve(stored as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query, clearCash);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            // const _url = queryUrl + `&${idDirection}=${lastId}`;
            const _url = queryUrl + `&last_id=${lastId}`;
            const { data } = await this.api.get({ url: _url, headers });
            const items = (Array.isArray(data) ? data : Object.values(data).find((v) => Array.isArray(v))) as any[];
            if (items.length) lastId = items[items.length - 1].id;
            loadsFunctions.hasMore = items.length >= loadsFunctions.limit;
            this.storable.insert(_storeKey, data);
            resolve(data);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query, true),
      // insert: (data: Response[]) => {
      //     this.storage.insert(_storeKey, data);
      // },
      // update: (data: Response[]) => {
      //     const _data = this.storage.get(_storeKey);
      //     _data.push(...data);
    };
    return loadsFunctions;
  };

  IdPaginator = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders, limit = this.limit }: CreateLoadCleintProps<T, RootKey>) => {
    let lastId = "";
    let queryUrl = "";
    let headers: any = null;

    const _BuildUrl = getUrl ? (query?: T) => this.getRoot({ root, url: getUrl!(query) }) : () => this.getRoot({ root, url });

    let idDirection = "IdGt";
    const loadsFunctions = {
      hasMore: false,
      limit,
      load: (query?: T) =>
        new Promise<Response>(async (resolve, reject) => {
          lastId = "";
          try {
            headers = getHeaders?.(query);

            queryUrl = this.generateQuery({ url: _BuildUrl(query), query: { limit: loadsFunctions.limit, ...query } });
            const _url = queryUrl;
            idDirection = queryUrl.split("sort")[1]?.split("&")[0].includes("-id") ? "IdLt" : "IdGt";

            const { data } = await this.api.get({ url: _url, headers });
            const items = (Array.isArray(data) ? data : Object.values(data).find((v) => Array.isArray(v))) as any[];
            if (items.length > 0) lastId = items[items.length - 1].id;
            loadsFunctions.hasMore = items.length >= loadsFunctions.limit;
            resolve(data as Response);
          } catch (err: any) {
            err.retry = () => loadsFunctions.load(query);
            reject(err);
          }
        }),
      loadMore: () =>
        new Promise<Response>(async (resolve, reject) => {
          try {
            // const _url = queryUrl + `&${idDirection}=${lastId}`;
            const _url = queryUrl + `&last_id=${lastId}`;
            const { data } = await this.api.get({ url: _url, headers });
            const items = (Array.isArray(data) ? data : Object.values(data).find((v) => Array.isArray(v))) as any[];
            if (items.length) lastId = items[items.length - 1].id;
            loadsFunctions.hasMore = items.length >= loadsFunctions.limit;
            resolve(data);
          } catch (err: any) {
            err.retry = () => loadsFunctions.loadMore();
            reject(err);
          }
        }),
      reload: (query?: T) => loadsFunctions.load(query),
    };
    return loadsFunctions;
  };

  GET = <Response = any>({ root, url, query, headers }: IGet<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.GET({ root, url, query, headers });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.get({ url: queryUrl, headers });
        resolve(res.data);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        reject(_err);
      }
    });
  GET_WithCash = <Response = any>({ root, url, query, headers, clearCash, storageKey = "" }: IGet<RootKey> & ICashed) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.GET_WithCash({ root, url, query, headers });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        let stored = clearCash ? null : this.storable.get(storageKey + queryUrl);
        if (!stored) {
          stored = await this.api.get({ url: queryUrl, headers });
          this.storable.set(storageKey + queryUrl, stored);
        }
        resolve(stored);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        reject(_err);
      }
    });

  POST = <Response = any>({ root, url, query, headers, getHeaders, body, onSuccess, onError }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.POST({ root, url, query, headers, body });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.post({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });
        onSuccess?.(res.data);
        resolve(res.data);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        onError?.(_err);
        reject(_err);
      }
    });

  POST_WithCash = <Response = any>({ root, url, query, headers, getHeaders, body, clearCash, storageKey = "", onError, onSuccess }: IPost<RootKey> & ICashed) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.POST_WithCash({ root, url, query, headers, body, clearCash, storageKey });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const storeKey = storageKey + queryUrl;
        let stored = clearCash ? null : this.storable.get(storeKey);
        if (!stored) {
          stored = await this.api.post({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });
          this.storable.set(storeKey, stored);
          onSuccess?.(stored);
        }
        resolve(stored);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        onError?.(_err);
        reject(_err);
      }
    });

  PUT = <Response = any>({ root, url, query, headers, body, getHeaders, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.PUT({ root, url, query, body });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.put({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });
        onSuccess?.(res.data);
        resolve(res.data);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });

  UPDATE = <Response = any>({ root, url, query, headers, getHeaders, body, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.UPDATE({ root, url, query, body });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.update({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });
        onSuccess?.(res.data);
        resolve(res.data);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });
  PATCH = <Response = any>({ root, url, query, body, headers, getHeaders, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.PATCH({ root, url, query, body });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.patch({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });
        onSuccess?.(res.data);
        resolve(res.data);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });

  DELETE = <Response = any>({ root, url, query, body, headers, getHeaders, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.DELETE({ root, url, query });
      try {
        const queryUrl = defaultGenerateQuery({ url: this.getRoot({ root, url }), query });
        const res = await this.api.delete({ url: queryUrl, body, headers: headers ?? getHeaders?.(query) });

        onSuccess?.(res.data);
        resolve(res.data);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });
}

const defaultGenerateQuery = ({ url, query }: GenerateQuery) => {
  if (!query) return url;
  let queryUrl = `${url}?`;
  if (typeof query.query === "object") query = query.query;
  new URLSearchParams(query).forEach((value, key) => {
    if (hasValue(value)) queryUrl += `${key}=${value}&`;
  });
  if (queryUrl.endsWith("&")) queryUrl = queryUrl.slice(0, -1);
  return queryUrl;
};

const hasValue = (value: any) => ![undefined, "undefined", "null", "", "none", "NaN"].includes(value);

type GenerateQuery = {
  url: string;
  query?: any;
};

type IQuery = { [key: string]: any };

type CreateLoadCleintProps<T, RootKey> = ({ url: string; getUrl?: null } | { url?: null; getUrl: (query?: T) => string }) & {
  getHeaders?: (query?: T) => any;
  limit?: number;
} & AmRoot<RootKey>;
type CreateCashedLoadCleintProps<T, RootKey> = CreateLoadCleintProps<T, RootKey> & {
  storageKey?: string;
};

type IClientFunctionsConstructor =
  | {
      api?: IApiService<any>;
      limit?: number;
      storeKey?: string;
      storage?: undefined;
      generateQuery?: (props: GenerateQuery) => string;
      roots: {
        [key: string]: string;
      };
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
// | {
//     useCash?: true;
//     api: IApiService<any>;
//     limit?: number;
//     storable?: undefined;
//     storage?: Storage;
//     storeKey: string;
//     generateQuery?: (props: GenerateQuery) => string;
//   };

interface IError extends Error {
  retry: () => Promise<any>;
}

type AmRoot<RootKey> =
  | {
      root?: any;
    }
  | {
      root: RootKey;
    };

type IGet<RootKey> = {
  url: string;
  query?: IQuery;
  headers?: any;
} & AmRoot<RootKey>;

type IPost<RootKey> = {
  url: string;
  body?: any;
  query?: IQuery;
  headers?: any;
  getHeaders?: (query: any) => any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
} & AmRoot<RootKey>;
type ICashed = {
  clearCash?: boolean;
  storageKey?: string;
};
