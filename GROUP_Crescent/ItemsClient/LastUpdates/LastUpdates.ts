import Builder from "../../Builder";  
                     export const getLastUpdatesClient = { 
    LastupdatesOfbusinessByBusinessId: async ({businessId}:LastupdatesOfbusinessByBusinessIdParams) => 
                 Builder.GET_Cashed<MorabaaItemSolutionDomainInterfacesILastUpdate>({root:"items",url:"/api/v1/lastupdates/ofbusiness/${businessId}" }),
 } 
                     