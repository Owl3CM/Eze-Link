type AccountsTotalsV2Params= {
    businessId : string;

}
type LoadAccountsParams= {
    offset : number;
businessId : string;
name : string;
q : string;
idsOnly : boolean;

}
type AccountsSearchParams= {
    businessId : string;
accountName : string;

}
type AccountsTotalsParams= {
    businessId : string;

}
type AccountsCountParams= {
    businessId : string;

}
type AccountsByIdParams= {
    id ? : string;

}
type patch_AccountParams= {
    id ? : string;
patch_Account: SalesReportAPIDTOsRequestsUpdateAccountBalanceRequest;

}
type delete_AccountParams= {
    businessId ? : string;
morabaaId ? : number;

}
type AccountsBalancesByIdParams= {
    id ? : string;

}
type AccountsByphoneParams= {
    businessId ? : string;
phoneNumber ? : string;

}
type LoadAccountsOfbusinessPendingByBusinessIdParams= {
    businessId ? : string;
offset : number;

}
type post_AccountsToggle_favoriteParams= {
    id ? : string;

}
