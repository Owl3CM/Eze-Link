import Builder from "../../Builder";
export const getBusinessesClient = {
  delete_Businesse: async ({ id }: delete_BusinesseParams) => Builder.DELETE({ root: "sales", url: `/api/v1/businesses/${id}` }),

  BusinessesOfclientByPhoneNumber: async ({ phoneNumber }: BusinessesOfclientByPhoneNumberParams) =>
    Builder.GET_Cashed<SalesReportAPIDTOsResponsesBusinessAndBalances>({ root: "sales", url: `/api/v1/businesses/ofclient/${phoneNumber}` }),
};
