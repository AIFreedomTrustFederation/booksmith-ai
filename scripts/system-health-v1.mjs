import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, ".booksmith-build", "system-health");
const outJson = path.join(outDir, "system-health-v1.json");
const outMd = path.join(outDir, "system-health-v1.md");

fs.mkdirSync(outDir, { recursive: true });

function run(cmd, args = []) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function commandVersion(name, args = ["--version"]) {
  const r = run(name, args);
  return {
    installed: r.ok,
    version: r.ok ? (r.stdout.split("\n")[0] || r.stderr.split("\n")[0] || "installed") : null,
    error: r.ok ? null : (r.stderr || r.stdout || "not found"),
  };
}

function localPackageVersion(name) {
  const pkg = path.join(root, "node_modules", name, "package.json");
  if (!fs.existsSync(pkg)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkg, "utf8")).version || null;
  } catch {
    return null;
  }
}

const isTermux = Boolean(process.env.TERMUX_VERSION || process.env.PREFIX?.includes("com.termux"));
const isAndroid = os.platform() === "android";
const arch = os.arch();
const platform = os.platform();

const nextLocal = path.join(root, "node_modules", ".bin", "next");
const hasLocalNext = fs.existsSync(nextLocal);

const health = {
  schema: "booksmith.system-health.v1",
  generatedAt: new Date().toISOString(),
  platform: {
    platform,
    arch,
    release: os.release(),
    isAndroid,
    isTermux,
    shell: process.env.SHELL || null,
    prefix: process.env.PREFIX || null,
    home: process.env.HOME || null,
  },
  runtime: {
    node: process.version,
    npm: commandVersion("npm", ["--version"]),
    git: commandVersion("git", ["--version"]),
    python: commandVersion("python", ["--version"]),
  },
  next: {
    localBinary: hasLocalNext ? path.relative(root, nextLocal) : null,
    localVersion: localPackageVersion("next"),
    reactVersion: localPackageVersion("react"),
    recommendedDevCommand: isAndroid || isTermux
      ? "npx next dev --webpack"
      : "npx next dev",
    turbopackSupported: !(isAndroid || isTermux),
    webpackRequired: isAndroid || isTermux,
  },
  publishingTools: {
    xelatex: commandVersion("xelatex", ["--version"]),
    lualatex: commandVersion("lualatex", ["--version"]),
    pdflatex: commandVersion("pdflatex", ["--version"]),
    tectonic: commandVersion("tectonic", ["--version"]),
    zip: commandVersion("zip", ["--version"]),
    unzip: commandVersion("unzip", ["-v"]),
    magick: commandVersion("magick", ["--version"]),
    convert: commandVersion("convert", ["--version"]),
    gs: commandVersion("gs", ["--version"]),
    pandoc: commandVersion("pandoc", ["--version"]),
    ffmpeg: commandVersion("ffmpeg", ["-version"]),
  },
  aiProviders: {
    ollama: commandVersion("ollama", ["--version"]),
    comfyuiHint: {
      installed: false,
      version: null,
      error: "Not auto-detected. Configure provider endpoint later.",
    },
  },
  recommendations: [],
};

if (health.next.webpackRequired) {
  health.recommendations.push("Use Webpack for Next.js dev on Termux/Android: npx next dev --webpack");
}

if (!hasLocalNext) {
  health.recommendations.push("Install project dependencies with npm install before launching Studio.");
}

if (!health.publishingTools.xelatex.installed && !health.publishingTools.lualatex.installed && !health.publishingTools.pdflatex.installed) {
  health.recommendations.push("Install at least one TeX engine for PDF builds.");
}

if (!health.publishingTools.zip.installed) {
  health.recommendations.push("Install zip so BookSmith can package managed artifacts.");
}

fs.writeFileSync(outJson, JSON.stringify(health, null, 2) + "\n");

function status(item) {
  return item?.installed ? "PASS" : "MISSING";
}

fs.writeFileSync(outMd, [
  "# BookSmith System Health v1",
  "",
  `Generated: ${health.generatedAt}`,
  "",
  "## Platform",
  "",
  `- Platform: ${platform}`,
  `- Architecture: ${arch}`,
  `- Android: ${isAndroid ? "yes" : "no"}`,
  `- Termux: ${isTermux ? "yes" : "no"}`,
  "",
  "## Next.js",
  "",
  `- Local Next binary: ${health.next.localBinary || "missing"}`,
  `- Next version: ${health.next.localVersion || "missing"}`,
  `- React version: ${health.next.reactVersion || "missing"}`,
  `- Turbopack supported: ${health.next.turbopackSupported ? "yes" : "no"}`,
  `- Recommended command: \`${health.next.recommendedDevCommand}\``,
  "",
  "## Runtime",
  "",
  `- Node: ${health.runtime.node}`,
  `- npm: ${health.runtime.npm.version || "missing"}`,
  `- git: ${health.runtime.git.version || "missing"}`,
  `- python: ${health.runtime.python.version || "missing"}`,
  "",
  "## Publishing Tools",
  "",
  ...Object.entries(health.publishingTools).map(([key, value]) => `- ${key}: ${status(value)}${value.version ? ` — ${value.version}` : ""}`),
  "",
  "## AI Providers",
  "",
  `- Ollama: ${status(health.aiProviders.ollama)}${health.aiProviders.ollama.version ? ` — ${health.aiProviders.ollama.version}` : ""}`,
  "",
  "## Recommendations",
  "",
  health.recommendations.length ? health.recommendations.map((item) => `- ${item}`).join("\n") : "- No major recommendations.",
  "",
].join("\n"));

console.log(`System health written: ${path.relative(root, outMd)}`);
console.log(`Recommended Studio command: ${health.next.recommendedDevCommand}`);
