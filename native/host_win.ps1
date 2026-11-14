# ASK Video native helper for Windows (Windows PowerShell 5.1 or PowerShell 7).
# Chrome starts it through host.bat; messages are length-prefixed UTF-8 JSON on stdin/stdout.
#   {filename, content}                    -> save the .srt to %TEMP% and put it on the clipboard as a file
#   {type: 'ask', system, prompt, model?}  -> answer with the local Claude Code CLI (claude -p)
#   {type: 'status'}                       -> is Claude Code installed and signed in
# Nothing else may be written to stdout: Chrome reads it as the reply.

$ErrorActionPreference = 'Stop'
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Config = Join-Path $AppDir 'config.json'
$AskTimeoutMs = 240000
$Models = @('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'opus', 'sonnet', 'haiku')
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Read-Message {
  $in = [Console]::OpenStandardInput()
  $head = New-Object byte[] 4
  $got = 0
  while ($got -lt 4) {
    $n = $in.Read($head, $got, 4 - $got)
    if ($n -le 0) { return $null }
    $got += $n
  }
  $len = [BitConverter]::ToInt32($head, 0)
  $buf = New-Object byte[] $len
  $got = 0
  while ($got -lt $len) {
    $n = $in.Read($buf, $got, $len - $got)
    if ($n -le 0) { break }
    $got += $n
  }
  return ($Utf8.GetString($buf, 0, $got) | ConvertFrom-Json)
}

function Send-Message($obj) {
  $bytes = $Utf8.GetBytes(($obj | ConvertTo-Json -Compress -Depth 5))
  $out = [Console]::OpenStandardOutput()
  $out.Write([BitConverter]::GetBytes([int]$bytes.Length), 0, 4)
  $out.Write($bytes, 0, $bytes.Length)
  $out.Flush()
}

# Quote one argument for the Windows command line (MSVC rules).
function Quote-Arg([string]$s) {
  if ($s -eq '') { return '""' }
  if ($s -notmatch '[\s"]') { return $s }
  $s = $s -replace '(\\*)"', '$1$1\"'
  $s = $s -replace '(\\+)$', '$1$1'
  return '"' + $s + '"'
}

function Find-Claude {
  if (Test-Path $Config) {
    try {
      $p = (Get-Content $Config -Raw | ConvertFrom-Json).claude
      if ($p -and (Test-Path $p)) { return $p }
    } catch {}
  }
  $cmd = Get-Command claude -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($cmd) { return $cmd.Source }
  foreach ($p in @("$env:USERPROFILE\.local\bin\claude.exe", "$env:APPDATA\npm\claude.cmd")) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

# Run claude with arguments and stdin text; returns exit code, stdout and stderr.
function Invoke-Claude([string]$exe, [string[]]$argList, [string]$stdin, [int]$timeoutMs) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $line = ($argList | ForEach-Object { Quote-Arg $_ }) -join ' '
  if ($exe -match '\.(cmd|bat)$') {
    # npm installs claude.cmd, which has to run through cmd.exe.
    $psi.FileName = $env:ComSpec
    $psi.Arguments = '/d /s /c "' + (Quote-Arg $exe) + ' ' + $line + '"'
  } else {
    $psi.FileName = $exe
    $psi.Arguments = $line
  }
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $psi.RedirectStandardInput = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.StandardOutputEncoding = $Utf8
  $psi.StandardErrorEncoding = $Utf8
  $psi.WorkingDirectory = $WorkDir
  $p = [System.Diagnostics.Process]::Start($psi)
  $outTask = $p.StandardOutput.ReadToEndAsync()
  $errTask = $p.StandardError.ReadToEndAsync()
  if ($stdin) {
    $bytes = $Utf8.GetBytes($stdin)
    $p.StandardInput.BaseStream.Write($bytes, 0, $bytes.Length)
  }
  $p.StandardInput.Close()
  if (-not $p.WaitForExit($timeoutMs)) {
    try { $p.Kill() } catch {}
    throw 'TIMEOUT'
  }
  return @{ code = $p.ExitCode; out = $outTask.Result; err = $errTask.Result }
}

function Get-Status {
  $claude = Find-Claude
  if (-not $claude) { return @{ ok = $true; state = 'no-claude' } }
  $r = Invoke-Claude $claude @('auth', 'status') '' 30000
  try { $info = $r.out | ConvertFrom-Json } catch {
    $detail = ($r.err + $r.out).Trim()
    if ($detail.Length -gt 300) { $detail = $detail.Substring($detail.Length - 300) }
    return @{ ok = $true; state = 'error'; detail = $detail }
  }
  if ($info.loggedIn) { return @{ ok = $true; state = 'ready' } }
  return @{ ok = $true; state = 'signed-out' }
}

function Invoke-Ask($msg) {
  $claude = Find-Claude
  if (-not $claude) { throw 'Claude Code (claude) was not found. Install it, then run native\install.cmd again' }
  # The system prompt goes through a file, so nothing in it can break the command line.
  $sysFile = Join-Path $WorkDir 'system-prompt.txt'
  [IO.File]::WriteAllText($sysFile, [string]$msg.system, $Utf8)
  $argList = @('-p', '--output-format', 'text', '--tools', '', '--no-session-persistence',
    '--strict-mcp-config', '--disable-slash-commands', '--system-prompt-file', $sysFile)
  if ($Models -contains [string]$msg.model) { $argList += @('--model', [string]$msg.model) }
  $r = Invoke-Claude $claude $argList ([string]$msg.prompt) $AskTimeoutMs
  $answer = ([string]$r.out).Trim()
  if ($r.code -ne 0 -or -not $answer) {
    $all = [string]$r.err + [string]$r.out
    if ($all -match 'authenticat|log ?in|401') { throw 'Claude Code is not signed in. Run `claude auth login` in PowerShell' }
    $lines = @(($all.Trim() -split "`r?`n") | Where-Object { $_ })
    $last = if ($lines.Count) { $lines[-1] } else { "exit code $($r.code)" }
    throw "Claude failed: $last"
  }
  return @{ ok = $true; answer = $answer }
}

function Copy-SrtFile($msg) {
  $name = [string]$msg.filename
  if (-not $name) { $name = 'subtitles.srt' }
  $name = (($name -replace '[\\/:*?"<>|\x00-\x1f]', ' ') -replace '\s+', ' ').Trim()
  if ($name -notmatch '\.srt$') { $name += '.srt' }
  $dir = Join-Path $env:TEMP 'srt-copy'
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Get-ChildItem -Path $dir -Filter '*.srt' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  $path = Join-Path $dir $name
  [IO.File]::WriteAllText($path, [string]$msg.content, $Utf8)
  Add-Type -AssemblyName System.Windows.Forms
  $files = New-Object System.Collections.Specialized.StringCollection
  [void]$files.Add($path)
  [System.Windows.Forms.Clipboard]::SetFileDropList($files)
  return @{ ok = $true; path = $path }
}

$WorkDir = Join-Path $env:TEMP 'srt-copy-ask'
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

try {
  $msg = Read-Message
  if ($null -eq $msg) { exit 0 }
  switch ([string]$msg.type) {
    'ask' { $reply = Invoke-Ask $msg }
    'status' { $reply = Get-Status }
    default { $reply = Copy-SrtFile $msg }
  }
  Send-Message $reply
} catch {
  $text = [string]$_.Exception.Message
  if ($text -eq 'TIMEOUT') { $text = 'Claude took too long to answer. Try again' }
  Send-Message @{ ok = $false; error = $text }
}
