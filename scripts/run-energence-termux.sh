#!/usr/bin/env bash
set -euo pipefail

slug="energence"

echo "==> Booksmith: validating federated library"
npm install
npm run validate:library
npm run validate:library:v2

echo "==> Booksmith: generating chapter writing packets"\nnpm run writing:queue:energence\n\necho "==> Booksmith: rendering deterministic LaTeX source"
npm run render:latex -- "$slug"

echo "==> Booksmith: building figure registry, briefs, and generation queue"
npm run figures:registry -- "$slug"
npm run figure:engine -- "$slug" queue
npm run figure:intelligence:v1 -- "$slug"
npm run figure:art-director -- "$slug"
npm run figure:audit -- "$slug"

echo "==> Booksmith: auditing references and bibliography"
npm run bibliography:audit:v2 -- "$slug"
npm run reference:intelligence:v1 -- "$slug"

echo "==> Booksmith: running structural and publication checks"
npm run validate:latex-integrity -- "$slug"
npm run latex:structure -- "$slug"
npm run proof:report -- "$slug"
npm run publication:gate:v2 -- "$slug"

echo "==> Booksmith: building managed artifacts when local TeX tools permit"
if command -v xelatex >/dev/null 2>&1 || command -v tectonic >/dev/null 2>&1 || command -v latexmk >/dev/null 2>&1; then
  npm run publication:engine:v1 -- "$slug"
  npm run packet:build -- "$slug"
else
  echo "WARN: No xelatex, tectonic, or latexmk detected; source generation and audits completed, PDF compilation skipped."
fi

echo "==> Energence pipeline completed"
git status --short
