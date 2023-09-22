import path from "path";
import { deleteFolder, fileExists, formateScript } from "./owlFs.js";
import { askQuestions, closeRl } from "./askQuestion.js";
import { UtilsBuilder } from "./page/builders/UtilsBuilder.js";
import { ComponentsBuilder } from "./page/builders/ComponentsBuilder.js";
import { PageBuilder } from "./page/builders/PageBuilder.js";

interface Question {
    question: string;
    answer: boolean;
}
// Read command line arguments
export const args = process.argv.slice(2);
export const rootDir = args?.[args.indexOf("-dir") + 1] ?? "./src/pages";
export const pageName = args?.[args.indexOf("-n") + 1] ?? "NO_NAME";
export const pageDir = path.join(rootDir, pageName);
export const pageUpperName = `${pageName.slice(0, 1).toUpperCase()}${pageName.slice(1)}`;
export const questions: Record<string, Question> = {
    addService: { question: "add Service", answer: true },
    addQueryBuilder: { question: "add QueryBuilder", answer: true },
    addComponents: { question: "add Components", answer: true },
    addUtils: { question: "add Utils", answer: true },
    addCss: { question: "add Css", answer: true },
};

export const hasService = () => questions.addService.answer;
export const hasComponents = () => questions.addComponents.answer;
export const hasUtils = () => questions.addUtils.answer;
export const hasQueryBuilder = () => questions.addQueryBuilder.answer;
export const hasCss = () => questions.addCss.answer;

// Check if directory already exists
if (args.some((o) => o === "-f") === false && (await fileExists(pageDir))) {
    console.log(`\nDirectory '${pageDir}' already exists. Aborting.\n`);
    const newQuestions = { override: { question: "override", answer: false } };
    await askQuestions(newQuestions);
    if (newQuestions.override.answer === false) process.exit(0);
}

if (args.some((o) => o === "-a") === false) await askQuestions(questions);

PageBuilder();
await ComponentsBuilder();
await UtilsBuilder();

!args.includes("-drs") && deleteFolder("./scriptsJS");
closeRl();
