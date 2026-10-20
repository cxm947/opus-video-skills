# Video Skills for Codex

[English](README.md)

基于 [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) 的 Codex 适配版，上游基线为 `59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1`。保留原版动画引擎、案例和制作方法，补齐 Codex 技能识别、工具调用与 Windows 初始化。

| 技能 | 用途 |
|---|---|
| `$painted-animation` | 手绘水彩与墨线动画、Clawd 小短片、音乐 MV、同步歌词 |
| `$kinetic-reel` | 动态排版、界面动效、作品集、产品短片、合成配乐 |

Codex 写场景代码，Chromium 渲染画面，FFmpeg 输出 MP4。无需 Claude Code、Claude 订阅或生图／生视频 API。已有歌曲由用户提供；动态排版模板可以合成器乐配乐。Clawd 角色保留，也可以换角色。

## 安装

准备 Node.js 22.12+（含 npm），执行：

```text
git clone https://github.com/cxm947/opus-video-skills.git
cd opus-video-skills
node scripts/install-codex.mjs
```

默认安装到 `$CODEX_HOME/skills`，未设置时为 `~/.codex/skills`；Windows 通常是 `C:/Users/你的用户名/.codex/skills`。安装器拒绝覆盖已有目录。也可以安装到项目内：

```text
node scripts/install-codex.mjs --dest "D:/你的项目/.agents/skills"
```

下一轮 Codex 对话即可调用，也支持自动选择：

```text
用 $painted-animation 做一段 10 秒的 Clawd 手绘动画。
用 $painted-animation，根据我提供的歌曲和 LRC 做一段歌词 MV。
用 $kinetic-reel 做一段 15 秒的中文产品介绍，配上卡点文字和界面动效。
```

更新时拉取此 fork 的最新代码，把已有技能目录移动到备份位置，再运行安装器。安装器不提供强制覆盖模式。

## 本地依赖与预览

- Node.js 22.12+ 和 npm。
- Chrome、Chromium 或 Edge，支持常见安装位置与 Playwright 缓存。
- FFmpeg：位于 PATH、通过 `FFMPEG_PATH` 指定，或放入 `$CODEX_HOME/bin`（默认 `~/.codex/bin`）。
- 仅节拍分析需要 Python 3 和 numpy。
- npm 安装及示例 Google Fonts 需要联网；离线制作时使用本地授权字体。

替换下面的示例路径，PowerShell 下直接运行：

```powershell
node "C:/Users/你/.codex/skills/painted-animation/scripts/new_project.mjs" "D:/videos/测试短片" --keep-demo
Set-Location -LiteralPath "D:/videos/测试短片"
node render.mjs --sheet=0.5,1,1.5 --out=out/check/sheet.jpg
node render.mjs --clip --range=0:1 --no-audio --out=out/check/preview.mp4
```

正式新建手绘项目去掉 `--keep-demo`；动态排版使用 `kinetic-reel/scripts/new_project.mjs`。`--skip-install` 只复制模板、不安装依赖。脚手架不依赖 Bash、rsync 或 sed，并拒绝写入非空目录。

```powershell
$env:CHROME_PATH = "C:/path/to/chrome.exe"
$env:FFMPEG_PATH = "C:/path/to/ffmpeg.exe"
```

渲染器也接受 `--chrome=...`、`--ffmpeg=...`。手绘默认 24 FPS，动态排版默认 30 FPS；分帧与编码必须使用同一帧率。`--no-audio` 用于静音预览，正式成片需提供真实存在的音频。

- [手绘动画 Skill](skills/painted-animation/SKILL.md) / [Codex 运行说明](skills/painted-animation/references/codex.md)
- [动态排版 Skill](skills/kinetic-reel/SKILL.md) / [Codex 运行说明](skills/kinetic-reel/references/codex.md)

## 验证与兼容性

增加 Codex `agents/openai.yaml`、独立技能许可与跨平台初始化；支持中文和空格路径；修复编码失败仍报告成功的问题。两个技能可独立安装，不依赖仓库外的公共脚本。

```text
node --test tests/codex.test.mjs
```

实际测试结果与限制见 [VALIDATION.md](VALIDATION.md)。Windows 为本次实测平台；macOS/Linux 路径发现已实现，但不据此宣称实测。原版 Claude 插件元数据保留，Codex 安装不使用 `/plugin` 命令。

## 来源与许可

MIT。原技能与案例来自 [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills)；手绘引擎与渲染器基础来自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)，方法参考 [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)。

保留上游 [LICENSE](LICENSE) 与模板版权声明；独立安装的技能附带许可，生成项目保留适用的声明。依赖库与字体遵循各自许可。这是社区适配版，非 OpenAI 官方产品。
