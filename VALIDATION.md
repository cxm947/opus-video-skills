# Codex adaptation validation

Tested on 2026-10-20, Windows, Node.js 24.18.0 / npm 11.16.0, Chrome 154.0.8037.99 and FFmpeg 7.1.
Upstream baseline: `59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1`.

## Automated checks

`node --test tests/codex.test.mjs`: 7/7 passed.

- Both skills install and scaffold independently from a copied skill directory, outside the repository.
- Paths with Chinese characters, spaces and `=` work.
- Installer checks both destinations before writing either skill.
- Existing project files are preserved when scaffolding is refused.
- `--keep-demo` retains the painted reference scene; default scaffolding unhooks it.
- Invalid tool overrides and failed child processes return errors.
- Standalone helper copies remain consistent.

Both skills passed Codex `skill-creator/scripts/quick_validate.py`; the changed renderers passed `node --check`, and `git diff --check` was clean.

## Real rendering checks

Created two independent projects with `new_project.mjs`, using normal npm dependency installation and automatic Chrome/FFmpeg discovery. Project paths contained spaces and Chinese characters.

| Output | Resolution | FPS | Decoded frames | Video duration | Audio |
|---|---|---:|---:|---:|---|
| Painted demo excerpt (`--range=1:2`) | 1920×1080 | 24 | 24 | 1.00 s | Deliberately silent |
| Kinetic demo excerpt (`--range=0:2`) | 1920×1080 | 30 | 60 | 2.00 s | AAC, synthesized score |
| Kinetic two-worker frames → encode | 1920×1080 | 30 | 6 | 0.20 s | Silent |
| Painted `PROJECT.audio` auto-selection | 1920×1080 | 24 | 6 | 0.25 s | AAC, supplied test score |

All four MP4 files decoded successfully. Both audio tracks decoded and contained non-silent samples. Contact sheets for the painted demo and six kinetic scenes were visually inspected. Audio was checked programmatically, not auditioned.

Additional checks:

- `--encode` succeeded with `CHROME_PATH` deliberately pointing to a nonexistent executable: encoding an existing frame sequence needs no browser.
- An unsupported output container made FFmpeg fail; the renderer exited nonzero, closed its browser, and did not print a success message.
- A missing requested soundtrack produced a nonzero exit without silently dropping audio.
- Beat analysis read the synthesized score through `FFMPEG_PATH` and estimated 120.20 BPM against the template's 120 BPM timeline.

Example reproduction commands (run from generated projects):

```text
node render.mjs --sheet=0.5,1,2 --w=480 --out=out/check/smoke.jpg
node render.mjs --clip --range=1:2 --no-audio --out=out/check/preview.mp4
```

For kinetic:

```text
node music/score.mjs
node render.mjs --clip --range=0:2 --audio=music/score.wav --out=out/check/preview-audio.mp4
node render.mjs --frames --range=0:0.2 --workers=2 --frames-dir=out/test-frames
node render.mjs --encode --frames-dir=out/test-frames --out=out/encoded/check.mp4
```

## Limits

These are template/runtime smoke tests, not a finished custom MV or a reproduction of the referenced 《日不落》 video. macOS/Linux paths are implemented but were not exercised on those operating systems. Edge and software WebGL were not used in these render tests. Demos load Google Fonts over the network; offline delivery requires local fonts. Long renders still require visual review and manual invalidation of stale frame caches after edits.
