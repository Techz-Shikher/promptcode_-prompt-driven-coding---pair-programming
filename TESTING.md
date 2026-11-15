# Testing

## Automated checks

- `npm test` runs Node's built-in test runner over `test/*.test.mjs`.
- `npm run lint` runs TypeScript with `noEmit`.
- `npm run build` builds the Vite client and bundles the Express entry point.

Current unit coverage verifies chat-history and field validation, prompt-quality scoring determinism/weights/gap detection, local prompt diagnostics, prompt-version storage/deduplication/diffs, structured AI response validation, Judge0 result/limit mapping, benchmark schemas/usage metadata, password hashing/session-token handling, and pagination cursors. There are no browser or live provider tests. Database migration and account integration require a PostgreSQL `DATABASE_URL`, which is not configured in this workspace.

## Current verification

Sixteen unit tests pass, `npm run lint` passes, and `npm run build` produces the client and server artifacts. The build reports a main JavaScript chunk larger than 500 kB; code splitting is future performance work. API smoke checks verify `/api/health`, malformed request rejection, and explicit unavailable responses for unconfigured Gemini, Judge0, and PostgreSQL providers. Prompt benchmark and account flows require their respective provider credentials for live integration checks.

The first dependency install exposed a peer mismatch: Vite 8 requires a newer esbuild than the original `^0.25.0` declaration. The project declaration and both lockfiles were aligned to esbuild 0.28.2. npm reported zero known vulnerabilities in the installed dependency tree.
