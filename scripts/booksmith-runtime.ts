import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";

import { runAiTask, type AiTaskInput } from "../src/lib/ai/ai-task-service";
import { getEnabledModelProviders, getModelProvider, getModelProviderConfigs } from "../src/lib/ai/provider-registry";
import { getJob, listJobKinds, recentJobs, startJob } from "./runtime/job-runner.mjs";
import { diffManuscript, gitStatus, readManuscript, recentManuscriptProvenance, saveManuscript } from "./runtime/manuscript-store.mjs";
import { readProviderSettings, writeProviderSettings } from "./runtime/provider-settings.mjs";
import { booksmithGraph, indexStatus, rebuildBooksmithIndex, searchBooksmithIndex } from "./runtime/sqlite-index.mjs";
import { importSource } from "./runtime/source-importer.mjs";

const root = process.cwd();
const host = process.env.BOOKSMITH_RUNTIME_HOST ?? "127.0.0.1";
const port = Number(process.env.BOOKSMITH_RUNTIME_PORT ?? "8787");
const token = process.env.BOOKSMITH_RUNTIME_TOKEN?.trim() ?? "";
const remoteBinding = !["127.0.0.1", "localhost", "::1"].includes(host);

if (remoteBinding && !token) throw new Error("BOOKSMITH_RUNTIME_TOKEN is required when the runtime binds beyond loopback.");

const configuredOrigins = new Set((process.env.BOOKSMITH_ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean));

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function originAllowed(origin: string | undefined) {
  if (!origin) return true;
  return isLocalOrigin(origin) || configuredOrigins.has(origin);
}

function authorized(request: IncomingMessage) {
  if (!token) return !remoteBinding;
  const header = request.headers.authorization;
  const supplied = header?.startsWith("Bearer ") ? header.slice(7) : request.headers["x-booksmith-token"];
  return supplied === token;
}

