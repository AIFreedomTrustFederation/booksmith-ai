import type { ProofDiagnostic } from "./types";

export function parseLatexLog(slug: string, log: string): ProofDiagnostic[] {
  const diagnostics: ProofDiagnostic[] = [];
  const lines = log.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("! LaTeX Error:")) {
      diagnostics.push({
        id: `latex-error-${i + 1}`,
        type: "latex-error",
        severity: "critical",
        message: line.trim(),
        logLine: i + 1,
        humanRequired: true,
        autoFixable: false,
      });
    }

    const overfull = line.match(/Overfull \\hbox \(([\d.]+)pt too wide\).*?lines? ([\d-]+)/);
    if (overfull) {
      diagnostics.push({
        id: `overfull-hbox-${i + 1}`,
        type: "overfull-hbox",
        severity: Number(overfull[1]) >= 15 ? "major" : "warning",
        message: line.trim(),
        logLine: i + 1,
        amountPt: Number(overfull[1]),
        context: [lines[i + 1], lines[i + 2]].filter(Boolean).join(" ").trim(),
        humanRequired: Number(overfull[1]) >= 15,
        autoFixable: Number(overfull[1]) < 15,
      });
    }

    const missing = line.match(/(?:File `([^']+)' not found|No file ([^.\s]+(?:\.[A-Za-z0-9]+)?))/);
    if (missing) {
      const file = missing[1] || missing[2];

      diagnostics.push({
        id: `missing-file-${i + 1}`,
        type: file.endsWith(".bbl") ? "missing-bibliography" : "missing-file",
        severity: file.endsWith(".bbl") ? "major" : "critical",
        message: line.trim(),
        logLine: i + 1,
        sourceFile: file,
        humanRequired: !file.endsWith(".bbl"),
        autoFixable: file.endsWith(".bbl"),
      });
    }

    if (/multiply-defined labels/i.test(line)) {
      diagnostics.push({
        id: `duplicate-label-warning-${i + 1}`,
        type: "duplicate-label",
        severity: "major",
        message: line.trim(),
        logLine: i + 1,
        humanRequired: true,
        autoFixable: false,
      });
    }
  }

  return diagnostics;
}
