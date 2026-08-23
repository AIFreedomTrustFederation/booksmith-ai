#!/usr/bin/env bash
set -euo pipefail

SLUG="${BOOKSMITH_SLUG:-energence}"
HOST="${BOOKSMITH_HOST:-0.0.0.0}"
PORT="${BOOKSMITH_PORT:-3000}"
RUNTIME_HOST="${BOOKSMITH_RUNTIME_HOST:-127.0.0.1}"
RUNTIME_PORT="${BOOKSMITH_RUNTIME_PORT:-8787}"
MODE="${BOOKSMITH_MODE:-studio}"

echo
echo "===================================="
echo "          Booksmith App"
echo "===================================="
echo
echo "Book: $SLUG"
echo "App: http://$HOST:$PORT"
echo "Runtime: http://$RUNTIME_HOST:$RUNTIME_PORT"
echo "Mode: $MODE"
echo

IS_TERMUX="no"
if [ -n "${TERMUX_VERSION:-}" ] || \
   [[ "${PREFIX:-}" == *"com.termux"* ]] || \
   [ "$(uname -o 2>/dev/null || true)" = "Android" ]; then
  IS_TERMUX="yes"
fi

echo "Termux/Android: $IS_TERMUX"
echo

echo "Step 1: System health"
npm run system:health || true

echo
echo "Step 2: Library registry"
npm run registry:build || true
npm run validate:library:v2 || true

echo
echo "Step 3: Prepare current book diagnostics"
npm run figures:registry -- "$SLUG" || true
npm run figure:studio -- "$SLUG" || true
npm run bibliography:audit:v2 -- "$SLUG" || true
npm run publication:gate:v2 -- "$SLUG" || true

echo
echo "Step 4: Start governed Runtime"
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
  echo "Booksmith Runtime failed to start. Check the messages above."
  exit 1
fi

echo
echo "Booksmith is ready."
echo "  Portal:       http://localhost:$PORT/"
echo "  Studio:       http://localhost:$PORT/studio"
echo "  Runtime:      http://localhost:$PORT/studio/runtime"
echo "  Living book:  http://localhost:$PORT/studio/books/$SLUG/living-manuscript"
echo
echo "GitHub Pages remains read-only. Canonical saves and local AI execute only through the Runtime."
echo

if [ "$IS_TERMUX" = "yes" ]; then
  echo "Launching Next.js with Webpack for Android/Termux..."
  npx next dev --webpack --hostname "$HOST" --port "$PORT"
else
  echo "Launching Next.js with the default development server..."
  npx next dev --hostname "$HOST" --port "$PORT"
fi
