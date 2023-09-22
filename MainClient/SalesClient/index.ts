import { getAccountsPagenatedClient, getAccountsOfbusinessPendingByBusinessIdPagenatedClient, getAccountsClient } from "./Accounts";
import { getBalancesClient } from "./Balances";
import { getBusinessesClient } from "./Businesses";
import { getBusinessTransactionsClient } from "./BusinessTransactions";
import { getBusinesstransactionsOfbusinessV2ByBusinessIdPagenatedClient, getBusinessTransactionsV2Client } from "./BusinessTransactionsV2";
import { getLastUpdatesClient } from "./LastUpdates";
import { getNetsClient } from "./Nets";
import { getSalesperdayByBusinessIdPagenatedClient, getSalesPerDayClient } from "./SalesPerDay";
import { getTransactionsExpensesByBusinessIdPagenatedClient, getTransactionsClient } from "./Transactions";
const Sales = {
  AccountsPagenated: getAccountsPagenatedClient,
  AccountsOfbusinessPendingByBusinessIdPagenated: getAccountsOfbusinessPendingByBusinessIdPagenatedClient,
  Accounts: getAccountsClient,
  Balances: getBalancesClient,
  Businesses: getBusinessesClient,
  BusinessTransactions: getBusinessTransactionsClient,
  BusinesstransactionsOfbusinessV2ByBusinessIdPagenated: getBusinesstransactionsOfbusinessV2ByBusinessIdPagenatedClient,
  BusinessTransactionsV2: getBusinessTransactionsV2Client,
  LastUpdates: getLastUpdatesClient,
  Nets: getNetsClient,
  SalesperdayByBusinessIdPagenated: getSalesperdayByBusinessIdPagenatedClient,
  SalesPerDay: getSalesPerDayClient,
  TransactionsExpensesByBusinessIdPagenated: getTransactionsExpensesByBusinessIdPagenatedClient,
  Transactions: getTransactionsClient,
};
export default Sales;
