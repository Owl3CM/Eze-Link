import { createFile, createFolder, formateScript, readFile } from "../helpers/owlFs.js";

// export const generateClient = async ([name, root]: string, split?: boolean) => {
//   try {
//     root = root.includes(".json") ? root : root.split(".com")[0] + ".com/swagger/v1/swagger.json";
//     const data = await fetch(root).then((res) => {
//       if (res.status === 404) return null;
//       return res.json();
//     });
//     // const data = JSON.parse(await readFile("./gitHub.json"))
//     if ((data as any)?.paths === undefined) {
//       Controller.onError({ message: "Bad Swagger", name: "bad" }, `Client generation failed! ${Controller.Name ?? Controller.ApiName}`);
//       return;
//     }

//     const { paths, components, info } = data as any;
//     Controller.ApiName = info.title;
//     Controller.Root = root.split("/swagger")[0];

//     if (split) await Controller.init(name);

//     createFolder(Controller.ClientDir);
//     Controller.SchemaTypes = ExtractSchemaTypes(components.schemas);
//     const tagByMethods = GroupMethodsByTag(paths);

//     ConvertToFiles(tagByMethods);

//     if (split) Finshup();

//     console.log("Client generation completed successfully!");
//   } catch (error) {
//     Controller.onError(error, `Client generation failed! ${Controller.Name ?? Controller.ApiName}`);
//   }
//   createFolder("./TEST", {
//     main: {
//       name: "t.ts",
//       content: Controller.SchemaTypes.join("\n"),
//     },
//   });
// };

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
  if (cleanName.includes("Login")) return `${cleanName}`;
  let extra = "";
  let _newName = cleanName;
  if (cleanName.endsWith("s") && (requestBody || (methodType === "delete" && Object.keys(pathParams).length))) {
    _newName = cleanName.slice(0, -1);
  }

  if (methodType === "get") {
    if (Object.keys(pathParams).length && _newName.includes("By") === false)
      return `${_newName}By${Object.keys(pathParams)
        .map((pp) => pp.charAt(0).toUpperCase() + pp.slice(1))
        .join("And")}`;
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
  pathToBuilder: "../Builder",
  Name: "",
  SchemaTypes: [] as string[],
  AllTagsFunctions: [] as AllTagsFunctions[],
  Root: "",
  ClientDir: "",
  ApiName: "",
  cleanTypeName: (name?: string) => (name ? name.replace(Controller.ApiName, "").replace(/\+/g, "").replace(/\./g, "") : ""),
  insertNewTag: (tag: string, _import: string, call: string) => {
    Controller.AllTagsFunctions[tag] = { _import, call };
  },
  init: async (clientName: string) => {
    const groupName = Controller.IsGroupInClientFolder ? "Client/" : "";
    Controller.ClientDir = `./src/${groupName}${clientName}Client`;
    Controller.Name = Controller.ClientDir.split("/").pop() ?? "";
    Controller.SchemaTypes = [];
    Controller.AllTagsFunctions = [];
    Controller.GroupFolderIndexFiles.push(Controller.Name);
    await createFolder(Controller.ClientDir);
  },
  onError: (error: Error, fileName = "error.txt", extra?: string) => {
    const err = "An error occurred during client generation:" + error.message + "\n" + extra;
    console.error(err);
    createFile({ dir: Controller.ClientDir, content: err, name: fileName });
  },
  IsGroupInClientFolder: false,
  PagenatedClients: [] as string[],
  GroupFolderIndexFiles: [] as string[],

  getMethodCallName,
  getCleanNameFromUrl,
};
export default Controller;

// finshup will be called after all swaggers are generated
const createTypesFile = () => {
  const { SchemaTypes, ClientDir: dir } = Controller;
  createFile({ dir, name: "Types.ts", content: SchemaTypes.join("") });
};
const createIndexFile = () => {
  const { Name, ClientDir: dir } = Controller;
  createFile({ dir, name: "index.ts", content: `export {default as ${Name} } from "./${Name}";` });
};
const createClientFile = () => {
  const { Name, AllTagsFunctions, ClientDir: dir } = Controller;
  const tags = Object.values(AllTagsFunctions);
  const content = `${tags.map(({ _import }) => _import).join("")} const ${Name} = {${tags.map(({ call }) => call).join("")}}; export default ${Name};`;

  createFile({ dir, name: `${Name}.ts`, content });
};

export function Finshup() {
  createClientFile();
  createTypesFile();
  createIndexFile();
  // formateScript(ClientController.ClientDir);
}

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
