# PromptCode

PromptCode is a React and Express learning workspace for prompt-driven coding. It includes a problem catalog, code editor, prompt-quality feedback, configurable multi-provider AI assistance, and study tools.

## Requirements

- Node.js 22.12 or newer
- At least one supported AI provider API key for AI-backed features (optional for browsing)
- A Judge0 CE-compatible service URL and optional auth token for isolated code execution
- PostgreSQL 14 or newer and a server-side `DATABASE_URL` for accounts and project persistence

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set one or more AI provider keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `DEEPSEEK_API_KEY`), `DATABASE_URL` for accounts and persistence, and configure `JUDGE0_API_URL` plus optional `JUDGE0_AUTH_TOKEN` for code execution.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

AI provider and database credentials are read by the server and must not be added to frontend environment variables. Database migrations run on startup when `DATABASE_URL` is configured. Account endpoints return an explicit unavailable error without PostgreSQL.

## Current capability boundaries

- Prompt quality feedback is a deterministic text-signal estimate. It shows category scores, suggestions, weights, and a methodology note; it does not measure answer correctness.
- Prompt debugging combines local rule checks with optional selected-provider diagnostics. Optimization returns explained changes; saved prompt versions are stored per problem in this browser.
- Prompt execution, code review, prompt optimization, problem import, chat, and dedicated code explanation/debugging/test-case suggestions route through the selected configured provider. Coding assistant feedback is validated structured analysis and is not compiled or executed.
- Test cases run only when a Judge0 CE-compatible isolated execution host is configured. The runner accepts complete programs using standard input/output; the bundled starter snippets are function templates and need a runnable entry point. It enforces 2-second CPU, 5-second wall time, 128 MiB memory, 1 MiB file, 10 cases per request, and bounded source/input/output sizes.
- Accounts use PostgreSQL-backed users and sessions. Passwords use scrypt hashes; session tokens are opaque, stored only as SHA-256 hashes in the database, and set in HttpOnly, SameSite=Strict cookies. Projects and prompts use owner-scoped, cursor-paginated APIs. Account/session features remain unavailable until PostgreSQL is configured.
- Prompt comparison runs two matched generations and a blinded evaluator using the selected model and a disclosed rubric. Results are AI judgments, not execution results, proofs, or statistically repeated measurements; each comparison makes three provider requests.
- The SQL assistant generates and explains bounded, single-statement SELECT/WITH SQL for PostgreSQL, MySQL, or SQLite and creates/explains validated OpenAPI JSON. It rejects common write patterns; generated SQL is never executed by PromptCode.
- Development workflows save resumable editor state and prompt/test/review run outcomes. Guest workflows use this browser's `localStorage`; signed-in workflows sync through owner-scoped PostgreSQL APIs when the database is configured.
- Custom problems, preferences, problem progress, and prompt version history still use this browser's `localStorage`; they are not synchronized to accounts.
- Real-time collaboration, lesson progress, analytics, leaderboard opt-in, daily challenges, and community prompts are available to signed-in users when PostgreSQL is configured. Community prompts are public; leaderboard participation is private until a user opts in. External integrations are not yet backed production services.

See [PROJECT_AUDIT.md](PROJECT_AUDIT.md), [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for details.

## Developer integrations

- The VS Code extension is in `integrations/vscode-promptcode`. It opens the local app, inserts a prompt template, and creates a Markdown prompt draft from text you select. It does not send source code to a server. See its README for local development and VSIX installation.
- GitHub Actions are defined in `.github/workflows/quality.yml`. They run type checks, tests, builds, dependency auditing, and a common-secret scan with a read-only repository token. Dependabot checks npm packages and workflow actions weekly.
- The Actions workflow runs after these files are pushed to a GitHub repository. This local workspace has no connected GitHub remote, so no remote workflow run or Marketplace publication was performed.

## Optional research bench

The research panel runs a local, seeded 0/1 knapsack comparison between exact dynamic programming and a greedy heuristic. It reports the generated-input fingerprint, result gap, and warmed repeated median timings. It does not run Qiskit or quantum hardware and makes no quantum speedup claims. Results are microbenchmarks and vary by browser and device.

## Commands

- `npm run dev` — local development server
- `npm run lint` — TypeScript type check
- `npm test` — unit tests
- `npm run build` — production client and server build
- `npm start` — run the built server

## Configuration

See `.env.example`. Provider keys are optional for local browsing; at least one is required for real AI requests. `AI_DEFAULT_MODEL` selects the server default. The current server listens on port 3000; `PORT` can override it.
