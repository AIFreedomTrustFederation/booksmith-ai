import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import dns from "node:dns/promises";
import fs from "node:fs";
import fsp from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const maxBytes = Number(process.env.BOOKSMITH_IMPORT_MAX_BYTES ?? 25 * 1024 * 1024);

function safeSlug(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*$/.test(value);
}

function slugify(value) {
  return String(value || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "source";
}

function sourceType(fileName, url) {
  const ext = path.extname(fileName || new URL(url || "https://example.invalid/source").pathname).toLowerCase();
  const map = {
    ".md": "markdown", ".mdx": "markdown", ".txt": "text", ".tex": "latex", ".bib": "bibtex", ".ris": "ris",
    ".json": "json", ".csl": "csl-json", ".pdf": "pdf", ".docx": "docx", ".epub": "epub", ".html": "web", ".htm": "web",
  };
  return map[ext] ?? (url ? "web" : "file");
}

function privateIp(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

async function assertPublicUrl(raw) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Booksmith web imports require HTTPS URLs.");
  if (url.username || url.password) throw new Error("Credential-bearing URLs are not allowed.");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error("Web import target resolves to a private or unsafe address.");
  return url;
}

async function fetchPublic(raw) {
  let url = await assertPublicUrl(raw);
  for (let redirect = 0; redirect < 5; redirect += 1) {
    const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "Booksmith-Runtime/1.0" } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Web source redirected without a location.");
      url = await assertPublicUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`Web source returned HTTP ${response.status}.`);
    const length = Number(response.headers.get("content-length") ?? "0");
    if (length > maxBytes) throw new Error(`Web source exceeds ${maxBytes} bytes.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error(`Web source exceeds ${maxBytes} bytes.`);
    return { bytes, finalUrl: url.toString(), contentType: response.headers.get("content-type") ?? "" };
  }
  throw new Error("Web source exceeded the redirect limit.");
}

function stripHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function commandAvailable(command) {
  try {
    await execFileAsync(process.platform === "win32" ? "where" : "which", [command]);
    return true;
  } catch {
    return false;
  }
}

async function extract(originalPath, type, contentType) {
  const ext = path.extname(originalPath).toLowerCase();
  if (["markdown", "text", "latex", "bibtex", "ris", "json", "csl-json"].includes(type)) {
    return { text: await fsp.readFile(originalPath, "utf8"), method: "direct-text" };
  }
  if (type === "web" || contentType.includes("text/html") || ext === ".html" || ext === ".htm") {
    return { text: stripHtml(await fsp.readFile(originalPath, "utf8")), method: "html-text" };
  }
  if (type === "pdf" && await commandAvailable("pdftotext")) {
    const output = `${originalPath}.txt`;
    await execFileAsync("pdftotext", ["-layout", originalPath, output], { maxBuffer: 8 * 1024 * 1024 });
    const text = await fsp.readFile(output, "utf8");
    await fsp.rm(output, { force: true });
    return { text, method: "pdftotext" };
  }
  if ((type === "docx" || type === "epub") && await commandAvailable("pandoc")) {
    const output = `${originalPath}.md`;
    await execFileAsync("pandoc", [originalPath, "-t", "gfm", "-o", output], { maxBuffer: 8 * 1024 * 1024 });
    const text = await fsp.readFile(output, "utf8");
    await fsp.rm(output, { force: true });
    return { text, method: "pandoc" };
  }
  return { text: "", method: "stored-original-only" };
}

async function updateRegistry(record) {
  const registryPath = path.join(root, "library", "source-registry.json");
  const registry = JSON.parse(await fsp.readFile(registryPath, "utf8"));
  registry.sources = Array.isArray(registry.sources) ? registry.sources : [];
  registry.sources.push(record);
  const temporary = `${registryPath}.booksmith.tmp`;
  await fsp.writeFile(temporary, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await fsp.rename(temporary, registryPath);
}

async function recordProvenance(value) {
  const directory = path.join(root, ".booksmith", "provenance");
  await fsp.mkdir(directory, { recursive: true });
  await fsp.appendFile(path.join(directory, "source-events.jsonl"), `${JSON.stringify(value)}\n`, "utf8");
}

export async function importSource(input) {
  const bookSlug = input.bookSlug;
  if (!safeSlug(bookSlug)) throw new Error("Invalid book slug.");
  if (!fs.existsSync(path.join(root, "books", bookSlug, "book.config.json"))) throw new Error("Book does not exist in this Booksmith repository.");

  const hasFile = typeof input.contentBase64 === "string" && input.contentBase64.length > 0;
  const hasText = typeof input.text === "string" && input.text.length > 0;
  const hasUrl = typeof input.url === "string" && input.url.trim().length > 0;
  if ([hasFile, hasText, hasUrl].filter(Boolean).length !== 1) throw new Error("Provide exactly one source: file content, text, or URL.");

  let bytes;
  let finalUrl = null;
  let contentType = "";
  let fileName = input.fileName ? path.basename(input.fileName) : "source.txt";
  if (hasUrl) {
    const fetched = await fetchPublic(input.url.trim());
    bytes = fetched.bytes;
    finalUrl = fetched.finalUrl;
    contentType = fetched.contentType;
    if (!input.fileName) fileName = path.basename(new URL(finalUrl).pathname) || "web-source.html";
  } else if (hasFile) {
    bytes = Buffer.from(input.contentBase64, "base64");
  } else {
    bytes = Buffer.from(input.text, "utf8");
    if (!input.fileName) fileName = "author-note.md";
  }
  if (bytes.length > maxBytes) throw new Error(`Source exceeds ${maxBytes} bytes.`);

  const type = sourceType(fileName, finalUrl);
  const id = `${bookSlug}-${slugify(fileName)}-${randomUUID().slice(0, 8)}`;
  const directory = path.join(root, "books", bookSlug, "sources", "imported", id);
  await fsp.mkdir(directory, { recursive: true });
  const originalPath = path.join(directory, `original${path.extname(fileName) || ".txt"}`);
  await fsp.writeFile(originalPath, bytes);
  const extraction = await extract(originalPath, type, contentType);
  const extractedPath = path.join(directory, "extracted.md");
  if (extraction.text) await fsp.writeFile(extractedPath, extraction.text, "utf8");

  const metadata = {
    sourceId: id,
    bookSlug,
    sourceType: type,
    originalName: fileName,
    originalUrl: finalUrl,
    contentType,
    extractionMethod: extraction.method,
    extracted: Boolean(extraction.text),
    importedAt: new Date().toISOString(),
    rightsStatus: input.rightsStatus || "review-required",
    notes: input.notes || "",
  };
  await fsp.writeFile(path.join(directory, "source.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

  const location = path.relative(root, extraction.text ? extractedPath : originalPath).replaceAll("\\", "/");
  const record = {
    sourceId: id,
    bookSlug,
    sourceType: type,
    location,
    rightsStatus: metadata.rightsStatus,
    status: extraction.text ? "connected" : "stored-extraction-required",
    notes: metadata.notes || `Imported by Booksmith Runtime using ${extraction.method}.`,
  };
  await updateRegistry(record);
  await recordProvenance({ id: randomUUID(), type: "source-import", ...metadata, location });

  return { record, metadata, directory: path.relative(root, directory).replaceAll("\\", "/") };
}
