import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const directory = path.join(root, ".booksmith");
const file = path.join(directory, "providers.json");
const allowed = new Set(["ollama-local", "llama-cpp-local", "vllm-local"]);

export async function readProviderSettings() {
  try {
    if (!fs.existsSync(file)) return { providers: [] };
    const value = JSON.parse(await fsp.readFile(file, "utf8"));
    return { providers: Array.isArray(value.providers) ? value.providers : [] };
  } catch {
    return { providers: [] };
  }
}

export async function writeProviderSettings(input) {
  if (!Array.isArray(input?.providers)) throw new Error("Provider settings require a providers array.");
  const providers = input.providers.map((candidate) => {
    if (!allowed.has(candidate.id)) throw new Error(`Unsupported provider id: ${candidate.id}`);
    const baseUrl = String(candidate.baseUrl ?? "").trim();
    if (baseUrl) {
      const parsed = new URL(baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Provider base URL must use HTTP or HTTPS.");
    }
    const defaultModel = String(candidate.defaultModel ?? "").trim();
    if (defaultModel.length > 200) throw new Error("Provider model name is too long.");
    return {
      id: candidate.id,
      enabled: Boolean(candidate.enabled),
      ...(baseUrl ? { baseUrl } : {}),
      ...(defaultModel ? { defaultModel } : {}),
    };
  });
  await fsp.mkdir(directory, { recursive: true });
  const temporary = `${file}.tmp`;
  await fsp.writeFile(temporary, `${JSON.stringify({ version: 1, providers }, null, 2)}\n`, "utf8");
  await fsp.rename(temporary, file);
  return { providers };
}
