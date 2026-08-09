import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

export type SystemToolStatus = {
  installed?: boolean;
  version?: string;
  error?: string;
};

export type SystemHealth = {
  platform: { platform: string; arch: string; isTermux: boolean };
  next: {
    webpackRequired: boolean;
    localVersion?: string;
    reactVersion?: string;
    turbopackSupported: boolean;
    recommendedDevCommand: string;
  };
  publishingTools: Record<string, SystemToolStatus>;
  aiProviders: Record<string, SystemToolStatus>;
  recommendations: string[];
};

export function getSystemHealth(): SystemHealth | null {
  const file = path.join(root, ".booksmith-build", "system-health", "system-health-v1.json");

  try {
    return fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8")) as SystemHealth
      : null;
  } catch {
    return null;
  }
}
