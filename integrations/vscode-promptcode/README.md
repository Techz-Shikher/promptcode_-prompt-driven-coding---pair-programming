# PromptCode for VS Code

This local extension adds three commands:

- **PromptCode: Open PromptCode** opens the configured PromptCode web app. Set `promptcode.url` in VS Code settings to change the address; the default is `http://localhost:3000`.
- **PromptCode: Draft Prompt from Selection** asks what you want to do with the selected code and creates an untitled Markdown draft in VS Code. It does not transmit the selection. Review and copy the draft into PromptCode yourself.
- **PromptCode: Insert DSA Prompt Template** inserts a reusable seven-part prompt at the cursor or over the selected text.

The extension has no network client, token storage, telemetry, or repository-wide file access. Its only external action is opening the URL you configured when you explicitly run the open command.

## Try it locally

1. Open this folder in VS Code.
2. Press `F5` to launch an Extension Development Host.
3. In that window, run one of the three commands from the Command Palette.

## Package a VSIX

Install the VS Code packaging tool if needed, then run `vsce package` from this folder. Install the resulting `.vsix` through **Extensions → Install from VSIX…**. Marketplace publishing requires a publisher account and is intentionally not configured here.
