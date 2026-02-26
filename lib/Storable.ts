export default class Storable {
  storage: Storage;
  storeKey: string;
  set = (store_key: string, data: any) =>
    Object.values(data).length > 0 ? this.storage.setItem(this.getCleanString(store_key), JSON.stringify(data)) : this.remove(store_key);
  get = (store_key: string) => JSON.parse(this.storage.getItem(this.getCleanString(store_key)) as string);

  insert = (key: string, value: Array<any> | Object) => {
    const isArray = Array.isArray(value);
    const _stored = this.get(key) ?? (isArray ? [] : {});
    let toStore = JSON.parse(JSON.stringify(value));
    if (Object.keys(_stored)?.length) {
      if (isArray) toStore = [...(_stored as any[]), ...(toStore as any[])];
      else if (typeof toStore === "object") {
        for (const prop in toStore) {
          if (Array.isArray(toStore[prop]) && Array.isArray(_stored[prop])) {
            toStore[prop] = [..._stored[prop], ...toStore[prop]];
          } else if (typeof toStore[prop] === "object" && typeof _stored[prop] === "object") {
            toStore[prop] = { ..._stored[prop], ...toStore[prop] };
          }
        }
      }
    }

    this.set(key, toStore);
  };
  remove = (store_key: string) => this.storage.removeItem(this.getCleanString(store_key));
  clear = (storageKey?: string) => {
    const prefix = storageKey ? this.getCleanString(storageKey) : this.storeKey;
    for (let i = this.storage.length - 1; i >= 0; i--) {
      const key = this.storage.key(i) as string;
      if (key.startsWith(prefix)) this.storage.removeItem(key);
    }
  };
  select = (key: string, value: any) => (this.get(key) ?? [])[value];

  private getCleanString = (text = "") => this.storeKey + text.replace(/[?&=/!]/g, "-");

  constructor({ storage = "sessionStorage", storeKey = "storable" }: StorableConstructor) {
    this.storage = {} as Storage;
    if (storage === "localStorage") this.storage = localStorage;
    else if (storage === "sessionStorage") this.storage = sessionStorage;
    else if (storage === "memoryStorage") this.storage = getMemoryStorage();
    else storage instanceof Storage ? (this.storage = storage) : null;
    this.storeKey = storeKey;
  }
  static clear = (storage: "localStorage" | "sessionStorage", storageKey: string) => {
    const _storage = storage === "localStorage" ? localStorage : sessionStorage;
    for (let i = _storage.length - 1; i >= 0; i--) {
      const key = _storage.key(i) as string;
      if (key.startsWith(storageKey)) _storage.removeItem(key);
    }
  };
}
type StorageType = "localStorage" | "sessionStorage" | "memoryStorage" | Storage;
type StorableConstructor = {
  storage?: StorageType;
  storeKey?: string;
};

export type IStorable = InstanceType<typeof Storable>;

function getMemoryStorage() {
  const _data = new Map<string, any>();
  const memoryStorage: any = {
    getItem: (key: string) => _data.get(key) ?? null,
    setItem: (key: string, value: any) => {
      _data.set(key, value);
    },
    removeItem: (key: string) => {
      _data.delete(key);
    },
    key: (index: number) => Array.from(_data.keys())[index] ?? null,
    get length() {
      return _data.size;
    },
  };
  return memoryStorage as Storage;
}
