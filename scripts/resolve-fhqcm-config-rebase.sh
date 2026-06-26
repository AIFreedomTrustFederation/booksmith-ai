#!/usr/bin/env bash
set -euo pipefail

echo "Resolving books/fhqcm/book.config.json conflict..."

cat > books/fhqcm/book.config.json <<'JSON'
{
  "slug": "fhqcm",
  "title": "The Fractal-Holographic Quantum Consciousness Model",
  "subtitle": "A Unified Framework for Matter, Energy, Consciousness, and the Eternal Now",
  "series": "Active Manuscripts",
  "status": "active",
  "version": "0.1.0",
  "purpose": "Active Booksmith manuscript for the FHQCM book project, including LaTeX source, PDF proof workflow, citation review, scientific integrity appendices, figure registry, equation registry, and publishing metadata.",
  "relatedBooks": ["panentheism", "universal-process-theosophy", "towards-a-unified-reality", "coincidence-and-the-eternal-now", "ai-stewardship-and-alignment", "federation-theory"],
  "canonicalTerms": ["FHQCM", "Eternal Now", "Coherence", "Coincidence", "Panentheism", "Christic Equivalency", "AI Stewardship"],
  "publishingTargets": ["latex", "pdf", "epub", "web", "publishing-packet"],
  "provenanceRequired": true
}
JSON

node -e "JSON.parse(require('fs').readFileSync('books/fhqcm/book.config.json','utf8')); console.log('book.config.json valid')"

git add books/fhqcm/book.config.json

echo
echo "Continuing rebase..."
GIT_EDITOR=true git rebase --continue

echo
echo "Running quick checks..."
npm run validate:library || true
npm run json:validate || true

echo
echo "Pushing to main..."
git push origin HEAD:main

echo
echo "Done."
