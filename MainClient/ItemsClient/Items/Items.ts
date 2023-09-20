import Builder from "../../Builder";
export const getItemsClient = {
  createItemsV2: async (createItemsV2: MorabaaItemSolutionRESTAPIDTOsRequestsV2CreateItemRequestV2) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v2/items`, body: createItemsV2 }),

  patch_ItemsV2: async ({ id, patch_ItemsV2 }: patch_ItemsV2Params) =>
    Builder.PATCH<MorabaaItemSolutionDomainDTOsItemPendingUpdateResponse>({ root: "items", url: `/api/v2/items/${id}`, body: patch_ItemsV2 }),

  post_ItemsUpdatesAcceptV2: async ({ id }: post_ItemsUpdatesAcceptV2Params) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v2/items/updates/${id}/accept` }),

  createItemsUpdatesAcceptV2: async (createItemsUpdatesAcceptV2: MorabaaItemSolutionDomainDTOsBulkAcceptPendingUpdatesRequest) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v2/items/updates/accept`, body: createItemsUpdatesAcceptV2 }),

  delete_ItemsUpdatesV2: async ({ id }: delete_ItemsUpdatesV2Params) => Builder.DELETE({ root: "items", url: `/api/v2/items/updates/${id}` }),

  ItemsUpdatesV2: async (params: GetItemsUpdatesV2Params) =>
    Builder.GET_Cashed<MorabaaItemSolutionDomainDTOsItemPendingUpdateResponse>({ root: "items", url: `/api/v2/items/updates`, params }),

  ItemsSearchV2: async (params: ItemsSearchV2Params) =>
    Builder.GET_Cashed<MorabaaItemSolutionDomainDTOsItemSearchResponse>({ root: "items", url: `/api/v2/items/search`, params }),

  editItemsPendingV2: async ({ id, editItemsPendingV2 }: editItemsPendingV2Params) =>
    Builder.PUT<MorabaaItemSolutionDomainInterfacesIItem>({ root: "items", url: `/api/v2/items/pending/${id}`, body: editItemsPendingV2 }),

  createItemsPendingAcceptV2: async ({ id, createItemsPendingAcceptV2 }: createItemsPendingAcceptV2Params) =>
    Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIItem>({
      root: "items",
      url: `/api/v2/items/pending/${id}/accept`,
      body: createItemsPendingAcceptV2,
    }),

  createItemsPendingAcceptV2: async (createItemsPendingAcceptV2: MorabaaItemSolutionDomainDTOsBulkAcceptItemsRequest) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v2/items/pending/accept`, body: createItemsPendingAcceptV2 }),

  ItemsOfownerCount: async (params: ItemsOfownerCountParams) => Builder.GET_Cashed({ root: "items", url: `/api/v1/items/ofowner/count`, params }),

  createItem: async (createItem: MorabaaItemSolutionRESTAPIDTOsRequestsCreateItemRequest) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v1/items`, body: createItem }),

  ItemsById: async ({ id }: ItemsByIdParams) => Builder.GET_Cashed<MorabaaItemSolutionDomainInterfacesIItem>({ root: "items", url: `/api/v1/items/${id}` }),

  ItemsLanding: async () =>
    Builder.GET_Cashed<MorabaaItemSolutionRESTAPIDTOsResponsesDrugStoreLandingResponse>({ root: "items", url: `/api/v1/items/landing` }),

  deleteItemsOfbusines: async ({ businessId }: deleteItemsOfbusinesParams) => Builder.DELETE({ root: "items", url: `/api/v1/items/ofbusiness/${businessId}` }),

  post_ItemsImages: async () => Builder.POST_Cashed({ root: "items", url: `/api/v1/items/images` }),

  createItemsForrep: async (createItemsForrep: MorabaaItemSolutionRESTAPIDTOsRequestsItemsForRepresentativeRequest) =>
    Builder.POST_Cashed<MorabaaItemSolutionDomainDTOsRepresentativeItemResponse>({ root: "items", url: `/api/v1/items/forrep`, body: createItemsForrep }),

  createItemsById: async () =>
    Builder.POST_Cashed<MorabaaItemSolutionRESTAPIDTOsResponsesRestaurantMenuItemResponse>({ root: "items", url: `/api/v1/items/byIds` }),

  delete_ItemsOfbusinessAll: async ({ id }: delete_ItemsOfbusinessAllParams) => Builder.DELETE({ root: "items", url: `/api/v1/items/ofbusiness/${id}/all` }),
};
export const getItemsPendingV2PagenatedClient = Builder.Offset_Load_Cashed<LoadItemsPendingV2Params, LoadItemsPendingV2Response[]>({
  url: `/api/v2/items/pending`,
});
export const getItemsOfownerPagenatedClient = Builder.Offset_Load_Cashed<LoadItemsOfownerParams, LoadItemsOfownerResponse[]>({ url: `/api/v1/items/ofowner` });
export const getItemsPagenatedClient = Builder.Offset_Load_Cashed<LoadItemsParams, LoadItemsResponse[]>({ url: `/api/v1/items` });
export const getItemsOfgroupByGroupIdPagenatedClient = Builder.Offset_Load_Cashed<LoadItemsOfgroupByGroupIdParams, LoadItemsOfgroupByGroupIdResponse[]>({
  getUrl: ({ groupId }) => {
    return `/api/v1/items/ofgroup/${groupId}`;
  },
});
