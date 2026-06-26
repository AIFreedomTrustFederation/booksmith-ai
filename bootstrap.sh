#!/usr/bin/env bash
set -euo pipefail

echo "BookSmith universal bootstrap"

OS="$(uname -s 2>/dev/null || echo unknown)"
IS_TERMUX="no"

if [ -n "${TERMUX_VERSION:-}" ] || [[ "${PREFIX:-}" == *"com.termux"* ]] || [ "$(uname -o 2>/dev/null || true)" = "Android" ]; then
  IS_TERMUX="yes"
fi

echo "OS: $OS"
echo "Termux: $IS_TERMUX"

if [ "$IS_TERMUX" = "yes" ]; then
  echo "Detected Android/Termux."
  if command -v pkg >/dev/null 2>&1; then
    pkg update -y
    pkg install -y nodejs git zip unzip python
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is missing. Install Node.js LTS, then rerun bootstrap."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is missing. Install npm, then rerun bootstrap."
  exit 1
fi

npm install

mkdir -p .booksmith-build

npm run system:health || true
npm run figure:art-director:pipeline:fhqcm || true

echo
echo "BookSmith bootstrap complete."
echo "Run:"
echo "npm run studio"
