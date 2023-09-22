import Builder from "../../Builder";
export const getPackagesClient = {
  PackagesOfbusinessByBusinessId: async ({ businessId }: PackagesOfbusinessByBusinessIdParams) =>
    Builder.GET_Cashed<MorabaaItemSolutionDomainInterfacesIPackage>({ root: "items", url: `/api/v1/packages/ofbusiness/${businessId}` }),

  createPackagesOfbusinessDetail: async ({ businessId }: createPackagesOfbusinessDetailParams) =>
    Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIPackage>({ root: "items", url: `/api/v1/packages/ofbusiness/${businessId}/details` }),

  createPackagesDetail: async () => Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIPackage>({ root: "items", url: `/api/v1/packages/details` }),
};
