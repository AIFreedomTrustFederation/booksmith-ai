#!/usr/bin/env bash
set -euo pipefail

HOST="${BOOKSMITH_HOST:-0.0.0.0}"
PORT="${BOOKSMITH_PORT:-3000}"

echo
echo "===================================="
echo "       BookSmith Studio"
echo "===================================="
echo

echo "Running health checks..."
npm run system:health || true

echo
echo "Building AI figure pipeline..."
npm run figure:art-director:pipeline:fhqcm || true

echo
echo "Starting BookSmith Studio..."

if [ -n "${TERMUX_VERSION:-}" ] || \
   [[ "${PREFIX:-}" == *"com.termux"* ]] || \
   [ "$(uname -o 2>/dev/null || true)" = "Android" ]; then

    echo "Android / Termux detected."
    echo "Using Next.js Webpack mode."

    npx next dev --webpack \
        --hostname "$HOST" \
        --port "$PORT"

else

    echo "Desktop environment detected."

    npx next dev \
        --hostname "$HOST" \
        --port "$PORT"

fi
