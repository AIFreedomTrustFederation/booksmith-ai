#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${BOOKSMITH_REPO_URL:-https://github.com/AIFreedomTrustFederation/booksmith-ai.git}"
TARGET_DIR="${BOOKSMITH_TARGET_DIR:-booksmith-ai}"

pkg update -y
pkg install -y git nodejs zip unzip python

if [ ! -d "$TARGET_DIR/.git" ]; then
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"
bash ./bootstrap.sh

echo
echo "Launch:"
echo "cd $TARGET_DIR && npm run studio"
