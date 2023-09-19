import Builder from "../../Builder";  
                     export const getTransactionsClient = { 
    createTransactionsV2: async (createTransactionsV2:SalesReportAPIDTOsRequestsV2CreateTransactionRequest) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesTransaction>({root:"sales",url:"/api/v2/transactions", body: createTransactionsV2 }),

    TransactionsByAccountIdAndCurrencyId: async ({accountId,currencyId}:TransactionsByAccountIdAndCurrencyIdParams) => 
                 Builder.GET_Cashed<SalesReportAPIEntitiesTransaction>({root:"sales",url:"/api/v1/transactions/${accountId}/${currencyId}" }),

    createTransaction: async (createTransaction:SalesReportAPIDTOsRequestsCreateTransactionRequest) => 
                 Builder.POST_Cashed<SalesReportAPIEntitiesTransaction>({root:"sales",url:"/api/v1/transactions", body: createTransaction }),
 } 
                     export const getTransactionsExpensesByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<LoadTransactionsExpensesByBusinessIdParams,LoadTransactionsExpensesByBusinessIdResponse>
                                ({getUrl:({ businessId }) => {
            return "/api/v1/transactions/expenses/${businessId}";
        }})