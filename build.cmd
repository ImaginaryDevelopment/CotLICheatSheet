@echo off
cls
REM @echo "Starting build.cmd"
REM @echo %0
REM @echo %cd%
.paket\paket.bootstrapper.exe prerelease
if errorlevel 1 (
  @echo "failed to find paketboot"
  exit /b %errorlevel%
)

.paket\paket.exe restore
if errorlevel 1 (
  @echo "failed to find paket"
  exit /b %errorlevel%
)

packages\FAKE\tools\FAKE.exe build.fsx %* --nocache