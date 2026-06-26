#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:source-mapped-proof -- "$SLUG"
node scripts/typography-diagnostics-v4.mjs "$SLUG"

STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="books/$SLUG/exports/zips/booksmith-${SLUG}-typography-diagnostics-v4-${STAMP}.zip"
DOWNLOADS="$HOME/storage/downloads"

zip -r "$ZIP" \
  "books/$SLUG/exports/pdf/booksmith-typography-diagnostics-v4.json" \
  "books/$SLUG/exports/pdf/booksmith-typography-diagnostics-v4.md" \
  "books/$SLUG/exports/pdf/booksmith-diagnostic-source-map.json" \
  "books/$SLUG/exports/pdf/booksmith-diagnostic-source-map.md" \
  "books/$SLUG/exports/latex/booksmith-source-map.json" \
  "books/$SLUG/exports/latex/booksmith-source-map.md" \
  "books/$SLUG/exports/proof-inspector" \
  >/dev/null

echo "Created typography diagnostics v4 ZIP:"
ls -lh "$ZIP"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP" "$DOWNLOADS/$(basename "$ZIP")"
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/$(basename "$ZIP")"
fi

echo
echo "Typography diagnostics preview:"
sed -n '1,120p' "books/$SLUG/exports/pdf/booksmith-typography-diagnostics-v4.md"
