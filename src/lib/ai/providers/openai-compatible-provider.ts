import {
  ModelGenerationRequest,
  ModelGenerationResponse,
  ModelHealth,
  ModelProvider,
  ModelProviderConfig,
  ModelProviderRequestError,
} from "../model-provider";

type OpenAICompatibleModel = {
  id: string;
};

type OpenAICompatibleModelsResponse = {
  data?: OpenAICompatibleModel[];
};

type OpenAICompatibleChatResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export class OpenAICompatibleProvider implements ModelProvider {
  readonly config: ModelProviderConfig;

  constructor(config: ModelProviderConfig) {
    this.config = config;
  }

  async health(): Promise<ModelHealth> {
    const checkedAt = new Date().toISOString();

    if (!this.config.enabled) {
      return {
        providerId: this.config.id,
        ok: false,
        checkedAt,
        message: "Provider is disabled.",
      };
    }

    try {
      const models = await this.listModels();
      return {
        providerId: this.config.id,
        ok: true,
        checkedAt,
        message: `Provider responded with ${models.length} model(s).`,
        models,
      };
    } catch (error) {
      return {
        providerId: this.config.id,
        ok: false,
        checkedAt,
        message: error instanceof Error ? error.message : "Unknown provider health error.",
      };
    }
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(new URL("models", normalizedBaseUrl(this.config.baseUrl)));

    if (!response.ok) {
      throw new ModelProviderRequestError(
        `${this.config.label} model list failed with HTTP ${response.status}`,
      );
    }

    const payload = (await response.json()) as OpenAICompatibleModelsResponse;
    return (payload.data ?? []).map((model) => model.id).filter(Boolean).sort();
  }

  async generate(request: ModelGenerationRequest): Promise<ModelGenerationResponse> {
    const model = request.model ?? this.config.defaultModel;

    if (!model) {
      throw new ModelProviderRequestError(`${this.config.label} requires a model name.`);
    }

    const response = await fetch(new URL("chat/completions", normalizedBaseUrl(this.config.baseUrl)), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new ModelProviderRequestError(
        `${this.config.label} generation failed with HTTP ${response.status}`,
      );
    }

    const payload = (await response.json()) as OpenAICompatibleChatResponse;
    const choice = payload.choices?.[0];
    const content = choice?.message?.content;

    if (!content) {
      throw new ModelProviderRequestError(`${this.config.label} returned no generated content.`);
    }

    return {
      providerId: this.config.id,
      model: payload.model ?? model,
      content,
      finishReason: choice?.finish_reason,
      usage: {
        promptTokens: payload.usage?.prompt_tokens,
        completionTokens: payload.usage?.completion_tokens,
        totalTokens: payload.usage?.total_tokens,
      },
      provenance: {
        providerKind: this.config.kind,
        localFirst: this.config.localFirst,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

function normalizedBaseUrl(baseUrl: string): URL {
  const withSlash = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(withSlash);
}
