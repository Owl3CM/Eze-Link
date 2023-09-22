import Builder from "../../Builder";
export const getGroupsClient = {
  createGroupsDetail: async () => Builder.POST_Cashed<MorabaaItemSolutionDomainInterfacesIGroup>({ root: "items", url: `/api/v1/groups/details` }),

  post_GroupsImages: async () => Builder.POST_Cashed({ root: "items", url: `/api/v1/groups/images` }),
};
export const getGroupsOfbusinessByBusinessIdPagenatedClient = Builder.Offset_Load_Cashed<
  LoadGroupsOfbusinessByBusinessIdParams,
  LoadGroupsOfbusinessByBusinessIdResponse[]
>({
  getUrl: ({ businessId }) => {
    return `/api/v1/groups/ofbusiness/${businessId}`;
  },
});
