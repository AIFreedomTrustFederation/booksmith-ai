import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const keep = Number(process.env.BOOKSMITH_KEEP_HISTORY || "25");
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const exportsDir = path.join(bookDir, "exports");
const pdfDir = path.join(exportsDir, "pdf");
const zipsDir = path.join(exportsDir, "zips");
const packetDir = path.join(exportsDir, "publishing-packet");

const managedDir = path.join(exportsDir, "managed");
const currentDir = path.join(managedDir, "current");
const historyDir = path.join(managedDir, "history");
const releaseDir = path.join(managedDir, "release");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = path.join(historyDir, stamp);

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(file) {
  return fs.existsSync(file);
}

function copyIfExists(src, dest) {
  if (!exists(src)) return false;
  ensure(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function copyDirIfExists(src, dest) {
  if (!exists(src)) return false;
  ensure(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true, force: true });
  return true;
}

function latestZip() {
  if (!exists(zipsDir)) return null;
  const files = fs.readdirSync(zipsDir)
    .filter((file) => file.endsWith(".zip"))
    .map((file) => path.join(zipsDir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || null;
}

function zipDir(sourceDir, zipPath) {
  ensure(path.dirname(zipPath));
  const result = spawnSync("zip", ["-r", zipPath, "."], {
    cwd: sourceDir,
    stdio: "inherit",
  });
  return result.status === 0;
}

function pruneHistory() {
  if (!exists(historyDir)) return [];
  const dirs = fs.readdirSync(historyDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(historyDir, entry.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  const removed = [];

  for (const dir of dirs.slice(keep)) {
    fs.rmSync(dir, { recursive: true, force: true });
    removed.push(path.relative(root, dir).replaceAll("\\", "/"));
  }

  return removed;
}

ensure(currentDir);
ensure(historyDir);
ensure(releaseDir);
ensure(runDir);

fs.rmSync(currentDir, { recursive: true, force: true });
ensure(currentDir);

const artifacts = [];

function take(src, relativeDest) {
  const destCurrent = path.join(currentDir, relativeDest);
  const destRun = path.join(runDir, relativeDest);

  if (copyIfExists(src, destCurrent)) {
    copyIfExists(src, destRun);
    artifacts.push(relativeDest);
  }
}

function takeDir(src, relativeDest) {
  const destCurrent = path.join(currentDir, relativeDest);
  const destRun = path.join(runDir, relativeDest);

  if (copyDirIfExists(src, destCurrent)) {
    copyDirIfExists(src, destRun);
    artifacts.push(`${relativeDest}/`);
  }
}

take(path.join(pdfDir, "main.pdf"), "main.pdf");
take(path.join(pdfDir, "main.log"), "main.log");
take(path.join(pdfDir, "booksmith-proof-report.md"), "reports/booksmith-proof-report.md");
take(path.join(pdfDir, "booksmith-proof-report.json"), "reports/booksmith-proof-report.json");
take(path.join(pdfDir, "booksmith-quality-gate.md"), "reports/booksmith-quality-gate.md");
take(path.join(pdfDir, "booksmith-quality-gate.json"), "reports/booksmith-quality-gate.json");
take(path.join(pdfDir, "booksmith-publication-gate-v2.md"), "reports/booksmith-publication-gate-v2.md");
take(path.join(pdfDir, "booksmith-publication-gate-v2.json"), "reports/booksmith-publication-gate-v2.json");
take(path.join(pdfDir, "booksmith-publication-engine-v1.md"), "reports/booksmith-publication-engine-v1.md");
take(path.join(pdfDir, "booksmith-publication-engine-v1.json"), "reports/booksmith-publication-engine-v1.json");
take(path.join(pdfDir, "booksmith-bibliography-audit-v2.md"), "reports/booksmith-bibliography-audit-v2.md");
take(path.join(pdfDir, "booksmith-bibliography-audit-v2.json"), "reports/booksmith-bibliography-audit-v2.json");
take(path.join(pdfDir, "booksmith-reference-intelligence-v1.md"), "reports/booksmith-reference-intelligence-v1.md");
take(path.join(pdfDir, "booksmith-reference-intelligence-v1.json"), "reports/booksmith-reference-intelligence-v1.json");
take(path.join(pdfDir, "booksmith-figure-asset-audit-v1.md"), "reports/booksmith-figure-asset-audit-v1.md");
take(path.join(pdfDir, "booksmith-figure-asset-audit-v1.json"), "reports/booksmith-figure-asset-audit-v1.json");
take(path.join(pdfDir, "booksmith-figure-intelligence-v1.md"), "reports/booksmith-figure-intelligence-v1.md");
take(path.join(pdfDir, "booksmith-figure-intelligence-v1.json"), "reports/booksmith-figure-intelligence-v1.json");

take(path.join(bookDir, "figures", "figure-registry.json"), "figures/figure-registry.json");
take(path.join(bookDir, "figures", "asset-ledger.json"), "figures/asset-ledger.json");
takeDir(path.join(bookDir, "figures", "ai-briefs"), "figures/ai-briefs");

if (exists(packetDir)) {
  takeDir(packetDir, "publishing-packet");
}

const newestZip = latestZip();
if (newestZip) {
  take(newestZip, `zips/${path.basename(newestZip)}`);
}

const releaseZip = path.join(releaseDir, `booksmith-${slug}-managed-${stamp}.zip`);
zipDir(currentDir, releaseZip);

const downloads = path.join(process.env.HOME || "", "storage", "downloads");
let androidCopy = null;

if (exists(downloads)) {
  androidCopy = path.join(downloads, path.basename(releaseZip));
  copyIfExists(releaseZip, androidCopy);
}

const removedHistory = pruneHistory();

const manifest = {
  slug,
  generatedAt: new Date().toISOString(),
  keepHistory: keep,
  currentDir: path.relative(root, currentDir).replaceAll("\\", "/"),
  runDir: path.relative(root, runDir).replaceAll("\\", "/"),
  releaseZip: path.relative(root, releaseZip).replaceAll("\\", "/"),
  androidCopy,
  artifacts,
  removedHistory,
};

fs.writeFileSync(path.join(currentDir, "artifact-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(path.join(runDir, "artifact-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

fs.writeFileSync(path.join(currentDir, "README.md"), [
  "# BookSmith Managed Current Artifact",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${manifest.generatedAt}`,
  "",
  "This directory contains the latest curated build outputs for review.",
  "",
  "## Included",
  "",
  ...artifacts.map((item) => `- ${item}`),
  "",
].join("\n"));

console.log("Artifact Manager v1 complete.");
console.log(`Current: ${manifest.currentDir}`);
console.log(`History run: ${manifest.runDir}`);
console.log(`Release ZIP: ${manifest.releaseZip}`);
if (androidCopy) console.log(`Android Downloads: ${androidCopy}`);
if (removedHistory.length) console.log(`Pruned history runs: ${removedHistory.length}`);
