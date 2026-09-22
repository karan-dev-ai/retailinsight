@echo off
title RetailInsight Launcher
echo ====================================================
echo Starting RetailInsight Full-Stack Platform...
echo ====================================================

start "RetailInsight Backend" "%~dp0\start-backend.bat"
timeout /t 3 /nobreak >nul
start "RetailInsight Frontend" "%~dp0\start-frontend.bat"

echo.
echo Both Backend (port 8080) and Frontend (port 5173) are launching!
echo Access the app at: http://localhost:5173
echo.
pause
