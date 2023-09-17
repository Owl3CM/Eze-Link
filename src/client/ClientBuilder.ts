import ApiService, { IApiService } from "./ApiService";
import Storable, { IStorable } from "./Storable";

type GetRoot<RootKey> = {
  url: string;
} & AmRoot<RootKey>;

export default class ClientBuilder<RootKey extends string> {
  limit = 25;
  storable: IStorable;
  Api: IApiService<any>;
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

  clearCashe = (storageKey?: string) => this.storable.clear(storageKey);

  constructor({ Api = ApiService.create({}), limit, storage, storeKey, generateQuery, roots }: IClientFunctionsConstructor) {
    this.roots = roots;
    this.useCash = !!storeKey;
    this.storable = this.useCash ? new Storable({ storage, storeKey }) : (null as any);
    if (!this.useCash) {
      this.GET_Cashed = this.GET;
      this.POST_Cashed = this.POST;
      this.Offset_Load_Cashed = this.Offset_Load;
      this.Page_Load_Cashed = this.Page_Load;
    }
    this.Api = Api;
    if (generateQuery) this.generateQuery = generateQuery;
    if (limit) this.limit = limit;
  }

  Offset_Load_Cashed = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders, storageKey = "" }: CreateCashedLoadCleintProps<T, RootKey>) => {
    let offset = 0;
    let query = "";
    let headers: any = null;
    let _storeKey = "";

    const _BuildUrl = getUrl ? (params?: T) => this.getRoot({ root, url: getUrl!(params) }) : () => this.getRoot({ root, url });

    const loadsFuctions = {
      load: (params?: T, clearCash?: boolean) =>
        new Promise<Response>(async (resolve, reject) => {
          offset = 0;
          try {
            headers = getHeaders?.(params);
            query = this.generateQuery({ url: _BuildUrl(params), params: { limit: this.limit, ...params } });
            _storeKey = storageKey + query;
            const _url = query + `&offset=${offset}`;
            let stored = clearCash ? null : this.storable.get(_storeKey);
            if (!stored) {
              stored = await this.Api.get({ url: _url, headers });
              this.storable.set(_storeKey, stored);
            }
            offset += stored.length;
            resolve(stored as Response);
          } catch (error) {
            reject(error);
          }
        }),
      loadMore: () =>
        new Promise(async (resolve, reject) => {
          try {
            const _url = query + `&offset=${offset}`;
            const data = await this.Api.get({ url: _url, headers });
            offset += data.length;
            this.storable.insert(_storeKey, data);
            resolve(data as Response[]);
          } catch (error) {
            reject(error);
          }
        }),
      reload: async (params: T) => await loadsFuctions.load(params, true),
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
    return loadsFuctions;
  };
  Offset_Load = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders }: CreateLoadCleintProps<T, RootKey>) => {
    let offset = 0;
    let query = "";
    let headers: any = null;

    const _BuildUrl = getUrl ? (params?: T) => this.getRoot({ root, url: getUrl!(params) }) : () => this.getRoot({ root, url });

    const loadsFuctions = {
      load: (params?: T) =>
        new Promise<Response>(async (resolve, reject) => {
          offset = 0;
          try {
            headers = getHeaders?.(params);
            query = this.generateQuery({ url: _BuildUrl(params), params: { limit: this.limit, ...params } });
            const _url = query + `&offset=${offset}`;
            const res = await this.Api.get({ url: _url, headers });
            offset += res.length;
            resolve(res as Response);
          } catch (error) {
            reject(error);
          }
        }),
      loadMore: () =>
        new Promise(async (resolve, reject) => {
          try {
            const _url = query + `&offset=${offset}`;
            const data = await this.Api.get({ url: _url, headers });
            offset += data.length;
            resolve(data as Response[]);
          } catch (error) {
            reject(error);
          }
        }),
      reload: async (params: T) => await loadsFuctions.load(params),
    };
    return loadsFuctions;
  };

  Page_Load_Cashed = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders, storageKey = "" }: CreateCashedLoadCleintProps<T, RootKey>) => {
    let page = 0;
    let query = "";
    let headers: any = null;
    let _storeKey = "";

    const _BuildUrl = getUrl ? (params?: T) => this.getRoot({ root, url: getUrl!(params) }) : () => this.getRoot({ root, url });

    const loadsFuctions = {
      load: (params?: T, clearCash?: boolean) =>
        new Promise<Response>(async (resolve, reject) => {
          page = 0;
          try {
            headers = getHeaders?.(params);
            query = this.generateQuery({ url: _BuildUrl(params), params: { limit: this.limit, ...params } });
            _storeKey = storageKey + query;
            const _url = query + `&page=${page}`;
            let stored = clearCash ? null : this.storable.get(_storeKey);
            if (!stored) {
              stored = await this.Api.get({ url: _url, headers });
              this.storable.set(_storeKey, stored);
            }
            page++;
            resolve(stored as Response);
          } catch (error) {
            reject(error);
          }
        }),
      loadMore: () =>
        new Promise(async (resolve, reject) => {
          try {
            const _url = query + `&page=${page}`;
            const data = await this.Api.get({ url: _url, headers });
            page++;
            this.storable.insert(_storeKey, data);
            resolve(data as Response[]);
          } catch (error) {
            reject(error);
          }
        }),
      reload: async (params: T) => await loadsFuctions.load(params, true),
      // insert: (data: Response[]) => {
      //     this.storage.insert(_storeKey, data);
      // },
      // update: (data: Response[]) => {
      //     const _data = this.storage.get(_storeKey);
      //     _data.push(...data);
    };
    return loadsFuctions;
  };
  Page_Load = <T = IQuery, Response = any[]>({ root, url, getUrl, getHeaders }: CreateLoadCleintProps<T, RootKey>) => {
    let page = 0;
    let query = "";
    let headers: any = null;

    const _BuildUrl = getUrl ? (params?: T) => this.getRoot({ root, url: getUrl!(params) }) : () => this.getRoot({ root, url });

    const loadsFuctions = {
      load: (params?: T) =>
        new Promise<Response>(async (resolve, reject) => {
          page = 0;
          try {
            headers = getHeaders?.(params);
            query = this.generateQuery({ url: _BuildUrl(params), params: { limit: this.limit, ...params } });
            const _url = query + `&page=${page}`;
            const res = await this.Api.get({ url: _url, headers });
            page++;
            resolve(res as Response);
          } catch (error) {
            reject(error);
          }
        }),
      loadMore: () =>
        new Promise(async (resolve, reject) => {
          try {
            const _url = query + `&page=${page}`;
            const data = await this.Api.get({ url: _url, headers });
            page++;
            resolve(data as Response[]);
          } catch (error) {
            reject(error);
          }
        }),
      reload: async (params: T) => await loadsFuctions.load(params),
    };
    return loadsFuctions;
  };

  GET = <Response = any>({ root, url, params, headers }: IGet<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.GET({ root, url, params, headers });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const res = await this.Api.get({ url: query, headers });
        resolve(res);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        reject(_err);
      }
    });
  GET_Cashed = <Response = any>({ root, url, params, headers, clearCash, storageKey = "" }: IGet<RootKey> & ICashed) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.GET_Cashed({ root, url, params, headers });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        let stored = clearCash ? null : this.storable.get(storageKey + query);
        if (!stored) {
          stored = await this.Api.get({ url: query, headers });
          this.storable.set(storageKey + query, stored);
        }
        resolve(stored);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        reject(_err);
      }
    });

  POST = <Response = any>({ root, url, params, headers, getHeaders, body, onSuccess, onError }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.POST({ root, url, params, headers, body });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const res = await this.Api.post({ url: query, body, headers: headers ?? getHeaders?.(params) });
        onSuccess?.(res);
        resolve(res);
      } catch (error) {
        const _err = error as IError;
        _err.retry = retry;
        onError?.(_err);
        reject(_err);
      }
    });

  POST_Cashed = <Response = any>({ root, url, params, headers, getHeaders, body, clearCash, storageKey = "", onError, onSuccess }: IPost<RootKey> & ICashed) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.POST_Cashed({ root, url, params, headers, body, clearCash, storageKey });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const storeKey = storageKey + query;
        let stored = clearCash ? null : this.storable.get(storeKey);
        if (!stored) {
          stored = await this.Api.post({ url: query, body, headers: headers ?? getHeaders?.(params) });
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

  PUT = <Response = any>({ root, url, params, headers, body, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.PUT({ root, url, params, body });
      try {
        const query = defaultGenerateQuery({ url, params });
        const res = await this.Api.put({ url: query, body, headers });
        onSuccess?.(res);
        resolve(res);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });

  UPDATE = <Response = any>({ root, url, params, body, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.UPDATE({ root, url, params, body });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const res = await this.Api.patch({ url: query, body });
        onSuccess?.(res);
        resolve(res);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });
  PATCH = <Response = any>({ root, url, params, body, onError, onSuccess }: IPost<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.PATCH({ root, url, params, body });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const res = await this.Api.patch({ url: query, body });
        onSuccess?.(res);
        resolve(res);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });

  DELETE = <Response = any>({ root, url, params, onError, onSuccess }: IDelete<RootKey>) =>
    new Promise<Response>(async (resolve, reject) => {
      const retry = () => this.DELETE({ root, url, params });
      try {
        const query = defaultGenerateQuery({ url: this.getRoot({ root, url }), params });
        const res = await this.Api.delete({ url: query });
        onSuccess?.(res);
        resolve(res);
      } catch (error) {
        (error as IError).retry = retry;
        onError?.(error);
        reject(error as IError);
      }
    });
}

