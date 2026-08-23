import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const jobsDir = path.join(root, ".booksmith", "jobs");
const jobs = new Map();

const definitions = {
  "library-validate": { npmScript: "validate:library:v2" },
  "system-health": { npmScript: "system:health" },
  "proof": { npmScript: "proof:v3" },
  "visual-proof": { npmScript: "proof:visual" },
  "figures": { npmScript: "figure:art-director:pipeline" },
  "publication-gate": { npmScript: "publication:gate:v2" },
  "publishing-packet": { npmScript: "packet:build" },
  "publish": { npmScript: "booksmith:publish-managed", consequential: true },
};

function safeSlug(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*$/.test(value);
}

async function persist(job) {
  await fsp.mkdir(jobsDir, { recursive: true });
  await fsp.writeFile(path.join(jobsDir, `${job.id}.json`), JSON.stringify(job, null, 2), "utf8");
}

function commandFor(definition, bookSlug) {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = ["run", definition.npmScript];
  if (bookSlug) args.push("--", bookSlug);
  return [npm, ...args];
}

export function listJobKinds() {
  return Object.entries(definitions).map(([kind, definition]) => ({ kind, consequential: Boolean(definition.consequential) }));
}

export async function startJob({ kind, bookSlug, confirmation }) {
  const definition = definitions[kind];
  if (!definition) throw new Error(`Unknown job kind: ${kind}`);
  if (bookSlug && !safeSlug(bookSlug)) throw new Error("Invalid book slug.");
  if (definition.consequential && confirmation !== kind) {
    const error = new Error(`Job ${kind} requires explicit confirmation.`);
    error.code = "BOOKSMITH_CONFIRMATION_REQUIRED";
    throw error;
  }

  const [command, ...args] = commandFor(definition, bookSlug);
  const id = randomUUID();
  const job = {
    id,
    kind,
    bookSlug: bookSlug || null,
    command: [command, ...args],
    status: "queued",
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    exitCode: null,
    log: "",
  };
  jobs.set(id, job);
  await persist(job);

  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, BOOKSMITH_JOB_ID: id },
    stdio: ["ignore", "pipe", "pipe"],
  });

  job.status = "running";
  job.startedAt = new Date().toISOString();
  await persist(job);

  const append = async (chunk) => {
    job.log = `${job.log}${chunk.toString()}`.slice(-250_000);
    await persist(job);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  child.on("error", async (error) => {
    job.status = "failed";
    job.finishedAt = new Date().toISOString();
    job.log = `${job.log}\n${error.stack ?? error.message}`.slice(-250_000);
    await persist(job);
  });
  child.on("close", async (code) => {
    job.exitCode = code;
    job.status = code === 0 ? "succeeded" : "failed";
    job.finishedAt = new Date().toISOString();
    await persist(job);
  });

  return { ...job, log: job.log.slice(-20_000) };
}

export async function getJob(id) {
  const memory = jobs.get(id);
  if (memory) return { ...memory, log: memory.log.slice(-100_000) };
  const file = path.join(jobsDir, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(await fsp.readFile(file, "utf8"));
}

export async function recentJobs(limit = 30) {
  await fsp.mkdir(jobsDir, { recursive: true });
  const files = (await fsp.readdir(jobsDir)).filter((file) => file.endsWith(".json"));
  const loaded = await Promise.all(files.map(async (file) => JSON.parse(await fsp.readFile(path.join(jobsDir, file), "utf8"))));
  return loaded.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, Math.max(1, Math.min(Number(limit), 100))).map((job) => ({ ...job, log: job.log.slice(-20_000) }));
}
