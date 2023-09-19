import Builder from "../../Builder";  
                     export const getStoresClient = { 
    createStoresGet_detailsV2: async (createStoresGet_detailsV2:MorabaaItemSolutionDomainDTOsGetStoresByIdsQuery) => 
                 Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIStore>({root:"items",url:"/api/v2/stores/get-details", body: createStoresGet_detailsV2 }),

    createStoresDetail: async () => 
                 Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIStore>({root:"items",url:"/api/v1/stores/details" }),
 } 
                     export const getStoresOfbusinessByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<LoadStoresOfbusinessByBusinessIdParams,LoadStoresOfbusinessByBusinessIdResponse>
                                ({getUrl:({ businessId }) => {
            return "/api/v1/stores/ofbusiness/${businessId}";
        }})