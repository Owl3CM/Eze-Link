import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const [artifactArg, confirmation] = process.argv.slice(2);
const expectedConfirmation = `--confirm=${packageJson.name}@${packageJson.version}`;

if (!artifactArg || confirmation !== expectedConfirmation) {
  console.error(`Usage: pnpm publish:artifact -- /absolute/path/to/package.tgz ${expectedConfirmation}`);
  process.exit(2);
}

const artifact = resolve(artifactArg);
if (!existsSync(artifact) || !basename(artifact).endsWith(".tgz")) {
  console.error(`Release artifact not found: ${artifact}`);
  process.exit(2);
}

const status = execFileSync("git", ["status", "--porcelain"], { cwd: packageRoot, encoding: "utf8" });
if (status.trim()) {
  console.error("Refusing to publish from a dirty worktree. Commit the reviewed release first.");
  process.exit(2);
}

execFileSync("npm", ["publish", artifact, "--access", "public"], {
  cwd: packageRoot,
  stdio: "inherit",
});
