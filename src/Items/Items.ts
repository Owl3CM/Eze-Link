import { createPostFunction, createCashedGetFunction, createLoadCleint, createPatchFunction, createDeleteFunction, createPutFunction } from "../ClientBuilder";

const root = "https://items.morabaaapps.com";
export const getItemsClient = {
  createItem: async (items: MorabaaItemSolutionRESTAPIDTOsRequestsCreateItemRequest) => createPostFunction({ url: `${root}/api/v1/items`, body: items }),
  ItemsById: async ({ id }: GetItemsParams) => createCashedGetFunction<MorabaaItemSolutionDomainInterfacesIItem>({ url: `${root}/api/v1/items/${id}` }),
};
export const getItemsOfownerPagenatedClient = createLoadCleint<LoadItemsOfownerParams, LoadItemsOfownerResponse>({ url: `${root}/api/v1/items/ofowner` });

type MorabaaItemSolutionDomainInterfacesIItem = {
  id?: string;
  morabaaId?: string;
  businessId?: string;
  groupId?: string;
  name?: string;
  scientificName?: string;
  notes?: string;
  filling?: string;
  quantity: number;
  minimumQuantity: number;
  addedAt: string;
  expireAt?: string;
  batchNumber?: string;
  deleted: boolean;
  lastUpdateAt?: string;
  wholeSalePrice?: number;
  privateSalePrice?: number;
  isAvailable: boolean;
};

type LoadItemsOfownerParams = {
  offset?: number;
  name?: string;
  businessId?: string;
  barcode?: string;
  GroupId?: string;
  MinBuyPrice?: number;
  MaxBuyPrice?: number;
  MinSellPrice?: number;
  MaxSellPrice?: number;
  BuyCurrencyId?: number;
  SellCurrencyId?: number;
  Pending?: boolean;
  Sort?: string;
  limit?: number;
  Query?: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsCreateItemRequest = {
  businessId?: string;
  items?: any;
  barcodes?: any;
  stores?: any;
  packages?: any;
  quantities?: any;
  itemPackages?: any;
  groups?: any;
  token?: string;
};
