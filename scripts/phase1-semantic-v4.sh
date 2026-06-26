#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run phase1:architecture:v4 -- "$SLUG"
node scripts/proof-semantic-context-v4.mjs "$SLUG"
node scripts/proof-semantic-repair-plan-v4.mjs "$SLUG"

BEFORE="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-report.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.counts.overfull)")"
echo "Before semantic repair overfull: $BEFORE"

node scripts/proof-semantic-apply-v4.mjs "$SLUG" 0 || true

./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"

AFTER="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-report.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.counts.overfull)")"
echo "After semantic repair overfull: $AFTER"

node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Semantic v4 final proof:"
sed -n '1,90p' "books/$SLUG/exports/pdf/booksmith-proof-report.md"
