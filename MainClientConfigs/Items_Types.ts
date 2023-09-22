type MicrosoftAspNetCoreMvcProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};

type MorabaaItemSolutionDomainDTOsBulkAcceptItemsRequest = {
  morabaaIdByItemId?: object;
  businessId?: string;
};

type MorabaaItemSolutionDomainDTOsBulkAcceptPendingUpdatesRequest = {
  businessId: string;
  updateIds?: undefined[];
};

type MorabaaItemSolutionDomainDTOsGetStoresByIdsQuery = {
  title?: string;
  offset: number;
  limit: number;
  ids?: undefined[];
};

type MorabaaItemSolutionDomainDTOsItemPendingUpdateResponse = {
  id: number;
  businessId: string;
  itemId: string;
  name?: string;
  scientificName?: string;
  storeId?: string;
  notes?: string;
  sellPrice?: number;
  privateSalePrice?: number;
  wholeSalePrice?: number;
  sellCurrencyId?: number;
  buyPrice?: number;
  buyCurrencyId?: number;
  thumbnail?: string;
  small?: string;
  main?: string;
};

type MorabaaItemSolutionDomainDTOsItemSearchResponse = {
  id?: string;
  name?: string;
  scientificName?: string;
  sellCurrencyId: number;
  sellPrice: number;
  barcodes?: undefined[];
  expiresAt?: string;
  packages?: MorabaaItemSolutionDomainDTOsItemSearchResponseItemPackageResponse[];
};

type MorabaaItemSolutionDomainDTOsItemSearchResponseItemPackageResponse = {
  packageId: string;
  parentPackageId: string;
  packageIndex: number;
  numberInParent: number;
  price: number;
  packageQuantity: number;
  isDefault: boolean;
  title?: string;
};

type MorabaaItemSolutionDomainDTOsRepresentativeItemResponse = {
  id?: string;
  morabaaId?: string;
  businessId?: string;
  storeId?: string;
  name?: string;
  scientificName?: string;
  notes?: string;
  filling?: string;
  sellPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  buyPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  quantity: number;
  addedAt: string;
  expireAt?: string;
  batchNumber?: string;
  images?: object;
  packages?: MorabaaItemSolutionDomainDTOsRepresentativeItemResponseItemPackage[];
  wholeSalePrice?: number;
  privateSalePrice?: number;
  isAvailable: boolean;
};

type MorabaaItemSolutionDomainDTOsRepresentativeItemResponseItemPackage = {
  itemId: string;
  packageId: number;
  packageName?: string;
  price: number;
  isDefault: boolean;
  packageIndex: number;
  packageQuantity: number;
  numberInParent: number;
  wholeSalePrice?: number;
  privateSalePrice?: number;
};

type MorabaaItemSolutionDomainDTOsRequestsCreatePendingItemRequest = {
  businessId?: string;
  name?: string;
  scientificName?: string;
  notes?: string;
  saleCurrencyId: number;
  salePrice: number;
  privateSalePrice?: number;
  wholeSalePrice?: number;
  buyCurrencyId: number;
  buyPrice: number;
  quantity: number;
  packages?: MorabaaItemSolutionDomainDTOsRequestsCreatePendingItemRequestPendingItemPackage[];
  imageId?: string;
  storeId?: string;
};

type MorabaaItemSolutionDomainDTOsRequestsCreatePendingItemRequestPendingItemPackage = {
  quantity: number;
  salePrice: number;
  saleCurrencyId: number;
  buyPrice: number;
  buyCurrencyId: number;
  index: number;
  packageId: string;
  parentPackageId?: string;
  quantityInParent?: number;
  privateSalePrice?: number;
  wholeSalePrice?: number;
  isDefault: boolean;
};

type MorabaaItemSolutionDomainDTOsRequestsItemRequest = {
  itemId: number;
  storeId: number;
  groupId: number;
  name: string;
  scientificName?: string;
  notes?: string;
  filling?: string;
  businessId?: string;
  salePrice: number;
  saleCurrencyId: number;
  buyPrice: number;
  buyCurrencyId: number;
  quantity: number;
  minimumQuantity: number;
  expireAt?: string;
  batchNumber?: string;
  deleted: boolean;
  hasImage: boolean;
  wholeSalePrice?: number;
  privateSalePrice?: number;
  isAvailable?: boolean;
};

