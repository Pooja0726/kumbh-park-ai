@echo off
title KumbhPark AI - Dev Server
cd /d "%~dp0"

echo.
echo ========================================
echo   KumbhPark AI - Starting...
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download from https://nodejs.org and install LTS, then run this again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies... first time only, please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Starting server at http://localhost:3000
echo.
echo KEEP THIS WINDOW OPEN while using the app.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

call npm run dev

pause
