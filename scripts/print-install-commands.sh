#!/usr/bin/env bash
set -euo pipefail

RAW_BASE="${BOOKSMITH_RAW_BASE:-https://raw.githubusercontent.com/AIFreedomTrustFederation/booksmith-ai/main}"

cat <<TEXT
# BookSmith Studio install commands

## Android / Termux

curl -fsSL $RAW_BASE/scripts/installers/install-termux.sh | bash

## Linux / macOS

curl -fsSL $RAW_BASE/scripts/installers/install-linux-macos.sh | bash

## Universal installer

curl -fsSL $RAW_BASE/install.sh | bash

## Windows PowerShell

iwr -useb $RAW_BASE/scripts/installers/install-windows.ps1 | iex

## Existing repo

bash ./bootstrap.sh
npm run studio
TEXT
