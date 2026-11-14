@echo off
rem Double-click to install the ASK Video helper on Windows. "install.cmd -Uninstall" removes it.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
echo.
pause
