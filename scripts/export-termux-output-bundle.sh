#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
NAME="booksmith-termux-output-${STAMP}"
OUT_DIR="$ROOT/termux-output-bundles/$NAME"
ZIP_PATH="$ROOT/termux-output-bundles/${NAME}.zip"
DOWNLOADS="$HOME/storage/downloads"

mkdir -p "$OUT_DIR"

echo "Collecting Termux/Git/BookSmith output..."

{
  echo "BOOKSMITH TERMUX OUTPUT BUNDLE"
  echo "Generated: $(date -Iseconds)"
  echo
  echo "PWD:"
  pwd
  echo
  echo "NODE:"
  node --version 2>&1 || true
  echo
  echo "NPM:"
  npm --version 2>&1 || true
  echo
  echo "GIT:"
  git --version 2>&1 || true
  echo
  echo "BRANCH:"
  git branch --show-current 2>&1 || true
  echo
  echo "STATUS:"
  git status --short 2>&1 || true
  echo
  echo "LOG:"
  git log --oneline --decorate -20 2>&1 || true
  echo
  echo "REMOTES:"
  git remote -v 2>&1 || true
} > "$OUT_DIR/environment.txt"

# Capture important repo state
git status > "$OUT_DIR/git-status.txt" 2>&1 || true
git diff > "$OUT_DIR/git-diff.txt" 2>&1 || true
git diff --cached > "$OUT_DIR/git-diff-cached.txt" 2>&1 || true
git log --oneline --decorate -50 > "$OUT_DIR/git-log.txt" 2>&1 || true

# Capture package/scripts
cp package.json "$OUT_DIR/package.json" 2>/dev/null || true
cp package-lock.json "$OUT_DIR/package-lock.json" 2>/dev/null || true
cp .gitignore "$OUT_DIR/gitignore.txt" 2>/dev/null || true

# Capture reports if present
mkdir -p "$OUT_DIR/reports"
find books -path '*exports*' -type f \
  \( -name '*.md' -o -name '*.json' -o -name '*.log' -o -name '*.blg' -o -name '*.bbl' \) \
  -exec cp --parents {} "$OUT_DIR/reports" \; 2>/dev/null || true

# Capture scripts/source we have been editing
mkdir -p "$OUT_DIR/source"
cp -r scripts "$OUT_DIR/source/scripts" 2>/dev/null || true
cp -r src/lib/publishing "$OUT_DIR/source/publishing" 2>/dev/null || true
cp -r src/lib/proof "$OUT_DIR/source/proof" 2>/dev/null || true
cp books/fhqcm/book.config.json "$OUT_DIR/source/book.config.json" 2>/dev/null || true
cp -r books/fhqcm/bibliography "$OUT_DIR/source/bibliography" 2>/dev/null || true

# Capture npm logs
mkdir -p "$OUT_DIR/npm-logs"
cp "$HOME"/.npm/_logs/*.log "$OUT_DIR/npm-logs/" 2>/dev/null || true

# Capture shell history if available
cp "$HOME/.bash_history" "$OUT_DIR/bash_history.txt" 2>/dev/null || true
cp "$HOME/.zsh_history" "$OUT_DIR/zsh_history.txt" 2>/dev/null || true

# Create an easy summary
{
  echo "# BookSmith Termux Output Bundle"
  echo
  echo "- Generated: $(date -Iseconds)"
  echo "- Repo: $(pwd)"
  echo "- Branch: $(git branch --show-current 2>/dev/null || echo unknown)"
  echo "- Latest commit: $(git log -1 --oneline 2>/dev/null || echo none)"
  echo
  echo "## Files included"
  find "$OUT_DIR" -type f | sed "s|$OUT_DIR/|- |" | sort
} > "$OUT_DIR/README.md"

mkdir -p "$(dirname "$ZIP_PATH")"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip missing. Install with: pkg install zip"
  exit 1
fi

cd "$ROOT/termux-output-bundles"
zip -r "${NAME}.zip" "$NAME" >/dev/null
cd "$ROOT"

echo
echo "Created:"
ls -lh "$ZIP_PATH"

if [ -d "$DOWNLOADS" ]; then
  cp "$ZIP_PATH" "$DOWNLOADS/${NAME}.zip"
  echo
  echo "Copied to Android Downloads:"
  echo "$DOWNLOADS/${NAME}.zip"
else
  echo
  echo "Android Downloads folder unavailable."
  echo "Run once: termux-setup-storage"
fi
