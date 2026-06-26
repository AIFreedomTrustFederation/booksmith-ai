#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"
node scripts/bibliography-audit-v2.mjs "$SLUG" || true
node scripts/bibliography-stub-missing-v2.mjs "$SLUG"
npm run render:latex -- "$SLUG"
./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"
node scripts/bibliography-audit-v2.mjs "$SLUG" || true
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/publication-gate-v2.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Bibliography audit preview:"
sed -n '1,160p' "books/$SLUG/exports/pdf/booksmith-bibliography-audit-v2.md"
