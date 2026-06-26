import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

export function getSystemHealth() {
  const file = path.join(root, ".booksmith-build", "system-health", "system-health-v1.json");

  try {
    return fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : null;
  } catch {
    return null;
  }
}
