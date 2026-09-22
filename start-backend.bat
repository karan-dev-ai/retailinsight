@echo off
title RetailInsight Backend (Spring Boot)
echo ====================================================
echo Starting RetailInsight Spring Boot Backend...
echo ====================================================

cd /d "%~dp0\backend"

REM Auto set JAVA_HOME if not set
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
    )
)

echo Using JAVA_HOME: %JAVA_HOME%
call mvnw.cmd spring-boot:run
pause
