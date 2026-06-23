param(
  [string]$Project = "templates/latex/booksmith-book",
  [string]$Engine = "xelatex",
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

function Convert-ToFontconfigPath([string]$path) {
  return ($path -replace "\\", "/")
}

function Add-UniqueExistingDir([System.Collections.Generic.List[string]]$dirs, [string]$dir) {
  if ((Test-Path $dir) -and -not $dirs.Contains($dir)) {
    $dirs.Add($dir)
  }
}

function Write-BooksmithFontconfig([string]$configDir, [string]$projectPath, [string]$outputPath) {
  New-Item -ItemType Directory -Force -Path $configDir | Out-Null

  $fontDirs = [System.Collections.Generic.List[string]]::new()
  Add-UniqueExistingDir $fontDirs (Join-Path $projectPath "assets\fonts")

  $miktexCommand = Get-Command xelatex -ErrorAction SilentlyContinue
  if ($miktexCommand) {
    $miktexRoot = $miktexCommand.Source -replace "\\miktex\\bin\\x64\\xelatex\.exe$", ""
    $knownOpenFontDirs = @(
      "fonts\truetype\catharsis\cormorantgaramond",
      "fonts\opentype\huerta\alegreya",
      "fonts\opentype\public\ebgaramond",
      "fonts\opentype\public\notocjksc",
      "fonts\opentype\public\libertinus-fonts",
      "fonts\opentype\public\tex-gyre",
      "fonts\opentype\public\tex-gyre-math",
      "fonts\truetype\google\noto"
    )

    foreach ($relativeDir in $knownOpenFontDirs) {
      Add-UniqueExistingDir $fontDirs (Join-Path $miktexRoot $relativeDir)
    }
  }

  $cacheDir = Join-Path $outputPath "fontconfig-cache"
  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null

  $dirXml = $fontDirs |
    ForEach-Object { "  <dir>$(Convert-ToFontconfigPath $_)</dir>" }

  $fontconfig = @"
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
$($dirXml -join "`n")
  <cachedir>$(Convert-ToFontconfigPath $cacheDir)</cachedir>
  <config></config>
</fontconfig>
"@

  $configPath = Join-Path $configDir "fonts.conf"
  Set-Content -LiteralPath $configPath -Value $fontconfig -Encoding UTF8
  return $configPath
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
$engineName = $Engine.ToLowerInvariant()
$latexmkMode = switch ($engineName) {
  "pdflatex" { "-pdf" }
  "xelatex" { "-pdfxe" }
  "lualatex" { "-pdflua" }
  default { "-pdfxe" }
}

Push-Location $projectPath
try {
  if ($engineName -eq "tectonic") {
    $tectonic = Get-Command tectonic -ErrorAction SilentlyContinue
    if (-not $tectonic) {
      throw "Tectonic was requested but not found."
    }

    $fontconfigDir = Join-Path $outputPath "fontconfig"
    $fontconfigFile = Write-BooksmithFontconfig $fontconfigDir $projectPath $outputPath
    $env:FONTCONFIG_FILE = $fontconfigFile
    $env:FONTCONFIG_PATH = $fontconfigDir

    & $tectonic.Source "--outdir" $outputPath "main.tex"
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }

    $tectonicPdf = Join-Path $outputPath "main.pdf"
    $namedPdf = Join-Path $outputPath "$jobName.pdf"
    if ((Test-Path $tectonicPdf) -and ($tectonicPdf -ne $namedPdf)) {
      Move-Item -LiteralPath $tectonicPdf -Destination $namedPdf -Force
    }
    exit 0
  }

  if ($latexmk -and $perl) {
    & $latexmk.Source $latexmkMode "-interaction=nonstopmode" "-halt-on-error" "-outdir=$outputPath" "-jobname=$jobName" "main.tex"
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
