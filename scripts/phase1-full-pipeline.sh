#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"
node scripts/validate-latex-integrity.mjs "$SLUG"
./scripts/build-fhqcm-export.sh
node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"

echo
echo "Phase 1 pipeline complete for $SLUG"
echo "Publishing packet:"
find "books/$SLUG/exports/publishing-packet" -maxdepth 3 -type f | sort
