// import ClientStorage from "./Storable";
// import { Api, ClientOptions } from "./ClientOptions";

// type IQuery = { [key: string]: any };

// type CreateLoadCleintProps<T, Response> = ({ url: string; getUrl?: null } | { url?: null; getUrl: (params: T) => string }) & {
//   getHeaders?: (params: T) => any;
//   storageKey?: string;
// };

// export const createLoadCleint = <T = IQuery, Response = any[]>({ url, getUrl, getHeaders, storageKey = "" }: CreateLoadCleintProps<T, Response>) => {
//   let offset = 0;
//   let query = "";
//   let headers = null;
//   let _storeKey = "";

//   const createdClient = {
//     load: (params?: T, clearCash?: boolean) =>
//       new Promise<Response>(async (resolve, reject) => {
//         offset = 0;
//         try {
//           headers = getHeaders?.(params);
//           query = generateQuery({ url: url ?? getUrl(params), params: { limit: ClientOptions.limit, ...params } });
//           _storeKey = storageKey + query;
//           const _url = query + `&offset=${offset}`;
//           let stored = clearCash ? null : ClientStorage.get(_storeKey);
//           if (!stored) {
//             stored = await Api.get({ url: _url, headers });
//             ClientStorage.set(_storeKey, stored);
//           }
//           offset += stored.length;
//           resolve(stored as Response);
//         } catch (error) {
//           reject(error);
//         }
//       }),
//     loadMore: () =>
//       new Promise(async (resolve, reject) => {
//         try {
//           const _url = query + `&offset=${offset}`;
//           const data = await Api.get({ url: _url, headers });
//           offset += data.length;
//           ClientStorage.insert(_storeKey, data);
//           resolve(data as Response[]);
//         } catch (error) {
//           reject(error);
//         }
//       }),
//     reload: async (params: T) => await createdClient.load(params, true),
//     // insert: (data: Response[]) => {
//     //     offset += data.length;
//     //     ClientStorage.insert(_storeKey, data);
//     // },
//     // update: (data: Response[]) => {
//     //     const _data = ClientStorage.get(_storeKey);
//     //     _data.push(...data);
//     //     ClientStorage.set(_storeKey, _data);
//     // },
//   };
//   return createdClient;
// };

// export const createCashedGetFunction = <Response = any>({ url, params, clearCash, storageKey = "", headers }: IGet) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createCashedGetFunction({ url, params, headers });
//     try {
//       const query = generateQuery({ url, params });
//       let stored = clearCash ? null : ClientStorage.get(storageKey + query);
//       if (!stored) {
//         stored = await Api.get({ url: query, headers });
//         ClientStorage.set(storageKey + query, stored);
//       }
//       resolve(stored);
//     } catch (error) {
//       error.retry = retry;
//       reject(error as IError);
//       console.error(url, "error");
//     }
//   });

// export const createPostFunction = <Response = any>({ url, params, headers, getHeaders, body, onSuccess, onError }: IPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createPostFunction({ url, params, headers, body });
//     try {
//       const query = generateQuery({ url, params });
//       const res = await Api.post({ url: query, body, headers: headers ?? getHeaders?.(params) });
//       onSuccess?.(res);
//       resolve(res);
//     } catch (error) {
//       error.retry = retry;
//       onError?.(error);
//       reject(error as IError);
//     }
//   });

// export const createCashedPostFunction = <Response = any>({ url, params, headers, getHeaders, body, clearCash, storageKey = "" }: ICashPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createCashedPostFunction({ url, params, headers, body, clearCash, storageKey });
//     try {
//       const query = generateQuery({ url, params });
//       const storeKey = storageKey + query;
//       let stored = clearCash ? null : ClientStorage.get(storeKey);
//       if (!stored) {
//         stored = await Api.post({ url: query, body, headers: headers ?? getHeaders?.(params) });
//         ClientStorage.set(storeKey, stored);
//       }
//       resolve(stored);
//     } catch (error) {
//       error.retry = retry;
//       reject(error as IError);
//     }
//   });

