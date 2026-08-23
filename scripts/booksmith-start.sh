#!/usr/bin/env bash
set -euo pipefail

HOST="${BOOKSMITH_HOST:-0.0.0.0}"
PORT="${BOOKSMITH_PORT:-3000}"
RUNTIME_HOST="${BOOKSMITH_RUNTIME_HOST:-127.0.0.1}"
RUNTIME_PORT="${BOOKSMITH_RUNTIME_PORT:-8787}"

if [ ! -d ".next" ]; then
  echo "Booksmith production build is missing. Run: npm run build"
  exit 1
fi

echo "Starting Booksmith Runtime on http://$RUNTIME_HOST:$RUNTIME_PORT"
BOOKSMITH_RUNTIME_HOST="$RUNTIME_HOST" BOOKSMITH_RUNTIME_PORT="$RUNTIME_PORT" npx tsx scripts/booksmith-runtime.ts &
RUNTIME_PID=$!

cleanup() {
  if kill -0 "$RUNTIME_PID" >/dev/null 2>&1; then
    kill "$RUNTIME_PID" >/dev/null 2>&1 || true
    wait "$RUNTIME_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

sleep 1
if ! kill -0 "$RUNTIME_PID" >/dev/null 2>&1; then
  echo "Booksmith Runtime failed to start."
  exit 1
fi

echo "Starting Booksmith production UI on http://$HOST:$PORT"
npx next start --hostname "$HOST" --port "$PORT"
