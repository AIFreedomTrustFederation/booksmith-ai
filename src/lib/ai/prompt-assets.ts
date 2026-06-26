import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ModelRole } from "./model-provider";

export type PromptAsset = {
  id: string;
  role: ModelRole;
  version: string;
  approved: boolean;
  system: string;
  instructions: string;
};

export type PromptAssetRegistry = {
  registryId: string;
  version: string;
  description: string;
  prompts: PromptAsset[];
};

export class PromptAssetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptAssetError";
  }
}

const promptRegistryPath = path.join(process.cwd(), "prompts", "ai", "task-prompts.json");

export async function loadPromptAssetRegistry(): Promise<PromptAssetRegistry> {
  const raw = await readFile(promptRegistryPath, "utf8");
  const registry = JSON.parse(raw) as PromptAssetRegistry;

  if (!Array.isArray(registry.prompts)) {
    throw new PromptAssetError("Prompt asset registry must contain a prompts array.");
  }

  return registry;
}

export async function getApprovedPromptAsset(role: ModelRole, promptAssetId?: string): Promise<PromptAsset> {
  const registry = await loadPromptAssetRegistry();
  const prompt = registry.prompts.find((candidate) => {
    if (promptAssetId) return candidate.id === promptAssetId;
    return candidate.role === role && candidate.approved;
  });

  if (!prompt) {
    throw new PromptAssetError(
      promptAssetId
        ? `No prompt asset found for id: ${promptAssetId}`
        : `No approved prompt asset found for role: ${role}`,
    );
  }

  if (!prompt.approved) {
    throw new PromptAssetError(`Prompt asset is not approved for production use: ${prompt.id}`);
  }

  if (prompt.role !== role) {
    throw new PromptAssetError(`Prompt asset ${prompt.id} is for role ${prompt.role}, not ${role}.`);
  }

  return prompt;
}
