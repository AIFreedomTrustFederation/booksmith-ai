import fs from "node:fs/promises";
import path from "node:path";

import type { ProofDiagnostic } from "./types";
import type { ProofContext } from "./repair-context";
import type { RepairResult, RepairRule } from "./repair-rules/types";
import { missingBibliographyRule } from "./repair-rules/bibliography";
import { duplicateLabelRule } from "./repair-rules/labels";
import { overfullHBoxRule } from "./repair-rules/overfull";

export type RepairEngineResult = {
  slug: string;
  generatedAt: string;
  diagnostics: number;
  attempted: number;
  fixed: number;
  results: RepairResult[];
};

export const defaultRepairRules: RepairRule[] = [
  missingBibliographyRule,
  overfullHBoxRule,
  duplicateLabelRule,
];

export async function applyRepairRules(
  context: ProofContext,
  diagnostics: ProofDiagnostic[],
  rules = defaultRepairRules,
): Promise<RepairEngineResult> {
  const results: RepairResult[] = [];

  for (const diagnostic of diagnostics) {
    const rule = rules.find((candidate) => candidate.supports(diagnostic));

    if (!rule) {
      results.push({
        ruleId: "no-rule",
        diagnosticId: diagnostic.id,
        fixed: false,
        changedFiles: [],
        message: `No repair rule registered for ${diagnostic.type}.`,
      });
      continue;
    }

    if (!rule.canAutoFix(diagnostic)) {
      results.push(await rule.apply(context, diagnostic));
      continue;
    }

    results.push(await rule.apply(context, diagnostic));
  }

  const result: RepairEngineResult = {
    slug: context.slug,
    generatedAt: new Date().toISOString(),
    diagnostics: diagnostics.length,
    attempted: results.length,
    fixed: results.filter((item) => item.fixed).length,
    results,
  };

  await fs.mkdir(context.pdfDir, { recursive: true });

  const repairEngineJson = JSON.stringify(result, null, 2);
  JSON.parse(repairEngineJson);

  await fs.writeFile(
    path.join(context.pdfDir, "booksmith-repair-engine-v2.json"),
    repairEngineJson + "\n",
    "utf8",
  );

  await fs.writeFile(
    path.join(context.pdfDir, "booksmith-repair-engine-v2.md"),
    renderRepairEngineReport(result),
    "utf8",
  );

  return result;
}

export function renderRepairEngineReport(result: RepairEngineResult): string {
  return [
    "# Booksmith Repair Engine v2",
    "",
    `Book slug: \`${result.slug}\``,
    `Generated: ${result.generatedAt}`,
    `Diagnostics: ${result.diagnostics}`,
    `Attempted repairs: ${result.attempted}`,
    `Applied repairs: ${result.fixed}`,
    "",
    "## Results",
    "",
    ...result.results.map((item) => [
      `### ${item.ruleId}`,
      "",
      `- Diagnostic: \`${item.diagnosticId}\``,
      `- Fixed: ${item.fixed ? "yes" : "no"}`,
      `- Message: ${item.message}`,
      item.changedFiles.length ? `- Changed files: ${item.changedFiles.map((file) => `\`${file}\``).join(", ")}` : "- Changed files: none",
      "",
    ].join("\\n")),
  ].join("\\n");
}
