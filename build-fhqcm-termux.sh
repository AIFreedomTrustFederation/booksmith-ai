#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "== FHQCM Termux Build =="

cd ~/booksmith-ai

# Load TeX Live path if Termux installed it.
if [ -f /data/data/com.termux/files/usr/etc/profile.d/texlive.sh ]; then
  source /data/data/com.termux/files/usr/etc/profile.d/texlive.sh
fi

echo "== Checking XeLaTeX =="
if ! command -v xelatex >/dev/null 2>&1; then
  echo "ERROR: xelatex not found. Run:"
  echo "pkg install texlive-installer -y"
  echo "termux-install-tl"
  exit 1
fi

echo "== Running FHQCM polish =="
npm run fhqcm:polish

MAIN="books/fhqcm/manuscript/main.tex"

echo "== Patching fonts for Termux portability =="

python - <<'PY'
from pathlib import Path

p = Path("books/fhqcm/manuscript/main.tex")
s = p.read_text()

s = s.replace(r"\setmainfont{TeX Gyre Pagella}", r"\setmainfont{DejaVu Serif}")
s = s.replace(r"\setsansfont{TeX Gyre Heros}", r"\setsansfont{DejaVu Sans}")
s = s.replace(r"\setmonofont{TeX Gyre Cursor}", r"\setmonofont{DejaVu Sans Mono}")
s = s.replace(r"\setmathfont{TeX Gyre Pagella Math}", r"% \setmathfont{TeX Gyre Pagella Math}")

p.write_text(s)
PY

echo "== Building PDF =="

cd books/fhqcm/manuscript

xelatex -interaction=nonstopmode main.tex || true

if [ -f ../bibliography/references.bib ]; then
  bibtex main || true
fi

xelatex -interaction=nonstopmode main.tex || true
xelatex -interaction=nonstopmode main.tex || true

if [ -f main.pdf ]; then
  echo "SUCCESS: PDF created:"
  ls -lh main.pdf
  echo "Opening PDF..."
  termux-open main.pdf || true
else
  echo "FAILED: main.pdf was not created."
  echo "Showing last 120 log lines:"
  tail -120 main.log
  exit 1
fi
