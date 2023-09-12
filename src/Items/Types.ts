type LoadItemsParams = {
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
type GetItemsParams = {
    id: string;
};
type ItemsOfbusinessParams = {
    businessId: string;
};
type LoadItemsOfgroupParams = {
    groupId: string;
    offset?: number;
};
type ItemsOfbusinessAllParams = {
    id: string;
};

type ItemsV2Params = {
    id: string;
    itemsV2: MorabaaItemSolutionDomainDTOsRequestsUpdateItemRequest;
};
type ItemsUpdatesAcceptV2Params = {
    id: number;
};
type ItemsUpdatesV2Params = {
    id: number;
};
type GetItemsUpdatesV2Params = {
    BusinessId?: string;
    IdGT?: number;
    IdLT?: number;
    Limit?: number;
    ItemId?: string;
};
type ItemsSearchV2Params = {
    query?: string;
};
type ItemsPendingV2Params = {
    id: string;
    itemsPendingV2: MorabaaItemSolutionDomainDTOsRequestsCreatePendingItemRequest;
};
type LoadItemsPendingV2Params = {
    Offset?: number;
    StoresIds?: undefined[];
    BusinessIds?: undefined[];
    Ids?: undefined[];
    GroupId?: string;
    Name?: string;
    BusinessId?: string;
    Barcode?: string;
    MinBuyPrice?: number;
    MaxBuyPrice?: number;
    MinSellPrice?: number;
    MaxSellPrice?: number;
    BuyCurrencyId?: number;
    SellCurrencyId?: number;
    Sort?: string;
    Pending?: boolean;
    Limit?: number;
    Query?: string;
};
type ItemsPendingAcceptV2Params = {
    id: string;
    itemsPendingAcceptV2: MorabaaItemSolutionDomainDTOsRequestsItemRequest;
};
type ItemsOfownerCountParams = {
    businessId?: string;
};
