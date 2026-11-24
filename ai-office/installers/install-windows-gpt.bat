@echo off
title AI Office Installer (GPT only)
echo.
echo   AI Office Installer (GPT only)
echo   Please wait 5-10 minutes. Do not close this window.
echo.
set AI_OFFICE_PROFILE=gpt
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; irm https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office/install-win.ps1 | iex"
