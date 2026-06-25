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

export function createModelProvider(config: ModelProviderConfig): ModelProvider {
  return new OpenAICompatibleProvider(config);
}

export function getEnabledModelProviders(
  configs: ModelProviderConfig[] = defaultModelProviderConfigs,
): ModelProvider[] {
  return configs.filter((config) => config.enabled).map(createModelProvider);
}

export function getModelProvider(
  providerId: string,
  configs: ModelProviderConfig[] = defaultModelProviderConfigs,
): ModelProvider {
  const config = configs.find((candidate) => candidate.id === providerId && candidate.enabled);

  if (!config) {
    throw new ModelProviderNotConfiguredError(providerId);
  }

  return createModelProvider(config);
}
