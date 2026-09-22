@echo off
title RetailInsight Frontend (React + Vite)
echo ====================================================
echo Starting RetailInsight React Frontend (Vite)...
echo ====================================================

cd /d "%~dp0\frontend"
call npm.cmd run dev
pause
