import Builder from "../../Builder";  
                     export const getLastUpdatesClient = { 
    LastupdatesOfbusinessByBusinessId: async ({businessId}:LastupdatesOfbusinessByBusinessIdParams) => 
                 Builder.GET_Cashed<SalesReportAPIEntitiesLastUpdate>({root:"sales",url:"/api/v1/lastupdates/ofbusiness/${businessId}" }),
 } 
                     