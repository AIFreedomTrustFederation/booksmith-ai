$RepoUrl = $env:BOOKSMITH_REPO_URL
if (-not $RepoUrl) { $RepoUrl = "https://github.com/AIFreedomTrustFederation/booksmith-ai.git" }

$TargetDir = $env:BOOKSMITH_TARGET_DIR
if (-not $TargetDir) { $TargetDir = "booksmith-ai" }

Write-Host "BookSmith Windows installer"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is missing. Install Git for Windows, then rerun."
  exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is missing. Install Node.js LTS, then rerun."
  exit 1
}

if (-not (Test-Path "$TargetDir\.git")) {
  git clone $RepoUrl $TargetDir
}

Set-Location $TargetDir
npm install
npm run system:health
npm run figure:art-director:pipeline:fhqcm

Write-Host ""
Write-Host "Launch:"
Write-Host "cd $TargetDir"
Write-Host "npm run studio"
