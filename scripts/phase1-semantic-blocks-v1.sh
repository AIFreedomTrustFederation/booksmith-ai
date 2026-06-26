#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:semantic:v4 -- "$SLUG"
node scripts/semantic-block-parser-v1.mjs "$SLUG"

STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="books/$SLUG/exports/zips/booksmith-${SLUG}-semantic-blocks-v1-${STAMP}.zip"
DOWNLOADS="$HOME/storage/downloads"

zip -r "$ZIP" \
  "books/$SLUG/exports/pdf/booksmith-semantic-blocks-v1.json" \
  "books/$SLUG/exports/pdf/booksmith-semantic-blocks-v1.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-semantic-context-v4.json" \
  "books/$SLUG/exports/pdf/booksmith-proof-semantic-context-v4.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-semantic-repair-plan-v4.json" \
  "books/$SLUG/exports/pdf/booksmith-proof-semantic-repair-plan-v4.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.md" \
  "books/$SLUG/exports/pdf/booksmith-proof-report.json" \
  >/dev/null

echo "Created semantic blocks ZIP:"
ls -lh "$ZIP"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP" "$DOWNLOADS/$(basename "$ZIP")"
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/$(basename "$ZIP")"
fi

echo
echo "Semantic blocks preview:"
sed -n '1,140p' "books/$SLUG/exports/pdf/booksmith-semantic-blocks-v1.md"
