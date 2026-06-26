#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run figure:studio:pipeline -- "$SLUG"
node scripts/figure-art-director-v1.mjs "$SLUG"
node scripts/artifact-manager-v1.mjs "$SLUG"

echo
echo "Figure Art Director preview:"
sed -n '1,160p' "books/$SLUG/figures/art-direction/figure-art-director-v1.md"
