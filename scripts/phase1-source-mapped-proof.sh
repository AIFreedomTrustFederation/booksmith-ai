#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:typography:v3 -- "$SLUG"
node scripts/build-latex-source-map.mjs "$SLUG"
node scripts/proof-diagnostic-source-map.mjs "$SLUG"
node scripts/visual-proof-inspector.mjs "$SLUG"

STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="books/$SLUG/exports/zips/booksmith-${SLUG}-source-mapped-proof-${STAMP}.zip"
DOWNLOADS="$HOME/storage/downloads"

zip -r "$ZIP" \
  "books/$SLUG/exports/proof-inspector" \
  "books/$SLUG/exports/latex/booksmith-source-map.json" \
  "books/$SLUG/exports/latex/booksmith-source-map.md" \
  "books/$SLUG/exports/pdf/booksmith-diagnostic-source-map.json" \
  "books/$SLUG/exports/pdf/booksmith-diagnostic-source-map.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.json" \
  >/dev/null

echo "Created source-mapped proof ZIP:"
ls -lh "$ZIP"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP" "$DOWNLOADS/$(basename "$ZIP")"
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/$(basename "$ZIP")"
fi
