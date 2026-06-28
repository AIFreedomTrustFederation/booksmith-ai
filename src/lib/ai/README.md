# Booksmith AI Model Provider Boundary

Booksmith AI must not call model runtimes directly from UI components.

All drafting, rewriting, editing, continuity, citation, story-bible, marketing, and embedding features should go through the internal `ModelProvider` interface in `src/lib/ai/model-provider.ts`.

## Current Providers

The first implementation uses an OpenAI-compatible adapter for local and self-hosted runtimes:

- Ollama local endpoint
- llama.cpp server
- vLLM server
- other user-managed OpenAI-compatible endpoints later

All providers are disabled by default.

## Server-Only Task Service

Use `runAiTask` from `src/lib/ai/ai-task-service.ts` for text-generation workflows.

The service flow is:

```text
typed Booksmith task
→ approved prompt asset from prompts/ai/task-prompts.json
→ role-specific provider selection
→ ModelProvider.generate(...)
→ data/provenance/ai-tasks.jsonl record
→ generated content returned to product workflow
```

The task service records provider ID, provider kind, model, prompt asset ID/version, book slug, source path, request time, generation time, local-first status, user-managed status, input hash, output hash, and token usage when the provider reports it.

## Environment Flags

```bash
BOOKSMITH_OLLAMA_ENABLED=true
BOOKSMITH_OLLAMA_BASE_URL=http://127.0.0.1:11434/v1/
BOOKSMITH_OLLAMA_MODEL=qwen2.5:7b

BOOKSMITH_LLAMA_CPP_ENABLED=true
BOOKSMITH_LLAMA_CPP_BASE_URL=http://127.0.0.1:8080/v1/
BOOKSMITH_LLAMA_CPP_MODEL=local-model

BOOKSMITH_VLLM_ENABLED=true
BOOKSMITH_VLLM_BASE_URL=http://127.0.0.1:8000/v1/
BOOKSMITH_VLLM_MODEL=local-model

BOOKSMITH_AI_DEFAULT_PROVIDER_ID=ollama-local
BOOKSMITH_AI_DRAFTING_PROVIDER_ID=ollama-local
BOOKSMITH_AI_EDITING_PROVIDER_ID=llama-cpp-local
BOOKSMITH_AI_CONTINUITY_PROVIDER_ID=vllm-local
```

## Rules

1. Do not import provider adapters into React UI components.
2. Do not add hosted paid APIs as required core dependencies.
3. Record model choices, prompt asset IDs, book slugs, and source paths in provenance records before production use.
4. Treat all user-managed endpoints as unverified until license and privacy checks are surfaced in the UI.
5. Keep provider configuration explicit and inspectable.
6. Keep `runAiTask` on server routes, server actions, scripts, or other Node/server-only workflows.

## Next Step

Add a thin server route or server action for the Studio UI that calls `runAiTask` without importing provider adapters into client components.
