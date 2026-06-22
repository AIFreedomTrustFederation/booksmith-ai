param(
  [string]$Project = "templates/latex/booksmith-book",
  [string]$Engine = "pdflatex",
  [string]$OutDir = ".latex-build"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$projectPath = Resolve-Path (Join-Path $repoRoot $Project)
$mainFile = Join-Path $projectPath "main.tex"
$outputPath = Join-Path $repoRoot $OutDir
$jobName = "booksmith-sample"

function Add-SessionPathDir([string]$dir) {
  if ((Test-Path $dir) -and (";$env:Path;" -notlike "*;$dir;*")) {
    $env:Path = "$env:Path;$dir"
  }
}

$booksmithTools = Join-Path $env:LOCALAPPDATA "BooksmithAI\tools"
$strawberryRoot = Join-Path $booksmithTools "strawberry-perl"
Add-SessionPathDir (Join-Path $strawberryRoot "perl\site\bin")
Add-SessionPathDir (Join-Path $strawberryRoot "perl\bin")
Add-SessionPathDir (Join-Path $strawberryRoot "c\bin")
Add-SessionPathDir (Join-Path $booksmithTools "tectonic")

$pandocRoot = Join-Path $booksmithTools "pandoc"
if (Test-Path $pandocRoot) {
  Get-ChildItem -Path $pandocRoot -Filter pandoc.exe -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1 |
    ForEach-Object { Add-SessionPathDir (Split-Path $_.FullName -Parent) }
}

if (-not (Test-Path $mainFile)) {
  throw "No main.tex found at $mainFile"
}

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

$latexmk = Get-Command latexmk -ErrorAction SilentlyContinue
$compiler = Get-Command $Engine -ErrorAction SilentlyContinue
$perl = Get-Command perl -ErrorAction SilentlyContinue

Push-Location $projectPath
try {
  if ($latexmk -and $perl) {
    & $latexmk.Source "-pdf" "-interaction=nonstopmode" "-halt-on-error" "-outdir=$outputPath" "-jobname=$jobName" "main.tex"
    if ($LASTEXITCODE -eq 0) {
      exit 0
    }

    Write-Warning "latexmk failed or is missing a runtime dependency. Falling back to $Engine."
  } elseif ($latexmk -and -not $perl) {
    Write-Warning "latexmk was found, but Perl was not. Falling back to $Engine."
  }

  if (-not $compiler) {
    throw "No latexmk or $Engine found. Install TeX Live, MiKTeX, or Tectonic-compatible tooling."
  }

  for ($pass = 1; $pass -le 2; $pass++) {
    & $compiler.Source "-interaction=nonstopmode" "-halt-on-error" "-output-directory=$outputPath" "-jobname=$jobName" "main.tex"
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }
}
finally {
  Pop-Location
}
