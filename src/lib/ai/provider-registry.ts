import fs from "node:fs";
import path from "node:path";

import { ModelProvider, ModelProviderConfig, ModelProviderNotConfiguredError } from "./model-provider";
import { OpenAICompatibleProvider } from "./providers/openai-compatible-provider";

export const defaultModelProviderConfigs: ModelProviderConfig[] = [
  {
    id: "ollama-local",
    kind: "ollama",
    label: "Ollama Local",
    baseUrl: process.env.BOOKSMITH_OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1/",
    defaultModel: process.env.BOOKSMITH_OLLAMA_MODEL,
    enabled: process.env.BOOKSMITH_OLLAMA_ENABLED === "true",
    localFirst: true,
    userManaged: true,
    notes: "Uses Ollama's OpenAI-compatible local endpoint when enabled by the user.",
  },
  {
    id: "llama-cpp-local",
    kind: "llama-cpp",
    label: "llama.cpp Local Server",
    baseUrl: process.env.BOOKSMITH_LLAMA_CPP_BASE_URL ?? "http://127.0.0.1:8080/v1/",
    defaultModel: process.env.BOOKSMITH_LLAMA_CPP_MODEL,
    enabled: process.env.BOOKSMITH_LLAMA_CPP_ENABLED === "true",
    localFirst: true,
    userManaged: true,
    notes: "Uses a user-managed llama.cpp OpenAI-compatible server.",
  },
  {
    id: "vllm-local",
    kind: "vllm",
    label: "vLLM Self-Hosted Server",
    baseUrl: process.env.BOOKSMITH_VLLM_BASE_URL ?? "http://127.0.0.1:8000/v1/",
    defaultModel: process.env.BOOKSMITH_VLLM_MODEL,
    enabled: process.env.BOOKSMITH_VLLM_ENABLED === "true",
    localFirst: true,
    userManaged: true,
    notes: "Uses a self-hosted vLLM OpenAI-compatible server.",
  },
];

type ProviderOverride = {
  id: string;
  enabled?: boolean;
  baseUrl?: string;
  defaultModel?: string;
};

type ProviderOverrideFile = { providers?: ProviderOverride[] };

function loadRuntimeOverrides(): ProviderOverride[] {
  const file = path.join(process.cwd(), ".booksmith", "providers.json");
  try {
    if (!fs.existsSync(file)) return [];
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as ProviderOverrideFile;
    return Array.isArray(parsed.providers) ? parsed.providers : [];
  } catch {
    return [];
  }
}

export function getModelProviderConfigs(): ModelProviderConfig[] {
  const overrides = new Map(loadRuntimeOverrides().map((provider) => [provider.id, provider]));
  return defaultModelProviderConfigs.map((base) => {
    const override = overrides.get(base.id);
    if (!override) return { ...base };
    return {
      ...base,
      enabled: typeof override.enabled === "boolean" ? override.enabled : base.enabled,
      baseUrl: override.baseUrl?.trim() || base.baseUrl,
      defaultModel: override.defaultModel?.trim() || base.defaultModel,
    };
  });
}

export function createModelProvider(config: ModelProviderConfig): ModelProvider {
  return new OpenAICompatibleProvider(config);
}

export function getEnabledModelProviders(
  configs: ModelProviderConfig[] = getModelProviderConfigs(),
): ModelProvider[] {
  return configs.filter((config) => config.enabled).map(createModelProvider);
}

export function getModelProvider(
  providerId: string,
  configs: ModelProviderConfig[] = getModelProviderConfigs(),
): ModelProvider {
  const config = configs.find((candidate) => candidate.id === providerId && candidate.enabled);

  if (!config) {
    throw new ModelProviderNotConfiguredError(providerId);
  }

  return createModelProvider(config);
}
