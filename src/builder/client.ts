#!/usr/bin/env node
import { createFile, createFolder, readFile } from "../helpers/owlFs.js";
import fetch from "node-fetch";
import Controller, { Finshup } from "./Controller.js";
import { ExtractSchemaTypes } from "./extractSchemaTypes.js";
import { GroupMethodsByTag } from "./groupMethodsByTag.js";
import { ConvertToFiles } from "./ConvertClientTagsToFiles.js";

const config = JSON.parse(await readFile("./eze.config.json"));

const start = async () => {
  const root = config.swaggerUrl.split("/swagger")[0];

  const data = (await fetch(config.swaggerUrl).then((res) => {
    if (res.status === 404) return null;
    return res.json();
  })) as any;

  const { paths, components } = data as any;
  Controller.ApiName = config.name;
  Controller.Root = root;
  Controller.ClientDir = config.clientDir;

  createFolder(Controller.ClientDir);
  Controller.SchemaTypes = ExtractSchemaTypes(components.schemas);
  const tagByMethods = GroupMethodsByTag(paths);

  // if (config.buildFiles)
  await ConvertToFiles(tagByMethods);

  if (data?.paths === undefined) {
    Controller.onError({ message: "Bad Swagger", name: "bad" }, `Client generation failed! ${Controller.Name ?? Controller.ApiName}`);
    return;
  }
};

await Controller.init(config.clientName);

await start();

Finshup();

// const test = () => {

//   else if (Controller.IsGroupInClientFolder) {
//     const { GroupFolderIndexFiles } = Controller;

//     createFile({
//       dir: "./src/Client",
//       name: "index.ts",
//       content: `
//         ${GroupFolderIndexFiles.map((o) => `import {${o}} from "./${o}";`).join("\n")}
//         export const Client ={
//             ${GroupFolderIndexFiles.map((o) => `...${o},`).join("\n")}
//         }
//         `,
//       // GroupFolderIndexFiles.map((o) => `export { ${o} } from "./${o}";`).join("\n"),
//     });
//   }
// };
