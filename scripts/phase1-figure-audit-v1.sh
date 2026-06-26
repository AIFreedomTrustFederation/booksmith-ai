#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:semantic-blocks:v1 -- "$SLUG" || true
node scripts/figure-asset-audit-v1.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Figure audit preview:"
sed -n '1,160p' "books/$SLUG/exports/pdf/booksmith-figure-asset-audit-v1.md"
