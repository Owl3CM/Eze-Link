import { createFile, createFolder, deleteFolder, formateScript, runCommand } from "./owlFs.js";
import { askQuestions, closeRl } from "./askQuestion.js";
import ClientController, { finshup } from "./Client/ClientController.js";

interface Question {
    question: string;
    answer: boolean;
}
// Read command line arguments
export const args = process.argv.slice(2);
export const clientName = args[0] ?? ""; // Directory name passed as argument

export const questions: Record<string, Question> = {
    buildPages: { question: "Build Pagenated Pages", answer: true },
    Separate: { question: "Separate Into Different Folders", answer: false },
    // sure: { question: "are u sure", answer: true },
};
// export const heIsSure = () => questions.sure.answer;

// Check if directory already exists
// if (args.some((o) => o === "-f") === false && (await fileExists(clientDir))) {
//     console.log(`\nDirectory '${clientDir}' already exists. Aborting.\n`);
//     const newQuestions = { override: { question: "override", answer: false } };
//     await askQuestions(newQuestions);
//     if (newQuestions.override.answer === false) process.exit(0);
// }

// if (args.some((o) => o === "-a") === false) await askQuestions(questions);
const split = questions.Separate.answer;
if (split) {
    const newQuestions = { Group: { question: "Group The Seprated Clients Folders In One Client Folder", answer: false } };
    await askQuestions(newQuestions);
    ClientController.IsGroupInClientFolder = newQuestions.Group.answer;
}

const swaggers = {
    // Waha: "https://api.sectors.zone/swagger/v1/swagger.json",
    // GitHub: "https://github.com/github/rest-api-description/blob/main/descriptions/api.github.com/api.github.com.2022-11-28.json",
    Items: "https://items.morabaaapps.com/swagger/v1/swagger.json",
    // Sales: "https://salereports.morabaaapps.com/api",
    // HubAdmin: "https://hubcore.morabaaapps.com/swagger/Admin/swagger.json",
    // HubBusiness: "https://hubcore.morabaaapps.com/swagger/Business/swagger.json",
    // HubSubscriptions: "https://hubcore.morabaaapps.com/swagger/Subscriptions/swagger.json",
    // OwnerTracker: "https://otracker.morabaaapps.com/api",
    // Reps: "https://repsapi.morabaaapps.com/api",
    // Restaurant: "https://rest.morabaaapps.com/api",
    // Tickets: "https://tickets.morabaaapps.com/api",
    // Notifications: "https://notifications.morabaaapps.com/api",
    // OnlineDbBackup: "https://onlinedbbackup.morabaaapps.com/api",
    // DevConsole: "https://devconsole.morabaaapps.com/api",
    // Invoices: "https://saturn.morabaa.cloud/api",
    // Currencies: "https://xchange.morabaaapps.com/api",
    // Raphael: "https://raphael.morabaa.com",
};

const swaggerEntries = Object.entries(swaggers);

if (!split) await ClientController.init(clientName);

let i = 0;
while (i < swaggerEntries.length) {
    await ClientController.generate(swaggerEntries[i] as any, split);
    i++;
}

if (!split) finshup();
else if (ClientController.IsGroupInClientFolder) {
    const { GroupFolderIndexFiles } = ClientController;

    createFile({
        dir: "./src/Client",
        name: "index.ts",
        content: `
        ${GroupFolderIndexFiles.map((o) => `import {${o}} from "./${o}";`).join("\n")}
        export const Client ={
            ${GroupFolderIndexFiles.map((o) => `...${o},`).join("\n")}
        }
        `,
        // GroupFolderIndexFiles.map((o) => `export { ${o} } from "./${o}";`).join("\n"),
    });
}

createFile({
    dir: "./",
    name: "PagenatedClientsNames.json",
    content: `["${ClientController.PagenatedClients.join('","')}"]`,
});

if (questions.buildPages.answer) {
    await runCommand("yarn client-pages");
}
!args.includes("-drs") && deleteFolder("./scriptsJS");

closeRl();