const defaultGenerateQuery = ({ url, params }: GenerateQuery) => {
  if (!params) return url;
  let query = `${url}?`;
  new URLSearchParams(params).forEach((value, key) => {
    if (hasValue(value)) query += `${key}=${value}&`;
  });
  if (query.endsWith("&")) query = query.slice(0, -1);
  return query;
};

const hasValue = (value: any) => ![undefined, "undefined", "null", "", "none"].includes(value);

type GenerateQuery = {
  url: string;
  params?: any;
};

type IQuery = { [key: string]: any };

type CreateLoadCleintProps<T, RootKey> = ({ url: string; getUrl?: null } | { url?: null; getUrl: (params?: T) => string }) & {
  getHeaders?: (params?: T) => any;
} & AmRoot<RootKey>;
type CreateCashedLoadCleintProps<T, RootKey> = ({ url: string; getUrl?: null } | { url?: null; getUrl: (params?: T) => string }) & {
  getHeaders?: (params?: T) => any;
  storageKey?: string;
} & AmRoot<RootKey>;

type IClientFunctionsConstructor =
  | {
      Api?: IApiService<any>;
      limit?: number;
      storeKey?: string;
      storage?: undefined;
      generateQuery?: (props: GenerateQuery) => string;
      roots: {
        [key: string]: string;
      };
    }
  | {
      Api?: IApiService<any>;
      limit?: number;
      storeKey: string;
      storage?: "localStorage" | "sessionStorage" | "memoryStorage";
      generateQuery?: (props: GenerateQuery) => string;
      roots: {};
    }
  | {
      Api?: IApiService<any>;
      limit?: number;
      storeKey: string;
      storage: "localStorage" | "sessionStorage" | "memoryStorage";
      generateQuery?: (props: GenerateQuery) => string;
      roots: {};
    };
// | {
//     useCash?: true;
//     Api: IApiService<any>;
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
  params?: IQuery;
  headers?: any;
} & AmRoot<RootKey>;

type IPost<RootKey> = {
  url: string;
  body?: any;
  params?: IQuery;
  headers?: any;
  getHeaders?: (params: any) => any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  getUrl?: (params: any) => string;
} & AmRoot<RootKey>;
type ICashed = {
  clearCash?: boolean;
  storageKey?: string;
};
type IDelete<RootKey> = {
  url: string;
  params?: IQuery;
  headers?: any;
  onSuccess?: (res: any) => void;
  onError?: (err: any) => void;
  getUrl?: (params: any) => string;
} & AmRoot<RootKey>;
