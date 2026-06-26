#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"
npm run figures:registry -- "$SLUG"
node scripts/figure-engine-v1.mjs "$SLUG" queue
node scripts/figure-studio-v1.mjs "$SLUG"
node scripts/figure-intelligence-v1.mjs "$SLUG" || true
node scripts/artifact-manager-v1.mjs "$SLUG"

echo
echo "Figure Studio preview:"
sed -n '1,120p' "books/$SLUG/figures/studio/figure-studio-index.md"
