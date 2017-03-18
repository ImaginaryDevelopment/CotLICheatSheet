@echo off
cls

#rem if paket is installed globally to the machine we don't need to specify a path
paket.exe restore
if errorlevel 1 (
  exit /b %errorlevel%
)

"packages\FAKE\tools\Fake.exe" build.fsx
pause