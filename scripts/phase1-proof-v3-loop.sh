#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
MAX_PASSES="${2:-5}"

npm run render:latex -- "$SLUG"
node scripts/typography-repair-v3.mjs "$SLUG"

PASS=1
BEST="9999"

while [ "$PASS" -le "$MAX_PASSES" ]; do
  echo
  echo "=============================="
  echo "Proof Engine v3 pass $PASS"
  echo "=============================="

  ./scripts/build-fhqcm-export.sh "$SLUG"
  node scripts/proof-report.mjs "$SLUG"
  node scripts/build-latex-source-map.mjs "$SLUG"
  node scripts/proof-diagnostic-source-map.mjs "$SLUG"
  node scripts/proof-v3-context.mjs "$SLUG"
  node scripts/proof-v3-repair-plan.mjs "$SLUG"

  CURRENT="$(node -e "const fs=require('fs'); const p='books/$SLUG/exports/pdf/booksmith-proof-report.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(j.counts.overfull)")"
  echo "Current overfull count: $CURRENT"

  if [ "$CURRENT" = "0" ]; then
    echo "Clean proof reached."
    break
  fi

  if [ "$CURRENT" -ge "$BEST" ]; then
    echo "No improvement over previous best."
    break
  fi

  BEST="$CURRENT"

  node scripts/proof-v3-apply-one.mjs "$SLUG" 0

  PASS=$((PASS + 1))
done

./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
node scripts/visual-proof-inspector.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Proof v3 final summary:"
sed -n '1,80p' "books/$SLUG/exports/pdf/booksmith-proof-report.md"
