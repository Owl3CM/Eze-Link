type LoadSalesperdayByBusinessIdParams= {
    businessId ? : string;
offset : number;

}
type createSalesperdayParams= {
    businessId ? : string;
createSalesperday: SalesReportAPIDTOsRequestsCreateSalesPerDayRequest;

}
type createSalesperdayChartreportParams= {
    dt : string;
reportType : SalesReportAPISharedEnumsSalesReportType;
viewCurrencyId : number;

}
