type patch_ItemsV2Params = {
  id?: string;
  patch_ItemsV2: MorabaaItemSolutionDomainDTOsRequestsUpdateItemRequest;
};
type post_ItemsUpdatesAcceptV2Params = {
  id?: number;
};
type delete_ItemsUpdatesV2Params = {
  id?: number;
};
type GetItemsUpdatesV2Params = {
  BusinessId: string;
  IdGT: number;
  IdLT: number;
  Ids: undefined[];
  Limit: number;
  ItemId: string;
};
type ItemsSearchV2Params = {
  query: string;
};
type editItemsPendingV2Params = {
  id?: string;
  editItemsPendingV2: MorabaaItemSolutionDomainDTOsRequestsCreatePendingItemRequest;
};
type LoadItemsPendingV2Params = {
  Offset: number;
  StoresIds: undefined[];
  BusinessIds: undefined[];
  Ids: undefined[];
  GroupId: string;
  Name: string;
  BusinessId: string;
  Barcode: string;
  MinBuyPrice: number;
  MaxBuyPrice: number;
  MinSellPrice: number;
  MaxSellPrice: number;
  BuyCurrencyId: number;
  SellCurrencyId: number;
  Sort: string;
  Pending: boolean;
  Limit: number;
  Query: string;
};
type createItemsPendingAcceptV2Params = {
  id?: string;
  createItemsPendingAcceptV2: MorabaaItemSolutionDomainDTOsRequestsItemRequest;
};
type LoadItemsOfownerParams = {
  offset: number;
  name: string;
  businessId: string;
  barcode: string;
  GroupId: string;
  MinBuyPrice: number;
  MaxBuyPrice: number;
  MinSellPrice: number;
  MaxSellPrice: number;
  BuyCurrencyId: number;
  SellCurrencyId: number;
  Pending: boolean;
  Sort: string;
  limit: number;
  Query: string;
};
type ItemsOfownerCountParams = {
  businessId: string;
};
type LoadItemsParams = {
  offset: number;
  name: string;
  businessId: string;
  barcode: string;
  GroupId: string;
  MinBuyPrice: number;
  MaxBuyPrice: number;
  MinSellPrice: number;
  MaxSellPrice: number;
  BuyCurrencyId: number;
  SellCurrencyId: number;
  Pending: boolean;
  Sort: string;
  limit: number;
  Query: string;
};
type ItemsByIdParams = {
  id?: string;
};
type deleteItemsOfbusinesParams = {
  businessId?: string;
};
type LoadItemsOfgroupByGroupIdParams = {
  groupId?: string;
  offset: number;
};
type delete_ItemsOfbusinessAllParams = {
  id?: string;
};
