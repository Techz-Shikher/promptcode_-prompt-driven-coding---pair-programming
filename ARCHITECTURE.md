# Architecture

## Current runtime

PromptCode is a modular single-process application. A React 19/Vite client uses same-origin `/api` calls to an Express 4 server. During development Express mounts Vite middleware; in production it serves `dist/`. Gemini API calls are made only from `server.ts`, so the Gemini key stays on the server.

```text
React SPA
  ├─ App.tsx: selected problem, editor, prompt and feature state
  ├─ components/: feature panels and modals
  ├─ data/: bundled catalog, lessons and checklist
  └─ utils/: deterministic prompt rubric/diagnostics, response validators, version history and browser storage helpers
       │ JSON over same origin
Express
  ├─ 1 MB JSON body limit and configurable process-local API rate limit
  ├─ Gemini-backed task endpoints with structured response checks
  ├─ optional Judge0 CE-compatible batch execution adapter with fixed resource caps
  ├─ PostgreSQL-backed opaque sessions, account workflows, owner-scoped project/prompt APIs, and startup migrations
  ├─ matched prompt comparison and blinded AI evaluation with usage metadata only when returned
  └─ Vite middleware (development) / dist static serving (production)
```

## Persistence and external services

- AI providers: server-side Gemini, OpenAI, Anthropic, and DeepSeek adapters. Model availability is derived from configured server secrets; requests use the selected model and return provider-reported usage, model version, and measured latency where available.
- Prompt quality meter: deterministic local heuristic; methodology is disclosed in its UI.
- Browser storage: custom problems, profile demo data, preferences, checklist state, progress, and per-problem prompt versions use `localStorage`.
- PostgreSQL-backed accounts, opaque sessions, project and prompt APIs are implemented but remain unavailable until `DATABASE_URL` is configured. No configured execution host, WebSocket room, or external community service exists. When configured, code is sent from the server to a Judge0 CE-compatible isolated worker; execution is unavailable by default.

## Operational limits

The API request limiter is in-memory and process-local. It is a basic guard for the current single-process app, not a substitute for a shared production quota or edge rate limiter. Express binds to `0.0.0.0` and reads `PORT` (default 3000). The Judge0 adapter limits each run to ten cases, caps CPU at 2 seconds, wall time at 5 seconds, memory at 128 MiB, and output at 16 KB per stream; the provider host and its credentials are deployment configuration. Structured observability and production deployment topology remain future work.

See [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for feature status and [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) for planned phases.
