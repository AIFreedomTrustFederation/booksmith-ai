#!/usr/bin/env bash
set -euo pipefail

HOST="${BOOKSMITH_HOST:-0.0.0.0}"
PORT="${BOOKSMITH_PORT:-3000}"

echo "BookSmith Server v1"
echo "Host: $HOST"
echo "Port: $PORT"

node scripts/system-health-v1.mjs || true
npm run figure:art-director:pipeline:fhqcm || true

if [ -n "${TERMUX_VERSION:-}" ] || [[ "${PREFIX:-}" == *"com.termux"* ]] || [ "$(uname -o 2>/dev/null || true)" = "Android" ]; then
  echo "Starting Next.js with Webpack for Android/Termux..."
  npx next dev --webpack --hostname "$HOST" --port "$PORT"
else
  echo "Starting Next.js server..."
  npx next dev --hostname "$HOST" --port "$PORT"
fi
