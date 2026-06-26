#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
MAX_PASSES="${2:-3}"

echo "Booksmith repair loop for $SLUG"
echo "Max passes: $MAX_PASSES"

npm run render:latex -- "$SLUG"

PASS=1
while [ "$PASS" -le "$MAX_PASSES" ]; do
  echo
  echo "=============================="
  echo "Repair pass $PASS"
  echo "=============================="

  ./scripts/build-fhqcm-export.sh "$SLUG"
  node scripts/proof-report.mjs "$SLUG"
  node scripts/booksmith-proof-repair-engine.mjs "$SLUG" repair

  BEFORE="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-report.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.counts.overfull + ':' + j.counts.duplicateLabels)")"

  ./scripts/build-fhqcm-export.sh "$SLUG"
  node scripts/proof-report.mjs "$SLUG"

  AFTER="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-report.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.counts.overfull + ':' + j.counts.duplicateLabels)")"

  echo "Before: $BEFORE"
  echo "After:  $AFTER"

  if [ "$BEFORE" = "$AFTER" ]; then
    echo "No further automatic improvement detected."
    break
  fi

  PASS=$((PASS + 1))
done

node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Booksmith repair loop complete."
echo
echo "Key reports:"
find "books/$SLUG/exports/pdf" -maxdepth 1 -type f \
  \( -name 'booksmith-repair-queue.md' -o -name 'booksmith-repair-report.md' -o -name 'booksmith-proof-report.md' -o -name 'booksmith-quality-gate.md' -o -name 'booksmith-proof-limit-gate.md' \) \
  | sort
