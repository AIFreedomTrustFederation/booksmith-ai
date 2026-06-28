import "server-only";

import { randomUUID } from "node:crypto";

import type { ModelGenerationResponse, ModelMessage, ModelProvider, ModelRole } from "./model-provider";
import { ModelProviderNotConfiguredError } from "./model-provider";
import { getApprovedPromptAsset, type PromptAsset } from "./prompt-assets";
import { appendAiTaskProvenance, sha256Hex, type AiTaskProvenanceRecord } from "./provenance-log";
import { defaultModelProviderConfigs, getEnabledModelProviders, getModelProvider } from "./provider-registry";

export type AiTaskInput = {
  taskId?: string;
  role: Exclude<ModelRole, "embeddings">;
  instruction: string;
  context?: string;
  bookSlug?: string;
  sourcePath?: string;
  promptAssetId?: string;
  providerId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type AiTaskResult = {
  taskId: string;
  role: AiTaskInput["role"];
  providerId: string;
  model: string;
  promptAsset: { id: string; version: string };
  content: string;
  provenance: AiTaskProvenanceRecord;
  usage?: ModelGenerationResponse["usage"];
};

export class AiTaskServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiTaskServiceError";
  }
}

export async function runAiTask(input: AiTaskInput): Promise<AiTaskResult> {
  validateTaskInput(input);

  const requestedAt = new Date().toISOString();
  const taskId = input.taskId ?? randomUUID();
  const promptAsset = await getApprovedPromptAsset(input.role, input.promptAssetId);
  const provider = selectProvider(input);
  const messages = buildTaskMessages(promptAsset, input);

  const generation = await provider.generate({
    role: input.role,
    model: input.model,
    messages,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    provenance: {
      bookSlug: input.bookSlug,
      sourcePath: input.sourcePath,
      promptAssetId: promptAsset.id,
    },
  });

  const provenance = await buildProvenanceRecord({
    input,
    taskId,
    promptAsset,
    provider,
    generation,
    requestedAt,
  });

  await appendAiTaskProvenance(provenance);

  return {
    taskId,
    role: input.role,
    providerId: generation.providerId,
    model: generation.model,
    promptAsset: { id: promptAsset.id, version: promptAsset.version },
    content: generation.content,
    provenance,
    usage: generation.usage,
  };
}

function validateTaskInput(input: AiTaskInput): void {
  if (input.role === "embeddings") {
    throw new AiTaskServiceError("Embedding tasks require a dedicated service.");
  }

  if (!input.instruction.trim()) {
    throw new AiTaskServiceError("AI task instruction is required.");
  }

  if (input.context !== undefined && !input.context.trim()) {
    throw new AiTaskServiceError("AI task context cannot be empty when provided.");
  }
}

function selectProvider(input: AiTaskInput): ModelProvider {
  if (input.providerId) return getModelProvider(input.providerId);

  const preferredProviderId = providerIdForRole(input.role);
  if (preferredProviderId) {
    try {
      return getModelProvider(preferredProviderId);
    } catch (error) {
      if (!(error instanceof ModelProviderNotConfiguredError)) throw error;
    }
  }

  const provider = getEnabledModelProviders()[0];
  if (!provider) {
    const knownProviders = defaultModelProviderConfigs.map((config) => config.id).join(", ");
    throw new ModelProviderNotConfiguredError(`No enabled provider. Known providers: ${knownProviders}`);
  }

  return provider;
}

function providerIdForRole(role: AiTaskInput["role"]): string | undefined {
  const envKey = `BOOKSMITH_AI_${role.toUpperCase().replaceAll("-", "_")}_PROVIDER_ID`;
  return process.env[envKey] ?? process.env.BOOKSMITH_AI_DEFAULT_PROVIDER_ID;
}

function buildTaskMessages(promptAsset: PromptAsset, input: AiTaskInput): ModelMessage[] {
  const content = [
    `Task role: ${input.role}`,
    input.bookSlug ? `Book slug: ${input.bookSlug}` : undefined,
    input.sourcePath ? `Source path: ${input.sourcePath}` : undefined,
    "",
    "Instruction:",
    input.instruction.trim(),
    input.context ? `\nContext:\n${input.context.trim()}` : undefined,
  ].filter(Boolean).join("\n");

  return [
    { role: "system", content: `${promptAsset.system}\n\n${promptAsset.instructions}` },
    { role: "user", content },
  ];
}

async function buildProvenanceRecord(args: {
  input: AiTaskInput;
  taskId: string;
  promptAsset: PromptAsset;
  provider: ModelProvider;
  generation: ModelGenerationResponse;
  requestedAt: string;
}): Promise<AiTaskProvenanceRecord> {
  return {
    id: randomUUID(),
    taskId: args.taskId,
    role: args.input.role,
    providerId: args.generation.providerId,
    providerKind: args.generation.provenance.providerKind,
    model: args.generation.model,
    promptAssetId: args.promptAsset.id,
    promptAssetVersion: args.promptAsset.version,
    bookSlug: args.input.bookSlug,
    sourcePath: args.input.sourcePath,
    requestedAt: args.requestedAt,
    generatedAt: args.generation.provenance.generatedAt,
    localFirst: args.generation.provenance.localFirst,
    userManaged: args.provider.config.userManaged,
    inputHash: await sha256Hex(JSON.stringify({ ...args.input, taskId: args.taskId })),
    outputHash: await sha256Hex(args.generation.content),
    usage: args.generation.usage,
  };
}
