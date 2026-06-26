import fs from "node:fs/promises";
import path from "node:path";

import type { RepairRule } from "./types";

const breakHints: [RegExp, string][] = [
  [/Fractal-Holographic/g, "Fractal-\\\\allowbreak Holographic"],
  [/Quantum Consciousness/g, "Quantum\\\\allowbreak Consciousness"],
  [/Consciousness Model/g, "Consciousness\\\\allowbreak Model"],
  [/Christic Equivalency/g, "Christic\\\\allowbreak Equivalency"],
  [/AI Freedom Trust Federation/g, "AI Freedom Trust\\\\allowbreak Federation"],
  [/SOURCE MAP AND BOOK EXPANSION PLAN/g, "SOURCE MAP\\\\allowbreak AND BOOK\\\\allowbreak EXPANSION PLAN"],
  [/COINCIDENCE, COHERENCE, AND THE ETERNAL NOW/g, "COINCIDENCE, COHERENCE,\\\\allowbreak AND THE ETERNAL NOW"],
];

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

export const overfullHBoxRule: RepairRule = {
  id: "overfull-hbox-safe-breaks",
  label: "Apply safe LaTeX line-break hints for known long phrases",

  supports(diagnostic) {
    return diagnostic.type === "overfull-hbox";
  },

  canAutoFix(diagnostic) {
    return diagnostic.autoFixable || Boolean(diagnostic.context);
  },

  async apply(context, diagnostic) {
    const texFiles = (await walk(context.exportDir)).filter((file) => file.endsWith(".tex"));
    const changedFiles: string[] = [];

    for (const file of texFiles) {
      let content = await fs.readFile(file, "utf8");
      const original = content;

      for (const [pattern, replacement] of breakHints) {
        content = content.replace(pattern, replacement);
      }

      if (content !== original) {
        await fs.writeFile(file, content, "utf8");
        changedFiles.push(path.relative(context.root, file));
      }
    }

    return {
      ruleId: this.id,
      diagnosticId: diagnostic.id,
      fixed: changedFiles.length > 0,
      changedFiles,
      message: changedFiles.length
        ? `Applied safe line-break hints to ${changedFiles.length} TeX files.`
        : "No matching safe line-break hints found.",
    };
  },
};
