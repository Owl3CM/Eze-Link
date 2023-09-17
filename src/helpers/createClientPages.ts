import { createFolder, readFile, runCommand } from "./owlFs.js";
const PagenatedClientsNames = JSON.parse(await readFile("./PagenatedClientsNames.json"));

if (PagenatedClientsNames.length) {
    createFolder("./src/ClientGeneratedPages", {
        main: {
            dir: "./src/ClientGeneratedPages",
            name: "index.ts",
            content: `${PagenatedClientsNames.map((o) => `import {${o}} from "./${o.charAt(0).toLowerCase() + o.slice(1)}";`).join("\n")}
            export const PagesRoutes=[
                ${PagenatedClientsNames.map((o) => `    { path: "/${o}", Component: ${o},title: "${o}"},`).join("\n")}
            ];
            `,
        },

        pages: {
            dir: "./src/ClientGeneratedPages",
            name: "ClientPages.tsx",
            content: `import { Link, Route, Routes } from "react-router-dom";
            import { PagesRoutes } from ".";

            const ClientPagesRoutes = () => {
                return (
                    <>
                        <Routes>
                            {PagesRoutes.map(({ path, Component }) => (
                                <Route key={path} path={path} element={<Component />} />
                            ))}
                        </Routes>
                        <div className="fixed bottom-0 row overflow-auto gap-l bg-prim p-l left-0 right-0 ">
                            {PagesRoutes.map(({ title, path }) => (
                                <Link to={path} key={title} className="bg-king round-l p-m text-goat" style={{ textDecoration: "none" }}>
                                    {title}
                                </Link>
                            ))}
                        </div>
                    </>
                );
            };

            export default ClientPagesRoutes;
            `,
        },
    });

    let i = 0;
    while (i < PagenatedClientsNames.length) {
        const name = PagenatedClientsNames[i].charAt(0).toLowerCase() + PagenatedClientsNames[i].slice(1);
        console.log({ i, name });
        // await new Promise((resolve) => setTimeout(resolve, 500 * i));
        runCommand(`yarn page -dir ./src/ClientGeneratedPages -n ${name} -a -f -drs`);
        i++;
    }
}
