@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo FAIRHIRE AI - Simple Local Recruitment Assistant
echo ============================================
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js LTS from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing packages for first run...
  call npm install
  if errorlevel 1 (
    echo npm install failed. Check your internet connection and retry.
    pause
    exit /b 1
  )
)
echo Starting FAIRHIRE AI...
call npm run dev
pause
