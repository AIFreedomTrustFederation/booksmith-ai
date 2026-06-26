#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"

npm run render:latex -- "$SLUG"

# First build creates AUX/LOG/PDF for diagnostics.
./scripts/build-fhqcm-export.sh "$SLUG"

# Apply safe proof controls and extract AUX diagnostics.
node scripts/booksmith-proof-autofix.mjs "$SLUG"

# Rebuild after AutoFix.
./scripts/build-fhqcm-export.sh "$SLUG"

node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"

echo
echo "Strict proof reports:"
find "books/$SLUG/exports/pdf" -maxdepth 1 -type f \
  \( -name '*report.md' -o -name '*gate.md' -o -name 'main.pdf' \) \
  | sort
