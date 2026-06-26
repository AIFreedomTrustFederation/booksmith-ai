import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const shouldSubmit = process.argv.includes("--submit");
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const exportsDir = path.join(bookDir, "exports");
const pdfDir = path.join(exportsDir, "pdf");
const osDir = path.join(exportsDir, "booksmith-os");
const outJson = path.join(osDir, "booksmith-os-v1.json");
const outMd = path.join(osDir, "booksmith-os-v1.md");

fs.mkdirSync(osDir, { recursive: true });

const stages = [];

function runStage(name, command, args, options = {}) {
  console.log(`\n========== ${name} ==========`);
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });

  const exitCode = result.status ?? 0;
  const ok = exitCode === 0 || options.allowFailure === true;

  stages.push({
    name,
    command: [command, ...args].join(" "),
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    exitCode,
    required: options.allowFailure !== true,
    ok,
  });

  if (!ok) {
    console.error(`Required stage failed: ${name}`);
    process.exit(exitCode || 1);
  }
}

function readJson(file, fallback = null) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
  } catch {
    return fallback;
  }
}

runStage("Federation registry build", "npm", ["run", "registry:build"]);
runStage("Federation registry validation", "npm", ["run", "validate:library:v2"]);
runStage("LaTeX export render", "npm", ["run", "render:latex", "--", slug]);
runStage("Figure registry and AI briefs", "npm", ["run", "figures:registry", "--", slug]);
runStage("PDF build", "bash", ["scripts/build-fhqcm-export.sh", slug]);
runStage("Proof report", "node", ["scripts/proof-report.mjs", slug]);
runStage("Bibliography audit", "node", ["scripts/bibliography-audit-v2.mjs", slug], { allowFailure: true });
runStage("Reference intelligence", "node", ["scripts/reference-intelligence-v1.mjs", slug], { allowFailure: true });
runStage("Figure asset audit", "node", ["scripts/figure-asset-audit-v1.mjs", slug], { allowFailure: true });
runStage("Figure intelligence", "node", ["scripts/figure-intelligence-v1.mjs", slug], { allowFailure: true });
runStage("Typography diagnostics", "npm", ["run", "phase1:typography-diagnostics:v4", "--", slug], { allowFailure: true });
runStage("Semantic block map", "npm", ["run", "semantic:blocks", "--", slug], { allowFailure: true });
runStage("Quality gate", "node", ["scripts/quality-gate.mjs", slug], { allowFailure: true });
runStage("Publication gate", "node", ["scripts/publication-gate-v2.mjs", slug], { allowFailure: true });
runStage("Publishing packet", "node", ["scripts/build-publishing-packet.mjs", slug]);
runStage("Latest ZIP export", "npm", ["run", "zip:latest", "--", slug], { allowFailure: true });
runStage("Artifact manager", "node", ["scripts/artifact-manager-v1.mjs", slug]);

const proof = readJson(path.join(pdfDir, "booksmith-proof-report.json"), {});
const publicationGate = readJson(path.join(pdfDir, "booksmith-publication-gate-v2.json"), {});
const referenceIntel = readJson(path.join(pdfDir, "booksmith-reference-intelligence-v1.json"), {});
const figureIntel = readJson(path.join(pdfDir, "booksmith-figure-intelligence-v1.json"), {});
const bibliographyAudit = readJson(path.join(pdfDir, "booksmith-bibliography-audit-v2.json"), {});

const requiredFailures = stages.filter((stage) => stage.required && !stage.ok);

let status = "PASS_DRAFT_ONLY";
if (requiredFailures.length) status = "FAIL_PIPELINE";
else if (publicationGate.status === "PASS_PUBLICATION_READY") status = "PASS_PUBLICATION_READY";

const nextActions = [];

if ((figureIntel.counts?.needsAiFigure ?? 0) > 0) {
  nextActions.push(`Generate and approve ${figureIntel.counts.needsAiFigure} figure asset(s).`);
}

if ((bibliographyAudit.counts?.unusedBibEntries ?? 0) > 0) {
  nextActions.push(`Review ${bibliographyAudit.counts.unusedBibEntries} available-but-unused bibliography entries.`);
}

if ((proof.counts?.overfull ?? 0) > 0) {
  nextActions.push(`Review ${proof.counts.overfull} remaining typography warning(s).`);
}

if (status === "PASS_PUBLICATION_READY") {
  nextActions.push("Book is ready for release tagging or publication export.");
}

const report = {
  schema: "booksmith.os.v1",
  slug,
  generatedAt: new Date().toISOString(),
  status,
  submitRequested: shouldSubmit,
  stages,
  summaries: {
    proofCounts: proof.counts ?? null,
    publicationGateStatus: publicationGate.status ?? null,
    referenceStatus: referenceIntel.status ?? null,
    referenceCounts: referenceIntel.counts ?? null,
    figureStatus: figureIntel.status ?? null,
    figureCounts: figureIntel.counts ?? null,
    bibliographyStatus: bibliographyAudit.status ?? null,
    bibliographyCounts: bibliographyAudit.counts ?? null,
  },
  nextActions,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith OS v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Status: **${status}**`,
  "",
  "## Summary",
  "",
  `- Publication gate: ${report.summaries.publicationGateStatus}`,
  `- Bibliography: ${report.summaries.bibliographyStatus}`,
  `- Reference intelligence: ${report.summaries.referenceStatus}`,
  `- Figure intelligence: ${report.summaries.figureStatus}`,
  "",
  "## Proof Counts",
  "",
  "```json",
  JSON.stringify(report.summaries.proofCounts, null, 2),
  "```",
  "",
  "## Reference Counts",
  "",
  "```json",
  JSON.stringify(report.summaries.referenceCounts, null, 2),
  "```",
  "",
  "## Figure Counts",
  "",
  "```json",
  JSON.stringify(report.summaries.figureCounts, null, 2),
  "```",
  "",
  "## Next Actions",
  "",
  nextActions.length ? nextActions.map((item) => `- ${item}`).join("\n") : "- None.",
  "",
  "## Stages",
  "",
  "| Stage | Required | Result | Duration |",
  "|---|---:|---:|---:|",
  ...stages.map((stage) => `| ${stage.name} | ${stage.required ? "yes" : "no"} | ${stage.ok ? "PASS" : "FAIL"} | ${stage.durationMs}ms |`),
  "",
].join("\n"));

console.log(`\nBookSmith OS report written: ${path.relative(root, outMd)}`);
console.log(`Status: ${status}`);

if (shouldSubmit) {
  console.log("\n========== Git submit ==========");

  const gitScript = `
set -e
git add .gitignore package.json package-lock.json scripts src books/registry.json books/registry-report.md books/${slug}/figures books/${slug}/bibliography books/${slug}/book.config.json 2>/dev/null || true
if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "add BookSmith OS pipeline coordinator"
fi
git fetch origin
git rebase origin/main
git push origin HEAD:main
`;

  const submit = spawnSync("bash", ["-lc", gitScript], {
    cwd: root,
    stdio: "inherit",
  });

  if ((submit.status ?? 0) !== 0) process.exit(submit.status || 1);
}
