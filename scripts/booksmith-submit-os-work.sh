#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
COMMIT_MSG="${COMMIT_MSG:-add BookSmith OS publishing coordinator and managed artifacts}"

echo "Submitting BookSmith OS work for: $SLUG"

echo
echo "Ensuring generated exports remain ignored..."
touch .gitignore
for pattern in \
  ".booksmith-build/" \
  "debug-bundles/" \
  "termux-output-bundles/" \
  "books/*/exports/"
do
  grep -qxF "$pattern" .gitignore || echo "$pattern" >> .gitignore
done

echo
echo "Running pre-submit validation..."
npm run registry:build
npm run validate:library:v2
npm run render:latex -- "$SLUG"
npm run figures:registry -- "$SLUG"

echo
echo "Staging source-only work..."
git add \
  .gitignore \
  package.json \
  package-lock.json \
  scripts \
  src \
  books/registry.json \
  books/registry-report.md \
  "books/$SLUG/book.config.json" \
  "books/$SLUG/figures" \
  "books/$SLUG/bibliography" \
  2>/dev/null || true

echo
echo "Git status:"
git status --short

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

echo
echo "Fetching and rebasing onto origin/main..."
git fetch origin
git rebase origin/main

echo
echo "Post-rebase validation..."
npm run registry:build
npm run validate:library:v2
npm run render:latex -- "$SLUG"
npm run figures:registry -- "$SLUG"

echo
echo "Pushing to main..."
git push origin HEAD:main

echo
echo "Submitted successfully."
