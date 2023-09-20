import { createFile, createFolder, formateScript, readFile } from "../helpers/owlFs.js";
import { EndpointsByTags } from "./groupMethodsByTag.js";

const getCleanNameFromUrl = (url: string) => {
  let version = "";
  const urlArr = url.split("/").filter((item) => !item.includes("{"));
  if (url.includes("api")) {
    return (
      urlArr
        .map((item, i) => {
          if (i < 2) return;
          else if (i === 2) {
            version = checkVersion(item);
            return;
          }
          item = item.replace(/api/g, "");
          return item.charAt(0).toUpperCase() + item.slice(1);
        })
        .join("") + version
    );
  } else {
    return urlArr.map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join("") + version;
  }
};
const checkVersion = (v: string) => {
  return ["v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10", "v11", "v12", "v13"].includes(v) ? v.toUpperCase() : "";
};

const getMethodCallName = (methodType: string, requestBody: any, pathParams: any, cleanName: string) => {
  if (!cleanName) cleanName = "notFound";
  if (cleanName.includes("Login")) return `${cleanName}`;
  const pathKeys = Object.keys(pathParams ?? {});
  let extra = "";
  let _newName = cleanName;
  if (cleanName.endsWith("s") && (requestBody || (methodType === "delete" && pathKeys.length))) {
    _newName = cleanName.slice(0, -1);
  }
  if (methodType === "get") {
    if (pathKeys.length && _newName.includes("By") === false)
      return `${_newName}By${pathKeys.map((pp) => pp.charAt(0).toUpperCase() + pp.slice(1)).join("And")}`;
  } else if (methodType === "post") {
    extra = requestBody ? "create" : "post_";
  } else if (methodType === "put") {
    extra = requestBody ? "edit" : "put_";
  } else if (methodType === "delete") {
    extra = requestBody ? "delete" : "delete_";
    if (_newName.includes("Delete")) extra = "delete_";
  } else extra = `${methodType}_`;
  return `${extra}${_newName}`;
};

const Controller = {
  pathToBuilder: "../../Builder",
  Name: "",
  Title: "",
  SchemaTypes: [] as string[],
  AllTagsFunctions: [] as AllTagsFunctions[],
  ConfigDir: "",
  Root: "",
  ClientDir: "",
  ApiName: "",
  cleanTypeName: (name?: string) => (name ? name.replace(Controller.ApiName, "").replace(/\+/g, "").replace(/\./g, "") : ""),
  insertNewTag: (tag: string, _import: string, call: string) => {
    Controller.AllTagsFunctions[tag] = { _import, call };
  },
  clearOver: async ({ config, groupName, clientDir, type }) => {
    Controller.Root = config.swaggerUrl.split("/swagger")[0];
    const mainDir = `${clientDir}/${groupName}`;
    Controller.MainDir = mainDir;
    Controller.ConfigDir = `${groupName}Configs`;
    Controller.Name = config.name;

    if (type === "client") {
      Controller.AllTagsFunctions = [];
      Controller.ApiName = config.name;
      Controller.Title = config.tag;
      Controller.ClientDir = `${mainDir}/${config.name}Client`;
      await createFolder(mainDir);
      Controller.GroupFolderIndexFiles.push(Controller.Name);
      // await createFolder(Controller.ClientDir);
    } else if (type === "swagger") {
      Controller.SchemaTypes = [];
    }
  },
  onError: (error: Error, fileName = "error.txt", extra?: string) => {
    const err = "An error occurred during client generation:" + error.message + "\n" + extra;
    console.error(err);
    createFile({ dir: Controller.ClientDir, content: err, name: fileName });
  },
  IsGroupInClientFolder: false,
  PagenatedClients: [] as string[],
  GroupFolderIndexFiles: [] as string[],
  MainDir: "",

  getMethodCallName,
  getCleanNameFromUrl,
};

export default Controller;

export const CreateConfigFolder = (endpointsByTags: EndpointsByTags) => {
  console.log("CreateConfigFolder", Controller.ConfigDir);

  createFolder(Controller.ConfigDir, [
    {
      name: `${Controller.Name}_EndpointsByTags.json`,
      content: `${JSON.stringify(endpointsByTags, null, 4)}`,
    },
    {
      name: `${Controller.Name}_Types.ts`,
      content: Controller.SchemaTypes.join(""),
    },
  ]);
};

type IClientController = typeof Controller;
// {
//     SchemaTypes: string[];
//     AllTagsFunctions: AllTagsFunctions[];
//     Root: string;
//     ClientDir: string;
//     Name: string;
//     ApiName: string;
//     cleanTypeName: (name?: string) => string;
//     insertNewTag: (tag: string, _import: string, call: string) => void;
//     init: (clientName: string) => void;
//     onError: (error: Error, fileName?: string, extra?: string) => void;
//     generate: ([name, root]: string, split?: boolean) => Promise<void>;
//     IsGroupInClientFolder: boolean;
//     PagenatedClients: string[];
//     GroupFolderIndexFiles: string[];
// }

type AllTagsFunctions = {
  [key: string]: {
    call: string;
    _import: string;
  };
};
