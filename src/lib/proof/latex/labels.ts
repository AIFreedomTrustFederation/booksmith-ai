import type { LatexDocument } from "./document";

export type LatexLabelDefinition = {
  label: string;
  file: string;
  start: number;
  end: number;
};

export type DuplicateLatexLabel = {
  label: string;
  definitions: LatexLabelDefinition[];
};

export function collectLabelDefinitions(document: LatexDocument): LatexLabelDefinition[] {
  const labels: LatexLabelDefinition[] = [];

  for (const file of document.files) {
    for (const command of file.commands) {
      if (command.command !== "label") continue;

      labels.push({
        label: command.argument.trim(),
        file: file.file,
        start: command.argumentStart,
        end: command.argumentEnd,
      });
    }
  }

  return labels;
}

export function findDuplicateLabels(document: LatexDocument): DuplicateLatexLabel[] {
  const grouped = new Map<string, LatexLabelDefinition[]>();

  for (const definition of collectLabelDefinitions(document)) {
    grouped.set(definition.label, [...(grouped.get(definition.label) ?? []), definition]);
  }

  return [...grouped.entries()]
    .filter(([, definitions]) => definitions.length > 1)
    .map(([label, definitions]) => ({
      label,
      definitions: [...definitions].sort((a, b) => {
        if (a.file === b.file) return a.start - b.start;
        return a.file.localeCompare(b.file);
      }),
    }));
}
