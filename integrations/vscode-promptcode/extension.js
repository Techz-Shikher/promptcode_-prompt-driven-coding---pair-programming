'use strict';

const vscode = require('vscode');

const DSA_TEMPLATE = [
  'Solve the following problem. Be precise and verify the result.',
  '',
  '1. Restate the requirements and input/output contract.',
  '2. Name the algorithmic technique and explain why it fits.',
  '3. State the key observations and invariant.',
  '4. Describe the algorithm step by step before writing code.',
  '5. Give a concise correctness argument.',
  '6. Derive time and auxiliary-space complexity.',
  '7. Cover edge cases, pitfalls, and tests.',
].join('\n');

function promptCodeUrl() {
  const configured = vscode.workspace.getConfiguration('promptcode').get('url', 'http://localhost:3000');
  let parsed;
  try { parsed = new URL(configured); } catch { throw new Error('Set PromptCode URL to a valid http:// or https:// address.'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('PromptCode URL must use http or https and cannot contain credentials.');
  }
  return parsed.toString();
}

function codeFence(text) {
  const runs = text.match(/`+/g) || [];
  return '`'.repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('promptcode.open', async () => {
      try {
        const opened = await vscode.env.openExternal(vscode.Uri.parse(promptCodeUrl()));
        if (!opened) vscode.window.showWarningMessage('VS Code could not open the configured PromptCode address.');
      } catch (error) { vscode.window.showErrorMessage(error.message); }
    }),
    vscode.commands.registerCommand('promptcode.insertDsaTemplate', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showInformationMessage('Open an editor before inserting the PromptCode template.');
      await editor.edit((edit) => edit.replace(editor.selection, DSA_TEMPLATE));
    }),
    vscode.commands.registerCommand('promptcode.draftFromSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) return vscode.window.showInformationMessage('Select code first. The extension only uses the selection you explicitly choose.');
      const task = await vscode.window.showInputBox({ prompt: 'What should PromptCode help you do with this selection?', placeHolder: 'Explain, debug, or improve this code' });
      if (!task?.trim()) return;
      const selection = editor.document.getText(editor.selection);
      const fence = codeFence(selection);
      const language = editor.document.languageId.replace(/[^a-zA-Z0-9_+-]/g, '') || 'text';
      const fileName = editor.document.uri.scheme === 'file' ? vscode.workspace.asRelativePath(editor.document.uri, false) : 'untitled';
      const draft = `# PromptCode draft\n\n${task.trim()}\n\nUse the selected code as context. Preserve unrelated behavior, identify assumptions, and include a focused verification plan.\n\nFile: \`${fileName}\`\n\n${fence}${language}\n${selection}\n${fence}\n`;
      const document = await vscode.workspace.openTextDocument({ language: 'markdown', content: draft });
      await vscode.window.showTextDocument(document, { preview: false });
      const choice = await vscode.window.showInformationMessage('Prompt draft created locally. Review it, then copy it into PromptCode when ready.', 'Open PromptCode');
      if (choice === 'Open PromptCode') await vscode.commands.executeCommand('promptcode.open');
    }),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
