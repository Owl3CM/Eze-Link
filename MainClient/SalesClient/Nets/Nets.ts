import Builder from "../../Builder";
export const getNetsClient = {
  createNetsV3: async ({ businessId, createNetsV3 }: createNetsV3Params) =>
    Builder.POST_Cashed<SalesReportAPIEntitiesDailyNet>({ root: "sales", url: `/api/v3/nets/${businessId}`, body: createNetsV3 }),

  NetsV2: async () => Builder.GET_Cashed<SalesReportAPIDTOsResponsesV2DailyNetOfOwnerResponse>({ root: "sales", url: `/api/v2/nets` }),

  createNetsV2: async ({ businessId, createNetsV2 }: createNetsV2Params) =>
    Builder.POST_Cashed<SalesReportAPIEntitiesDailyNet>({ root: "sales", url: `/api/v2/nets/${businessId}`, body: createNetsV2 }),

  NetsV2ByBusinessId: async ({ businessId, ...params }: NetsV2ByBusinessIdParams) =>
    Builder.GET_Cashed<SalesReportAPIDTOsResponsesV2DailyNetResponse>({ root: "sales", url: `/api/v2/nets/${businessId}`, params }),

  NetsThis_monthV2ByBusinessId: async ({ businessId }: NetsThis_monthV2ByBusinessIdParams) =>
    Builder.GET_Cashed<SalesReportAPIDTOsResponsesV2DailyNetResponse>({ root: "sales", url: `/api/v2/nets/${businessId}/this-month` }),
};
