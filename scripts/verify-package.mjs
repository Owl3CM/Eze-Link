import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const requestedArtifact = process.argv[2];
const temporaryRoots = [];

function fail(message) {
  throw new Error(message);
}

function makeTemporaryDirectory(prefix) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  temporaryRoots.push(directory);
  return directory;
}

function collectFiles(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(absolutePath, root);
    return [relative(root, absolutePath).split(sep).join("/")];
  });
}

function assertPathExists(installedRoot, packagePath, claim) {
  const absolutePath = resolve(installedRoot, packagePath);
  const packagePrefix = `${installedRoot}${sep}`;
  if (absolutePath !== installedRoot && !absolutePath.startsWith(packagePrefix)) {
    fail(`${claim} escapes the installed package: ${packagePath}`);
  }
  if (!existsSync(absolutePath)) fail(`${claim} is absent from the installed package: ${packagePath}`);
}

function assertManifestPath(installedRoot, value, claim) {
  if (typeof value !== "string") return;
  if (!value.startsWith(".")) return;
  assertPathExists(installedRoot, value, claim);
}

function walkExports(installedRoot, value, claim = "package.json exports") {
  if (typeof value === "string") {
    assertManifestPath(installedRoot, value, claim);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) walkExports(installedRoot, child, `${claim}.${key}`);
}

function normalizeDocumentationClaim(rawClaim) {
  const withoutFragment = rawClaim.split("#", 1)[0].split("?", 1)[0];
  return decodeURIComponent(withoutFragment.replace(/^node_modules\/eze-link\//, ""));
}

function isLocalInlinePath(value) {
  return (
    value.startsWith("node_modules/eze-link/") ||
    /^(?:\.\.?\/|\.agent\/|context\/|dist\/)/.test(value) ||
    /^[A-Za-z0-9_.-]+\.(?:d\.ts|md|json|mjs|cjs|js|ts)$/.test(value)
  );
}

function assertDocumentationPath(installedRoot, documentPath, rawClaim, claimKind) {
  if (!rawClaim || rawClaim.startsWith("#") || /^[a-z][a-z+.-]*:/i.test(rawClaim)) return;
  const packagePath = normalizeDocumentationClaim(rawClaim);
  const candidates = rawClaim.startsWith("node_modules/eze-link/")
    ? [resolve(installedRoot, packagePath)]
    : [resolve(dirname(documentPath), packagePath), resolve(installedRoot, packagePath)];
  const packagePrefix = `${installedRoot}${sep}`;
  const validCandidate = candidates.some(
    (candidate) =>
      (candidate === installedRoot || candidate.startsWith(packagePrefix)) && existsSync(candidate),
  );
  if (!validCandidate) {
    fail(`${claimKind} in ${relative(installedRoot, documentPath)} is absent: ${rawClaim}`);
  }
}

function auditDocumentation(installedRoot, files) {
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  for (const file of markdownFiles) {
    const documentPath = join(installedRoot, file);
    const content = readFileSync(documentPath, "utf8");
    if (/file:\/\/\/|\/Users\//.test(content)) fail(`Non-portable absolute path in ${file}`);
    if (/(^|[^A-Za-z0-9_.-])(?:lib|src)\/|__tests__|\.test\.[cm]?[jt]sx?\b/m.test(content)) {
      fail(`Source-tree-only path claim in installed guidance: ${file}`);
    }

    for (const match of content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      assertDocumentationPath(installedRoot, documentPath, match[1], "Markdown link");
    }
    for (const match of content.matchAll(/`([^`\n]+)`/g)) {
      const value = match[1].trim();
      if (isLocalInlinePath(value)) {
        assertDocumentationPath(installedRoot, documentPath, value, "Inline path claim");
      }
    }
  }
}

function auditArtifact(artifact) {
  const extractionRoot = makeTemporaryDirectory("eze-link-package-audit-");
  execFileSync("tar", ["-xzf", artifact, "-C", extractionRoot], { stdio: "inherit" });
  const installedRoot = join(extractionRoot, "package");
  if (!existsSync(installedRoot) || !statSync(installedRoot).isDirectory()) {
    fail(`npm artifact has no package directory: ${artifact}`);
  }

  const requiredPaths = [
    ".agent/_index.md",
    ".agent/context/api-service.md",
    ".agent/context/client-builder.md",
    ".agent/context/storable.md",
    "AGENTS.md",
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "dist/ApiService.d.ts",
    "dist/ClientBuilder.d.ts",
    "dist/Storable.d.ts",
    "dist/index.d.ts",
    "dist/index.js",
    "package.json",
  ];
  for (const packagePath of requiredPaths) assertPathExists(installedRoot, packagePath, "Required path");

  const files = collectFiles(installedRoot);
  const forbiddenEntries = files.filter(
    (file) =>
      /^(?:lib|src|scripts|test|tests)\//.test(file) ||
      /(?:^|\/)__tests__\//.test(file) ||
      /(?:^|\/)(?:pnpm-lock\.yaml|pnpm-workspace\.yaml|USER_MANUAL_TESTS\.md)$/.test(file),
  );
  if (forbiddenEntries.length) fail(`Internal files leaked into package: ${forbiddenEntries.join(", ")}`);

  const manifest = JSON.parse(readFileSync(join(installedRoot, "package.json"), "utf8"));
  for (const field of ["main", "module", "types"]) {
    assertPathExists(installedRoot, manifest[field], `package.json ${field}`);
  }
  if ("source" in manifest) assertPathExists(installedRoot, manifest.source, "package.json source");
  walkExports(installedRoot, manifest.exports);
  for (const packagePath of manifest.files ?? []) assertPathExists(installedRoot, packagePath, "package.json files");

  auditDocumentation(installedRoot, files);
  console.log(`Verified ${basename(artifact)}: ${files.length} installed files and all documented paths resolve.`);
}

try {
  let artifact;
  if (requestedArtifact) {
    if (!isAbsolute(requestedArtifact)) fail("Artifact path must be absolute.");
    artifact = resolve(requestedArtifact);
    if (!existsSync(artifact) || !artifact.endsWith(".tgz")) fail(`Artifact not found: ${artifact}`);
  } else {
    const packRoot = makeTemporaryDirectory("eze-link-pack-");
    const cacheRoot = join(packRoot, "npm-cache");
    const output = execFileSync(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", packRoot],
      {
        cwd: packageRoot,
        encoding: "utf8",
        env: { ...process.env, npm_config_cache: cacheRoot },
      },
    );
    const result = JSON.parse(output);
    artifact = join(packRoot, result[0].filename);
  }
  auditArtifact(artifact);
} finally {
  for (const directory of temporaryRoots.reverse()) rmSync(directory, { recursive: true, force: true });
}
