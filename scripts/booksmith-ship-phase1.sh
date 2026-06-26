#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-fhqcm}"
COMMIT_MSG="${COMMIT_MSG:-complete BookSmith Phase 1 publishing pipeline}"

echo "BookSmith Phase 1 ship script for: $SLUG"

if [ ! -f package.json ] || [ ! -d .git ]; then
  echo "Run this from the booksmith-ai repo root."
  exit 1
fi

# Do not commit generated output by default.
touch .gitignore
for pattern in \
  ".booksmith-build/" \
  "debug-bundles/" \
  "books/*/exports/zips/" \
  "books/*/exports/pdf/" \
  "books/*/exports/publishing-packet/"
do
  grep -qxF "$pattern" .gitignore || echo "$pattern" >> .gitignore
done

echo
echo "Running Phase 1 pipeline..."
npm run render:latex -- "$SLUG"
npm run validate:latex-integrity -- "$SLUG" || true
./scripts/build-fhqcm-export.sh "$SLUG"
node scripts/proof-report.mjs "$SLUG"
node scripts/quality-gate.mjs "$SLUG" || true
node scripts/booksmith-proof-limit-gate.mjs "$SLUG" || true
node scripts/build-publishing-packet.mjs "$SLUG"
npm run zip:latest -- "$SLUG"

echo
echo "Validating JSON reports..."
if [ -f scripts/validate-booksmith-json.mjs ]; then
  node scripts/validate-booksmith-json.mjs || true
fi

echo
echo "Proof summary:"
node - <<NODE
const fs = require("fs");
const p = "books/$SLUG/exports/pdf/booksmith-proof-report.json";
if (fs.existsSync(p)) {
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  console.log(j.counts);
}
NODE

echo
echo "Quality gate:"
cat "books/$SLUG/exports/pdf/booksmith-quality-gate.md" 2>/dev/null | sed -n '1,40p' || true

echo
echo "Staging source/tooling files only..."

git add \
  package.json \
  package-lock.json \
  .gitignore \
  scripts \
  src/lib/publishing \
  src/lib/proof \
  "books/$SLUG/book.config.json" \
  "books/$SLUG/bibliography/references.bib" 2>/dev/null || true

echo
echo "Git status:"
git status --short

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

echo
echo "Pushing to current branch..."
git push origin HEAD

echo
echo "Done. Latest ZIP should also be in Android Downloads."
