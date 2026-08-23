export type RuntimeConfig = {
  baseUrl: string;
  token: string;
};

export type RuntimeHealth = {
  ok: boolean;
  runtime: string;
  host: string;
  port: number;
  remoteBinding: boolean;
  tokenRequired: boolean;
  node: string;
  sqlite: { ready: boolean; metadata?: Record<string, string>; error?: string };
  providers: Array<{ id: string; label: string; kind: string; enabled: boolean; localFirst: boolean; defaultModel: string | null }>;
  enabledProviders: string[];
  jobs: Array<{ kind: string; consequential: boolean }>;
};

export type RuntimeManuscript = {
  bookSlug: string;
  chapterSlug: string;
  path: string;
  exists: boolean;
  text: string;
  hash: string;
  words: number;
};

export type ManuscriptDiff = RuntimeManuscript & {
  changed: boolean;
  workingHash: string;
  workingWords: number;
  stats: { additions: number; deletions: number; beforeLines: number; afterLines: number };
  diff: string;
};

export type RuntimeJob = {
  id: string;
  kind: string;
  bookSlug: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  log: string;
};

const configKey = "booksmith:runtime:config";

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") return { baseUrl: "http://127.0.0.1:8787", token: "" };
  try {
    const stored = JSON.parse(window.localStorage.getItem(configKey) ?? "{}") as Partial<RuntimeConfig>;
    return {
      baseUrl: (stored.baseUrl || "http://127.0.0.1:8787").replace(/\/$/, ""),
      token: stored.token || "",
    };
  } catch {
    return { baseUrl: "http://127.0.0.1:8787", token: "" };
  }
}

export function saveRuntimeConfig(config: RuntimeConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(configKey, JSON.stringify({
    baseUrl: config.baseUrl.replace(/\/$/, ""),
    token: config.token,
  }));
}

async function request<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const config = getRuntimeConfig();
  const response = await fetch(`${config.baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({ error: response.statusText }));
  if (!response.ok) {
    const error = new Error(payload.error ?? `Booksmith Runtime returned ${response.status}.`) as Error & { status?: number; code?: string; payload?: unknown };
    error.status = response.status;
    error.code = payload.code;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

export function runtimeHealth() {
  return request<RuntimeHealth>("/v1/health", { method: "GET" });
}

export function runtimeManuscript(bookSlug: string, chapterSlug: string) {
  return request<RuntimeManuscript>(`/v1/manuscript?book=${encodeURIComponent(bookSlug)}&chapter=${encodeURIComponent(chapterSlug)}`, { method: "GET" });
}

export function runtimeDiff(bookSlug: string, chapterSlug: string, draft: string) {
  return request<ManuscriptDiff>("/v1/manuscript/diff", {
    method: "POST",
    body: JSON.stringify({ bookSlug, chapterSlug, draft }),
  });
}

export function runtimeSave(args: { bookSlug: string; chapterSlug: string; draft: string; expectedHash: string; commit?: boolean; message?: string }) {
  return request<{ saved: boolean; unchanged: boolean; manuscript: RuntimeManuscript; provenance?: unknown; git?: { committed: boolean; sha?: string; reason?: string } }>("/v1/manuscript/save", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

export function runtimeAiTask(input: Record<string, unknown>) {
  return request<{ taskId: string; content: string; providerId: string; model: string; provenance: unknown }>("/v1/ai/task", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function runtimeAiStream(
  input: Record<string, unknown>,
  onEvent: (event: { type: string; data: unknown }) => void,
) {
  const config = getRuntimeConfig();
  const response = await fetch(`${config.baseUrl}/v1/ai/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error ?? `AI stream failed with ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const lines = frame.split("\n");
      const type = lines.find((line) => line.startsWith("event:"))?.slice(6).trim() ?? "message";
      const raw = lines.filter((line) => line.startsWith("data:")) .map((line) => line.slice(5).trim()).join("\n");
      let data: unknown = raw;
      try { data = JSON.parse(raw); } catch { /* preserve raw event */ }
      onEvent({ type, data });
    }
  }
}

export function runtimeSearch(query: string, bookSlug?: string, limit = 30) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (bookSlug) params.set("book", bookSlug);
  return request<Array<{ id: string; bookSlug: string; kind: string; path: string; title: string; snippet: string; rank: number }>>(`/v1/search?${params}`, { method: "GET" });
}

export function runtimeGraph(bookSlug?: string) {
  const query = bookSlug ? `?book=${encodeURIComponent(bookSlug)}` : "";
  return request<{ entities: Array<{ id: string; kind: string; label: string; domain: string | null }>; edges: Array<{ source: string; target: string; relation: string; bookSlug: string | null }> }>(`/v1/graph${query}`, { method: "GET" });
}

export function runtimeRebuildIndex() {
  return request<{ dbPath: string; documentCount: number; entityCount: number; edgeCount: number; rebuiltAt: string }>("/v1/index/rebuild", { method: "POST", body: "{}" });
}

export function runtimeStartJob(kind: string, bookSlug?: string, confirmation?: string) {
  return request<RuntimeJob>("/v1/jobs", {
    method: "POST",
    body: JSON.stringify({ kind, bookSlug, confirmation }),
  });
}

export function runtimeJobs(limit = 30) {
  return request<RuntimeJob[]>(`/v1/jobs?limit=${limit}`, { method: "GET" });
}

export function runtimeJob(id: string) {
  return request<RuntimeJob>(`/v1/jobs/${encodeURIComponent(id)}`, { method: "GET" });
}

export function runtimeGitStatus() {
  return request<{ available: boolean; branch: string | null; status: string[] }>("/v1/git/status", { method: "GET" });
}

export function runtimeProvenance(limit = 100) {
  return request<{ manuscript: unknown[]; ai: unknown[] }>(`/v1/provenance?limit=${limit}`, { method: "GET" });
}
