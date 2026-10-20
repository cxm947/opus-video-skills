import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs, findChrome, findFFmpeg, run } from '../skills/painted-animation/template/toolchain.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'codex-video-test-'));
// Retain tiny test artifacts for inspection; no recursive deletion is necessary.
const node = (args, cwd = root) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8', windowsHide: true });

test('install and scaffold both skills outside the repository, with Chinese and spaces', () => {
  const dest = join(scratch, '安装 skills');
  const installed = node(['scripts/install-codex.mjs', '--dest', dest]);
  assert.equal(installed.status, 0, installed.stderr);
  for (const name of ['painted-animation', 'kinetic-reel']) {
    const skill = join(dest, name), project = join(scratch, `${name} 项目 = demo`);
    assert.ok(existsSync(join(skill, 'agents/openai.yaml')));
    assert.match(readFileSync(join(skill, 'LICENSE'), 'utf8'), /Copyright.*tuzhechen2005/);
    const created = node([join(skill, 'scripts/new_project.mjs'), project, '--skip-install'], scratch);
    assert.equal(created.status, 0, created.stderr);
    assert.ok(existsSync(join(project, 'toolchain.mjs')));
    assert.ok(existsSync(join(project, 'SKILL-LICENSE')));
    const parsed = node(['--check', join(project, 'render.mjs')], scratch);
    assert.equal(parsed.status, 0, parsed.stderr);
    if (name === 'painted-animation') {
      assert.match(readFileSync(join(project, 'studio.html'), 'utf8'), /<!-- Example only: <script src="src\/scenes\/demo.js">/);
    }
    writeFileSync(join(project, 'user-file.txt'), 'preserve this');
    const repeated = node([join(skill, 'scripts/new_project.mjs'), project, '--skip-install'], scratch);
    assert.notEqual(repeated.status, 0);
    assert.equal(readFileSync(join(project, 'user-file.txt'), 'utf8'), 'preserve this');
  }
});

test('installer preflights every destination before writing either skill', () => {
  const dest = join(scratch, 'occupied');
  mkdirSync(join(dest, 'kinetic-reel'), { recursive: true });
  writeFileSync(join(dest, 'kinetic-reel/keep.txt'), 'mine');
  const result = node(['scripts/install-codex.mjs', '--dest', dest]);
  assert.notEqual(result.status, 0);
  assert.equal(existsSync(join(dest, 'painted-animation')), false);
  assert.equal(readFileSync(join(dest, 'kinetic-reel/keep.txt'), 'utf8'), 'mine');
});

test('keep-demo preserves the reference scene', () => {
  const project = join(scratch, 'keep-demo');
  const result = node(['skills/painted-animation/scripts/new_project.mjs', project, '--skip-install', '--keep-demo']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(join(project, 'studio.html'), 'utf8'), /^<script src="src\/scenes\/demo.js"><\/script>$/m);
});

test('CLI preserves equals signs in media and output filenames', () => {
  assert.deepEqual(parseArgs(['--clip', '--out=C:/clips/片 段=a.mp4', '--audio=song=demo.wav']),
    { clip: true, out: 'C:/clips/片 段=a.mp4', audio: 'song=demo.wav' });
});

test('explicit invalid executable overrides fail instead of silently using another tool', () => {
  const absent = join(scratch, 'absent.exe');
  assert.throws(() => findChrome(absent), /does not exist/);
  assert.throws(() => findFFmpeg(absent), /does not exist/);
});

test('child process errors and nonzero exit codes propagate', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'process.exit(7)']), /Process failed \(7\)/);
  await assert.rejects(run(join(scratch, 'nonexistent-executable'), []), /ENOENT/);
  await run(process.execPath, ['-e', 'process.exit(0)']);
});

test('standalone helper copies are consistent', () => {
  for (const path of ['template/toolchain.mjs', 'scripts/new_project.mjs']) {
    assert.equal(readFileSync(join(root, 'skills/painted-animation', path), 'utf8'),
      readFileSync(join(root, 'skills/kinetic-reel', path), 'utf8'));
  }
});
