#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${BOOKSMITH_REPO_URL:-https://github.com/AIFreedomTrustFederation/booksmith-ai.git}"
TARGET_DIR="${BOOKSMITH_TARGET_DIR:-booksmith-ai}"

if ! command -v git >/dev/null 2>&1; then
  echo "Install git first."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js LTS first."
  exit 1
fi

if [ ! -d "$TARGET_DIR/.git" ]; then
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"
bash ./bootstrap.sh
