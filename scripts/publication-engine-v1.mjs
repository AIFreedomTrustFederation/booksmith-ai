import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const pdfDir = path.join(bookDir, "exports", "pdf");
const outJson = path.join(pdfDir, "booksmith-publication-engine-v1.json");
const outMd = path.join(pdfDir, "booksmith-publication-engine-v1.md");

const steps = [];

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const start = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });

  const record = {
    label,
    command: [command, ...args].join(" "),
    status: result.status ?? 0,
    ok: (result.status ?? 0) === 0 || options.allowFailure === true,
    required: options.allowFailure !== true,
    durationMs: Date.now() - start,
  };

  steps.push(record);

  if (!record.ok) {
    console.error(`Step failed: ${label}`);
    process.exit(record.status || 1);
  }
}

fs.mkdirSync(pdfDir, { recursive: true });

run("Build federation registry", "npm", ["run", "registry:build"]);
run("Validate library registry", "npm", ["run", "validate:library:v2"]);
run("Render LaTeX export", "npm", ["run", "render:latex", "--", slug]);
run("Build figure registry", "npm", ["run", "figures:registry", "--", slug]);
run("Build PDF export", "bash", ["scripts/build-fhqcm-export.sh", slug]);
run("Proof report", "node", ["scripts/proof-report.mjs", slug]);
run("Bibliography audit v2", "node", ["scripts/bibliography-audit-v2.mjs", slug], { allowFailure: true });
run("Reference intelligence v1", "node", ["scripts/reference-intelligence-v1.mjs", slug], { allowFailure: true });
run("Figure asset audit v1", "node", ["scripts/figure-asset-audit-v1.mjs", slug], { allowFailure: true });
run("Figure intelligence v1", "node", ["scripts/figure-intelligence-v1.mjs", slug], { allowFailure: true });
run("Quality gate", "node", ["scripts/quality-gate.mjs", slug], { allowFailure: true });
run("Publication gate v2", "node", ["scripts/publication-gate-v2.mjs", slug], { allowFailure: true });
run("Build publishing packet", "node", ["scripts/build-publishing-packet.mjs", slug]);
run("Export latest ZIP", "npm", ["run", "zip:latest", "--", slug], { allowFailure: true });

function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

const proof = readJson(path.join(pdfDir, "booksmith-proof-report.json"), {});
const publicationGate = readJson(path.join(pdfDir, "booksmith-publication-gate-v2.json"), {});
const referenceIntel = readJson(path.join(pdfDir, "booksmith-reference-intelligence-v1.json"), {});
const figureIntel = readJson(path.join(pdfDir, "booksmith-figure-intelligence-v1.json"), {});

const requiredFailures = steps.filter((step) => step.required && !step.ok);

const status = requiredFailures.length
  ? "FAIL_PIPELINE"
  : publicationGate.status === "PASS_PUBLICATION_READY"
    ? "PASS_PUBLICATION_READY"
    : "PASS_DRAFT_ONLY";

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  status,
  steps,
  summaries: {
    proofCounts: proof.counts ?? null,
    publicationGateStatus: publicationGate.status ?? null,
    referenceStatus: referenceIntel.status ?? null,
    referenceCounts: referenceIntel.counts ?? null,
    figureStatus: figureIntel.status ?? null,
    figureCounts: figureIntel.counts ?? null,
  },
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith Publication Engine v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Status: **${status}**`,
  "",
  "## Summary",
  "",
  `- Publication gate: ${report.summaries.publicationGateStatus}`,
  `- Reference status: ${report.summaries.referenceStatus}`,
  `- Figure status: ${report.summaries.figureStatus}`,
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
  "## Steps",
  "",
  "| Step | Required | Result | Duration |",
  "|---|---:|---:|---:|",
  ...steps.map((step) => `| ${step.label} | ${step.required ? "yes" : "no"} | ${step.ok ? "PASS" : "FAIL"} | ${step.durationMs}ms |`),
  "",
].join("\n"));

console.log(`Publication engine report written: ${path.relative(root, outMd)}`);
console.log(`Status: ${status}`);
