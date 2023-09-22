import { getGroupsOfbusinessByBusinessIdPagenatedClient, getGroupsClient } from "./Groups";
import {
  getItemsPendingV2PagenatedClient,
  getItemsOfownerPagenatedClient,
  getItemsPagenatedClient,
  getItemsOfgroupByGroupIdPagenatedClient,
  getItemsClient,
} from "./Items";
import { getLastUpdatesClient } from "./LastUpdates";
import { getOffersPagenatedClient, getOffersClient } from "./Offers";
import { getPackagesClient } from "./Packages";
import { getStoresOfbusinessByBusinessIdPagenatedClient, getStoresClient } from "./Stores";
const Items = {
  GroupsOfbusinessByBusinessIdPagenated: getGroupsOfbusinessByBusinessIdPagenatedClient,
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
};
export default Items;
