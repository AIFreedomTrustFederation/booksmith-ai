export type ModelProviderKind = "ollama" | "llama-cpp" | "vllm" | "openai-compatible";

export type ModelRole =
  | "drafting"
  | "rewriting"
  | "editing"
  | "continuity"
  | "story-bible"
  | "citations"
  | "marketing"
  | "embeddings";

export type ModelProviderConfig = {
  id: string;
  kind: ModelProviderKind;
  label: string;
  baseUrl: string;
  defaultModel?: string;
  enabled: boolean;
  localFirst: boolean;
  userManaged: boolean;
  notes?: string;
};

export type ModelMessageRole = "system" | "user" | "assistant";

export type ModelMessage = {
  role: ModelMessageRole;
  content: string;
};

export type ModelGenerationRequest = {
  model?: string;
  role: ModelRole;
  messages: ModelMessage[];
  temperature?: number;
  maxTokens?: number;
  provenance?: {
    bookSlug?: string;
    sourcePath?: string;
    promptAssetId?: string;
  };
};

export type ModelGenerationResponse = {
  providerId: string;
  model: string;
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  provenance: {
    providerKind: ModelProviderKind;
    localFirst: boolean;
    generatedAt: string;
  };
};

export type ModelHealth = {
  providerId: string;
  ok: boolean;
  checkedAt: string;
  message: string;
  models?: string[];
};

export interface ModelProvider {
  readonly config: ModelProviderConfig;
  health(): Promise<ModelHealth>;
  listModels(): Promise<string[]>;
  generate(request: ModelGenerationRequest): Promise<ModelGenerationResponse>;
}

export class ModelProviderNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`Model provider is not configured or enabled: ${providerId}`);
    this.name = "ModelProviderNotConfiguredError";
  }
}

export class ModelProviderRequestError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ModelProviderRequestError";
  }
}
