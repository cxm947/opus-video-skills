#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv.slice(2);
if (input.includes('--help')) {
  console.log('node scripts/install-codex.mjs [--dest <skills-directory>]\nInstalls both skills; refuses to overwrite existing paths.');
  process.exit(0);
}
if (input.length && (input.length !== 2 || input[0] !== '--dest' || !input[1])) throw new Error('Expected --dest <skills-directory>.');
const dest = resolve(input[1] || join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills'));
const names = ['painted-animation', 'kinetic-reel'];
// Check every destination before copying either skill; include dangling symlinks.
for (const name of names) {
  const path = join(dest, name);
  let occupied = false;
  try { lstatSync(path); occupied = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (occupied) throw new Error(`Already exists; nothing overwritten: ${path}`);
  if (!existsSync(join(root, 'skills', name, 'SKILL.md'))) throw new Error(`Missing source skill: ${name}`);
}
mkdirSync(dest, { recursive: true });
for (const name of names) {
  cpSync(join(root, 'skills', name), join(dest, name), {
    recursive: true, errorOnExist: true, force: false,
    filter: p => !['node_modules', 'out', '__pycache__', '.DS_Store'].includes(basename(p)),
  });
  console.log(`Installed ${name}: ${join(dest, name)}`);
}
console.log('Available on the next Codex turn. Use $painted-animation or $kinetic-reel.');
