import fs from "node:fs/promises";
import path from "node:path";

import type { RepairRule } from "./types";

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    }),
  );

  return result.flat();
}

export const duplicateLabelRule: RepairRule = {
  id: "duplicate-label-diagnostics",
  label: "Locate duplicate labels and leave source-safe repair queue",

  supports(diagnostic) {
    return diagnostic.type === "duplicate-label";
  },

  canAutoFix() {
    return false;
  },

  async apply(context, diagnostic) {
    const texFiles = (await walk(context.exportDir)).filter((file) => file.endsWith(".tex"));
    const labels = new Map<string, string[]>();

    for (const file of texFiles) {
      const content = await fs.readFile(file, "utf8");
      for (const match of content.matchAll(/\\label\{([^}]+)\}/g)) {
        const label = match[1];
        const relative = path.relative(context.root, file);
        labels.set(label, [...(labels.get(label) || []), relative]);
      }
    }

    const duplicates = [...labels.entries()].filter(([, files]) => files.length > 1);

    return {
      ruleId: this.id,
      diagnosticId: diagnostic.id,
      fixed: false,
      changedFiles: [],
      message: duplicates.length
        ? `Duplicate labels require human review: ${duplicates.map(([label, files]) => `${label} (${files.join(", ")})`).join("; ")}`
        : "LaTeX reported duplicate labels, but source scan did not find duplicated \\label{} commands.",
    };
  },
};
