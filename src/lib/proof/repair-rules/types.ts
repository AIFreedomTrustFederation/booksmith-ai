import type { ProofDiagnostic } from "../types";
import type { ProofContext } from "../repair-context";

export type RepairResult = {
  ruleId: string;
  diagnosticId: string;
  fixed: boolean;
  changedFiles: string[];
  message: string;
};

export type RepairRule = {
  id: string;
  label: string;
  supports(diagnostic: ProofDiagnostic): boolean;
  canAutoFix(diagnostic: ProofDiagnostic): boolean;
  apply(context: ProofContext, diagnostic: ProofDiagnostic): Promise<RepairResult>;
};
