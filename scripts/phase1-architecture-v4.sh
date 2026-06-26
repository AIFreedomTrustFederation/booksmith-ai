#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:typography-diagnostics:v4 -- "$SLUG"
node scripts/proof-context-inspector.mjs "$SLUG"
node scripts/proof-architecture-check.mjs "$SLUG"
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Architecture v4 complete."
echo
sed -n '1,120p' "books/$SLUG/exports/pdf/booksmith-proof-context-inspector.md"
