import { createHash } from "node:crypto";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import type { ModelRole } from "./model-provider";

export type AiTaskProvenanceRecord = {
  id: string;
  taskId: string;
  role: ModelRole;
  providerId: string;
  providerKind: string;
  model: string;
  promptAssetId: string;
  promptAssetVersion: string;
  bookSlug?: string;
  sourcePath?: string;
  requestedAt: string;
  generatedAt: string;
  localFirst: boolean;
  userManaged: boolean;
  inputHash: string;
  outputHash: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

const provenanceDirectory = path.join(process.cwd(), "data", "provenance");
const aiTaskLogPath = path.join(provenanceDirectory, "ai-tasks.jsonl");

export async function appendAiTaskProvenance(record: AiTaskProvenanceRecord): Promise<void> {
  await mkdir(provenanceDirectory, { recursive: true });
  await appendFile(aiTaskLogPath, `${JSON.stringify(record)}\n`, "utf8");
}

export async function sha256Hex(value: string): Promise<string> {
  return createHash("sha256").update(value).digest("hex");
}
