type IParamType = any; // "string" | "number" | "boolean" | "number?" | "string?" | "boolean?" | "any";
type IParamObjType = {
  [key: string]: {
    required?: boolean;
    type: IParamType;
  };
};

type IMethod = "get" | "post" | "put" | "delete" | "patch" | "update";

type IParams =
  | IParamObjType
  | {
      [key: string]: IParamType;
    };

type TagedMethod = {
  pathParams?: IParams;
  queryParams?: IParams;
  requestBody?: string;
  successResponse?: string;
};

type TagedMethods = {
  [key: string]: {
    [key in IMethod]?: TagedMethod;
  };
};

const testSample: TagedMethods = {
  "api/v1/test": {
    get: {
      queryParams: {
        id: "string",
        name: "string",
      },
      pathParams: {
        id: {
          type: "string",
          required: true,
        },
      },
      requestBody: "test",
    },
  },
};
