import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', '.next', 'vendor']);
const fallbackIgnoredFiles = new Set(['.env', '.env.local', '.env.development', '.env.production']);
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['Stripe secret key', /\bsk_(?:live|test)_[0-9A-Za-z]{20,}\b/],
  ['PostgreSQL connection URL', /\bpostgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@[^\s/]+/i],
];

function trackedPaths() {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'buffer', windowsHide: true });
  if (result.status !== 0 || !result.stdout?.length) return null;
  return result.stdout.toString('utf8').split('\0').filter(Boolean);
}

async function fallbackPaths(directory = root, prefix = '') {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) found.push(...await fallbackPaths(path.join(directory, entry.name), relative));
    } else if (entry.isFile() && !fallbackIgnoredFiles.has(entry.name)
      && !(entry.name.startsWith('.env') && entry.name !== '.env.example')) found.push(relative);
  }
  return found;
}

const paths = trackedPaths() || await fallbackPaths();
const findings = [];
for (const relative of paths) {
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) continue;
  let contents;
  try { contents = await readFile(absolute); } catch { continue; }
  if (contents.includes(0)) continue;
  const lines = contents.toString('utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const [label, pattern] of patterns) if (pattern.test(line)) findings.push(`${relative}:${index + 1}: possible ${label}`);
  });
}

if (findings.length) {
  process.stderr.write(`Secret scan found ${findings.length} possible credential(s):\n${findings.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Secret scan passed (${paths.length} files checked).\n`);
}
