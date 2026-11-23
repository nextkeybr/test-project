# AI 오피스 설치 / 업데이트 (윈도우용)
# 처음 설치: 키보드에서 [윈도우키 + R] → 아래 한 줄 붙여넣기 → Enter
#   powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office/install-win.ps1 | iex"
# 업데이트: 사무실 화면의 "새 버전 업데이트" 버튼
# 필요한 프로그램(Node.js, Claude Code, Codex)이 없으면 알아서 설치합니다. 관리자 권한은 필요 없습니다.
# 내 데이터(채팅 기록, 결과물, 캐릭터 이미지, 내 설정)는 지우지 않습니다.

function Invoke-AIOfficeInstall {
  $ErrorActionPreference = 'Stop'
  $ProgressPreference = 'SilentlyContinue'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $Update = $env:AI_OFFICE_UPDATE -eq '1'
  $Dest = if ($env:AI_OFFICE_DIR) { $env:AI_OFFICE_DIR } else { Join-Path $env:USERPROFILE 'AI-Office' }
  $Branch = 'claude/ecstatic-lovelace-echyjs'
  $Url = "https://codeload.github.com/nextkeybr/test-project/tar.gz/refs/heads/$Branch"
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  $Log = Join-Path $Dest 'install-log.txt'
  if (-not $Update) { try { Start-Transcript -Path $Log -Append | Out-Null } catch {} }

  function Fail($msg, $fix) { throw [System.Exception]::new("$msg|$fix") }
  function Step($n, $t) { Write-Host ""; Write-Host "[$n] $t" -ForegroundColor Cyan }
  function Ok($t) { Write-Host "   [OK] $t" -ForegroundColor Green }
  function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
  function Add-Path($p) { if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) { $env:PATH = "$p;$env:PATH" } }

  $Runtime = Join-Path $Dest 'runtime'
  Add-Path (Join-Path $env:USERPROFILE '.local\bin')
  Add-Path (Join-Path $Runtime 'npm')
  Add-Path (Join-Path $Runtime 'node')

  try {
    Step '1/5' '인터넷 연결 확인'
    try { Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 15 | Out-Null } catch { Fail '인터넷에 연결할 수 없어요.' '와이파이를 확인하고 다시 실행해 주세요.' }
    Ok '연결됨'

    Step '2/5' 'AI 오피스 파일 받기'
    $Tmp = Join-Path ([IO.Path]::GetTempPath()) ("ai-office-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $Tmp | Out-Null
    try {
      $Tgz = Join-Path $Tmp 'src.tar.gz'
      Invoke-WebRequest -Uri $Url -OutFile $Tgz -UseBasicParsing
      & tar.exe -xzf $Tgz -C $Tmp
      if ($LASTEXITCODE -ne 0) { Fail '받은 파일의 압축을 풀지 못했어요.' '잠시 뒤에 다시 실행해 주세요.' }
      $Src = Get-ChildItem -Path $Tmp -Directory | ForEach-Object { Join-Path $_.FullName 'ai-office' } | Where-Object { Test-Path $_ } | Select-Object -First 1
      if (-not $Src) { Fail '받은 파일이 이상해요.' '잠시 뒤에 다시 실행해 주세요.' }
      # 받은 파일에는 내 데이터가 들어있지 않으므로, 그대로 덮어써도 내 데이터는 남습니다
      & robocopy.exe $Src $Dest /E /NFL /NDL /NJH /NJS /NP | Out-Null
      if ($LASTEXITCODE -ge 8) { Fail '파일을 복사하지 못했어요.' '사무실이 켜져 있다면 끄고 다시 실행해 주세요.' }
      $global:LASTEXITCODE = 0
    } finally { Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue }
    Ok ("버전 " + (Get-Content (Join-Path $Dest 'VERSION') -ErrorAction SilentlyContinue))

    $Bat = Join-Path $Dest 'AI-Office.bat'
    if ($Update -and (Test-Path $Bat)) { Write-Host '[OK] 업데이트 완료'; return }

    Step '3/5' 'Node.js 준비 (사무실을 돌리는 엔진)'
    $nodeOk = $false
    if (Has 'node') { try { $nodeOk = [int](& node -p "process.versions.node.split('.')[0]") -ge 18 } catch {} }
    if ($nodeOk) { Ok ("이미 있어요 (" + (& node -v) + ")") } else {
      $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
      $line = (Invoke-WebRequest -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing).Content -split "`n" | Where-Object { $_ -match '"lts":"' } | Select-Object -First 1
      if ($line -match '"version":"(v[0-9.]+)"') { $ver = $Matches[1] } else { Fail 'Node.js 버전 정보를 받지 못했어요.' '잠시 뒤에 다시 실행해 주세요.' }
      Write-Host "   Node.js $ver 받는 중..."
      $zip = Join-Path ([IO.Path]::GetTempPath()) "node-$ver.zip"
      Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/node-$ver-win-$arch.zip" -OutFile $zip -UseBasicParsing
      $nt = Join-Path $Runtime 'node-tmp'
      Remove-Item -Recurse -Force $nt -ErrorAction SilentlyContinue
      New-Item -ItemType Directory -Force -Path $nt | Out-Null
      & tar.exe -xf $zip -C $nt
      Remove-Item $zip -Force -ErrorAction SilentlyContinue
      $inner = Get-ChildItem $nt -Directory | Select-Object -First 1
      Remove-Item -Recurse -Force (Join-Path $Runtime 'node') -ErrorAction SilentlyContinue
      Move-Item $inner.FullName (Join-Path $Runtime 'node')
      Remove-Item -Recurse -Force $nt -ErrorAction SilentlyContinue
      Add-Path (Join-Path $Runtime 'node')
      if (-not (Has 'node')) { Fail 'Node.js를 준비하지 못했어요.' 'https://nodejs.org 에서 직접 설치한 뒤 다시 실행해 주세요.' }
      Ok ("설치 완료 (" + (& node -v) + ")")
    }

    Step '4/5' 'AI 프로그램 준비 (Claude Code, Codex)'
    if (Has 'claude') { Ok 'Claude Code 이미 있어요' } else {
      Write-Host '   Claude Code 설치 중...'
      try { & powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex" } catch {}
      Add-Path (Join-Path $env:USERPROFILE '.local\bin')
      if (Has 'claude') { Ok 'Claude Code 설치 완료' } else { Write-Host "   [!] Claude Code 설치가 끝나지 않았어요. 사무실의 '시작 준비'에서 다시 시도할 수 있어요." -ForegroundColor Yellow }
    }
    if (Has 'codex') { Ok 'Codex 이미 있어요' } else {
      Write-Host '   Codex 설치 중...'
      try { & npm.cmd install -g --prefix (Join-Path $Runtime 'npm') '@openai/codex@latest' 2>&1 | Out-Null } catch {}
      Add-Path (Join-Path $Runtime 'npm')
      if (Has 'codex') { Ok 'Codex 설치 완료' } else { Write-Host "   [!] Codex 설치가 끝나지 않았어요. 사무실의 '시작 준비'에서 다시 시도할 수 있어요." -ForegroundColor Yellow }
    }

    Step '5/5' '바탕화면 아이콘 만들기'
    $BatText = @"
@echo off
title AI Office
cd /d "%~dp0"
set "PATH=%~dp0runtime\node;%~dp0runtime\npm;%USERPROFILE%\.local\bin;%PATH%"
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
    $Desktop = [Environment]::GetFolderPath('Desktop')
    $Shell = New-Object -ComObject WScript.Shell
    $Lnk = $Shell.CreateShortcut((Join-Path $Desktop 'AI오피스.lnk'))
    $Lnk.TargetPath = $Bat
    $Lnk.WorkingDirectory = $Dest
    $Lnk.Description = 'AI 오피스 열기'
    $Lnk.IconLocation = "$env:SystemRoot\System32\imageres.dll,186"
    $Lnk.Save()
    Ok "바탕화면에 'AI오피스' 아이콘을 만들었어요"

    Write-Host ""
    Write-Host "설치 끝! 사무실을 열어 드릴게요." -ForegroundColor Cyan
    Write-Host "처음 열리면 '시작 준비' 창에서 [로그인하기] 버튼만 누르면 됩니다."
    Write-Host "다음부터는 바탕화면의 'AI오피스' 아이콘을 더블클릭하세요."
    Start-Process -FilePath $Bat -WorkingDirectory $Dest
  } catch {
    $parts = "$($_.Exception.Message)" -split '\|', 2
    Write-Host ""
    Write-Host ("[X] " + $parts[0]) -ForegroundColor Red
    if ($parts.Count -gt 1) { Write-Host ("    해결 방법: " + $parts[1]) -ForegroundColor Yellow }
    Write-Host "    그래도 안 되면 이 파일을 보내주세요: $Log"
    if (-not $Update) { try { Read-Host '    Enter를 누르면 창이 닫혀요' | Out-Null } catch {} }
    if ($Update) { exit 1 }
  } finally {
    if (-not $Update) { try { Stop-Transcript | Out-Null } catch {} }
  }
}
Invoke-AIOfficeInstall
