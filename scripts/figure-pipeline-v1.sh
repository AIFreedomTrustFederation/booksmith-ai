#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"
npm run figures:registry -- "$SLUG"
node scripts/figure-engine-v1.mjs "$SLUG" queue
node scripts/figure-intelligence-v1.mjs "$SLUG" || true
node scripts/publication-gate-v2.mjs "$SLUG" || true
node scripts/artifact-manager-v1.mjs "$SLUG"

echo
echo "Figure Engine v1 preview:"
sed -n '1,140p' "books/$SLUG/figures/figure-engine-report.md"

echo
echo "Queue files:"
find "books/$SLUG/figures/generation-queue" -maxdepth 1 -type f | sort | head -50
