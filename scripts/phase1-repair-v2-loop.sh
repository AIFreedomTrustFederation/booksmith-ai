#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
MAX_PASSES="${2:-5}"

npm run render:latex -- "$SLUG"

PASS=1
PREVIOUS=""

while [ "$PASS" -le "$MAX_PASSES" ]; do
  echo
  echo "=============================="
  echo "Booksmith Proof Repair v2 Pass $PASS"
  echo "=============================="

  ./scripts/build-fhqcm-export.sh "$SLUG"
  npm run proof:v2 -- "$SLUG"
  npm run proof:repair:v2 -- "$SLUG"

  CURRENT="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-diagnostics-v2.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.diagnostics.length)")"
  FIXED="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-repair-engine-v2.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.fixed)")"

  echo "Diagnostics: $CURRENT"
  echo "Repairs applied: $FIXED"

  if [ "$CURRENT" = "0" ]; then
    echo "Clean proof diagnostics reached."
    break
  fi

  if [ "$FIXED" = "0" ] || [ "$CURRENT" = "$PREVIOUS" ]; then
    echo "No further automatic repair progress detected."
    break
  fi

  PREVIOUS="$CURRENT"
  PASS=$((PASS + 1))
done

./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Proof Repair v2 complete."
find "books/$SLUG/exports/pdf" -maxdepth 1 -type f \
  \( -name '*v2.md' -o -name '*v2.json' -o -name '*gate.md' -o -name '*report.md' -o -name 'main.pdf' \) \
  | sort
