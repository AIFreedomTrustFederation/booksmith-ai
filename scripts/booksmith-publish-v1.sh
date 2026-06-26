#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

node scripts/publication-engine-v1.mjs "$SLUG"

echo
echo "Publication Engine v1 preview:"
sed -n '1,160p' "books/$SLUG/exports/pdf/booksmith-publication-engine-v1.md"

echo
echo "Latest package files:"
find "books/$SLUG/exports" -maxdepth 4 -type f \
  \( -name '*publication-engine-v1*' -o -name '*reference-intelligence*' -o -name '*figure-intelligence*' -o -name '*publication-gate-v2*' -o -name '*.zip' \) \
  | sort
