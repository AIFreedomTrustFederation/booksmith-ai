#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
shift || true

node scripts/booksmith-os-v1.mjs "$SLUG" "$@"

echo
echo "BookSmith OS v1 preview:"
sed -n '1,180p' "books/$SLUG/exports/booksmith-os/booksmith-os-v1.md"

echo
echo "Managed current artifact:"
find "books/$SLUG/exports/managed/current" -maxdepth 4 -type f | sort | head -120

echo
echo "Latest managed release:"
find "books/$SLUG/exports/managed/release" -maxdepth 1 -type f -name '*.zip' | sort | tail -1
