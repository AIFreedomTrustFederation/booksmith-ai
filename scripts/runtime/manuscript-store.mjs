import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const runtimeDir = path.join(root, ".booksmith");
const provenanceDir = path.join(runtimeDir, "provenance");

function validSlug(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*$/.test(value);
}

function validChapter(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*$/.test(value);
}

function chapterPath(bookSlug, chapterSlug) {
  if (!validSlug(bookSlug) || !validChapter(chapterSlug)) throw new Error("Invalid book or chapter identifier.");
  const file = path.join(root, "books", bookSlug, "manuscript", "chapters", `${chapterSlug}.md`);
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Resolved manuscript path escapes the repository.");
  return file;
}

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}

function words(value) {
  const text = String(value ?? "").trim();
  return text ? text.split(/\s+/).length : 0;
}

export async function readManuscript(bookSlug, chapterSlug) {
  const file = chapterPath(bookSlug, chapterSlug);
  const exists = fs.existsSync(file);
  const text = exists ? await fsp.readFile(file, "utf8") : "";
  return {
    bookSlug,
    chapterSlug,
    path: path.relative(root, file).replaceAll("\\", "/"),
    exists,
    text,
    hash: sha(text),
    words: words(text),
  };
}

async function gitDiff(before, after) {
  const temporary = await fsp.mkdtemp(path.join(os.tmpdir(), "booksmith-diff-"));
  const oldPath = path.join(temporary, "canon.md");
  const newPath = path.join(temporary, "working.md");
  try {
    await Promise.all([fsp.writeFile(oldPath, before, "utf8"), fsp.writeFile(newPath, after, "utf8")]);
    try {
      const { stdout } = await execFileAsync("git", ["diff", "--no-index", "--text", "--unified=3", "--", oldPath, newPath], { cwd: root, maxBuffer: 4 * 1024 * 1024 });
      return stdout;
    } catch (error) {
      if (error?.code === 1) return error.stdout ?? "";
      return "";
    }
  } finally {
    await fsp.rm(temporary, { recursive: true, force: true });
  }
}

function lineStats(before, after) {
  const oldLines = before.split("\n");
  const newLines = after.split("\n");
  const oldSet = new Map();
  for (const line of oldLines) oldSet.set(line, (oldSet.get(line) ?? 0) + 1);
  let additions = 0;
  const remaining = new Map(oldSet);
  for (const line of newLines) {
    const count = remaining.get(line) ?? 0;
    if (count > 0) remaining.set(line, count - 1);
    else additions += 1;
  }
  const deletions = [...remaining.values()].reduce((sum, count) => sum + count, 0);
  return { additions, deletions, beforeLines: oldLines.length, afterLines: newLines.length };
}

export async function diffManuscript({ bookSlug, chapterSlug, draft }) {
  const current = await readManuscript(bookSlug, chapterSlug);
  const next = String(draft ?? "");
  return {
    ...current,
    changed: next !== current.text,
    workingHash: sha(next),
    workingWords: words(next),
    stats: lineStats(current.text, next),
    diff: await gitDiff(current.text, next),
  };
}

async function appendProvenance(record) {
  await fsp.mkdir(provenanceDir, { recursive: true });
  await fsp.appendFile(path.join(provenanceDir, "manuscript-events.jsonl"), `${JSON.stringify(record)}\n`, "utf8");
}

async function gitCommit(relativePath, message) {
  const gitDirectory = path.join(root, ".git");
  if (!fs.existsSync(gitDirectory)) return { committed: false, reason: "Repository has no local .git directory." };
  await execFileAsync("git", ["add", "--", relativePath], { cwd: root });
  try {
    const { stdout } = await execFileAsync("git", ["commit", "-m", message], { cwd: root, maxBuffer: 2 * 1024 * 1024 });
    const { stdout: head } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: root });
    return { committed: true, sha: head.trim(), output: stdout.trim() };
  } catch (error) {
    const output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`.trim();
    if (/nothing to commit/i.test(output)) return { committed: false, reason: "Nothing to commit." };
    throw error;
  }
}

export async function saveManuscript({ bookSlug, chapterSlug, draft, expectedHash, commit = false, message }) {
  const current = await readManuscript(bookSlug, chapterSlug);
  if (expectedHash && expectedHash !== current.hash) {
    const error = new Error("Canonical manuscript changed after this working copy was loaded.");
    error.code = "BOOKSMITH_CONFLICT";
    error.current = current;
    throw error;
  }

  const next = String(draft ?? "");
  if (next === current.text) return { saved: false, unchanged: true, manuscript: current };

  const target = chapterPath(bookSlug, chapterSlug);
  await fsp.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.booksmith-${randomUUID()}.tmp`;
  await fsp.writeFile(temporary, next, "utf8");
  await fsp.rename(temporary, target);

  const manuscript = await readManuscript(bookSlug, chapterSlug);
  const event = {
    id: randomUUID(),
    type: "author-approved-manuscript-save",
    bookSlug,
    chapterSlug,
    path: manuscript.path,
    previousHash: current.hash,
    newHash: manuscript.hash,
    previousWords: current.words,
    newWords: manuscript.words,
    approvedAt: new Date().toISOString(),
    authority: "explicit-runtime-save",
  };
  await appendProvenance(event);

  const git = commit
    ? await gitCommit(manuscript.path, message?.trim() || `Update ${bookSlug} chapter ${chapterSlug} in Booksmith`)
    : { committed: false, reason: "Git commit not requested." };

  return { saved: true, unchanged: false, manuscript, provenance: event, git };
}

export async function gitStatus() {
  if (!fs.existsSync(path.join(root, ".git"))) return { available: false, branch: null, status: [] };
  const [{ stdout: branch }, { stdout: status }] = await Promise.all([
    execFileAsync("git", ["branch", "--show-current"], { cwd: root }),
    execFileAsync("git", ["status", "--short"], { cwd: root }),
  ]);
  return {
    available: true,
    branch: branch.trim(),
    status: status.split("\n").filter(Boolean),
  };
}

export async function recentManuscriptProvenance(limit = 100) {
  const file = path.join(provenanceDir, "manuscript-events.jsonl");
  if (!fs.existsSync(file)) return [];
  const lines = (await fsp.readFile(file, "utf8")).trim().split("\n").filter(Boolean);
  return lines.slice(-Math.max(1, Math.min(Number(limit), 500))).reverse().map((line) => JSON.parse(line));
}
