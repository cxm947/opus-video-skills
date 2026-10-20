# Video Skills for Codex

[简体中文](README.zh-CN.md)

A Codex adaptation of [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills), based on commit `59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1`. It retains the animation engines, examples and visual craft guidance, and adds Codex discovery, runtime instructions, standalone licensing and Windows-compatible project creation.

| Skill | Use |
|---|---|
| `painted-animation` | Watercolour and ink cartoons, Clawd shorts, music videos and karaoke lyrics |
| `kinetic-reel` | Moving typography, interface graphics, portfolio reels, product videos and synthesized scores |

Codex writes scene code, renders frames in Chromium and encodes MP4 with FFmpeg. Claude Code, a Claude subscription and an image/video generation API are not required. Existing songs are user-supplied; the kinetic template can synthesize an instrumental score. Clawd is an optional character.

## Install

Node.js 22.12+ with npm is required.

```text
git clone https://github.com/cxm947/opus-video-skills.git
cd opus-video-skills
node scripts/install-codex.mjs
```

Both skills are copied to `$CODEX_HOME/skills`, or `~/.codex/skills` if unset. Existing skill directories are never overwritten. For a project-local or custom install:

```text
node scripts/install-codex.mjs --dest /absolute/project/.agents/skills
```

Available on the next Codex turn, with automatic discovery enabled:

```text
Use $painted-animation to make a 10-second hand-painted Clawd cartoon.
Use $painted-animation with my audio and LRC to create a lyric MV.
Use $kinetic-reel to make a 15-second product intro with Chinese titles.
```

To update, fetch this fork's changes, move existing skill directories to a backup location, and rerun the installer. There is no destructive overwrite mode.

## Rendering requirements

- Node.js 22.12+ and npm.
- Chrome, Chromium or Microsoft Edge. Standard installs and Playwright Chromium caches are detected.
- FFmpeg on PATH, at `FFMPEG_PATH`, or under `$CODEX_HOME/bin` (default `~/.codex/bin`).
- Python 3 with numpy for beat analysis only.
- Network for npm dependencies and demo Google Fonts. Use local licensed fonts for offline rendering.

Scaffold commands work in PowerShell, macOS and Linux shells. Quote paths containing spaces.

```text
node /absolute/path/to/painted-animation/scripts/new_project.mjs /path/to/new-video --keep-demo
cd /path/to/new-video
node render.mjs --sheet=0.5,1,1.5 --out=out/check/sheet.jpg
node render.mjs --clip --range=0:1 --no-audio --out=out/check/preview.mp4
```

Omit `--keep-demo` for a new painted project. Kinetic uses the equivalent `kinetic-reel/scripts/new_project.mjs`. `--skip-install` copies files without npm installation. The scaffold refuses nonempty directories.

Use `CHROME_PATH` / `FFMPEG_PATH` or `--chrome=...` / `--ffmpeg=...` for custom executables. Render from the generated project directory. Use the same FPS for frames and encoding: painted defaults to 24; kinetic to 30. `--no-audio` is for silent previews; final soundtrack input must exist.

- [Painted skill](skills/painted-animation/SKILL.md) / [Codex runtime notes](skills/painted-animation/references/codex.md)
- [Kinetic skill](skills/kinetic-reel/SKILL.md) / [Codex runtime notes](skills/kinetic-reel/references/codex.md)

## Validation

The adaptation replaces Bash/rsync/sed scaffolds with Node, adds `agents/openai.yaml`, supports spaces/Chinese paths, and propagates encoder failures. Each skill works independently of the repository root and the other skill.

```text
node --test tests/codex.test.mjs
```

See [VALIDATION.md](VALIDATION.md) for actual results and limitations. Windows is the tested platform; macOS/Linux discovery is implemented but not certified by Windows results. Original Claude plugin metadata is retained; Codex uses the installer above, not `/plugin` commands.

## Attribution and license

MIT. Original skills and examples: [tuzhechen2005](https://github.com/tuzhechen2005/opus-video-skills). Painted engine and renderer foundation: [John Heibel's ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase), informed by [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo).

Upstream copyright notices remain in [LICENSE](LICENSE) and the template license. Each installed skill includes its license; generated projects retain applicable notices. Libraries and fonts retain their own licenses. This is a community adaptation, not an official OpenAI product.
