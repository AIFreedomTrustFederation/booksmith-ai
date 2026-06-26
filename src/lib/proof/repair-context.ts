import path from "node:path";

export type ProofContext = {
  slug: string;
  root: string;
  bookRoot: string;
  exportDir: string;
  pdfDir: string;
};

export function createProofContext(slug: string, root = process.cwd()): ProofContext {
  return {
    slug,
    root,
    bookRoot: path.join(root, "books", slug),
    exportDir: path.join(root, "books", slug, "exports", "latex"),
    pdfDir: path.join(root, "books", slug, "exports", "pdf"),
  };
}
