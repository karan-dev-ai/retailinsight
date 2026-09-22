# Set JAVA_HOME if missing
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot") {
        $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
    }
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
& .\mvnw.cmd spring-boot:run
