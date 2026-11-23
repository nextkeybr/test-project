# AI 오피스 설치 / 업데이트 (윈도우용)
# 처음 설치: PowerShell 에서  irm https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office/install-win.ps1 | iex
# 업데이트:  사무실 화면의 "새 버전 업데이트" 버튼 (또는 위 명령을 다시 실행)
# 내 데이터(채팅 기록, 결과물, 캐릭터 이미지, agents.local.json, role.local.md)는 지우지 않습니다.
$Update = $env:AI_OFFICE_UPDATE -eq '1'
$ErrorActionPreference = 'Stop'

$Dest = if ($env:AI_OFFICE_DIR) { $env:AI_OFFICE_DIR } else { Join-Path $env:USERPROFILE 'AI-Office' }
$Branch = 'claude/ecstatic-lovelace-echyjs'
$Url = "https://codeload.github.com/nextkeybr/test-project/tar.gz/refs/heads/$Branch"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[X] Node.js 가 없습니다. https://nodejs.org 에서 LTS 버전을 설치한 뒤, PowerShell 을 새로 열고 다시 실행해 주세요." -ForegroundColor Red
  return
}

Write-Host "최신 버전 받는 중..."
$Tmp = Join-Path ([IO.Path]::GetTempPath()) ("ai-office-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $Tmp | Out-Null
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $Tgz = Join-Path $Tmp 'src.tar.gz'
  $ProgressPreference = 'SilentlyContinue'
  Invoke-WebRequest -Uri $Url -OutFile $Tgz -UseBasicParsing
  & tar.exe -xzf $Tgz -C $Tmp
  if ($LASTEXITCODE -ne 0) { throw "압축을 풀지 못했습니다" }
  $Src = Get-ChildItem -Path $Tmp -Directory | ForEach-Object { Join-Path $_.FullName 'ai-office' } | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $Src) { throw "받은 파일에서 ai-office 폴더를 찾지 못했습니다" }
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  # 받은 파일에는 내 데이터가 들어있지 않으므로, 그대로 덮어써도 내 데이터는 남습니다
  & robocopy.exe $Src $Dest /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "파일 복사에 실패했습니다 (robocopy $LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
} finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
$Ver = Get-Content (Join-Path $Dest 'VERSION') -ErrorAction SilentlyContinue
Write-Host "[OK] 파일 설치 완료: $Dest (버전 $Ver)" -ForegroundColor Green

# 실행 파일 (업데이트 때는 지금 실행 중인 파일을 건드리지 않습니다)
$Bat = Join-Path $Dest 'AI-Office.bat'
if ($Update -and (Test-Path $Bat)) { Write-Host "[OK] 업데이트 완료"; exit 0 }
$BatText = @"
@echo off
title AI Office
cd /d "%~dp0"
set OFFICE_OPEN=1
:loop
node server.js
if %errorlevel%==42 (
  set OFFICE_OPEN=0
  goto loop
)
echo.
echo AI Office is closed. Press any key to close this window.
pause >nul
"@
Set-Content -Path $Bat -Value $BatText -Encoding ASCII

# 바탕화면 아이콘 (OneDrive 바탕화면도 자동으로 찾음)
$Desktop = [Environment]::GetFolderPath('Desktop')
$Shell = New-Object -ComObject WScript.Shell
$Lnk = $Shell.CreateShortcut((Join-Path $Desktop 'AI오피스.lnk'))
$Lnk.TargetPath = $Bat
$Lnk.WorkingDirectory = $Dest
$Lnk.Description = 'AI 오피스 열기'
$Lnk.IconLocation = "$env:SystemRoot\System32\imageres.dll,186"
$Lnk.Save()

Write-Host ""
Write-Host "설치 끝! 바탕화면의 'AI오피스' 아이콘을 더블클릭하면 사무실이 열립니다." -ForegroundColor Cyan
Write-Host "지금 바로 열어 드릴게요..."
Start-Process -FilePath $Bat -WorkingDirectory $Dest
