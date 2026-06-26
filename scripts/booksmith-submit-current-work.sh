#!/usr/bin/env bash
set -euo pipefail

BRANCH="$(git branch --show-current)"
COMMIT_MSG="${COMMIT_MSG:-advance BookSmith proof engine and figure registry architecture}"

echo "BookSmith submit script"
echo "Branch: $BRANCH"

echo
echo "Protecting generated outputs from commits..."
touch .gitignore

for pattern in \
  ".booksmith-build/" \
  "debug-bundles/" \
  "termux-output-bundles/" \
  "books/*/exports/" \
  "books/*/exports/pdf/" \
  "books/*/exports/zips/" \
  "books/*/exports/latex/" \
  "books/*/exports/proof-inspector/" \
  "books/*/exports/publishing-packet/"
do
  grep -qxF "$pattern" .gitignore || echo "$pattern" >> .gitignore
done

echo
echo "Running source-level checks..."
npm run validate:library || true
npm run render:latex:fhqcm
npm run figures:registry:fhqcm

echo
echo "Staging source architecture only..."
git add \
  .gitignore \
  package.json \
  package-lock.json \
  scripts \
  src \
  books/fhqcm/book.config.json \
  books/fhqcm/figures \
  books/fhqcm/bibliography \
  books/fhqcm/assets \
  books/fhqcm/manuscript \
  2>/dev/null || true

echo
echo "Staged changes:"
git status --short

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

echo
echo "Fetching remote..."
git fetch origin

echo
echo "Rebasing onto origin/main..."
git rebase origin/main

echo
echo "Running post-rebase checks..."
npm run validate:library || true
npm run render:latex:fhqcm
npm run figures:registry:fhqcm

echo
echo "Pushing to main..."
git push origin HEAD:main

echo
echo "Submitted successfully."
