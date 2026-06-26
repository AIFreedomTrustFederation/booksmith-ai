#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
ROOT="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP_NAME="booksmith-${SLUG}-latest-${STAMP}.zip"

EXPORT_ROOT="$ROOT/books/$SLUG/exports"
ZIP_DIR="$ROOT/books/$SLUG/exports/zips"
ZIP_PATH="$ZIP_DIR/$ZIP_NAME"
DOWNLOADS="$HOME/storage/downloads"

mkdir -p "$ZIP_DIR"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is missing. Install it with:"
  echo "pkg install zip"
  exit 1
fi

echo "Creating BookSmith ZIP for: $SLUG"

zip -r "$ZIP_PATH" \
  "books/$SLUG/book.config.json" \
  "books/$SLUG/exports/latex" \
  "books/$SLUG/exports/pdf" \
  "books/$SLUG/exports/publishing-packet" \
  -x "**/*.aux" \
  -x "**/*.toc" \
  -x "**/*.out" \
  -x "**/zips/*"

echo
echo "Created:"
ls -lh "$ZIP_PATH"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP_PATH" "$DOWNLOADS/$ZIP_NAME"
  echo
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/$ZIP_NAME"
else
  echo
  echo "Android Downloads not available."
  echo "Run once:"
  echo "termux-setup-storage"
fi

echo
echo "Latest ZIP path:"
echo "$ZIP_PATH"
