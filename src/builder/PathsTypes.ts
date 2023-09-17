import { TypeProp } from "./ComponentsTypes";

export type Method = {
    tags: string[];
    parameters: IParam[];
    responses: {
        [key: string]: IResponse;
    };
    requestBody?: IRequest;
};

export type IRequest = {
    content: {
        "application/json": {
            schema: { type: "array"; items: { $ref: string }; $ref: string };
        };
    };
};

export type IResponse = {
    description: string;
    content: {
        "application/json": {
            schema: {
                $ref: string;
                type: "array";
                items: { $ref: string };
            };
        };
    };
};

export type IParam = {
    name: string;
    in: "query" | "path";
    schema: ParamSchema;
};
export type IType = "string" | "number" | "integer" | "boolean" | "array" | "object";
export type ParamSchema = {
    type: IType;
    formate?: string;
};
export type IMethodType = "get" | "post" | "put" | "delete" | "patch" | "update";

export interface IPaths {
    [key: string]: {
        get?: Method;
        put?: Method;
        post?: Method;
        delete?: Method;
        update?: Method;
    };
}

export type IComponentsProperties = {
    type: IType;
    nullable: boolean;
    items?: {
        $ref?: string;
    };
    $ref?: string;
};

export type IComponentsSchemas = {
    type: IType;
    properties: {
        [key: string]: IComponentsProperties;
    };
    enum?: string[];
};
export interface IComponents {
    schemas: {
        [key: string]: IComponentsSchemas;
    };
}
export interface ISwagger {
    paths: IPaths;
    components: IComponents;
}
