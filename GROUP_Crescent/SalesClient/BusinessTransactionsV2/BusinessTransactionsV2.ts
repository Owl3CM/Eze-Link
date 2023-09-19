import Builder from "../../Builder";  
                     export const getBusinessTransactionsV2Client = { 
    BusinesstransactionsV2: async () => 
                 Builder.GET_Cashed({root:"sales",url:"/api/v2/businesstransactions" }),

    createBusinesstransactionsV2: async (createBusinesstransactionsV2:SalesReportAPIDTOsRequestsV2CreateBusinessTransactionRequestV2) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesBusinessTransaction>({root:"sales",url:"/api/v2/businesstransactions", body: createBusinesstransactionsV2 }),
 } 
                     export const getBusinesstransactionsOfbusinessV2ByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<LoadBusinesstransactionsOfbusinessV2ByBusinessIdParams,LoadBusinesstransactionsOfbusinessV2ByBusinessIdResponse>
                                ({getUrl:({ businessId }) => {
            return "/api/v2/businesstransactions/ofbusiness/${businessId}";
        }})