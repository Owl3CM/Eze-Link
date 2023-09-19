import Controller from "./Controller.js";
import { IPaths, IRequest, IResponse } from "./PathsTypes.js";
import { extractType } from "./extractSchemaTypes.js";

export type TagedMethod = {
  pathParams?: {
    [key: string]: {
      required: boolean;
      type: string;
    };
  };
  queryParams?: {
    [key: string]: string;
  };
  requestBody?: string;
  successResponse?: string;
};

export type EndpointsByTags = {
  [key: string]: {
    [key: string]: TagedMethod;
  };
};

export const GroupEndpointsByTags = (paths: IPaths) => {
  const tagByMethod: EndpointsByTags = {};

  try {
    Object.entries(paths).forEach(([path, pathData]) => {
      const pathMethods = Object.keys(pathData);

      pathMethods.forEach((method) => {
        const { tags, parameters, responses, requestBody } = pathData[method]; //tags string[] & parameters:query & response :200
        const tag = tags.join("_");
        if (!tagByMethod[tag]) tagByMethod[tag] = {};
        if (!tagByMethod[tag][path]) tagByMethod[tag][path] = {};

        const holder = tagByMethod[tag][path];
        const { pathParams, queryParams } = getParameters(parameters);
        const pathName = Controller.getCleanNameFromUrl(path?.replace("-", "_"))?.replace("-", "_");
        holder[method] = {
          pathParams: pathParams,
          queryParams: queryParams,
          requestBody: getRequestBodySchema(requestBody),
          successResponse: getMethodSuccessResponseSchema(responses),
          name: Controller.getMethodCallName(method, requestBody, pathParams, pathName),
        };

        // remove empty objects
        Object.keys(holder[method]).forEach((key) => {
          if (!holder[method][key]) {
            delete holder[method][key];
          }
        });
      });
    });
  } catch (error) {
    Controller.onError(error);
  }
  return tagByMethod;
};

const getParameters = (parameters: any[]) => {
  const pathParams = {};
  const queryParams = {};
  if (!parameters) return {};
  parameters.forEach(({ name, schema, required, in: _in }) => {
    // if (_in === "path") pathParams[name] = { required, type: extractType(schema) };
    // else if (_in === "query") queryParams[name] = { required, type: extractType(schema) };
    if (_in === "path") pathParams[name] = `${extractType(schema)}${required ? "?" : ""}`;
    else if (_in === "query") queryParams[name] = `${extractType(schema)}${required ? "?" : ""}`;
    // else if (_in === "body") queryParams[name] = extractType(schema);
    // else if (_in === "formData") queryParams[name] = extractType(schema);
    // else if (_in === "header") queryParams[name] = extractType(schema);
    // else if (_in === "cookie") queryParams[name] = extractType(schema);
  });
  return { pathParams: Object.keys(pathParams).length ? pathParams : null, queryParams: Object.keys(queryParams).length ? queryParams : null };
};

const getMethodSuccessResponseSchema = (responses: { [key: string]: IResponse }) => {
  const successResponse = Object.entries(responses).find(([key, value]) => key.startsWith("2"))?.[1];
  if (successResponse && successResponse.content && successResponse.content["application/json"]) {
    const responseSchema = successResponse.content["application/json"]?.schema;
    if (!responseSchema) return null;
    const ref = (responseSchema.$ref ?? responseSchema.items?.$ref)?.split("/")?.pop();
    return Controller.cleanTypeName(ref);
  }
  return null;
};

const getRequestBodySchema = (requestBody?: IRequest) => {
  if (requestBody && requestBody.content && requestBody.content["application/json"]) {
    const responseSchema = requestBody.content["application/json"].schema;
    if (!responseSchema) return null;
    const ref = (responseSchema.$ref ?? responseSchema.items?.$ref)?.split("/")?.pop();
    return Controller.cleanTypeName(ref);
  }
  return null;
};
