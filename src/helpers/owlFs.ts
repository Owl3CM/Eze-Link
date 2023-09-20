import fs from "fs";
import path from "path";

type File = {
  name: string;
  content: string;
};

export const fileExists = async (dir: string): Promise<boolean> => fs.existsSync(dir);

export async function createFolder(dir: string, files: File[] = []): Promise<string> {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
    console.log(`Directory '${dir}' created successfully.`);

    files.forEach(async ({ name, content }) => {
      await createFile({ dir, name, content });
    });
    return dir;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create directory '${dir}'.`);
  }
}

export async function createFile({ dir, name, content }: { dir: string; name: string; content: string }): Promise<any> {
  const filePath = path.join(dir, name);
  try {
    await fs.promises.writeFile(filePath, content);
    console.log(`File '${filePath}' created successfully.`);
    return filePath;
  } catch (err) {
    console.error(`Failed to create file '${filePath}'.`);
    // throw new Error(`Failed to create file '${filePath}'.`);
  }
}

export async function deleteFolder(dir: string): Promise<void> {
  try {
    await fs.promises.rmdir(dir, { recursive: true });
    console.log(`Directory '${dir}' deleted successfully.`);
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to delete directory '${dir}'.`);
  }
}

// export async function createFolder(dir) {
//     try {
//         await fs.promises.mkdir(dir, { recursive: true });
//         console.log(`Directory '${dir}' created successfully.`);
//         return dir;
//     } catch (err) {
//         console.error(err);
//     }
// }

export async function runCommand(command: string): Promise<void> {
  const { exec } = await import("child_process");
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      resolve();
    });
  });
}

export async function formateScript(dir: string): Promise<void> {
  await runCommand(`npx prettier --write ${dir}/**/* `);
}

export async function readFile(dir: string): Promise<string> {
  try {
    const data = await fs.promises.readFile(dir, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to read file '${dir}'.`);
  }
}

export async function writeFile({ dir, content }: { dir: string; content: string }): Promise<void> {
  try {
    await fs.promises.writeFile(dir, content);
    console.log(`File '${dir}' created successfully.`);
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create file '${dir}'.`);
  }
}

// export async function readDir(dir: string): Promise<string[]> {}
