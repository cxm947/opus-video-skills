#!/usr/bin/env node
// Cross-platform scaffold; kept identical in both standalone skills.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, delimiter, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, findFFmpeg, run } from '../template/toolchain.mjs';

const input = process.argv.slice(2);
if (input.includes('--help') || input.length === 0) {
  console.log('node new_project.mjs <new-project-dir> [--keep-demo] [--skip-install]');
  process.exit(input.length === 0 ? 1 : 0);
}
const [targetArg, ...flags] = input;
if (flags.some(f => !['--keep-demo', '--skip-install'].includes(f))) throw new Error('Unknown option.');
const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(targetArg);
if (existsSync(target) && readdirSync(target).length) throw new Error(`Target must be empty; nothing overwritten: ${target}`);
mkdirSync(target, { recursive: true });
cpSync(join(skill, 'template'), target, {
  recursive: true, filter: p => !['node_modules', 'out', '.DS_Store'].includes(basename(p)),
});
for (const p of ['assets', 'out/check']) mkdirSync(join(target, p), { recursive: true });
const studio = join(target, 'studio.html');
if (existsSync(studio) && !flags.includes('--keep-demo')) {
  writeFileSync(studio, readFileSync(studio, 'utf8').replace(
    '<script src="src/scenes/demo.js"></script>',
    '<!-- Example only: <script src="src/scenes/demo.js"></script> -->'));
}
// Include the fork's license as well as any template-specific upstream license.
if (existsSync(join(skill, 'LICENSE'))) cpSync(join(skill, 'LICENSE'), join(target, 'SKILL-LICENSE'));

if (!flags.includes('--skip-install')) {
  // Invoke npm's JS entry directly: Windows cannot spawn npm.cmd without a shell.
  const bins = [dirname(process.execPath), ...(process.env.PATH || '').split(delimiter).filter(Boolean)];
  const candidates = [
    process.env.npm_execpath,
    ...bins.flatMap(p => [
      join(p, 'node_modules/npm/bin/npm-cli.js'),
      join(p, '../lib/node_modules/npm/bin/npm-cli.js'),
      join(p, '../share/nodejs/npm/bin/npm-cli.js'),
    ]),
  ];
  const npmCli = candidates.find(p => p && existsSync(p));
  const args = [existsSync(join(target, 'package-lock.json')) ? 'ci' : 'install', '--no-audit', '--no-fund'];
  if (npmCli) await run(process.execPath, [npmCli, ...args], { cwd: target });
  else if (process.platform !== 'win32') await run('npm', args, { cwd: target });
  else throw new Error(`Cannot locate npm-cli.js. Install Node.js with npm, then run npm install in ${target}`);
}
console.log(`Project created: ${target}`);
for (const [name, find] of [['Browser', findChrome], ['FFmpeg', findFFmpeg]]) {
  try { console.log(`${name}: ${find()}`); }
  catch (error) { console.warn(`MISSING ${name}: ${error.message}`); }
}
console.log(flags.includes('--skip-install') ? 'Dependencies were not installed (--skip-install).' : 'Dependencies installed.');
