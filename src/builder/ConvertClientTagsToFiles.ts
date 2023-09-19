import { createFolder } from "../helpers/owlFs.js";
import Controller from "./Controller.js";
import { EndpointsByTags, TagedMethod } from "./groupMethodsByTag.js";
import { IPaths } from "./PathsTypes.js";

const syncTagsFunctions = () => {
  let _import = `import {`;
  let call = "";
  Object.entries(_TagsAdded).forEach(([name, funcName]) => {
    _import += ` ${funcName},`;
    call += `    ${name}: ${funcName},\n`;
  });
  _import += `} from "./${_CurrentTag}";\n`;
  Controller.insertNewTag(_CurrentTag, _import, call);
  _TagsAdded = {};
};

const newTagCreated = ({ name, funcName }: { name: string; funcName: string }) => {
  _TagsAdded[name] = funcName;
};

let _CurrentTag = "";
let _TypesContent: string[] = [];
let _TagContents = "";
let _TagsAdded: IKeyValue = {};
let _ExtraFunctinos: string[] = [];

const clearOver = () => {
  _TypesContent = [];
  _TagContents = "";
  _ExtraFunctinos = [];
};

export const ConvertToFiles = (endpointsByTags: EndpointsByTags) => {
  createFolder(Controller.ClientDir);
  Object.entries(endpointsByTags).forEach(([tag, methods]) => {
    clearOver();
    _CurrentTag = tag;
    const funcName = `get${_CurrentTag}Client`;
    processing(methods, funcName);
    saveToFiles();
    newTagCreated({ name: _CurrentTag, funcName });
    syncTagsFunctions();
  });
};

const processing = (methods: TagedMethod, funcName: string) => {
  const methodsEntries = Object.entries(methods);

  _TagContents = `${getClientHeader(methods)} 
                     export const ${funcName} = { ${methodsEntries.map(getMethodContent as any).join("")} } 
                     ${_ExtraFunctinos.join("\n")}`;
};

const getMethodContent = ([endpoint, method]: [string, EndpointsByTags]) => {
  let methodContent = "";
  const pathName = Controller.getCleanNameFromUrl(endpoint.replace("-", "_")).replace("-", "_");
  Object.entries(method).forEach(([methodType, methodValues]) => {
    const queryParams = methodValues.queryParams;
    const pathParams = methodValues.pathParams ?? {};
    const requestBody = methodValues.requestBody; //?? "any";
    const successResponse = methodValues.successResponse as string;
    const functionName = methodValues?.name ?? Controller.getMethodCallName(methodType, requestBody, pathParams, pathName);
    const TestNaME = functionName as any;

    const itsLoadFunc = queryParams && (queryParams["offset"] || queryParams["Offset"]);
    const extraProp = requestBody ? `${TestNaME.charAt(0).toLowerCase()}${TestNaME.slice(1)}` : false;

    let newType = "any";
    let perlCraises = "";
    let newTypeName = "";
    let calledFunctionProps = "";

    const allParams = { ...pathParams, ...queryParams };

    if (extraProp)
      allParams[extraProp] = {
        type: requestBody,
        required: true,
      };

    const pathParamsContent = Object.keys(pathParams).join(",");

    calledFunctionProps += `({root:"${Controller.Title}",${getUrl(endpoint)}${extraProp ? `, body: ${extraProp}` : ""}${queryParams ? ", params" : ""} })`;

    if (Object.keys(allParams).length) {
      newTypeName = itsLoadFunc ? `Load${TestNaME}Params` : `${TestNaME}Params`;

      newType = getParamsType(newTypeName, allParams);

      if (!_TypesContent.some((t) => t === newType)) {
        if (_TypesContent.find((t) => t.includes(newTypeName))) {
          newTypeName = `${methodType.charAt(0).toUpperCase()}${methodType.slice(1)}${newTypeName}`;
          newType = getParamsType(newTypeName, allParams);
        }
        _TypesContent.push(newType);
      }
    }

    if (pathParamsContent) {
      perlCraises = `({${pathParamsContent}${extraProp ? `, ${extraProp}` : ""}${queryParams ? ", ...params" : ""}}`;
    } else if (queryParams) {
      if (extraProp) perlCraises += `({${extraProp},...params}`;
      else perlCraises = `(params`;
    } else if (extraProp) {
      perlCraises += `(${extraProp}`;
      newTypeName = `${requestBody}`;
      _TypesContent = _TypesContent.filter((t) => t !== newType);
    }
    if (perlCraises) perlCraises += `:${newTypeName})`;
    else perlCraises = "()";

    if (itsLoadFunc) {
      const extraFuncName = `get${TestNaME}PagenatedClient`;
      const changedTypeName = `Load${TestNaME}Response`;
      Controller.SchemaTypes.push("type " + changedTypeName + " = " + successResponse + ";\n\n");
      _ExtraFunctinos.push(
        `export const ${extraFuncName} = Builder.${methodsScripts["offsetLoad"]}<${newTypeName},${changedTypeName}>
                                ({${getPagenatedUrl(endpoint, pathParamsContent)}})`
      );
      if (!Controller.PagenatedClients.includes(TestNaME)) Controller.PagenatedClients.push(TestNaME);
      newTagCreated({ name: `${TestNaME}Pagenated`, funcName: extraFuncName });
      return;
    }

    const response = successResponse ? `<${successResponse}>` : "";
    const calledFunction = `Builder.${methodsScripts[methodType]}${response}`;
    methodContent += `\n    ${functionName}: async ${perlCraises} => 
                 ${calledFunction}${calledFunctionProps},\n`;
  });
  return methodContent;
};

