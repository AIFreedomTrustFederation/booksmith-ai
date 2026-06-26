export type SourceMapEntry = {
  emittedFile: string;
  emittedLine: number;
  sourceFile: string;
  sourceLine: number;
  kind: "root" | "input" | "generated" | "unknown";
};

export type SourceMapReport = {
  slug: string;
  generatedAt: string;
  entries: SourceMapEntry[];
};