function applyCors(request: IncomingMessage, response: ServerResponse) {
  const origin = request.headers.origin;
  if (origin && originAllowed(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Booksmith-Token");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Cache-Control", "no-store");
}

function json(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}

async function body(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > 40 * 1024 * 1024) throw new Error("Request body exceeds 40 MiB.");
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function requireMutationAccess(request: IncomingMessage) {
  if (!originAllowed(request.headers.origin)) {
    const error = new Error("Origin is not allowed by Booksmith Runtime.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  if (!authorized(request)) {
    const error = new Error("Booksmith Runtime authorization failed.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
}

function safeLimit(value: string | null, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, 500)) : fallback;
}

async function readJsonLines(file: string, limit: number) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
  return lines.slice(-limit).reverse().map((line) => {
    try { return JSON.parse(line); } catch { return { raw: line }; }
  });
}

function publicProviderConfig() {
  return getModelProviderConfigs().map((provider) => ({
    id: provider.id,
    label: provider.label,
    kind: provider.kind,
    enabled: provider.enabled,
    localFirst: provider.localFirst,
    userManaged: provider.userManaged,
    baseUrl: provider.baseUrl,
    defaultModel: provider.defaultModel ?? null,
    notes: provider.notes ?? null,
  }));
}

async function health() {
  let sqlite;
  try { sqlite = await indexStatus(); } catch (error) { sqlite = { ready: false, error: error instanceof Error ? error.message : String(error) }; }
  return {
    ok: true,
    runtime: "booksmith-runtime-v1",
    pid: process.pid,
    host,
    port,
    remoteBinding,
    tokenRequired: Boolean(token),
    repository: root,
    node: process.version,
    sqlite,
    importMaxBytes: Number(process.env.BOOKSMITH_IMPORT_MAX_BYTES ?? 25 * 1024 * 1024),
    providers: publicProviderConfig(),
    enabledProviders: getEnabledModelProviders().map((provider) => provider.config.id),
    jobs: listJobKinds(),
  };
}

async function streamAi(request: IncomingMessage, response: ServerResponse) {
  requireMutationAccess(request);
  const input = await body(request) as AiTaskInput;
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.write(`event: status\ndata: ${JSON.stringify({ phase: "started", at: new Date().toISOString() })}\n\n`);
  try {
    const result = await runAiTask(input);
    response.write(`event: proposal\ndata: ${JSON.stringify(result)}\n\n`);
    response.write(`event: done\ndata: ${JSON.stringify({ phase: "complete", taskId: result.taskId })}\n\n`);
  } catch (error) {
    response.write(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : String(error) })}\n\n`);
  } finally {
    response.end();
  }
}

const server = createServer(async (request, response) => {
  applyCors(request, response);
  if (request.method === "OPTIONS") {
    if (!originAllowed(request.headers.origin)) return json(response, 403, { error: "Origin not allowed." });
    response.statusCode = 204;
    return response.end();
  }

  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
    const route = url.pathname;

    if (request.method === "GET" && route === "/v1/health") return json(response, 200, await health());

    if (request.method === "GET" && route === "/v1/providers") {
      return json(response, 200, { providers: publicProviderConfig(), overrides: (await readProviderSettings()).providers });
    }

    if (request.method === "POST" && route === "/v1/providers") {
      requireMutationAccess(request);
      await writeProviderSettings(await body(request));
      return json(response, 200, { providers: publicProviderConfig() });
    }

    if (request.method === "POST" && route === "/v1/providers/health") {
      requireMutationAccess(request);
      const input = await body(request) as { providerId?: string };
      if (input.providerId) return json(response, 200, await getModelProvider(input.providerId).health());
      const results = await Promise.all(getEnabledModelProviders().map((provider) => provider.health()));
      return json(response, 200, results);
    }

    if (request.method === "GET" && route === "/v1/manuscript") return json(response, 200, await readManuscript(url.searchParams.get("book") ?? "", url.searchParams.get("chapter") ?? ""));

    if (request.method === "POST" && route === "/v1/manuscript/diff") {
      requireMutationAccess(request);
      return json(response, 200, await diffManuscript(await body(request)));
    }

    if (request.method === "POST" && route === "/v1/manuscript/save") {
      requireMutationAccess(request);
      return json(response, 200, await saveManuscript(await body(request)));
    }

    if (request.method === "POST" && route === "/v1/ai/task") {
      requireMutationAccess(request);
      return json(response, 200, await runAiTask(await body(request) as AiTaskInput));
    }

    if (request.method === "POST" && route === "/v1/ai/stream") return streamAi(request, response);

    if (request.method === "POST" && route === "/v1/sources/import") {
      requireMutationAccess(request);
      const imported = await importSource(await body(request));
      let index = null;
      try { index = await rebuildBooksmithIndex(); } catch { /* source remains safely imported even if SQLite is unavailable */ }
      return json(response, 201, { ...imported, index });
    }

    if (request.method === "POST" && route === "/v1/index/rebuild") {
      requireMutationAccess(request);
      return json(response, 200, await rebuildBooksmithIndex());
    }

    if (request.method === "GET" && route === "/v1/index/status") return json(response, 200, await indexStatus());

    if (request.method === "GET" && route === "/v1/search") {
      return json(response, 200, await searchBooksmithIndex(url.searchParams.get("q") ?? "", {
        bookSlug: url.searchParams.get("book") || undefined,
        limit: safeLimit(url.searchParams.get("limit"), 30),
      }));
    }

    if (request.method === "GET" && route === "/v1/graph") return json(response, 200, await booksmithGraph(url.searchParams.get("book") || undefined));
    if (request.method === "GET" && route === "/v1/git/status") return json(response, 200, await gitStatus());

    if (request.method === "POST" && route === "/v1/jobs") {
      requireMutationAccess(request);
      return json(response, 202, await startJob(await body(request)));
    }

    if (request.method === "GET" && route === "/v1/jobs") return json(response, 200, await recentJobs(safeLimit(url.searchParams.get("limit"), 30)));

    if (request.method === "GET" && route.startsWith("/v1/jobs/")) {
      const job = await getJob(route.slice("/v1/jobs/".length));
      return job ? json(response, 200, job) : json(response, 404, { error: "Job not found." });
    }

    if (request.method === "GET" && route === "/v1/provenance") {
      const limit = safeLimit(url.searchParams.get("limit"), 100);
      const [manuscript, ai, sources] = await Promise.all([
        recentManuscriptProvenance(limit),
        readJsonLines(path.join(root, "data", "provenance", "ai-tasks.jsonl"), limit),
        readJsonLines(path.join(root, ".booksmith", "provenance", "source-events.jsonl"), limit),
      ]);
      return json(response, 200, { manuscript, ai, sources });
    }

    return json(response, 404, { error: "Booksmith Runtime route not found.", route });
  } catch (error) {
    const status = (error as Error & { status?: number; code?: string }).status
      ?? ((error as Error & { code?: string }).code === "BOOKSMITH_CONFLICT" ? 409 : 400);
    return json(response, status, {
      error: error instanceof Error ? error.message : String(error),
      code: (error as Error & { code?: string }).code ?? null,
      current: (error as Error & { current?: unknown }).current ?? null,
    });
  }
});

server.listen(port, host, async () => {
  console.log(`Booksmith Runtime v1 listening on http://${host}:${port}`);
  console.log(remoteBinding ? "Remote binding enabled with token protection." : "Loopback-only mode enabled.");
  if (process.env.BOOKSMITH_INDEX_ON_START !== "false") {
    try {
      const result = await rebuildBooksmithIndex();
      console.log(`Booksmith SQLite index ready: ${result.documentCount} documents, ${result.entityCount} entities, ${result.edgeCount} edges.`);
    } catch (error) {
      console.warn(`Booksmith index rebuild skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

function shutdown(signal: string) {
  console.log(`\n${signal}: closing Booksmith Runtime.`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
