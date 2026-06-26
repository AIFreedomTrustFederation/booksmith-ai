#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
COMMIT_MSG="${COMMIT_MSG:-stabilize BookSmith publication architecture}"

echo "BookSmith stabilization pipeline for $SLUG"

echo
echo "Ensuring generated outputs stay ignored..."
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
echo "Running registry validation..."
npm run registry:build
npm run validate:library:v2

echo
echo "Running FHQCM render and proof pipeline..."
npm run render:latex -- "$SLUG"
npm run phase1:figure-audit:v1 -- "$SLUG" || true
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/publication-gate-v2.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Publication gate preview:"
sed -n '1,120p' "books/$SLUG/exports/pdf/booksmith-publication-gate-v2.md" || true

echo
echo "Staging source only..."
git add \
  .gitignore \
  package.json \
  package-lock.json \
  scripts \
  src \
  books/registry.json \
  books/registry-report.md \
  books/$SLUG/book.config.json \
  books/$SLUG/figures \
  books/$SLUG/bibliography \
  books/$SLUG/assets \
  books/$SLUG/manuscript \
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
echo "Rebasing and pushing..."
git fetch origin
git rebase origin/main

echo
echo "Post-rebase validation..."
npm run registry:build
npm run validate:library:v2
npm run render:latex -- "$SLUG"
npm run figures:registry -- "$SLUG"

git push origin HEAD:main

echo
echo "Stabilization submitted successfully."
