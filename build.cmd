@echo off
cls

paket.bootstrapper.exe prerelease
if errorlevel 1 (
  exit /b %errorlevel%
)

paket.exe restore
if errorlevel 1 (
  exit /b %errorlevel%
)

packages\FAKE\tools\FAKE.exe build.fsx %* --nocache