// export const createPutFunction = <Response = any>({ url, params, headers, body, onError, onSuccess }: IPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createPutFunction({ url, params, body });
//     try {
//       const query = generateQuery({ url, params });
//       const res = await Api.put({ url: query, body, headers });
//       onSuccess?.(res);
//       resolve(res);
//     } catch (error) {
//       error.retry = retry;
//       onError?.(error);
//       reject(error as IError);
//     }
//   });

// export const createUploadFunction = <Response = any>({ url, params, headers, body, onError, onSuccess }: IPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createUploadFunction({ url, params, body });
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "App-Package": "com.morabaa.my",
//         },
//         body: body,
//       });

//       if (!response.ok) {
//         reject("Error uploading image");
//       }

//       const responseData = await response.json();
//       return resolve(responseData);
//     } catch (error) {
//       error.retry = retry;

//       reject(error as IError);
//     }
//   });
// export const createUpdateFunction = <Response = any>({ url, params, body, onError, onSuccess }: IPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createUpdateFunction({ url, params, body });
//     try {
//       const query = generateQuery({ url, params });
//       const res = await Api.patch({ url: query, body });
//       onSuccess?.(res);
//       resolve(res);
//     } catch (error) {
//       error.retry = retry;
//       onError?.(error);
//       reject(error as IError);
//     }
//   });
// export const createPatchFunction = <Response = any>({ url, params, body, onError, onSuccess }: IPost) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createPatchFunction({ url, params, body });
//     try {
//       const query = generateQuery({ url, params });
//       const res = await Api.patch({ url: query, body });
//       onSuccess?.(res);
//       resolve(res);
//     } catch (error) {
//       error.retry = retry;
//       onError?.(error);
//       reject(error as IError);
//     }
//   });

// export const createDeleteFunction = <Response = any>({ url, params, onError, onSuccess }: IDelete) =>
//   new Promise<Response>(async (resolve, reject) => {
//     const retry = () => createDeleteFunction({ url, params });
//     try {
//       const query = generateQuery({ url, params });
//       const res = await Api.delete({ url: query });
//       onSuccess?.(res);
//       resolve(res);
//     } catch (error) {
//       error.retry = retry;
//       onError?.(error);
//       reject(error as IError);
//     }
//   });

// export type IClentCreate = ReturnType<typeof createLoadCleint>;

// interface Props {
//   url: string;
//   params?: any;
//   limit?: number;
//   offset?: number;
// }
// const generateQuery = ({ url, params }: Props) => {
//   if (!params) return url;
//   let query = `${url}?`;
//   new URLSearchParams(params).forEach((value, key) => {
//     if (hasValue(value)) query += `${key}=${value}&`;
//   });
//   if (query.endsWith("&")) query = query.slice(0, -1);
//   return query;
// };

// const hasValue = (value: any) => ![undefined, "undefined", "null", "", "none"].includes(value);

// interface IError extends Error {
//   retry: () => Promise<any>;
// }

// interface IGet {
//   url: string;
//   params?: IQuery;
//   headers?: any;
//   clearCash?: boolean;
//   storageKey?: string;
// }
// interface IPost {
//   url: string;
//   body?: any;
//   params?: IQuery;
//   headers?: any;
//   getHeaders?: (params: any) => any;
//   onSuccess?: (res: any) => void;
//   onError?: (err: any) => void;
//   getUrl?: (params: any) => string;
// }
// interface ICashPost extends IPost {
//   clearCash?: boolean;
//   storageKey?: string;
// }
// interface IDelete {
//   url: string;
//   params?: IQuery;
//   headers?: any;
//   onSuccess?: (res: any) => void;
//   onError?: (err: any) => void;
//   getUrl?: (params: any) => string;
// }
