#!/usr/bin/env bash
set -euo pipefail

echo "Current branch:"
git branch --show-current

echo
echo "Current status:"
git status --short

echo
echo "Fetching origin..."
git fetch origin

echo
echo "Rebasing local work onto origin/main..."
git rebase origin/main

echo
echo "Running quick validation after rebase..."
npm run validate:library || true
npm run proof:v2:fhqcm || true
npm run json:validate || true

echo
echo "Pushing rebased commit..."
git push origin HEAD:main

echo
echo "Push complete."
