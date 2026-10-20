# Codex runtime notes

## Installed paths and tools

This is a self-contained Codex skill. Resolve all `scripts/`, `template/`, `references/` and `examples/` paths relative to this skill directory, even when the working directory is the generated project. The usual install root is `$CODEX_HOME/skills`, or `~/.codex/skills` when unset. The same files still work with other coding agents.

Use the available shell/file tools for project code and commands, and `view_image` for contact sheets and stills. Tool names vary by host; there is no dependency on Claude's `Read`, `Task`, plugin marketplace, model, API key or subscription. In Codex desktop, `load_workspace_dependencies` can locate the bundled Node/Python runtimes when they are absent from PATH. Invoke discovered executable paths directly. Do not change the user's selected model or reasoning effort.

Keep user-selected characters and art direction. Clawd is an optional bundled character, not a requirement to use Claude. For long videos, work chapter by chapter; use subagents only when authorized by the session. Parallel render workers are local rendering processes, not subagents.

## Create a project

Node.js 22.12+ with npm, Chrome/Chromium or Edge, and FFmpeg are needed. Python with numpy is needed only for music beat detection. The scaffold uses Node, not Bash, rsync or sed, and refuses to overwrite a nonempty directory.

```powershell
# Replace these example paths with the actual skill and requested output directory.
node "C:/Users/you/.codex/skills/kinetic-reel/scripts/new_project.mjs" "D:/videos/new-project"
Set-Location -LiteralPath "D:/videos/new-project"
```

On macOS/Linux the command is the same with Unix paths. `--keep-demo` retains the painted demo for a smoke test; `--skip-install` copies files without npm dependency installation. The kinetic template retains its demo until you replace the cues and scenes.

The renderer detects standard Chrome and Edge installs and Playwright Chromium caches. For nonstandard locations:

```powershell
$env:CHROME_PATH = "C:/path/to/chrome.exe"
$env:FFMPEG_PATH = "C:/path/to/ffmpeg.exe"
```

On macOS/Linux use `export CHROME_PATH="..."` and `export FFMPEG_PATH="..."`.
The renderer also accepts `--chrome=...` and `--ffmpeg=...`; quote the whole argument if it contains spaces. FFmpeg is found on PATH or in `$CODEX_HOME/bin` (default `~/.codex/bin`). When running FFmpeg commands directly, use its full discovered path (`& $env:FFMPEG_PATH ...` in PowerShell) if it is not on PATH. Beat detection honors `FFMPEG_PATH`.

## Render and verify

Run commands separately in PowerShell; Windows PowerShell 5.1 does not support `&&`. Run rendering from the generated project directory. Use the template's frame rate consistently in both frame generation and encoding (painted: 24; kinetic: 30); a different rate changes timing.

```text
node render.mjs --sheet=0.5,1,1.5 --out=out/check/sheet.jpg
node render.mjs --clip --range=0:1 --no-audio --out=out/check/silent-preview.mp4
```

The first preview should be short enough to measure rendering cost before launching the full video. `--no-audio` is for silent previews; provide the requested song or synthesize the kinetic score for final output. Missing audio is an error, not permission to silently drop the soundtrack. For `--encode`, pass `--audio=...` explicitly; it does not load browser project settings. Browser installation is unnecessary for encoding already-rendered frames.

Inspect rendered images. Verify that MP4 decoding works, duration/frame rate match, and the audio stream exists when requested. Report real measurements, not template timing claims. Keep renders local unless the user requests a remote service.

Frames are resumable but cache invalidation is manual: after scene, frame-rate or timing changes use a fresh `--frames-dir=out/revision2` for both `--frames` and `--encode`, or remove only verified affected frame files. `--range` preserves absolute frame indices for partial rerenders; render the full sequence from frame zero before encoding. For a standalone excerpt use `--clip --range=a:b`.

Google Fonts used by the demos need network access. For offline/reproducible output, bundle appropriately licensed fonts, use local `@font-face`, and verify Chinese glyphs and text bounds. Software WebGL (`--soft-gl`) is a fallback and can be slow, especially with watercolour fills.

Deliver a clickable absolute output path (and inline preview if supported), the duration, resolution, audio status and any material limitation. Never report successful output after a nonzero renderer/encoder exit.
