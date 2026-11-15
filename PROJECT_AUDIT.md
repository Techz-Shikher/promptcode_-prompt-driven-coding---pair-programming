# PromptCode Repository Audit

**Audit date:** 2026-11-12  
**Scope:** The opened local workspace at the repository root. No project ZIP is present in this workspace; the source files listed below were read directly.

The architecture, feature inventory, and risks below describe the repository as first inspected. The follow-up section records changes made after that baseline audit.

## Architecture

PromptCode is a single-page React application served by an Express process. The Express process starts Vite in development and serves the built client in production. Frontend modules call same-origin JSON endpoints under `/api`; the backend calls Google Gemini directly through `@google/genai` when `GEMINI_API_KEY` is configured. Without a key, several endpoints return hardcoded fallback content.

```text
Browser (React + TypeScript)
  ├─ App.tsx: application state, problem selection, prompt and test actions
  ├─ components/: editor, problem panels, and feature modals
  ├─ data/: bundled problems, lessons, and checklist entries
  └─ utils/: browser localStorage persistence and formatting
       │ same-origin fetch('/api/...')
       ▼
Express server (server.ts)
  ├─ Gemini-backed prompt execution, review, optimization, import, and chat
  ├─ heuristic prompt comparison
  └─ hardcoded fallback responses
```

## Technology and configuration

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion, Lucide.
- **Backend:** Express 4, TypeScript via `tsx` in development, bundled with esbuild for production.
- **AI:** Google Gemini SDK, one hardcoded model ID (`gemini-3.8-flash`) and server-side `GEMINI_API_KEY`.
- **Persistence:** browser `localStorage` for custom problems, user profile, preferences, checklist and problem progress. No database or server-side user state.
- **Execution:** no code execution service. The UI's current test action fabricates pass/fail and resource figures.
- **Scripts:** `dev`, `build`, `start`, `preview`, `clean`, and `lint` (`tsc --noEmit`). There is no test script or test suite in the repository.
- **Environment:** `.env.example` documents Gemini and `APP_URL`; the server currently uses a fixed port 3000 and does not read `APP_URL`.
- **Repository state:** the workspace root is not a Git repository, so a tracked-file diff or prior change history could not be inspected.

## Feature inventory

Status describes actual behavior in the inspected code, not the presence of a screen or button.

| Feature | Status | Evidence / notes |
|---|---|---|
| Problem catalog, categories, editor, language starter code | DONE | Bundled problem data, category selection, editor, reset and language switching are implemented. |
| Gemini prompt execution and code review | IN PROGRESS | Server calls Gemini when configured, but does not validate inputs or response schemas; fallback content is presented as normal output. |
| Prompt optimization | IN PROGRESS | Gemini endpoint exists; there is no schema validation, persistence, or reliable no-key distinction. |
| AI problem import | IN PROGRESS | Gemini endpoint plus manual/JSON/pack flows exist; imported structured content is weakly validated. |
| Prompt quality analysis/debugger | PENDING | No systematic category score, ambiguity/contradiction analysis, or validated feedback schema. |
| Prompt comparison | PENDING | `/api/prompt/compare` uses prompt length/substring heuristics; UI also falls back to simulated scores and code. |
| Prompt version history | PENDING | UI shows hardcoded example versions and scores; no persisted version model. |
| Code generation, explanation, debugging | IN PROGRESS | Main prompt endpoint can request these tasks through Gemini, but no dedicated validated contracts; without a key it returns templates. |
| Code execution and test cases | PENDING | Current frontend maps code length to passing cases, echoes expected output, and randomizes runtime/memory. No execution backend exists. |
| SQL/API assistant | PENDING | Feature modal is client-side demonstration content; no corresponding server endpoint. |
| Authentication and authorization | PENDING | Demo account switching and a client-side profile form persist a user object in localStorage; no credentials are verified or protected routes exist. |
| Database and server persistence | PENDING | No database, migrations, ownership checks, or server-side persistence. |
| Multi-provider AI/model routing | PENDING | Gemini is the only provider in `server.ts`; selected model state is not passed into API requests. Other provider labels are simulated. |
| Development workflow/history | PENDING | No server-backed workflow state or run history. |
| Real-time collaboration | DONE | PostgreSQL rooms, invite membership, roles, WebSocket code synchronization, presence, persisted chat, and reconnect snapshots passed a live two-account verification. |
| Learning academy | DONE | Four lesson assessments are server-scored; pass results, attempts, daily challenges, recommendations, and achievements persist per account. |
| Analytics | DONE | Scores, best results, completion, recent assessment history, and learning points derive from PostgreSQL records. |
| Community/leaderboard | DONE | Public prompts support owner deletion, unique votes and reports; reported prompts hide after three distinct reports. Leaderboard display requires explicit opt-in. |
| Developer integrations | DONE | A local VS Code extension and GitHub Actions quality/security workflow are in the repository; no remote GitHub run or Marketplace publishing has been performed. |
| Quantum/research | DONE | Optional browser-local benchmark uses seeded inputs and compares an exact dynamic-programming baseline with a greedy heuristic; no quantum execution or advantage claim is made. |
| Security/infrastructure | IN PROGRESS | Gemini key is server-side and JSON body has a size limit. Authentication, rate limits, robust validation, structured logging, quotas and deployment hardening are absent. |
| Build/type check | IN PROGRESS | `npm run lint` is the configured TypeScript check; verification is to be run during implementation. No CI or automated tests exist. |

