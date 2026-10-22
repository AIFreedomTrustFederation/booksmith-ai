#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SLUG="${1:-fhqcm}"
EXPORT_DIR="$ROOT/books/$SLUG/exports/latex"
OUT_DIR="$ROOT/books/$SLUG/exports/pdf"

mkdir -p "$OUT_DIR"

echo "Building $SLUG export:"
echo "  cwd:  $EXPORT_DIR"
echo "  out:  $OUT_DIR"

cd "$EXPORT_DIR"

# A successful TeX exit does not guarantee that any pages were emitted.
# Keep previous proofs intact, but never count an old PDF as this build's output.
BUILD_MARKER="$(mktemp "$OUT_DIR/.booksmith-pdf-build.XXXXXXXX")"
trap 'rm -f "$BUILD_MARKER"' EXIT

run_engine() {
  "$1" -interaction=nonstopmode -halt-on-error -output-directory="$OUT_DIR" main.tex
}

if command -v tectonic >/dev/null 2>&1; then
  echo "Using tectonic"
  tectonic --outdir "$OUT_DIR" main.tex
elif command -v xelatex >/dev/null 2>&1; then
  echo "Using xelatex"
  run_engine xelatex

  if command -v bibtex >/dev/null 2>&1 && [ -f "$OUT_DIR/main.aux" ]; then
    echo "Running bibtex"
    (cd "$OUT_DIR" && bibtex main) || true
  fi

  run_engine xelatex
  run_engine xelatex
elif command -v pdflatex >/dev/null 2>&1; then
  echo "Using pdflatex"
  run_engine pdflatex

  if command -v bibtex >/dev/null 2>&1 && [ -f "$OUT_DIR/main.aux" ]; then
    echo "Running bibtex"
    (cd "$OUT_DIR" && bibtex main) || true
  fi

  run_engine pdflatex
  run_engine pdflatex
elif command -v lualatex >/dev/null 2>&1; then
  echo "Using lualatex"
  run_engine lualatex

  if command -v bibtex >/dev/null 2>&1 && [ -f "$OUT_DIR/main.aux" ]; then
    echo "Running bibtex"
    (cd "$OUT_DIR" && bibtex main) || true
  fi

  run_engine lualatex
  run_engine lualatex
else
  echo "No TeX engine found."
  exit 1
fi

if [ ! -s "$OUT_DIR/main.pdf" ] || [ ! "$OUT_DIR/main.pdf" -nt "$BUILD_MARKER" ]; then
  echo "ERROR: TeX finished without creating a fresh, nonempty main.pdf in $OUT_DIR" >&2
  exit 1
fi

rm -f "$BUILD_MARKER"
trap - EXIT

echo
echo "PDF build files:"
find "$OUT_DIR" -maxdepth 1 -type f | sort
