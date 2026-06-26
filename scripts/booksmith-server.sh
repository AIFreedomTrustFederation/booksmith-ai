#!/usr/bin/env bash
set -euo pipefail

SLUG="${BOOKSMITH_SLUG:-fhqcm}"
HOST="${BOOKSMITH_HOST:-0.0.0.0}"
PORT="${BOOKSMITH_PORT:-3000}"
MODE="${BOOKSMITH_MODE:-studio}"

echo
echo "===================================="
echo "        BookSmith Local Server"
echo "===================================="
echo
echo "Slug: $SLUG"
echo "Host: $HOST"
echo "Port: $PORT"
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
echo "Step 3: Figure Studio data"
npm run render:latex -- "$SLUG" || true
npm run figures:registry -- "$SLUG" || true
npm run figure:queue || true
npm run figure:studio -- "$SLUG" || true
npm run figure:art-director -- "$SLUG" || true

echo
echo "Step 4: Publishing diagnostics"
npm run bibliography:audit:v2 -- "$SLUG" || true
npm run publication:gate:v2 -- "$SLUG" || true

echo
echo "Step 5: Managed artifacts"
npm run artifacts:manage:v1 -- "$SLUG" || true

echo
echo "BookSmith server prepared."
echo
echo "Open locally:"
echo "  http://localhost:$PORT/studio/figures"
echo "  http://localhost:$PORT/studio/system"
echo
echo "Open from another device on same Wi-Fi:"
echo "  http://<this-device-ip>:$PORT/studio/figures"
echo

if [ "$IS_TERMUX" = "yes" ]; then
  echo "Launching Studio with Webpack for Android/Termux..."
  exec npx next dev --webpack --hostname "$HOST" --port "$PORT"
else
  echo "Launching Studio with default Next.js dev server..."
  exec npx next dev --hostname "$HOST" --port "$PORT"
fi
