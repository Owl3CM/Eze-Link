type MicrosoftAspNetCoreMvcProblemDetails = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
};

type SalesReportAPIDTOsRequestsAccountsVerificationRequest = {
    businessId?: string;
    accountsIds?: undefined[];
};

type SalesReportAPIDTOsRequestsBusinessTransactionRequestData = {
    amount: number;
    currencyId: number;
    type: SalesReportAPISharedEnumsBusinessTransactionType;
    date: string;
    description?: string;
};

type SalesReportAPIDTOsRequestsCreateAccountRequest = {
    id?: string;
    name?: string;
    accountId: number;
    mainId: number;
    morabaaId: number;
    businessId?: string;
    phoneNumber?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    deleted?: boolean;
};

type SalesReportAPIDTOsRequestsCreateBusinessTransactionRequest = {
    businessId: string;
    data: SalesReportAPIDTOsRequestsBusinessTransactionRequestData[];
};

type SalesReportAPIDTOsRequestsCreateSalesPerDayRequest = {
    Date: string;
    SaleInIQD: number;
    SaleInUSD: number;
    ExpenseInIQD: number;
    ExpenseInUSD: number;
    ProfitInIQD: number;
    ProfitInUSD: number;
    PurchasesInIQD: number;
    PurchasesInUSD: number;
    Ticks: number;
};

type SalesReportAPIDTOsRequestsCreateTransactionRequest = {
    businessId?: string;
    morabaaId: number;
    description?: string;
    status?: string;
    opType?: string;
    currencyId: number;
    balance: number;
    amount: number;
    dateTime: string;
    date: string;
};

type SalesReportAPIDTOsRequestsGetAccountIdByMorabaaIdRequest = {
    businessId?: string;
    accountIds?: undefined[];
};

type SalesReportAPIDTOsRequestsGetAccountsForRepresentativeRequest = {
    businessId?: string;
    accountsIds?: undefined[];
    name?: string;
    q?: string;
    offset: number;
};

type SalesReportAPIDTOsRequestsSetBalanceRequest = {
    morabaaId: number;
    amount: number;
    state?: string;
    currencyId: number;
    businessId?: string;
};

type SalesReportAPIDTOsRequestsUpdateAccountBalanceRequest = {
    balanceInIQD: number;
    balanceInUSD: number;
    balanceInIQDState?: string;
    balanceInUSDState?: string;
};

type SalesReportAPIDTOsRequestsV2AddDailyNetRequest = {
    date: string;
    sales: number;
    expenses: number;
    profit: number;
    purchases: number;
    currencyId: number;
};

type SalesReportAPIDTOsRequestsV2BusinessTransactionRequestDataV2 = {
    amount: number;
    currencyId: number;
    type: SalesReportAPISharedEnumsBusinessTransactionType;
    date: string;
    description?: string;
};

type SalesReportAPIDTOsRequestsV2CreateBusinessTransactionRequestV2 = {
    businessId: string;
    data: SalesReportAPIDTOsRequestsV2BusinessTransactionRequestDataV2[];
};

type SalesReportAPIDTOsRequestsV2CreateTransactionRequest = {
    businessId?: string;
    morabaaId: number;
    description?: string;
    status?: string;
    opType?: string;
    currencyId: number;
    balance: number;
    amount: number;
    dateTime: string;
    index: number;
};

type SalesReportAPIDTOsResponsesAccountsTotalsResponse = {
    creditInIQD: number;
    creditInUSD: number;
    debtInIQD: number;
    debtInUSD: number;
};

type SalesReportAPIDTOsResponsesAccountWithBalancesResponse = {
    id?: string;
    businessId?: string;
    businessTitle?: string;
    morabaaId: number;
    name?: string;
    accountId: number;
    mainId: number;
    phoneNumber?: string;
    address?: string;
    balances?: SalesReportAPIDTOsResponsesBalanceResponse[];
    latitude?: number;
    longitude?: number;
    isFavorite: boolean;
};

type SalesReportAPIDTOsResponsesBalanceResponse = {
    amount: number;
    currencyId: number;
    state?: string;
};

type SalesReportAPIDTOsResponsesBusinessAndBalances = {
    businessId?: string;
    businessTitle?: string;
    balances?: SalesReportAPIEntitiesBalance[];
};

type SalesReportAPIDTOsResponsesSalesPerDayChartPoint = {
    businessId?: string;
    data?: SalesReportAPIDTOsResponsesSalesPerDayChartPointInfo[];
};

