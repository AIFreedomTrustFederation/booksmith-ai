Write-Host "BookSmith Windows Installer v1"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is missing. Install Node.js LTS from nodejs.org, then rerun this script."
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is missing. Install Git for Windows, then rerun this script."
  exit 1
}

npm install
npm run system:health
npm run figure:art-director:pipeline:fhqcm

Write-Host ""
Write-Host "Bootstrap complete."
Write-Host "Launch Studio with:"
Write-Host "npm run studio"
