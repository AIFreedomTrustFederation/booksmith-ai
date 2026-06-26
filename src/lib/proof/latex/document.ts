import fs from "node:fs/promises";
import path from "node:path";

export type LatexCommandNode = {
  kind: "command";
  command: string;
  file: string;
  start: number;
  end: number;
  argumentStart: number;
  argumentEnd: number;
  argument: string;
};

export type LatexDocumentFile = {
  file: string;
  content: string;
  commands: LatexCommandNode[];
};

export type LatexDocument = {
  rootDir: string;
  files: LatexDocumentFile[];
};

const trackedCommands = new Set([
  "chapter",
  "section",
  "subsection",
  "subsubsection",
  "paragraph",
  "caption",
  "label",
  "ref",
  "pageref",
  "autoref",
  "cref",
  "Cref",
  "eqref",
  "includegraphics",
  "input",
  "include",
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  }));
  return files.flat().sort();
}

function findMatchingBrace(content: string, openIndex: number): number {
  let depth = 0;

  for (let i = openIndex; i < content.length; i++) {
    const char = content[i];
    const previous = content[i - 1];

    if (previous === "\\") continue;

    if (char === "{") depth++;
    if (char === "}") depth--;

    if (depth === 0) return i;
  }

  return -1;
}

export function parseLatexCommands(file: string, content: string): LatexCommandNode[] {
  const commands: LatexCommandNode[] = [];
  const commandPattern = /\\([A-Za-z]+)\s*(?:\[[^\]]*\])?\s*\{/g;

  for (const match of content.matchAll(commandPattern)) {
    const command = match[1];
    if (!trackedCommands.has(command)) continue;

    const start = match.index ?? 0;
    const openBrace = content.indexOf("{", start + match[0].indexOf(command) + command.length);
    if (openBrace < 0) continue;

    const closeBrace = findMatchingBrace(content, openBrace);
    if (closeBrace < 0) continue;

    commands.push({
      kind: "command",
      command,
      file,
      start,
      end: closeBrace + 1,
      argumentStart: openBrace + 1,
      argumentEnd: closeBrace,
      argument: content.slice(openBrace + 1, closeBrace),
    });
  }

  return commands;
}

export async function loadLatexDocument(rootDir: string): Promise<LatexDocument> {
  const texFiles = (await walk(rootDir)).filter((file) => file.endsWith(".tex"));
  const files = await Promise.all(texFiles.map(async (file) => {
    const content = await fs.readFile(file, "utf8");
    return {
      file,
      content,
      commands: parseLatexCommands(file, content),
    };
  }));

  return { rootDir, files };
}

export async function writeLatexDocumentFile(file: LatexDocumentFile): Promise<void> {
  await fs.writeFile(file.file, file.content, "utf8");
}

export function relativeLatexPath(rootDir: string, file: string): string {
  return path.relative(rootDir, file).replaceAll("\\", "/");
}