type SalesReportAPIDTOsResponsesSalesPerDayChartPointInfo = {
    dateFrom: string;
    dateTo: string;
    saleInIQD: number;
    saleInUSD: number;
    expenseInIQD: number;
    expenseInUSD: number;
    profitInIQD: number;
    profitInUSD: number;
    purchasesInIQD: number;
    purchasesInUSD: number;
    saleNet: number;
    expenseNet: number;
    profitNet: number;
    purchasesNet: number;
};

type SalesReportAPIDTOsResponsesSalesPerDayOfOwnerResponse = {
    businessTitle?: string;
    businessCategory?: string;
    sales: SalesReportAPIEntitiesSalesPerDay;
};

type SalesReportAPIDTOsResponsesV2AccountTotalsResponse = {
    credits?: object;
    debts?: object;
    nets?: object;
};

type SalesReportAPIDTOsResponsesV2DailyNetOfOwnerResponse = {
    business?: object;
    sales?: object;
    expenses?: object;
    purchases?: object;
    profits?: object;
    date: string;
};

type SalesReportAPIDTOsResponsesV2DailyNetResponse = {
    sales?: object;
    expenses?: object;
    purchases?: object;
    profits?: object;
    date: string;
};

type SalesReportAPIEntitiesAccount = {
    id?: string;
    businessId?: string;
    morabaaId: number;
    name?: string;
    accountId: number;
    mainId: number;
    phoneNumber?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
};

type SalesReportAPIEntitiesBalance = {
    id?: string;
    accountGuid?: string;
    account: SalesReportAPIEntitiesAccount;
    amount: number;
    currencyId: number;
    state?: string;
};

type SalesReportAPIEntitiesBusinessTransaction = {
    id?: string;
    businessId: string;
    amount: number;
    currencyId: number;
    date: string;
    transactionType: SalesReportAPISharedEnumsBusinessTransactionType;
    description?: string;
};

type SalesReportAPIEntitiesDailyNet = {
    id?: string;
    businessId?: string;
    date: string;
    sales: number;
    expenses: number;
    profit: number;
    purchases: number;
    currencyId: number;
};

type SalesReportAPIEntitiesLastUpdate = {
    id?: string;
    businessId: string;
    updatedAt: string;
};

type SalesReportAPIEntitiesSalesPerDay = {
    id?: string;
    businessId?: string;
    date: string;
    saleInIQD: number;
    saleInUSD: number;
    expenseInIQD: number;
    expenseInUSD: number;
    profitInIQD: number;
    profitInUSD: number;
    purchasesInIQD: number;
    purchasesInUSD: number;
};

type SalesReportAPIEntitiesTransaction = {
    id?: string;
    accountGuid?: string;
    account: SalesReportAPIEntitiesAccount;
    description?: string;
    status?: string;
    opType?: string;
    currencyId: number;
    balance: number;
    amount: number;
    date: string;
    index: number;
};

type SalesReportAPISharedEnumsBusinessTransactionType = "0" | "1" | "2" | "3" | "4" | "5";

type SalesReportAPISharedEnumsSalesReportType = "0" | "1" | "2";

type LoadGroupsOfbusinessByBusinessIdResponse = MorabaaItemSolutionDomainInterfacesIGroup;


type LoadItemsPendingV2Response = MorabaaItemSolutionDomainInterfacesIItem;


type LoadItemsOfownerResponse = MorabaaItemSolutionRESTAPIDTOsResponsesMyMorabaaItemResponse;


type LoadItemsResponse = MorabaaItemSolutionDomainInterfacesIItem;


type LoadItemsOfgroupByGroupIdResponse = MorabaaItemSolutionRESTAPIDTOsResponsesRestaurantMenuItemResponse;


type LoadOffersResponse = MorabaaItemSolutionRESTAPIDTOsResponsesItemOfferResponse;


type LoadStoresOfbusinessByBusinessIdResponse = MorabaaItemSolutionDomainInterfacesIStore;


type LoadAccountsResponse = SalesReportAPIDTOsResponsesAccountWithBalancesResponse;


type LoadAccountsOfbusinessPendingByBusinessIdResponse = SalesReportAPIEntitiesAccount;


type LoadBusinesstransactionsOfbusinessV2ByBusinessIdResponse = SalesReportAPIEntitiesBusinessTransaction;


type LoadSalesperdayByBusinessIdResponse = SalesReportAPIEntitiesSalesPerDay;


type LoadTransactionsExpensesByBusinessIdResponse = SalesReportAPIEntitiesTransaction;

