import Builder from "../../Builder";  
                     export const getAccountsClient = { 
    AccountsTotalsV2: async (params:AccountsTotalsV2Params) => 
                 Builder.GET_Cashed<SalesReportAPIDTOsResponsesV2AccountTotalsResponse>({root:"sales",url:"/api/v2/accounts/totals", params }),

    createAccount: async (createAccount:SalesReportAPIDTOsRequestsCreateAccountRequest) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesAccount>({root:"sales",url:"/api/v1/accounts", body: createAccount }),

    editAccount: async (editAccount:SalesReportAPIDTOsRequestsCreateAccountRequest) => 
                 Builder.PUT<SalesReportAPIEntitiesAccount>({root:"sales",url:"/api/v1/accounts", body: editAccount }),

    AccountsSearch: async (params:AccountsSearchParams) => 
                 Builder.GET_Cashed({root:"sales",url:"/api/v1/accounts/search", params }),

    AccountsTotals: async (params:AccountsTotalsParams) => 
                 Builder.GET_Cashed<SalesReportAPIDTOsResponsesAccountsTotalsResponse>({root:"sales",url:"/api/v1/accounts/totals", params }),

    AccountsCount: async (params:AccountsCountParams) => 
                 Builder.GET_Cashed({root:"sales",url:"/api/v1/accounts/count", params }),

    AccountsById: async ({id}:AccountsByIdParams) => 
                 Builder.GET_Cashed<SalesReportAPIDTOsResponsesAccountWithBalancesResponse>({root:"sales",url:"/api/v1/accounts/${id}" }),

    patch_Account: async ({id, patch_Account}:patch_AccountParams) => 
                 Builder.PATCH<SalesReportAPIEntitiesAccount>({root:"sales",url:"/api/v1/accounts/${id}", body: patch_Account }),

    delete_Account: async ({businessId,morabaaId}:delete_AccountParams) => 
                 Builder.DELETE({root:"sales",url:"/api/v1/accounts/${businessId}/${morabaaId}" }),

    AccountsBalancesById: async ({id}:AccountsBalancesByIdParams) => 
                 Builder.GET_Cashed<SalesReportAPIEntitiesBalance>({root:"sales",url:"/api/v1/accounts/${id}/balances" }),

    createAccountsForrep: async (createAccountsForrep:SalesReportAPIDTOsRequestsGetAccountsForRepresentativeRequest) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesAccount>({root:"sales",url:"/api/v1/accounts/forrep", body: createAccountsForrep }),

    createAccountsVerify: async (createAccountsVerify:SalesReportAPIDTOsRequestsAccountsVerificationRequest) => 
                 Builder.POST_Cashed({root:"sales",url:"/api/v1/accounts/verify", body: createAccountsVerify }),

    AccountsByphone: async ({businessId,phoneNumber}:AccountsByphoneParams) => 
                 Builder.GET_Cashed<SalesReportAPIDTOsResponsesAccountWithBalancesResponse>({root:"sales",url:"/api/v1/accounts/byphone/${businessId}/${phoneNumber}" }),

    createAccountsForrep: async (createAccountsForrep:SalesReportAPIDTOsRequestsGetAccountIdByMorabaaIdRequest) => 
                 Builder.POST_Cashed({root:"sales",url:"/api/v1/accounts/forreps", body: createAccountsForrep }),

    post_AccountsToggle_favorite: async ({id}:post_AccountsToggle_favoriteParams) => 
                 Builder.POST_Cashed({root:"sales",url:"/api/v1/accounts/${id}/toggle-favorite" }),
 } 
                     export const getAccountsPagenatedClient = Builder.Offset_Load_Cashed<LoadAccountsParams,LoadAccountsResponse>
                                ({url:"/api/v1/accounts"})
export const getAccountsOfbusinessPendingByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<LoadAccountsOfbusinessPendingByBusinessIdParams,LoadAccountsOfbusinessPendingByBusinessIdResponse>
                                ({getUrl:({ businessId }) => {
            return "/api/v1/accounts/ofbusiness/${businessId}/pending";
        }})