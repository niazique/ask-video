# ASK Video

A Chrome extension that lets you ask Claude anything about the YouTube video you are watching — and copy its subtitles as an `.srt` file.

- **Ask about the video.** Open the popup on any YouTube video and ask a question, or press *Summarize it*. Claude reads the video's subtitles and answers right in the popup. Timestamps in the answer are clickable and jump the video to that moment.
- **Choose how long the answer is:** *tl;dr* (one sentence), *normal* (a few short paragraphs) or *lecture* (a structured answer with headings).
- **Choose the model:** Auto, Opus, Sonnet or Haiku.
- **Copy subtitles as a file.** The `.SRT` button (or right-click on a YouTube page → *Copy subtitles file*) puts an `.srt` file on the clipboard, in the original language or in English. Paste it into a chat with Claude, a folder, anywhere.
- **Interface in 8 languages:** Deutsch, English, Español, Français, Italiano, Português, Русский, 中文.

Answers come from **Claude Code running on your Mac**, so they use your Claude subscription. No API key is needed.

> Unofficial project, not affiliated with or endorsed by Anthropic or YouTube.

## Requirements

- Google Chrome on **macOS** or **Windows**
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), installed and signed in (`claude auth login`)
- macOS only: Python 3 (comes with the Xcode Command Line Tools: `xcode-select --install`)

Without Claude Code the extension can still copy subtitles, but cannot answer questions.

**Linux:** the extension installs and copies subtitles (as text), but there is no helper for answers yet. The popup detects your system and says so.

## Install

### macOS

1. Get the code:

   ```bash
   git clone https://github.com/niazique/ask-video.git ~/ask-video
   ```

2. Install the helper (see [what it does](#what-the-helper-does)):

   ```bash
   ~/ask-video/native/install.sh
   ```

3. Load the extension in Chrome: open `chrome://extensions`, turn on **Developer mode** (top right), click **Load unpacked** and choose the `~/ask-video` folder.

4. Open any YouTube video and click the ASK Video icon in the toolbar. If something is missing, the popup tells you what to do.

### Windows

1. Install Claude Code if you don't have it — in PowerShell: `irm https://claude.ai/install.ps1 | iex` — and sign in: `claude auth login`.
2. Get the code: `git clone https://github.com/niazique/ask-video.git` in PowerShell, or **Code → Download ZIP** on GitHub and unzip it.
3. In the `native` folder, double-click **`install.cmd`** and wait for `Done.` (If Windows warns about a file from the internet, choose *More info → Run anyway*.)
4. Load the extension in Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked** → choose the folder.
5. Open a YouTube video and click the ASK Video icon.

### Install with Claude Code

If you use Claude Code, you can let it do steps 1–2 and check everything. Paste this into Claude Code:

```text
Install the ASK Video Chrome extension from https://github.com/niazique/ask-video — follow the "Instructions for Claude" section of its README.
```

Chrome does not let programs add unpacked extensions on their own, so step 3 (three clicks in `chrome://extensions`) stays with you.

<details>
<summary><b>Instructions for Claude</b></summary>

When a user asks you to install this extension:

1. Clone the repository to `~/ask-video` (on Windows `%USERPROFILE%\ask-video`, or a folder the user names). If it already exists, run `git pull` there instead.
2. Install the helper from that folder. It must print `Done.`; if it says Claude Code was not found, tell the user to install Claude Code first.
   - macOS: `./native/install.sh`
   - Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File native\install.ps1`
   - Linux: there is no helper yet — skip this and tell the user that copying subtitles works but answers do not.
3. Run `claude auth status`. If `loggedIn` is not `true`, ask the user to run `claude auth login` and sign in with their Claude account.
4. Tell the user to open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and choose the folder from step 1 — and, if it was already loaded, to press the reload button on the ASK Video card instead.
5. Tell them to open a YouTube video and click the ASK Video icon.

Do not change files outside the repository folder except through `install.sh`.
</details>

## Update

```bash
cd ~/ask-video && git pull && ./native/install.sh
```

On Windows: `git pull` (or download the ZIP again), then double-click `native\install.cmd`. Then press the reload button on the ASK Video card in `chrome://extensions`.

## What the helper does

Chrome extensions cannot put a file on the clipboard or run programs, so a small helper does that: Python on macOS ([`native/srt_copy_host.py`](native/srt_copy_host.py)), PowerShell on Windows ([`native/host_win.ps1`](native/host_win.ps1)) — no extra software needed on Windows. Chrome starts it only when the extension asks, through [native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging). It:

- saves the `.srt` to a temporary folder and puts it on the clipboard as a file;
- answers questions by running `claude -p` with the video's subtitles, with all tools disabled — Claude only reads the subtitles and replies;
- checks whether Claude Code is installed and signed in.

On macOS, `install.sh` creates three files and nothing else:

- `~/Library/Application Support/SRTCopy/srt_copy_host.py` — the helper
- `~/Library/Application Support/SRTCopy/config.json` — the path to `claude`
- `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.srtcopy.host.json` — tells Chrome where the helper is and that only this extension may use it

On Windows, `install.cmd` creates the folder `%LOCALAPPDATA%\ASKVideo` (the helper, its launcher `host.bat`, `config.json` and the Chrome manifest) and one registry key, `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.srtcopy.host`, which points Chrome to that manifest. Nothing is installed for other users and no admin rights are needed.

## Uninstall

```bash
~/ask-video/native/install.sh --uninstall
```

On Windows: `native\install.cmd -Uninstall` (from a command prompt in the extension folder).

Then remove ASK Video in `chrome://extensions` and delete the folder.

## Good to know

- Each question sends the whole transcript to Claude, so long videos use more of your Claude limits — Opus the most.
- Subtitles are read the same way the YouTube player loads them. If YouTube changes how that works, copying and answers may break until the extension is updated.
- Chats are kept per video until Chrome restarts.

## License

[MIT](LICENSE)
