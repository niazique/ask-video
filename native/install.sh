#!/bin/bash
# Installs the helper that puts the .srt on the clipboard as a file and answers
# questions through the local Claude Code CLI (macOS + Chrome only).
# Creates files outside the project folder:
#   ~/Library/Application Support/SRTCopy/srt_copy_host.py (+ config.json)
#   ~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.srtcopy.host.json
# Uninstall: ./install.sh --uninstall
set -euo pipefail

EXT_ID="hahaflgljfibnfjedhckbedppchaofjo"
HERE="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$HOME/Library/Application Support/SRTCopy"
NMH_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
MANIFEST="$NMH_DIR/com.srtcopy.host.json"

if [[ "${1:-}" == "--uninstall" ]]; then
  rm -f "$MANIFEST" "$APP_DIR/srt_copy_host.py" "$APP_DIR/config.json"
  rmdir "$APP_DIR" 2>/dev/null || true
  echo "Helper removed."
  exit 0
fi

mkdir -p "$APP_DIR" "$NMH_DIR"
cp "$HERE/srt_copy_host.py" "$APP_DIR/srt_copy_host.py"
chmod +x "$APP_DIR/srt_copy_host.py"

# Remember where the Claude Code CLI lives: Chrome starts the helper with a minimal PATH.
CLAUDE_BIN="$(zsh -lic 'command -v claude' 2>/dev/null | tail -1 || true)"
if [[ -n "$CLAUDE_BIN" && -x "$CLAUDE_BIN" ]]; then
  printf '{"claude": "%s"}\n' "$CLAUDE_BIN" > "$APP_DIR/config.json"
  echo "Claude Code: $CLAUDE_BIN"
else
  rm -f "$APP_DIR/config.json"
  echo "Claude Code (claude) not found: Ask will not work until it is installed and this script is run again."
fi

cat > "$MANIFEST" <<EOF
{
  "name": "com.srtcopy.host",
  "description": "ASK Video: copies .srt files and asks Claude Code",
  "path": "$APP_DIR/srt_copy_host.py",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
EOF

echo "Done. Reload the extension at chrome://extensions."
