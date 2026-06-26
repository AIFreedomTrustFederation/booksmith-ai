#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${BOOKSMITH_REPO_URL:-https://github.com/AIFreedomTrustFederation/booksmith-ai.git}"
TARGET_DIR="${BOOKSMITH_TARGET_DIR:-booksmith-ai}"

echo "BookSmith one-command installer"
echo "Repo: $REPO_URL"
echo "Target: $TARGET_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required."
  exit 1
fi

if [ ! -d "$TARGET_DIR/.git" ]; then
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"

if [ -f "./bootstrap.sh" ]; then
  bash ./bootstrap.sh
else
  bash scripts/booksmith-bootstrap-v1.sh
fi

echo
echo "Launch BookSmith Studio:"
echo "cd $TARGET_DIR"
echo "npm run studio"
