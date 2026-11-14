#!/usr/bin/python3
"""ASK Video native helper.

Messages from the extension:
  {"filename", "content"}                -> save the .srt to a temp folder and put it
                                            on the macOS clipboard as a file
  {"type": "ask", "system", "prompt",
   "model"?}                             -> answer with the local Claude Code CLI (claude -p)
  {"type": "status"}                     -> is Claude Code installed and signed in
"""
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile

APP_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(APP_DIR, "config.json")
ASK_TIMEOUT = 240
# Models the popup can choose; anything else means Claude Code's own default.
MODELS = (
    "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5",
    "opus", "sonnet", "haiku",  # short aliases saved by earlier versions
)

JXA = (
    'ObjC.import("AppKit");'
    'function run(argv){'
    'var pb=$.NSPasteboard.generalPasteboard;pb.clearContents;'
    'var ok=pb.writeObjects($.NSArray.arrayWithObject($.NSURL.fileURLWithPath(argv[0])));'
    'return ok?"ok":"fail";}'
)


def read_message():
    raw = sys.stdin.buffer.read(4)
    if len(raw) < 4:
        return None
    (length,) = struct.unpack("<I", raw)
    return json.loads(sys.stdin.buffer.read(length).decode("utf-8"))


def send_message(obj):
    data = json.dumps(obj).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(data)) + data)
    sys.stdout.buffer.flush()


def copy_file(msg):
    name = re.sub(r'[/\\:\x00-\x1f]', " ", str(msg.get("filename") or "subtitles.srt")).strip()
    name = re.sub(r"\s+", " ", name)
    if not name.lower().endswith(".srt"):
        name += ".srt"
    folder = os.path.join(tempfile.gettempdir(), "srt-copy")
    os.makedirs(folder, exist_ok=True)
    for old in os.listdir(folder):  # previous copies are no longer needed
        if old.lower().endswith(".srt"):
            try:
                os.remove(os.path.join(folder, old))
            except OSError:
                pass
    path = os.path.join(folder, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(msg.get("content") or "")
    out = subprocess.run(
        ["/usr/bin/osascript", "-l", "JavaScript", "-e", JXA, path],
        capture_output=True, text=True, timeout=15,
    )
    if out.returncode != 0 or out.stdout.strip() != "ok":
        raise RuntimeError(out.stderr.strip() or "could not write to the clipboard")
    return {"ok": True, "path": path}


def find_claude():
    try:
        with open(CONFIG, encoding="utf-8") as f:
            path = json.load(f).get("claude")
        if path and os.access(path, os.X_OK):
            return path
    except (OSError, ValueError):
        pass
    home = os.path.expanduser("~")
    for path in (
        shutil.which("claude"),
        "/opt/homebrew/bin/claude",
        "/usr/local/bin/claude",
        os.path.join(home, ".local/bin/claude"),
        os.path.join(home, ".claude/local/claude"),
    ):
        if path and os.access(path, os.X_OK):
            return path
    raise RuntimeError("Claude Code (claude) was not found. Install it, then run native/install.sh again")


def claude_env(claude):
    env = dict(os.environ)
    # Chrome starts the helper with a minimal PATH; claude needs node next to it.
    extra = [os.path.dirname(os.path.realpath(claude)), os.path.dirname(claude), "/opt/homebrew/bin", "/usr/local/bin"]
    env["PATH"] = os.pathsep.join(extra + [env.get("PATH", "/usr/bin:/bin")])
    return env


def status(_msg):
    """Is Claude Code installed and signed in? Only the state goes back, no account details."""
    try:
        claude = find_claude()
    except RuntimeError:
        return {"ok": True, "state": "no-claude"}
    out = subprocess.run(
        [claude, "auth", "status"], capture_output=True, text=True, timeout=30,
        cwd=tempfile.gettempdir(), env=claude_env(claude),
    )
    try:
        info = json.loads(out.stdout)
    except ValueError:
        return {"ok": True, "state": "error", "detail": (out.stderr or out.stdout).strip()[-300:]}
    return {"ok": True, "state": "ready" if info.get("loggedIn") else "signed-out"}


def ask(msg):
    claude = find_claude()
    env = claude_env(claude)
    workdir = os.path.join(tempfile.gettempdir(), "srt-copy-ask")
    os.makedirs(workdir, exist_ok=True)
    cmd = [
        claude, "-p",
        "--output-format", "text",
        "--tools", "",
        "--no-session-persistence",
        "--strict-mcp-config",
        "--disable-slash-commands",
        "--system-prompt", str(msg.get("system") or ""),
    ]
    if msg.get("model") in MODELS:
        cmd += ["--model", msg["model"]]
    out = subprocess.run(
        cmd, input=str(msg.get("prompt") or ""), capture_output=True, text=True,
        timeout=ASK_TIMEOUT, cwd=workdir, env=env,
    )
    answer = out.stdout.strip()
    if out.returncode != 0 or not answer:
        if re.search(r"authenticat|log ?in|401", out.stderr + answer, re.I):
            raise RuntimeError("Claude Code is not signed in. Run `claude` in Terminal and sign in with /login")
        detail = (out.stderr.strip() or answer or f"exit code {out.returncode}").splitlines()
        raise RuntimeError("Claude failed: " + (detail[-1] if detail else "no answer"))
    return {"ok": True, "answer": answer}


def main():
    msg = read_message()
    if msg is None:
        return
    try:
        handler = {"ask": ask, "status": status}.get(msg.get("type"), copy_file)
        send_message(handler(msg))
    except subprocess.TimeoutExpired:
        send_message({"ok": False, "error": "Claude took too long to answer. Try again"})
    except Exception as e:  # noqa: BLE001
        send_message({"ok": False, "error": str(e)})


if __name__ == "__main__":
    main()
