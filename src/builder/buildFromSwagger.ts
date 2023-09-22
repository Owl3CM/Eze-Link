#!/usr/bin/env node
import { readFile } from "../helpers/owlFs.js";
import fetch from "node-fetch";
import Controller, { CreateConfigFolder } from "./Controller.js";
import { ExtractSchemaTypes } from "./extractSchemaTypes.js";
import { GroupEndpointsByTags } from "./groupMethodsByTag.js";

const { swaggers, groupName, clientDir } = JSON.parse(await readFile("./eze.config.json"));

const start = async (config) => {
  const data = (await fetch(config.swaggerUrl).then((res) => (res.status === 404 ? {} : res.json()))) as any;

  if (data?.paths === undefined) {
    Controller.onError({ message: "Bad Swagger", name: "bad" }, `Client generation failed! , Swagger:${Controller.Root}`);
    return;
  }
  const { paths, components } = data;

  Controller.SchemaTypes = await ExtractSchemaTypes(components.schemas);
  const endpointsByTags = await GroupEndpointsByTags(paths);

  CreateConfigFolder(endpointsByTags);
};

for (const config of swaggers) {
  await Controller.clearOver({ config, clientDir, groupName, type: "swagger" });
  await start(config);
}

// export const ClientRoots = {
//   hub: "https://hubcore.morabaaapps.com/api",
//   items: "https://items.morabaaapps.com/api",
//   ownerTracker: "https://otracker.morabaaapps.com/api",
//   sales: "https://salereports.morabaaapps.com/api",
//   reps: "https://repsapi.morabaaapps.com/api",
//   restaurant: "https://rest.morabaaapps.com/api",
//   tickets: "https://tickets.morabaaapps.com/api",
//   notifications: "https://notifications.morabaaapps.com/api",
//   onlineDbBackup: "https://onlinedbbackup.morabaaapps.com/api",
//   devConsole: "https://devconsole.morabaaapps.com/api",
//   invoices: "https://saturn.morabaa.cloud/api",
//   currencies: "https://xchange.morabaaapps.com/api",
//   raphael: "https://raphael.morabaa.com",
// };
