#!/usr/bin/env node
import { createFile, readFile } from "../helpers/owlFs.js";
import Controller, { Finshup, GetEndpointsByTags } from "./Controller.js";
import { ConvertToFiles } from "./ConvertClientTagsToFiles.js";

const { swaggers, clientDir, groupName } = JSON.parse(await readFile("./eze.config.json"));
// Todo fix duplicate imports
const start = async () => {
  const { endpointsByTags, schemaTypes } = await GetEndpointsByTags(groupName);

  await ConvertToFiles(endpointsByTags);
  await Finshup(schemaTypes);
};

for (const config of swaggers) {
  await Controller.clearOver({
    clientDir,
    config,
    groupName,
    type: "client",
  });
  await start();
}

createBuilder();

function createBuilder() {
  createFile({
    name: "Builder.ts",
    dir: Controller.MainDir,
    content: `import ClientBuilder from "../src/client/ClientBuilder";
    const Builder = new ClientBuilder({
    roots: {
         ${swaggers.map((swg) => `${swg.tag}: "${swg.swaggerUrl.split(".com")[0] + ".com"}"`).join(",\n")}
      },
     });
    //  export const { DELETE, GET, GET_Cashed, PATCH, POST, POST_Cashed, PUT, Offset_Load_Cashed, Page_Load_Cashed, Page_Load, Offset_Load, UPDATE } = Builder;
     export default Builder;
     `,
  });

  createFile({
    dir: Controller.MainDir,
    name: "index.ts",
    content: `
        ${Controller.GroupFolderIndexFiles.map((o) => `import ${o} from "./${o}Client";`).join("\n")}
        export const Client ={
            ${Controller.GroupFolderIndexFiles.map((o) => `...${o},`).join("\n")}
        }`,
    // GroupFolderIndexFiles.map((o) => `export { ${o} } from "./${o}";`).join("\n"),
  });
}
