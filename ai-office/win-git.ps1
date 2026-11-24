# Portable Git for Windows (no admin rights). Claude Code on Windows uses Git Bash.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File win-git.ps1 -Dest "C:\Users\me\AI-Office"
# (ASCII only on purpose: Windows PowerShell 5.1 reads -File scripts in the local code page.)
param([string]$Dest = $PSScriptRoot)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$gitDir = Join-Path (Join-Path $Dest 'runtime') 'git'
$bash = Join-Path $gitDir 'bin\bash.exe'
if (-not (Test-Path $bash)) {
  $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { '64-bit' }
  Write-Host "Looking up the latest Portable Git..."
  # Fallback: a known release (used when the GitHub API is busy, e.g. many PCs behind one office network)
  $name = if ($arch -eq 'arm64') { 'PortableGit-2.47.1-arm64.7z.exe' } else { 'PortableGit-2.47.1-64-bit.7z.exe' }
  $dl = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/$name"
  try {
    $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/git-for-windows/git/releases/latest' -UseBasicParsing -UserAgent 'ai-office-installer' -TimeoutSec 20
    $asset = $rel.assets | Where-Object { $_.name -like "PortableGit-*-$arch.7z.exe" } | Select-Object -First 1
    if ($asset) { $name = $asset.name; $dl = $asset.browser_download_url }
  } catch { Write-Host "GitHub API not available, using the known release." }
  $exe = Join-Path ([IO.Path]::GetTempPath()) $name
  Write-Host ("Downloading " + $name + " ...")
  Invoke-WebRequest -Uri $dl -OutFile $exe -UseBasicParsing
  New-Item -ItemType Directory -Force -Path $gitDir | Out-Null
  Write-Host "Extracting..."
  $p = Start-Process -FilePath $exe -ArgumentList @("-o`"$gitDir`"", '-y') -Wait -PassThru -WindowStyle Hidden
  Remove-Item $exe -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $bash)) { throw 'Portable Git could not be extracted (git bash)' }
}
# Tell Claude Code where Git Bash is (for this user, all future windows)
[Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', $bash, 'User')
$env:CLAUDE_CODE_GIT_BASH_PATH = $bash
Write-Host "Git ready: $bash"
