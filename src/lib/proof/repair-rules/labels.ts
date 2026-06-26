import path from "node:path";

import { findDuplicateLabels } from "../latex/labels";
import { loadLatexDocument, writeLatexDocumentFile } from "../latex/document";
import type { RepairRule } from "./types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const duplicateLabelRule: RepairRule = {
  id: "duplicate-label-structural-v3",
  label: "Structurally rename duplicate LaTeX labels",

  supports(diagnostic) {
    return diagnostic.type === "duplicate-label";
  },

  canAutoFix() {
    return true;
  },

  async apply(context, diagnostic) {
    const document = await loadLatexDocument(context.exportDir);
    const duplicates = findDuplicateLabels(document);

    const changedFiles = new Set<string>();
    const renameNotes: string[] = [];

    for (const duplicate of duplicates) {
      const [, ...laterDefinitions] = duplicate.definitions;

      for (let i = 0; i < laterDefinitions.length; i++) {
        const definition = laterDefinitions[i];
        const nextLabel = `${duplicate.label}-${i + 2}`;
        const file = document.files.find((candidate) => candidate.file === definition.file);
        if (!file) continue;

        const before = file.content.slice(0, definition.start);
        const after = file.content.slice(definition.end);
        file.content = `${before}${nextLabel}${after}`;

        changedFiles.add(path.relative(context.root, file.file).replaceAll("\\", "/"));
        renameNotes.push(`${duplicate.label} -> ${nextLabel} in ${path.relative(context.root, file.file).replaceAll("\\", "/")}`);

        const oldRef = escapeRegExp(duplicate.label);
        const referenceCommands = ["ref", "pageref", "autoref", "cref", "Cref", "eqref"];

        for (const refCommand of referenceCommands) {
          const nearbyPattern = new RegExp(`\\\\${refCommand}\\{${oldRef}\\}`, "g");
          file.content = file.content.replace(nearbyPattern, `\\${refCommand}{${nextLabel}}`);
        }
      }
    }

    for (const file of document.files) {
      if (changedFiles.has(path.relative(context.root, file.file).replaceAll("\\", "/"))) {
        await writeLatexDocumentFile(file);
      }
    }

    return {
      ruleId: this.id,
      diagnosticId: diagnostic.id,
      fixed: changedFiles.size > 0,
      changedFiles: [...changedFiles],
      message: renameNotes.length
        ? `Structurally renamed duplicate labels: ${renameNotes.join("; ")}.`
        : "No duplicate labels found by structural scanner.",
    };
  },
};
