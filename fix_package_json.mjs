import fs from "node:fs";

const pkg = {
  name: "booksmith-ai",
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "eslint",
    "ensure:book-folders": "node scripts/ensure-book-folders.mjs",
    "validate:library": "node scripts/validate-library.mjs",
    "latex:sample": "powershell -ExecutionPolicy Bypass -File scripts/build-latex.ps1",
    "latex:sample:lua": "powershell -ExecutionPolicy Bypass -File scripts/build-latex.ps1 -Engine lualatex",
    "fhqcm:images": "node scripts/generate-fhqcm-images.mjs",
    "fhqcm:polish": "node scripts/fhqcm-polish-and-validate.mjs",
    "latex:sample:tectonic": "powershell -ExecutionPolicy Bypass -File scripts/build-latex.ps1 -Engine tectonic",
    "render:latex": "node scripts/render-latex.mjs",
    "render:latex:fhqcm": "node scripts/render-latex.mjs fhqcm"
  },
  dependencies: {
    next: "16.2.9",
    react: "19.2.4",
    "react-dom": "19.2.4"
  },
  devDependencies: {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    eslint: "^9",
    "eslint-config-next": "16.2.9",
    tailwindcss: "^4",
    typescript: "^5",
    tsx: "^4.20.0"
  }
};

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("package.json repaired");
