import path from "node:path";

export type RewriteReport = {
  rewrittenFiles: string[];
  rewrites: {
    file: string;
    from: string;
    to: string;
    kind: "input" | "include" | "includegraphics" | "bibliography";
  }[];
};

function normalizeTexPath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function rewriteProjectPath(value: string): string {
  const clean = normalizeTexPath(value);

  if (clean.startsWith("../assets/")) return clean.replace("../assets/", "assets/");
  if (clean.startsWith("../bibliography/")) return clean.replace("../bibliography/", "bibliography/");
  if (clean.startsWith("../metadata/")) return clean.replace("../metadata/", "metadata/");
  if (clean.startsWith("../figures/")) return clean.replace("../figures/", "figures/");
  if (clean.startsWith("../../../library/")) return clean.replace("../../../library/", "library/");
  if (clean.startsWith("../../library/")) return clean.replace("../../library/", "library/");
  if (clean.startsWith("../library/")) return clean.replace("../library/", "library/");

  return clean;
}

function rewriteBraceCommand(
  content: string,
  file: string,
  kind: RewriteReport["rewrites"][number]["kind"],
  command: string,
  report: RewriteReport,
): string {
  const pattern = new RegExp(`\\\\${command}(\\[[^\\]]*\\])?\\{([^}]+)\\}`, "g");

  return content.replace(pattern, (match, options = "", rawValue: string) => {
    if (command === "bibliography") {
      const rewritten = rawValue
        .split(",")
        .map((item) => rewriteProjectPath(item.trim()))
        .join(",");

      if (rewritten !== rawValue) {
        report.rewrites.push({ file, from: rawValue, to: rewritten, kind });
      }

      return `\\${command}${options}{${rewritten}}`;
    }

    const rewritten = rewriteProjectPath(rawValue.trim());

    if (rewritten !== rawValue.trim()) {
      report.rewrites.push({ file, from: rawValue.trim(), to: rewritten, kind });
    }

    return `\\${command}${options}{${rewritten}}`;
  });
}

export function rewriteLatexExportFile(relativePath: string, content: string, report: RewriteReport): string {
  let next = content;

  next = rewriteBraceCommand(next, relativePath, "input", "input", report);
  next = rewriteBraceCommand(next, relativePath, "include", "include", report);
  next = rewriteBraceCommand(next, relativePath, "includegraphics", "includegraphics", report);
  next = rewriteBraceCommand(next, relativePath, "bibliography", "bibliography", report);

  if (next !== content) {
    report.rewrittenFiles.push(relativePath);
  }

  return next;
}

export function createRewriteReport(): RewriteReport {
  return {
    rewrittenFiles: [],
    rewrites: [],
  };
}

export function renderRewriteReport(report: RewriteReport): string {
  return [
    "# Booksmith LaTeX Export Rewrite Report",
    "",
    `Rewritten files: ${report.rewrittenFiles.length}`,
    `Path rewrites: ${report.rewrites.length}`,
    "",
    "## Rewrites",
    "",
    ...report.rewrites.map((rewrite) => `- ${rewrite.file}: ${rewrite.kind} ${rewrite.from} -> ${rewrite.to}`),
    "",
  ].join("\n");
}
