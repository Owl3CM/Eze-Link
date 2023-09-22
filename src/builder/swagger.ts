export const swagger = {
    openapi: "3.0.1",
    info: {
        title: "SalesReport.API",
        version: "v1",
    },
    paths: {
        "/api/v2/accounts/totals": {
            get: {
                tags: ["Accounts"],
                parameters: [
                    {
                        name: "businessId",
                        in: "query",
                        schema: {
                            type: "string",
                            default: "",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SalesReport.API.DTOs.Responses.V2.AccountTotalsResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/accounts": {
            get: {
                tags: ["Accounts"],
                parameters: [
                    {
                        name: "offset",
                        in: "query",
                        schema: {
                            type: "integer",
                            format: "int32",
                        },
                    },
                    {
                        name: "businessId",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "name",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "q",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "idsOnly",
                        in: "query",
                        schema: {
                            type: "boolean",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/SalesReport.API.DTOs.Responses.AccountWithBalancesResponse",
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails",
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Accounts"],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/SalesReport.API.DTOs.Requests.CreateAccountRequest",
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SalesReport.API.Entities.Account",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails",
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Accounts"],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/SalesReport.API.DTOs.Requests.CreateAccountRequest",
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/SalesReport.API.Entities.Account",
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/v1/transactions": {
            post: {
                tags: ["Transactions"],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/SalesReport.API.DTOs.Requests.CreateTransactionRequest",
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SalesReport.API.Entities.Transaction",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            "Microsoft.AspNetCore.Mvc.ProblemDetails": {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        nullable: true,
                    },
                    title: {
                        type: "string",
                        nullable: true,
                    },
                    status: {
                        type: "integer",
                        format: "int32",
                        nullable: true,
                    },
                    detail: {
                        type: "string",
                        nullable: true,
                    },
                    instance: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: {},
            },
            "SalesReport.API.DTOs.Requests.AccountsVerificationRequest": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    accountsIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.BusinessTransactionRequestData": {
                required: ["amount", "currencyId", "date", "type"],
                type: "object",
                properties: {
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    type: {
                        $ref: "#/components/schemas/SalesReport.API.Shared.Enums+BusinessTransactionType",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    description: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.CreateAccountRequest": {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        nullable: true,
                    },
                    name: {
                        type: "string",
                        nullable: true,
                    },
                    accountId: {
                        type: "integer",
                        format: "int32",
                    },
                    mainId: {
                        type: "integer",
                        format: "int32",
                    },
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    phoneNumber: {
                        type: "string",
                        nullable: true,
                    },
                    address: {
                        type: "string",
                        nullable: true,
                    },
                    latitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                    longitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                    deleted: {
                        type: "boolean",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.CreateBusinessTransactionRequest": {
                required: ["businessId", "data"],
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                    },
                    data: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/SalesReport.API.DTOs.Requests.BusinessTransactionRequestData",
                        },
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.CreateSalesPerDayRequest": {
                type: "object",
                properties: {
                    Date: {
                        type: "string",
                        format: "date-time",
                    },
                    SaleInIQD: {
                        type: "number",
                        format: "double",
                    },
                    SaleInUSD: {
                        type: "number",
                        format: "double",
                    },
                    ExpenseInIQD: {
                        type: "number",
                        format: "double",
                    },
                    ExpenseInUSD: {
                        type: "number",
                        format: "double",
                    },
                    ProfitInIQD: {
                        type: "number",
                        format: "double",
                    },
                    ProfitInUSD: {
                        type: "number",
                        format: "double",
                    },
                    PurchasesInIQD: {
                        type: "number",
                        format: "double",
                    },
                    PurchasesInUSD: {
                        type: "number",
                        format: "double",
                    },
                    Ticks: {
                        type: "integer",
                        format: "int64",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.CreateTransactionRequest": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    description: {
                        type: "string",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        nullable: true,
                    },
                    opType: {
                        type: "string",
                        nullable: true,
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    balance: {
                        type: "number",
                        format: "double",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    dateTime: {
                        type: "string",
                        format: "date-time",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.GetAccountIdByMorabaaIdRequest": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    accountIds: {
                        type: "array",
                        items: {
                            type: "integer",
                            format: "int32",
                        },
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.GetAccountsForRepresentativeRequest": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    accountsIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        nullable: true,
                    },
                    name: {
                        type: "string",
                        nullable: true,
                    },
                    q: {
                        type: "string",
                        nullable: true,
                    },
                    offset: {
                        type: "integer",
                        format: "int32",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.SetBalanceRequest": {
                type: "object",
                properties: {
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    state: {
                        type: "string",
                        nullable: true,
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.UpdateAccountBalanceRequest": {
                type: "object",
                properties: {
                    balanceInIQD: {
                        type: "number",
                        format: "double",
                    },
                    balanceInUSD: {
                        type: "number",
                        format: "double",
                    },
                    balanceInIQDState: {
                        type: "string",
                        nullable: true,
                    },
                    balanceInUSDState: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.V2.AddDailyNetRequest": {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    sales: {
                        type: "number",
                        format: "double",
                    },
                    expenses: {
                        type: "number",
                        format: "double",
                    },
                    profit: {
                        type: "number",
                        format: "double",
                    },
                    purchases: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.V2.BusinessTransactionRequestDataV2": {
                required: ["amount", "currencyId", "date", "type"],
                type: "object",
                properties: {
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    type: {
                        $ref: "#/components/schemas/SalesReport.API.Shared.Enums+BusinessTransactionType",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    description: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.V2.CreateBusinessTransactionRequestV2": {
                required: ["businessId", "data"],
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                    },
                    data: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/SalesReport.API.DTOs.Requests.V2.BusinessTransactionRequestDataV2",
                        },
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Requests.V2.CreateTransactionRequest": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    description: {
                        type: "string",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        nullable: true,
                    },
                    opType: {
                        type: "string",
                        nullable: true,
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    balance: {
                        type: "number",
                        format: "double",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    dateTime: {
                        type: "string",
                        format: "date-time",
                    },
                    index: {
                        type: "integer",
                        format: "int32",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.AccountsTotalsResponse": {
                type: "object",
                properties: {
                    creditInIQD: {
                        type: "number",
                        format: "double",
                    },
                    creditInUSD: {
                        type: "number",
                        format: "double",
                    },
                    debtInIQD: {
                        type: "number",
                        format: "double",
                    },
                    debtInUSD: {
                        type: "number",
                        format: "double",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.AccountWithBalancesResponse": {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    businessTitle: {
                        type: "string",
                        nullable: true,
                    },
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    name: {
                        type: "string",
                        nullable: true,
                    },
                    accountId: {
                        type: "integer",
                        format: "int32",
                    },
                    mainId: {
                        type: "integer",
                        format: "int32",
                    },
                    phoneNumber: {
                        type: "string",
                        nullable: true,
                    },
                    address: {
                        type: "string",
                        nullable: true,
                    },
                    balances: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/SalesReport.API.DTOs.Responses.BalanceResponse",
                        },
                        nullable: true,
                    },
                    latitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                    longitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                    isFavorite: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.BalanceResponse": {
                type: "object",
                properties: {
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    state: {
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.BusinessAndBalances": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    businessTitle: {
                        type: "string",
                        nullable: true,
                    },
                    balances: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/SalesReport.API.Entities.Balance",
                        },
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.SalesPerDayChartPoint": {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        nullable: true,
                    },
                    data: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/SalesReport.API.DTOs.Responses.SalesPerDayChartPointInfo",
                        },
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.SalesPerDayChartPointInfo": {
                type: "object",
                properties: {
                    dateFrom: {
                        type: "string",
                        format: "date-time",
                    },
                    dateTo: {
                        type: "string",
                        format: "date-time",
                    },
                    saleInIQD: {
                        type: "number",
                        format: "double",
                    },
                    saleInUSD: {
                        type: "number",
                        format: "double",
                    },
                    expenseInIQD: {
                        type: "number",
                        format: "double",
                    },
                    expenseInUSD: {
                        type: "number",
                        format: "double",
                    },
                    profitInIQD: {
                        type: "number",
                        format: "double",
                    },
                    profitInUSD: {
                        type: "number",
                        format: "double",
                    },
                    purchasesInIQD: {
                        type: "number",
                        format: "double",
                    },
                    purchasesInUSD: {
                        type: "number",
                        format: "double",
                    },
                    saleNet: {
                        type: "number",
                        format: "double",
                        readOnly: true,
                    },
                    expenseNet: {
                        type: "number",
                        format: "double",
                        readOnly: true,
                    },
                    profitNet: {
                        type: "number",
                        format: "double",
                        readOnly: true,
                    },
                    purchasesNet: {
                        type: "number",
                        format: "double",
                        readOnly: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.SalesPerDayOfOwnerResponse": {
                type: "object",
                properties: {
                    businessTitle: {
                        type: "string",
                        nullable: true,
                    },
                    businessCategory: {
                        type: "string",
                        nullable: true,
                    },
                    sales: {
                        $ref: "#/components/schemas/SalesReport.API.Entities.SalesPerDay",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.V2.AccountTotalsResponse": {
                type: "object",
                properties: {
                    credits: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    debts: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    nets: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.V2.DailyNetOfOwnerResponse": {
                type: "object",
                properties: {
                    business: {
                        type: "object",
                        additionalProperties: {
                            type: "string",
                        },
                        nullable: true,
                    },
                    sales: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    expenses: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    purchases: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    profits: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.DTOs.Responses.V2.DailyNetResponse": {
                type: "object",
                properties: {
                    sales: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    expenses: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    purchases: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    profits: {
                        type: "object",
                        additionalProperties: {
                            type: "number",
                            format: "double",
                        },
                        nullable: true,
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.Account": {
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    morabaaId: {
                        type: "integer",
                        format: "int32",
                    },
                    name: {
                        maxLength: 512,
                        type: "string",
                        nullable: true,
                    },
                    accountId: {
                        type: "integer",
                        format: "int32",
                    },
                    mainId: {
                        type: "integer",
                        format: "int32",
                    },
                    phoneNumber: {
                        maxLength: 256,
                        type: "string",
                        nullable: true,
                    },
                    address: {
                        maxLength: 512,
                        type: "string",
                        nullable: true,
                    },
                    longitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                    latitude: {
                        type: "number",
                        format: "double",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.Balance": {
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    accountGuid: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    account: {
                        $ref: "#/components/schemas/SalesReport.API.Entities.Account",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    state: {
                        maxLength: 128,
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.BusinessTransaction": {
                required: ["amount", "businessId", "currencyId", "date", "transactionType"],
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        maxLength: 36,
                        type: "string",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    transactionType: {
                        $ref: "#/components/schemas/SalesReport.API.Shared.Enums+BusinessTransactionType",
                    },
                    description: {
                        maxLength: 1024,
                        type: "string",
                        nullable: true,
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.DailyNet": {
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    sales: {
                        type: "number",
                        format: "double",
                    },
                    expenses: {
                        type: "number",
                        format: "double",
                    },
                    profit: {
                        type: "number",
                        format: "double",
                    },
                    purchases: {
                        type: "number",
                        format: "double",
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.LastUpdate": {
                required: ["businessId"],
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        maxLength: 36,
                        type: "string",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.SalesPerDay": {
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    businessId: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    saleInIQD: {
                        type: "number",
                        format: "double",
                    },
                    saleInUSD: {
                        type: "number",
                        format: "double",
                    },
                    expenseInIQD: {
                        type: "number",
                        format: "double",
                    },
                    expenseInUSD: {
                        type: "number",
                        format: "double",
                    },
                    profitInIQD: {
                        type: "number",
                        format: "double",
                    },
                    profitInUSD: {
                        type: "number",
                        format: "double",
                    },
                    purchasesInIQD: {
                        type: "number",
                        format: "double",
                    },
                    purchasesInUSD: {
                        type: "number",
                        format: "double",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Entities.Transaction": {
                type: "object",
                properties: {
                    id: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    accountGuid: {
                        maxLength: 36,
                        type: "string",
                        nullable: true,
                    },
                    account: {
                        $ref: "#/components/schemas/SalesReport.API.Entities.Account",
                    },
                    description: {
                        maxLength: 1024,
                        type: "string",
                        nullable: true,
                    },
                    status: {
                        maxLength: 256,
                        type: "string",
                        nullable: true,
                    },
                    opType: {
                        maxLength: 256,
                        type: "string",
                        nullable: true,
                    },
                    currencyId: {
                        type: "integer",
                        format: "int32",
                    },
                    balance: {
                        type: "number",
                        format: "double",
                    },
                    amount: {
                        type: "number",
                        format: "double",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    index: {
                        type: "integer",
                        format: "int32",
                    },
                },
                additionalProperties: false,
            },
            "SalesReport.API.Shared.Enums+BusinessTransactionType": {
                enum: [0, 1, 2, 3, 4, 5],
                type: "integer",
                format: "int32",
            },
            "SalesReport.API.Shared.Enums+SalesReportType": {
                enum: [0, 1, 2],
                type: "integer",
                format: "int32",
            },
        },
        securitySchemes: {
            Bearer: {
                type: "apiKey",
                description: "Auth Token",
                name: "Authorization",
                in: "header",
            },
        },
    },
    security: [
        {
            Bearer: [],
        },
    ],
};
