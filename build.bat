@echo off
cls
REM @echo "Starting build.bat"

.paket\paket.exe restore
if errorlevel 1 (
  exit /b %errorlevel%
)
@echo %cd%
"packages\FAKE\tools\Fake.exe" build.fsx
pause