## Bugs, risks, and technical debt

1. **False test results:** `src/App.tsx` determines pass status from source length, reports the expected value as actual output, and generates random timing/memory. This teaches users that unexecuted code passed.
2. **False prompt benchmark:** `server.ts` and `PromptCompareModal.tsx` infer quality from prompt length and the phrase “7-section”; the UI also fabricates comparison results on request failure.
3. **Stale prompt submission:** quick-prompt handlers call the execute callback immediately after `setPrompt`, but the callback closes over the old render's state.
4. **Malformed chat request crash:** `/api/chat` indexes `messages` before checking its type and before its `try` block.
5. **No-key AI fallbacks look real:** fallback output is returned as successful JSON without identifying it as a template/demo or returning a service-unavailable status.
6. **Abuse and cost exposure:** AI routes have no authentication, rate limiting, request quotas or per-field limits. JSON bodies may be 10 MB.
7. **Model selection is disconnected:** frontend `activeModel` does not affect server model selection.
8. **Client-controlled identity:** login/profile data is not authentication and localStorage cannot enforce identity or ownership.
9. **No persistence guarantees:** browser storage can be edited, cleared, or fail due to quota; it is the only persistence layer.
10. **Weak runtime validation:** API request bodies, Gemini JSON, and JSON-imported problems are trusted with little validation.
11. **Scope/documentation mismatch:** README is the generic AI Studio starter guide; no product architecture, API contract, security model, test/deploy guide, or migration plan is documented.
12. **Environment mismatch:** server port is hardcoded, `APP_URL` is unused, and there is no production deployment configuration or CI.

## Recommended implementation order

1. Remove deceptive simulations and make unavailable integrations explicit; fix request validation and stale state behavior.
2. Establish shared runtime schemas, error responses, provider abstraction, and a real prompt analyzer/enhancer/debugger.
3. Add structured AI coding workflows and actual prompt version persistence.
4. Integrate an isolated execution provider through a server adapter; never execute user code in Express.
5. Implement genuine prompt comparison with matched model/task settings and transparent rubric metadata.
6. Add PostgreSQL migrations and ownership-aware data models, then real authentication/session management.
7. Connect model selection to provider routing; add measured usage, latency and cost where providers expose it.
8. Replace SQL/API demos, then collaboration, analytics, learning and community surfaces with backed functionality.
9. Add security/infrastructure controls, CI, automated tests, deployment docs and a final verification pass.
10. Keep quantum/research isolated and label any simulator output accurately; make no advantage claims without benchmarks.

## Phase checklist

