#!/usr/bin/env bash
set -euo pipefail

slug="energence"

echo "==> Booksmith: validating federated library"
npm install
npm run validate:library
npm run validate:library:v2

mkdir -p "books/$slug/assets" "books/$slug/exports/pdf" "books/$slug/exports/latex" "books/$slug/manuscript/chapters"

echo "==> Booksmith: generating chapter writing packets"
npm run writing:queue:energence

echo "==> Booksmith: rendering deterministic LaTeX source"
npm run render:latex -- "$slug"

echo "==> Booksmith: building figure registry, studio, art direction, and queue"
npm run figures:registry -- "$slug"
npm run figure:engine -- "$slug" queue
npm run figure:studio -- "$slug"
npm run figure:art-director -- "$slug"
npm run figure:intelligence:v1 -- "$slug"
npm run figure:audit -- "$slug"

echo "==> Booksmith: auditing references and bibliography"
npm run bibliography:audit:v2 -- "$slug"
npm run reference:intelligence:v1 -- "$slug"

echo "==> Booksmith: running structural checks"
npm run validate:latex-integrity -- "$slug"
npm run latex:structure -- "$slug"

echo "==> Booksmith: checking for a local TeX engine"
if command -v tectonic >/dev/null 2>&1 || command -v xelatex >/dev/null 2>&1 || command -v pdflatex >/dev/null 2>&1 || command -v lualatex >/dev/null 2>&1; then
  echo "==> Booksmith: building PDF before proof analysis"
  bash scripts/build-fhqcm-export.sh "$slug"
  npm run proof:report -- "$slug"
  npm run publication:gate:v2 -- "$slug"
  npm run packet:build -- "$slug"
else
  echo "WARN: No TeX engine detected. LaTeX source, writing packets, figure workflow, and audits completed."
  echo "WARN: PDF proof report and final publishing packet are deferred until a TeX engine is installed."
  npm run publication:gate:v2 -- "$slug" || true
fi

echo "==> Energence pipeline completed"
git status --short
