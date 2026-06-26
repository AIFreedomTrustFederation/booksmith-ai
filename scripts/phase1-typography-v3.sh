#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"
node scripts/typography-repair-v3.mjs "$SLUG"
./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Typography v3 proof summary:"
sed -n '1,90p' "books/$SLUG/exports/pdf/booksmith-proof-report.md"
