import ClientBuilder from "../src/client/ClientBuilder";
const Builder = new ClientBuilder({
  roots: {
    items: "https://items.morabaaapps.com",
    sales: "https://salereports.morabaaapps.com",
  },
  storeKey: "MainClient",
});
//  export const { DELETE, GET, GET_Cashed, PATCH, POST, POST_Cashed, PUT, Offset_Load_Cashed, Page_Load_Cashed, Page_Load, Offset_Load, UPDATE } = Builder;
export default Builder;
