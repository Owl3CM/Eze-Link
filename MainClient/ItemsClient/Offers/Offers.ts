import Builder from "../../Builder";
export const getOffersClient = {
  createOffer: async (createOffer: MorabaaItemSolutionRESTAPIDTOsRequestsCreateOfferRequest) =>
    Builder.POST_Cashed({ root: "items", url: `/api/v1/offers`, body: createOffer }),

  editOffer: async ({ id, editOffer }: editOfferParams) =>
    Builder.PUT<MorabaaItemSolutionDomainInterfacesIItemOffer>({ root: "items", url: `/api/v1/offers/${id}`, body: editOffer }),

  delete_Offer: async ({ id }: delete_OfferParams) => Builder.DELETE({ root: "items", url: `/api/v1/offers/${id}` }),
};
export const getOffersPagenatedClient = Builder.Offset_Load_Cashed<LoadOffersParams, LoadOffersResponse[]>({ url: `/api/v1/offers` });
