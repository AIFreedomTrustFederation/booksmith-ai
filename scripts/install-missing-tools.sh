#!/usr/bin/env bash
set -euo pipefail

echo
echo "===================================="
echo " BookSmith Missing Tools Installer"
echo "===================================="
echo

IS_TERMUX="no"

if [ -n "${TERMUX_VERSION:-}" ] || \
   [[ "${PREFIX:-}" == *"com.termux"* ]] || \
   [ "$(uname -o 2>/dev/null || true)" = "Android" ]; then
  IS_TERMUX="yes"
fi

echo "Termux/Android: $IS_TERMUX"
echo

if [ "$IS_TERMUX" = "yes" ]; then
  echo "Installing Termux dependencies..."

  pkg update -y

  pkg install -y \
    nodejs \
    git \
    zip \
    unzip \
    python \
    imagemagick \
    ghostscript \
    ffmpeg \
    pandoc \
    texlive-bin

  echo
  echo "Termux dependency install complete."

else
  echo "Desktop/laptop detected."
  echo
  echo "Install these tools with your platform package manager if missing:"
  echo
  echo "Linux Debian/Ubuntu:"
  echo "  sudo apt update"
  echo "  sudo apt install -y nodejs npm git zip unzip python3 imagemagick ghostscript ffmpeg pandoc texlive-xetex texlive-latex-extra"
  echo
  echo "macOS Homebrew:"
  echo "  brew install node git zip unzip python imagemagick ghostscript ffmpeg pandoc --cask mactex"
  echo
  echo "Windows:"
  echo "  Install Node.js LTS, Git for Windows, MiKTeX, ImageMagick, Ghostscript, Pandoc, and FFmpeg."
fi

echo
echo "Running npm install..."
npm install

echo
echo "Running BookSmith health check..."
npm run system:health || true

echo
echo "Preparing Studio data..."
npm run figure:art-director:pipeline:fhqcm || true

echo
echo "Done."
echo
echo "Launch Studio:"
echo "npm run studio"
