#!/usr/bin/env bash
set -euo pipefail

echo "BookSmith Termux Installer v1"

pkg update -y
pkg install -y nodejs git zip unzip python

echo
echo "Optional publishing tools:"
echo "Install TeX separately if needed:"
echo "pkg install texlive-bin texlive-installer"

echo
bash scripts/booksmith-bootstrap-v1.sh

echo
echo "To launch:"
echo "npm run studio"
