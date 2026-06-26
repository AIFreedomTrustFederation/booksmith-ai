#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run booksmith:publish -- "$SLUG"
node scripts/artifact-manager-v1.mjs "$SLUG"

echo
echo "Managed artifact preview:"
find "books/$SLUG/exports/managed/current" -maxdepth 4 -type f | sort

echo
echo "Managed release ZIP:"
find "books/$SLUG/exports/managed/release" -maxdepth 1 -type f -name '*.zip' | sort | tail -1
