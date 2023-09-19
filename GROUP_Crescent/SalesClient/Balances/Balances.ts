import Builder from "../../Builder";  
                     export const getBalancesClient = { 
    createBalance: async (createBalance:SalesReportAPIDTOsRequestsSetBalanceRequest) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesBalance>({root:"sales",url:"/api/v1/balances", body: createBalance }),
 } 
                     