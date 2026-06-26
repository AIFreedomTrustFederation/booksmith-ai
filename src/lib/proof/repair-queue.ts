import type { ProofDiagnostic } from "./types";

export function renderRepairQueue(slug: string, diagnostics: ProofDiagnostic[]): string {
  const sorted = [...diagnostics].sort((a, b) => {
    const rank = { critical: 0, major: 1, warning: 2, info: 3 };
    return rank[a.severity] - rank[b.severity];
  });

  return [
    "# Booksmith Repair Queue",
    "",
    `Book slug: \`${slug}\``,
    `Generated: ${new Date().toISOString()}`,
    `Open diagnostics: ${sorted.length}`,
    "",
    ...sorted.map((item) => [
      `## ${item.type}: ${item.severity}`,
      "",
      `- Message: ${item.message}`,
      item.sourceFile ? `- Source file: \`${item.sourceFile}\`` : undefined,
      item.sourceLine ? `- Source line: ${item.sourceLine}` : undefined,
      item.logLine ? `- Log line: ${item.logLine}` : undefined,
      item.amountPt ? `- Overflow: ${item.amountPt}pt` : undefined,
      item.label ? `- Label: \`${item.label}\`` : undefined,
      item.context ? `- Context: ${item.context}` : undefined,
      `- Auto-fixable: ${item.autoFixable ? "yes" : "no"}`,
      `- Human required: ${item.humanRequired ? "yes" : "no"}`,
      "",
    ].filter(Boolean).join("\n")),
  ].join("\n");
}