| Phase | Status | Notes |
|---|---|---|
| 1. Complete repository audit | DONE | This document records the inspected architecture, feature truth, risks and order. |
| 2. Core Prompt Intelligence Engine | DONE | Deterministic local diagnostics, optional Gemini findings, explained optimization changes, and browser-local version history/comparison/restore are implemented. |
| 3. AI Coding Intelligence | IN PROGRESS | Basic Gemini-backed generation/review exists; dedicated explainer/debugger/test generation and validation are absent. |
| 4. Real Code Execution Engine | PENDING | Requires a configured isolated provider; no local arbitrary execution will be added. |
| 5. Prompt-to-outcome evaluation | DONE | Matched Gemini answer generation and blinded five-dimension AI evaluation are implemented; results disclose that they are not statistically repeated or executed. |
| 6. Authentication and database | IN PROGRESS | PostgreSQL migrations, account workflows, workflow/project ownership, pagination, and cleanup were verified live; staged backup restore remains unverified because `pg_dump`/`pg_restore` are unavailable. |
| 7. Multi-LLM architecture | IN PROGRESS | Server adapters for Gemini, OpenAI, Anthropic, and DeepSeek, a configured-model catalog, browser model selection, transient retries, and measured metadata are implemented. Live requests remain unverified until provider keys are configured. |
| 8. AI development workflow | DONE | Local guest snapshots and authenticated owner-scoped PostgreSQL workflow/run history, pagination, and deletion were verified live. |
| 9. SQL and API assistant | IN PROGRESS | AI-backed read-only SQL and validated OpenAPI generation/explanation are implemented; live provider verification is pending. |
| 10. Collaboration | DONE | Authenticated PostgreSQL rooms, roles, code/chat synchronization, presence, and reconnect were verified live. |
| 11. Learning, analytics and community | DONE | Account-backed assessments, adaptive recommendations, privacy controls, anti-abuse limits, shared prompts, and opt-in rankings are implemented and live-checked. |
| 12. Developer integrations | DONE | Local VS Code extension, read-only GitHub Actions checks, dependency updates, and a repository secret scan are implemented; remote activation awaits hosting this workspace. |
| 13. Quantum/research | DONE | Simulated optimizer claims were removed; reproducible classical measurements include a fixed seed, data fingerprint, warmups, repeated timings, medians, and a validated exact baseline. |
| 14. Security and infrastructure | IN PROGRESS | Initial exposure and validation fixes are prioritized; comprehensive controls remain. |

## Audit limitations

This audit reflects files present in the opened workspace on the audit date. There is no ZIP archive in the workspace root. No deployment secrets, external service accounts, provider credentials, database, or execution sandbox were available to inspect. Feature statuses must be revisited as implementation phases are completed.

## Follow-up implementation status — 2026-11-12

After documenting the baseline above, the first remediation slice made these changes:

- Added a transparent deterministic prompt-quality meter with weighted category feedback and tested AI response validators for execution, review, optimization, and problem import.
- Removed fabricated test outcomes, heuristic benchmark scores, sample prompt-version history, default completed-progress values, and canned AI fallback responses.
- Added request shape/size validation, a configurable per-process API rate limit, configurable port, and sanitized JSON error responses.
- Added required-field and maximum-length checks on AI request payloads.
- Marked remaining sample/local-only analytics, profile, collaboration, provider, community, and integration screens clearly in their interface.
- Added repository documentation and sixteen passing unit tests. Type checking and production build pass. Phase 2 added local prompt diagnostics, optional Gemini findings, explained optimization changes, and per-problem browser-local versions with diff/restore. Phase 3 added validated coding assistant flows for explanation, debugging, and test suggestions. Phase 4 added the optional Judge0 CE-compatible adapter with enforced limits and per-case result validation. Phase 5 added matched Gemini runs and blinded AI evaluation with a disclosed rubric. Phase 6 added PostgreSQL migrations, server-managed accounts/sessions, owner-scoped APIs and pagination, and backup/restore guidance. Live PostgreSQL migration and account workflow checks remain unavailable until `DATABASE_URL` is configured; the build retains a large-chunk warning.

Deployment execution host configuration and verification, statistical multi-run benchmarking, staged PostgreSQL backup restore verification, live provider response verification (Gemini request timed out), and external integrations remain pending; see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md).

Phase 8 adds resumable editor snapshots, step statuses, prompt/test/review run outcomes, failure records, and owner-scoped workflow APIs. Guest data persists in browser storage; signed-in workflow synchronization has been verified against PostgreSQL.

Phase 9 replaces the SQL/API demo with validated AI-backed generation and explanation. SQL responses are limited to a single read-only query and are never executed by the application; OpenAPI responses are checked for bounded path, operation, and response structure. Live provider checks remain pending until an API key is configured.

Phase 10 adds authenticated invite-only rooms, owner/editor/viewer permissions, persisted room chat and code, revision-checked WebSocket updates, online presence, and reconnect snapshots. A live two-account check verified room creation/join, shared code and chat, viewer write denial, reconnect state, and cleanup against the configured PostgreSQL database.

Phase 11 replaces example analytics and community content with PostgreSQL-backed assessment progress, best scores, achievements, adaptive recommendations, daily challenges, public prompt sharing, voting, reporting, and leaderboard participation. Assessment answers are scored server-side; users must opt in before their display name and points appear on the leaderboard. Live database checks verified scoring, progress, challenge completion, privacy defaults/opt-in, vote uniqueness, self-vote prevention, report hiding, and cleanup.