type MorabaaItemSolutionDomainDTOsRequestsUpdateItemRequest = {
  businessId: string;
  name?: string;
  scientificName?: string;
  storeId?: string;
  notes?: string;
  privateSalePrice?: number;
  wholeSalePrice?: number;
  quantity?: number;
  sellPrice?: number;
  sellCurrencyId?: number;
  buyPrice?: number;
  buyCurrencyId?: number;
  imageId?: string;
  packages?: MorabaaItemSolutionDomainModelsPackagePendingUpdate[];
};

type MorabaaItemSolutionDomainInterfacesIGroup = {
  id?: string;
  businessId?: string;
  morabaaId?: string;
  title?: string;
  deleted: boolean;
  imagePath?: string;
};

type MorabaaItemSolutionDomainInterfacesIItem = {
  id?: string;
  morabaaId?: string;
  businessId?: string;
  groupId?: string;
  name?: string;
  scientificName?: string;
  notes?: string;
  filling?: string;
  sellPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  buyPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  quantity: number;
  minimumQuantity: number;
  addedAt: string;
  expireAt?: string;
  batchNumber?: string;
  deleted: boolean;
  images: MorabaaItemSolutionDomainValueObjectsItemImageObject;
  barcodes?: MorabaaItemSolutionDomainValueObjectsBarcodeObject[];
  lastUpdateAt?: string;
  wholeSalePrice?: number;
  privateSalePrice?: number;
  isAvailable: boolean;
};

type MorabaaItemSolutionDomainInterfacesIItemOffer = {
  id?: string;
  itemId?: string;
  price: MorabaaItemSolutionDomainValueObjectsPriceObject;
  addedQuantity: number;
  minimumQuantity: number;
  expiresAt: string;
  createdAt: string;
};

type MorabaaItemSolutionDomainInterfacesILastUpdate = {
  id?: string;
  businessId?: string;
  updatedAt: string;
};

type MorabaaItemSolutionDomainInterfacesIPackage = {
  id: string;
  businessId: string;
  morabaaId: number;
  title?: string;
  deleted: boolean;
};

type MorabaaItemSolutionDomainInterfacesIStore = {
  id?: string;
  businessId?: string;
  morabaaId?: string;
  title?: string;
  deleted: boolean;
};

type MorabaaItemSolutionDomainModelsPackagePendingUpdate = {
  quantity: number;
  salePrice: number;
  currencyId: number;
  packageId: string;
  privateSalePrice: number;
  wholeSalePrice: number;
  isDefault: boolean;
  buyPrice?: number;
};

type MorabaaItemSolutionDomainValueObjectsBarcodeObject = {
  barcode?: string;
  fillingId?: string;
};

type MorabaaItemSolutionDomainValueObjectsItemImageObject = {
  thumbnail?: string;
  small?: string;
  main?: string;
};

