export type ProofSeverity = "info" | "warning" | "major" | "critical";

export type ProofDiagnostic = {
  id: string;
  type:
    | "latex-error"
    | "missing-file"
    | "missing-bibliography"
    | "duplicate-label"
    | "overfull-hbox"
    | "underfull-hbox";
  severity: ProofSeverity;
  message: string;
  sourceFile?: string;
  sourceLine?: number;
  logLine?: number;
  amountPt?: number;
  label?: string;
  context?: string;
  humanRequired: boolean;
  autoFixable: boolean;
};

export type ProofReport = {
  slug: string;
  generatedAt: string;
  pdfPath?: string;
  logPath?: string;
  diagnostics: ProofDiagnostic[];
};
