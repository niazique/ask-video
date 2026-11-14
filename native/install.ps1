# Installs the ASK Video helper on Windows: it copies .srt files to the clipboard and
# answers questions through the local Claude Code CLI. Run install.cmd (double-click).
# Creates, for the current user only:
#   %LOCALAPPDATA%\ASKVideo\host.ps1, host.bat, config.json, com.srtcopy.host.json
#   HKCU\Software\Google\Chrome\NativeMessagingHosts\com.srtcopy.host
# Uninstall: install.cmd -Uninstall

param([switch]$Uninstall)
$ErrorActionPreference = 'Stop'

$ExtId = 'hahaflgljfibnfjedhckbedppchaofjo'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppDir = Join-Path $env:LOCALAPPDATA 'ASKVideo'
$RegKey = 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.srtcopy.host'
$Utf8 = New-Object System.Text.UTF8Encoding($false)

if ($Uninstall) {
  Remove-Item -Path $RegKey -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path $AppDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host 'Helper removed.'
  exit 0
}

New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
$hostScript = Join-Path $AppDir 'host.ps1'
Copy-Item -Path (Join-Path $Here 'host_win.ps1') -Destination $hostScript -Force
Unblock-File -Path $hostScript -ErrorAction SilentlyContinue

# Chrome needs an executable; the batch file starts PowerShell with the helper.
$bat = "@echo off`r`npowershell.exe -NoLogo -NoProfile -NonInteractive -STA -ExecutionPolicy Bypass -File `"%~dp0host.ps1`" %*`r`n"
[IO.File]::WriteAllText((Join-Path $AppDir 'host.bat'), $bat, [System.Text.Encoding]::ASCII)

# Remember where the Claude Code CLI lives.
$claude = (Get-Command claude -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $claude) {
  foreach ($p in @("$env:USERPROFILE\.local\bin\claude.exe", "$env:APPDATA\npm\claude.cmd")) {
    if (Test-Path $p) { $claude = $p; break }
  }
}
$configPath = Join-Path $AppDir 'config.json'
if ($claude) {
  [IO.File]::WriteAllText($configPath, (@{ claude = $claude } | ConvertTo-Json), $Utf8)
  Write-Host "Claude Code: $claude"
} else {
  Remove-Item -Path $configPath -Force -ErrorAction SilentlyContinue
  Write-Host 'Claude Code (claude) not found: answers will not work until it is installed and this installer is run again.'
}

# Native messaging manifest + the registry key that points Chrome to it.
$manifestPath = Join-Path $AppDir 'com.srtcopy.host.json'
$manifest = [ordered]@{
  name = 'com.srtcopy.host'
  description = 'ASK Video: copies .srt files and asks Claude Code'
  path = (Join-Path $AppDir 'host.bat')
  type = 'stdio'
  allowed_origins = @("chrome-extension://$ExtId/")
}
[IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json), $Utf8)
New-Item -Path $RegKey -Force | Out-Null
Set-Item -Path $RegKey -Value $manifestPath

Write-Host 'Done. Reload the extension at chrome://extensions.'
