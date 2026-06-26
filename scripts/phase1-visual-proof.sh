#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:typography:v3 -- "$SLUG"
node scripts/visual-proof-inspector.mjs "$SLUG"

STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="books/$SLUG/exports/zips/booksmith-${SLUG}-visual-proof-${STAMP}.zip"
DOWNLOADS="$HOME/storage/downloads"

mkdir -p "books/$SLUG/exports/zips"

zip -r "$ZIP" \
  "books/$SLUG/exports/proof-inspector" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.json" \
  >/dev/null

echo
echo "Created visual proof ZIP:"
ls -lh "$ZIP"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP" "$DOWNLOADS/$(basename "$ZIP")"
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/$(basename "$ZIP")"
fi
