export type PublishingTarget =
  | "markdown" | "latex" | "pdf" | "epub" | "web" | "docx" | "print" | "publishing-packet";

export type BooksmithBookConfig = {
  slug: string;
  title: string;
  subtitle?: string;
  series: string;
  status: string;
  version: string;
  purpose: string;
  relatedBooks?: string[];
  canonicalTerms?: string[];
  publishingTargets: PublishingTarget[];
  provenanceRequired: boolean;
};

export type BooksmithSourceFile = {
  relativePath: string;
  outputPath: string;
  kind: "latex" | "markdown" | "asset" | "metadata" | "unknown";
  content: string;
};

export type BooksmithManuscript = {
  slug: string;
  rootPath: string;
  config: BooksmithBookConfig;
  sourceFiles: BooksmithSourceFile[];
  generatedAt: string;
};
