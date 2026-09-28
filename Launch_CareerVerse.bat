@echo off
title CareerVerse Launcher
echo =======================================================
echo          CareerVerse - Live Platform Launcher
echo =======================================================
echo.

set "PROJECT_DIR=c:\Users\Bhavadharani\OneDrive\Apps\Android App\careerverse\backend"
cd /d "%PROJECT_DIR%"

:: Check if server is already running on port 5000
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] CareerVerse server is already running on port 5000.
) else (
    echo [..] Starting CareerVerse unified backend server...
    start "" /b node server.js > "%TEMP%\careerverse_server.log" 2>&1
    timeout /t 4 /nobreak >nul
)

echo.
echo Opening CareerVerse in your default browser...
start http://localhost:5000

echo.
echo =======================================================
echo App URL:        http://localhost:5000
echo Admin Portal:   http://localhost:5000/admin
echo API Health:     http://localhost:5000/health
echo =======================================================
timeout /t 4 >nul
exit
