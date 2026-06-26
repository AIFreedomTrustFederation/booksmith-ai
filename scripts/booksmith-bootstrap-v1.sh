#!/usr/bin/env bash
set -euo pipefail

echo "BookSmith Bootstrap v1"

ROOT="$(pwd)"
OS="$(uname -s 2>/dev/null || echo unknown)"
IS_TERMUX="no"

if [ -n "${TERMUX_VERSION:-}" ] || [[ "${PREFIX:-}" == *"com.termux"* ]] || [ "$OS" = "Android" ]; then
  IS_TERMUX="yes"
fi

echo "Root: $ROOT"
echo "OS: $OS"
echo "Termux: $IS_TERMUX"

echo
echo "Installing Node dependencies..."
npm install

echo
echo "Preparing BookSmith data..."
npm run system:health || true
npm run figure:art-director:pipeline:fhqcm || true

echo
echo "Bootstrap complete."
echo
echo "Launch Studio with:"
echo "npm run studio"
