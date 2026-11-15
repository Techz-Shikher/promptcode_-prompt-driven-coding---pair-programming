import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const extensionRoot = path.join(root, 'integrations', 'vscode-promptcode');
const manifest = JSON.parse(await readFile(path.join(extensionRoot, 'package.json'), 'utf8'));
const source = await readFile(path.join(extensionRoot, manifest.main), 'utf8');
if (!manifest.engines?.vscode || !Array.isArray(manifest.contributes?.commands) || manifest.contributes.commands.length === 0) {
  throw new Error('VS Code extension manifest is missing its engine or commands.');
}
for (const command of manifest.contributes.commands) {
  if (!source.includes(`registerCommand('${command.command}'`)) throw new Error(`Extension command is not implemented: ${command.command}`);
}
if (/\b(?:fetch|XMLHttpRequest)\s*\(/.test(source)) throw new Error('The local extension must not upload editor contents.');
const syntax = spawnSync(process.execPath, ['--check', path.join(extensionRoot, manifest.main)], { stdio: 'inherit', windowsHide: true });
if (syntax.status !== 0) process.exitCode = syntax.status || 1;
else process.stdout.write(`VS Code extension check passed (${manifest.contributes.commands.length} commands).\n`);
