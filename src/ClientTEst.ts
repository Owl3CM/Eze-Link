import { getItemsOfownerPagenatedClient, getItemsClient } from "./Items";
const Client = {
  ItemsPagenated: getItemsOfownerPagenatedClient,
  Items: getItemsClient,
};
export default Client;
