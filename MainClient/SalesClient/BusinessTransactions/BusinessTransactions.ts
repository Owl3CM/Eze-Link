import Builder from "../../Builder";
export const getBusinessTransactionsClient = {
  BusinesstransactionsOfbusinessByBusinessId: async ({ businessId, ...params }: BusinesstransactionsOfbusinessByBusinessIdParams) =>
    Builder.GET_Cashed<SalesReportAPIEntitiesBusinessTransaction>({ root: "sales", url: `/api/v1/businesstransactions/ofbusiness/${businessId}`, params }),

  Businesstransactions: async () => Builder.GET_Cashed({ root: "sales", url: `/api/v1/businesstransactions` }),

  createBusinesstransaction: async (createBusinesstransaction: SalesReportAPIDTOsRequestsCreateBusinessTransactionRequest) =>
    Builder.POST_Cashed<SalesReportAPIEntitiesBusinessTransaction>({ root: "sales", url: `/api/v1/businesstransactions`, body: createBusinesstransaction }),
};