const changeParamsType = (type: string) => {};

//
const getParamsType = (newTypeName, allParams) =>
  `type ${newTypeName}= {
    ${Object.entries(allParams)
      .map(([paramName, paramData]) => {
        if (typeof paramData === "string") {
          if (paramData.includes("?")) return `${paramName} ? : ${paramData.replace("?", "")};\n`;
          return `${paramName} : ${paramData};\n`;
        }
        const { type, required } = paramData as any;
        return `${paramName}${required ? "" : "?"}: ${type};\n`;
      })
      .join("")}
}
`;

const getUrl = (url: string) => {
  if (url.includes("{")) url = url.split("{").join("${");
  return `url:"${url}"`;
};

const getPagenatedUrl = (url: string, pathParamsContent?: string) => {
  if (url.includes("{"))
    return `getUrl:({ ${pathParamsContent} }) => {
            return ${getUrl(url).split(":")[1]};
        }`;
  else return getUrl(url);
};

function saveToFiles() {
  const _client = [
    {
      content: `export * from "./${_CurrentTag}" \n//export * from "./Types"`,
      name: "index.ts",
    },
    {
      content: _TypesContent.map((t) => t.replace("-", "_")).join(""),
      name: "Types.ts",
    },
    {
      content: _TagContents,
      name: `${_CurrentTag}.ts`,
    },
  ];
  createFolder(`${Controller.ClientDir}/${_CurrentTag}`, _client);
}

const getClientHeader = (methods: TagedMethod) => {
  // const values = Object.values(methods);
  // let hasOffset = true;
  // const importMethods = values
  // .map((values) => Object.keys(values))
  // .flat()
  // .filter((value, index, self) => self.indexOf(value) === index);
  // if (hasOffset) {
  //   importMethods.push("load");
  // }
  return `import Builder from "${Controller.pathToBuilder}"; `;
  // const root ="${Controller.Root}";
  // const importMethodsNames = importMethods.map((method) => methodsScripts[method]);
  // return `import { ${importMethodsNames.join(", ")} } from "${Controller.pathToBuilder}"; \n\nconst root ="${Controller.Root}";`;
};

const methodsScripts = {
  offsetLoad: "Offset_Load_Cashed",
  pageLoad: "Page_Load_Cashed",
  get: "GET_Cashed",
  put: "PUT",
  update: "UPDATE",
  delete: "DELETE",
  patch: "PATCH",
  post: "POST_Cashed",
};

type IKeyValue = { [key: string]: string };
