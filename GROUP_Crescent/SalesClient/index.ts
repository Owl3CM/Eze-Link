import { getGroupsOfbusinessByBusinessIdPagenatedClient, getGroupsClient,} from "./Groups";
import { getItemsPendingV2PagenatedClient, getItemsOfownerPagenatedClient, getItemsPagenatedClient, getItemsOfgroupByGroupIdPagenatedClient, getItemsClient,} from "./Items";
import { getLastUpdatesClient,} from "./LastUpdates";
import { getOffersPagenatedClient, getOffersClient,} from "./Offers";
import { getPackagesClient,} from "./Packages";
import { getStoresOfbusinessByBusinessIdPagenatedClient, getStoresClient,} from "./Stores";
import { getAccountsPagenatedClient, getAccountsOfbusinessPendingByBusinessIdPagenatedClient, getAccountsClient,} from "./Accounts";
import { getBalancesClient,} from "./Balances";
import { getBusinessesClient,} from "./Businesses";
import { getBusinessTransactionsClient,} from "./BusinessTransactions";
import { getBusinesstransactionsOfbusinessV2ByBusinessIdPagenatedClient, getBusinessTransactionsV2Client,} from "./BusinessTransactionsV2";
import { getNetsClient,} from "./Nets";
import { getSalesperdayByBusinessIdPagenatedClient, getSalesPerDayClient,} from "./SalesPerDay";
import { getTransactionsExpensesByBusinessIdPagenatedClient, getTransactionsClient,} from "./Transactions";
 const Sales = {    GroupsOfbusinessByBusinessIdPagenated: getGroupsOfbusinessByBusinessIdPagenatedClient,
    Groups: getGroupsClient,
    ItemsPendingV2Pagenated: getItemsPendingV2PagenatedClient,
    ItemsOfownerPagenated: getItemsOfownerPagenatedClient,
    ItemsPagenated: getItemsPagenatedClient,
    ItemsOfgroupByGroupIdPagenated: getItemsOfgroupByGroupIdPagenatedClient,
    Items: getItemsClient,
    LastUpdates: getLastUpdatesClient,
    OffersPagenated: getOffersPagenatedClient,
    Offers: getOffersClient,
    Packages: getPackagesClient,
    StoresOfbusinessByBusinessIdPagenated: getStoresOfbusinessByBusinessIdPagenatedClient,
    Stores: getStoresClient,
    AccountsPagenated: getAccountsPagenatedClient,
    AccountsOfbusinessPendingByBusinessIdPagenated: getAccountsOfbusinessPendingByBusinessIdPagenatedClient,
    Accounts: getAccountsClient,
    Balances: getBalancesClient,
    Businesses: getBusinessesClient,
    BusinessTransactions: getBusinessTransactionsClient,
    BusinesstransactionsOfbusinessV2ByBusinessIdPagenated: getBusinesstransactionsOfbusinessV2ByBusinessIdPagenatedClient,
    BusinessTransactionsV2: getBusinessTransactionsV2Client,
    Nets: getNetsClient,
    SalesperdayByBusinessIdPagenated: getSalesperdayByBusinessIdPagenatedClient,
    SalesPerDay: getSalesPerDayClient,
    TransactionsExpensesByBusinessIdPagenated: getTransactionsExpensesByBusinessIdPagenatedClient,
    Transactions: getTransactionsClient,
}; export default Sales;