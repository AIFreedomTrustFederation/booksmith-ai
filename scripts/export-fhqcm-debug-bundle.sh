#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
ROOT="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
BUNDLE_NAME="booksmith-${SLUG}-debug-${STAMP}.zip"

SRC_DIR="$ROOT/books/$SLUG/exports"
OUT_DIR="$ROOT/debug-bundles"
ANDROID_DOWNLOADS="$HOME/storage/downloads"

mkdir -p "$OUT_DIR"

if [ ! -d "$SRC_DIR" ]; then
  echo "Missing exports directory: $SRC_DIR"
  echo "Run npm run phase1:pipeline:$SLUG first."
  exit 1
fi

ZIP_PATH="$OUT_DIR/$BUNDLE_NAME"

echo "Creating debug bundle:"
echo "  source: $SRC_DIR"
echo "  output: $ZIP_PATH"

if command -v zip >/dev/null 2>&1; then
  zip -r "$ZIP_PATH" \
    "books/$SLUG/book.config.json" \
    "books/$SLUG/exports/latex" \
    "books/$SLUG/exports/pdf" \
    "books/$SLUG/exports/publishing-packet" \
    -x "**/*.aux" \
    -x "**/*.toc" \
    -x "**/*.out"
else
  echo "zip is not installed."
  echo "Install it with: pkg install zip"
  exit 1
fi

echo
echo "Bundle created:"
ls -lh "$ZIP_PATH"

if [ -d "$ANDROID_DOWNLOADS" ]; then
  cp "$ZIP_PATH" "$ANDROID_DOWNLOADS/$BUNDLE_NAME"
  echo
  echo "Copied to Android Downloads:"
  echo "$ANDROID_DOWNLOADS/$BUNDLE_NAME"
else
  echo
  echo "Android downloads folder not available."
  echo "Run this once if needed: termux-setup-storage"
fi
