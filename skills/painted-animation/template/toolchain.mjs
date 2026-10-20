// Kept identical in both templates so each installed skill is self-contained.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

const isFile = p => {
  try { return Boolean(p) && statSync(p).isFile(); } catch { return false; }
};

export function parseArgs(argv) {
  return Object.fromEntries(argv.map(arg => {
    const text = arg.replace(/^--/, ''), index = text.indexOf('=');
    return index < 0 ? [text, true] : [text.slice(0, index), text.slice(index + 1)];
  }));
}

export function findChrome(explicit) {
  const override = explicit || process.env.CHROME_PATH;
  if (override) {
    if (!isFile(override)) throw new Error(`Browser does not exist: ${override}`);
    return resolve(override);
  }
  const win = process.platform === 'win32', mac = process.platform === 'darwin';
  const candidates = win ? [
    ...[process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]
      .filter(Boolean).flatMap(base => [
        join(base, 'Google/Chrome/Application/chrome.exe'),
        join(base, 'Microsoft/Edge/Application/msedge.exe'),
      ]),
  ] : mac ? [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ] : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || (win
    ? join(process.env.LOCALAPPDATA || homedir(), 'ms-playwright')
    : mac ? join(homedir(), 'Library/Caches/ms-playwright') : join(homedir(), '.cache/ms-playwright'));
  if (existsSync(cache)) {
    const builds = readdirSync(cache).filter(n => /^chromium-\d+$/.test(n))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const build of builds) {
      const variants = win ? ['chrome-win/chrome.exe', 'chrome-win64/chrome.exe']
        : mac ? ['chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome']
        : ['chrome-linux/chrome', 'chrome-linux64/chrome'];
      candidates.push(...variants.map(p => join(cache, build, p)));
    }
  }
  const found = candidates.find(isFile);
  if (!found) throw new Error('Chrome/Edge not found. Set CHROME_PATH or pass --chrome=<absolute path>.');
  return found;
}

export function findFFmpeg(explicit) {
  const override = explicit || process.env.FFMPEG_PATH;
  if (override) {
    if (!isFile(override)) throw new Error(`FFmpeg does not exist: ${override}`);
    return resolve(override);
  }
  const name = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const candidates = (process.env.PATH || '').split(delimiter).filter(Boolean)
    .map(p => join(p.replace(/^"|"$/g, ''), name));
  candidates.push(join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'bin', name));
  const found = candidates.find(isFile);
  if (!found) throw new Error('FFmpeg not found. Install it on PATH or set FFMPEG_PATH to its executable.');
  return found;
}

export function completion(child) {
  const done = new Promise((ok, fail) => {
    child.once('error', fail);
    child.once('close', (code, signal) => code === 0 ? ok()
      : fail(new Error(`Process failed (${signal || code}): ${child.spawnfile}`)));
  });
  // The producer may still be rendering a frame when the encoder exits.
  done.catch(() => {});
  return done;
}

export async function run(command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'inherit', windowsHide: true, ...options });
  await completion(child);
}

export async function writeFrame(child, buffer) {
  if (child.exitCode !== null || child.stdin.destroyed) throw new Error('FFmpeg stopped before all frames were written.');
  await new Promise((ok, fail) => child.stdin.write(buffer, error => error ? fail(error) : ok()));
}