type MorabaaItemSolutionDomainValueObjectsPriceObject = {
  price: number;
  currencyId: number;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsCreateItemRequest = {
  businessId?: string;
  items?: MorabaaItemSolutionRESTAPIDTOsRequestsItemRequest[];
  barcodes?: MorabaaItemSolutionRESTAPIDTOsRequestsItemBarcodeRequest[];
  stores?: MorabaaItemSolutionRESTAPIDTOsRequestsStoreRequest[];
  packages?: MorabaaItemSolutionRESTAPIDTOsRequestsPackageRequest[];
  quantities?: MorabaaItemSolutionRESTAPIDTOsRequestsQuantityRequest[];
  itemPackages?: MorabaaItemSolutionRESTAPIDTOsRequestsItemPackageRequest[];
  groups?: MorabaaItemSolutionRESTAPIDTOsRequestsGroupRequest[];
  token?: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsCreateOfferRequest = {
  businessId?: string;
  offerDetails?: MorabaaItemSolutionRESTAPIDTOsRequestsCreateOfferRequestDetails[];
};

type MorabaaItemSolutionRESTAPIDTOsRequestsCreateOfferRequestDetails = {
  itemId: number;
  price: number;
  currencyId: number;
  minimumQuantity: number;
  addedQuantity: number;
  expiresAt: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsGroupRequest = {
  morabaaId: number;
  title?: string;
  deleted: boolean;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsItemBarcodeRequest = {
  morabaaId: number;
  fillingId: number;
  text?: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsItemPackageRequest = {
  morabaaItemId: number;
  morabaaPackageId: number;
  morabaaParentPackageId: number;
  numberInParent: number;
  price: number;
  isDefault: boolean;
  deleted: boolean;
  packageIndex: number;
  packageQuantity: number;
  wholeSalePrice?: number;
  privateSalePrice?: number;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsItemRequest = {
  itemId: number;
  storeId: number;
  groupId: number;
  name: string;
  scientificName?: string;
  notes?: string;
  filling?: string;
  businessId?: string;
  salePrice: number;
  saleCurrencyId: number;
  buyPrice: number;
  buyCurrencyId: number;
  quantity: number;
  minimumQuantity: number;
  expireAt?: string;
  batchNumber?: string;
  deleted: boolean;
  hasImage: boolean;
  wholeSalePrice?: number;
  privateSalePrice?: number;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsItemsForRepresentativeRequest = {
  storesIds?: undefined[];
  ids?: undefined[];
  offset: number;
  name?: string;
  barcode?: string;
  sort?: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsPackageRequest = {
  morabaaId: number;
  title?: string;
  deleted: boolean;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsQuantityRequest = {
  morabaaId: number;
  itemMorabaaId: number;
  storeMorabaaId: number;
  value: number;
  deleted: boolean;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsStoreRequest = {
  morabaaId: number;
  title?: string;
  deleted: boolean;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsUpdateOfferRequest = {
  price?: number;
  currencyId?: number;
  minimumQuantity?: number;
  addedQuantity?: number;
  expiresAt?: string;
};

type MorabaaItemSolutionRESTAPIDTOsRequestsV2CreateItemRequestV2 = {
  businessId?: string;
  items?: MorabaaItemSolutionRESTAPIDTOsRequestsItemRequest[];
  barcodes?: MorabaaItemSolutionRESTAPIDTOsRequestsItemBarcodeRequest[];
  stores?: MorabaaItemSolutionRESTAPIDTOsRequestsStoreRequest[];
  packages?: MorabaaItemSolutionRESTAPIDTOsRequestsPackageRequest[];
  quantities?: MorabaaItemSolutionRESTAPIDTOsRequestsQuantityRequest[];
  itemPackages?: MorabaaItemSolutionRESTAPIDTOsRequestsItemPackageRequest[];
  groups?: MorabaaItemSolutionRESTAPIDTOsRequestsGroupRequest[];
  token?: string;
  lastSyncId: number;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreBusinessResponse = {
  id?: string;
  title?: string;
  address?: string;
  owner?: string;
  category?: string;
  created_at: string;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreItemImageResponse = {
  image?: string;
  small_image?: string;
  thumbnail?: string;
  added_at: string;
  item?: string;
  id: number;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreItemResponse = {
  id?: string;
  moraba_id: number;
  business: MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreBusinessResponse;
  title?: string;
  scientific_title?: string;
  notes?: string;
  filling?: string;
  price: number;
  currency_id: number;
  expire_at?: string;
  batch_number?: string;
  images?: MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreItemImageResponse[];
  offer_min_quantity?: number;
  offer_quantity?: number;
  offer_expire_dt?: string;
  offer_price?: number;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreLandingResponse = {
  newest?: MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreItemResponse[];
  new_offers?: MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreItemResponse[];
};

type MorabaaItemSolutionRESTAPIDTOsResponsesItemOfferResponse = {
  id?: string;
  itemId?: string;
  price: MorabaaItemSolutionDomainValueObjectsPriceObject;
  addedQuantity: number;
  minimumQuantity: number;
  expiresAt: string;
  createdAt: string;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesMyMorabaaItemResponse = {
  id?: string;
  businessTitle?: string;
  businessId?: string;
  name?: string;
  buyPriceWithCurrency?: string;
  sellPriceWithCurrency?: string;
  quantityWithFill?: string;
  expiresAt?: string;
  images?: object;
  scientificName?: string;
  batchNumber?: string;
  notes?: string;
  groupId?: string;
  barcode?: string;
  buyPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  sellPriceObject: MorabaaItemSolutionDomainValueObjectsPriceObject;
  quantity: number;
  packages?: MorabaaItemSolutionDomainDTOsRepresentativeItemResponseItemPackage[];
  morabaaId: number;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesRestaurantItemImageObject = {
  thumbnail?: string;
  small?: string;
  main?: string;
};

type MorabaaItemSolutionRESTAPIDTOsResponsesRestaurantMenuItemResponse = {
  id?: string;
  morabaaId: number;
  name?: string;
  price: number;
  currencyId: number;
  groupId?: string;
  images: MorabaaItemSolutionRESTAPIDTOsResponsesRestaurantItemImageObject;
};
