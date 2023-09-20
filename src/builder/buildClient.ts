#!/usr/bin/env node
import chalk from "chalk";
import { createFile, readFile, runCommand, writeFile } from "../helpers/owlFs.js";
import Controller from "./Controller.js";
import { ConvertToFiles } from "./ConvertClientTagsToFiles.js";

const { swaggers, clientDir, groupName } = JSON.parse(await readFile("./eze.config.json"));
const start = async () => {
  const endpointsByTags = await GetGeneratedConfigs(groupName);

  await ConvertToFiles(endpointsByTags);
  await Finshup();
};

for (const config of swaggers) {
  await Controller.clearOver({ clientDir, config, groupName, type: "client" });
  await start();
}

await createBuilder();
await createMainIndex();

console.log(chalk.green("\nDone!"));
console.log(chalk.cyanBright("Running Prettier...\n"));

runCommand(`start /B npx prettier --write ${Controller.MainDir}/**/*`);

async function createBuilder() {
  await createFile({
    name: "Builder.ts",
    dir: Controller.MainDir,
    // content: `import ClientBuilder from "../src/client/ClientBuilder";
    content: `import ClientBuilder from "eze-link";
    const Builder = new ClientBuilder({
    roots: {
         ${swaggers.map((swg) => `${swg.tag}: "${swg.swaggerUrl.split(".com")[0] + ".com"}"`).join(",\n")}
      },
      storeKey: "${groupName}",
     });
    //  export const { DELETE, GET, GET_Cashed, PATCH, POST, POST_Cashed, PUT, Offset_Load_Cashed, Page_Load_Cashed, Page_Load, Offset_Load, UPDATE } = Builder;
      export default Builder;
     `,
  });
}

async function createMainIndex() {
  await createFile({
    dir: Controller.MainDir,
    name: "index.ts",
    content: `
        ${Controller.GroupFolderIndexFiles.map((o) => `import ${o} from "./${o}Client";`).join("\n")}
        export const Client ={
            ${Controller.GroupFolderIndexFiles.map((o) => `...${o},`).join("\n")}
        }
        export { default as Builder } from "./Builder";
        `,
    // GroupFolderIndexFiles.map((o) => `export { ${o} } from "./${o}";`).join("\n"),
  });
}

export async function Finshup() {
  await createIndexFile();
  await createTypesFile();
}

async function createTypesFile() {
  const typesDir = `${Controller.ConfigDir}/${Controller.Name}_Types.ts`;
  // const schemaTypes = (await readFile(typesDir)).split("\n");
  const content = Controller.SchemaTypes.join("\n");
  // writeFile({ dir: typesDir, content });
  // const { SchemaTypes, ClientDir: dir } = Controller;
  await createFile({ dir: `${Controller.ConfigDir}`, name: `${Controller.Name}_ExtraTypes.ts`, content: content });
}

async function createIndexFile() {
  const { Name, AllTagsFunctions, ClientDir: dir } = Controller;
  const tags = Object.values(AllTagsFunctions);
  const content = `${tags.map(({ _import }) => _import).join("")} const ${Name} = {${tags.map(({ call }) => call).join("")}}; export default ${Name};`;
  await createFile({ dir, name: `index.ts`, content });
}

async function GetGeneratedConfigs(groupName) {
  Controller.ConfigDir = `${groupName}Configs`;
  const endpointsByTags = JSON.parse(await readFile(`${Controller.ConfigDir}/${Controller.Name}_EndpointsByTags.json`));
  return endpointsByTags;
}
