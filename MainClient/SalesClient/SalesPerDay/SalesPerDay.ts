import Builder from "../../Builder";
export const getSalesPerDayClient = {
  Salesperday: async () => Builder.GET_Cashed<SalesReportAPIDTOsResponsesSalesPerDayOfOwnerResponse>({ root: "sales", url: `/api/v1/salesperday` }),

  createSalesperday: async ({ businessId, createSalesperday }: createSalesperdayParams) =>
    Builder.POST_Cashed<SalesReportAPIEntitiesSalesPerDay>({ root: "sales", url: `/api/v1/salesperday/${businessId}`, body: createSalesperday }),

  createSalesperdayChartreport: async (params: createSalesperdayChartreportParams) =>
    Builder.POST_Cashed<SalesReportAPIDTOsResponsesSalesPerDayChartPoint>({ root: "sales", url: `/api/v1/salesperday/chartreport`, params }),
};
export const getSalesperdayByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<LoadSalesperdayByBusinessIdParams, LoadSalesperdayByBusinessIdResponse[]>({
  getUrl: ({ businessId }) => {
    return `/api/v1/salesperday/${businessId}`;
  },
});
