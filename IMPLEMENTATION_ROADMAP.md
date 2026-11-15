# PromptCode Implementation Roadmap

This roadmap records observed implementation state. A phase is not marked complete until its behavior is implemented and verified. See [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for the initial repository findings.

## Phase 1 — Repository audit

- [x] Read the opened workspace source, configuration, feature components, utilities, and backend routes.
- [x] Record what is implemented, partial, simulated, or missing.

## Phase 2 — Core prompt intelligence

- [x] Add a deterministic, weighted prompt-quality estimate with category scores, gaps, suggestions, and a visible methodology disclosure.
- [x] Validate structured output for prompt execution and expose a deterministic local prompt-quality rubric.
- [x] Add local prompt checks and a Gemini-backed debugger for missing, ambiguous, or contradictory requirements, with severity and suggested corrections.
- [x] Show validated original/revised prompt changes with reasons; support copy, export, apply, and save.
- [x] Save per-problem prompt versions locally, compare text and rubric scores, restore versions, and track quality estimates over time.

## Phase 3 — AI coding intelligence

- [x] Keep Gemini credentials server-side and make missing-provider failures explicit for generation, review, optimization, import, and chat.
- [x] Validate structured provider output for generation, review, optimization, and problem import.
- [x] Validate every provider response and add dedicated schemas for all remaining response types, including bounded structured output for chat.
- [x] Add dedicated code explanation, debugging, and test-case-generation contracts with an editor entry point; label analysis as unexecuted.

## Phase 4 — Isolated code execution

- [x] Remove the source-length fake test runner and fabricated output/resource values; fail closed when no secure execution host is configured.
- [x] Implement a Judge0 CE-compatible batch adapter with fixed CPU, wall-time, memory, file-size, input-count, and output-size limits plus validated per-case results.
- [x] Add server-side provider URL/token configuration and document the stdin/stdout contract and operational limits.
- [ ] Configure a deployment execution host and verify that its language IDs match the configured Judge0 CE-compatible version. Until then, execution correctly returns `503`.

## Phase 5 — Prompt-to-outcome evaluation

- [x] Remove heuristic prompt scores and simulated comparison results; report that matched evaluation is not implemented.
- [x] Run both prompts in parallel under the same model, task context, and generation settings, then evaluate blinded candidates with a disclosed rubric.
- [x] Return server-measured latency and requested model transparently; expose provider-reported model version and token usage only when returned. Do not invent cost figures.

## Phase 6 — Authentication and database

- [x] Implement server-managed registration/login/logout, secure opaque sessions, owner authorization, profile/password changes, and account deletion.
- [x] Add PostgreSQL schema/migrations, database-enforced ownership constraints, cursor pagination, and documented backup/restore procedures.
- [x] Configure `DATABASE_URL`; apply migrations and verify registration, account-backed workflow persistence/history, owner isolation, and cursor pagination against PostgreSQL.
- [ ] Verify a schema/data backup restore in a separate staging database. `pg_dump` and `pg_restore` are not installed in this workspace.

## Phase 7 — Multi-provider AI

- [x] Add server-side Google Gemini, OpenAI, Anthropic, and DeepSeek adapters with credentials kept out of the browser.
- [x] Add a configured-model catalog and route AI requests using the selected model; unavailable providers are disabled in the picker.
- [x] Retry transient provider/network failures with bounded backoff and timeout; normalize provider-reported model, usage, and latency metadata.
- [ ] Verify live requests for configured providers. Gemini is configured in the private `.env`, but the smoke request timed out before a provider response; other provider keys remain optional/unset.

## Phase 8 — Development workflow

- [x] Persist bounded workflow snapshots locally for guests and owner-scoped in PostgreSQL for signed-in accounts.
- [x] Restore problem, prompt, language, code, generated result, test cases/results, current step, and prior failures.
- [x] Record prompt, test execution, and code review successes/failures in a bounded chronological history; retain workflow ownership and delete runs with their parent.
- [x] Verify migration and account-backed workflow synchronization against a configured PostgreSQL instance.

## Phase 9 — SQL and API assistant

- [x] Replace static examples with selected-provider SQL generation/explanation and validated OpenAPI JSON generation/explanation.
- [x] Validate SQL dialect and bounded response shape; reject multiple statements and common write/DDL/locking/known side-effect patterns.
- [x] Keep generated SQL display/copy only; the server has no SQL execution path.
- [ ] Verify live provider generation and explanation after configuring a provider key.

## Phase 10 — Collaboration

- [x] Add authenticated, invite-only rooms with PostgreSQL room/member/message persistence and owner/editor/viewer roles.
- [x] Synchronize code over authenticated WebSockets with optimistic revision checks, viewer write protection, presence, and reconnect snapshots.
- [x] Replace seeded peer/chat demonstrations with room controls and persisted shared chat.
- [x] Verify a two-account collaboration session including room creation/join, code/chat synchronization, viewer role enforcement, reconnect state, and account/room cleanup.

## Phase 11 — Learning, analytics, and community

- [x] Replace static analytics, achievements, leaderboard, and community examples with account-backed learning and public prompt data.
- [x] Add server-scored lesson assessments, adaptive lesson recommendations, opt-in leaderboard privacy, unique voting/reporting, and daily limits.
- [x] Verify scoring, saved progress, daily challenge, privacy opt-in, vote constraints, report threshold, and temporary-account cleanup against PostgreSQL.

## Phase 12 — Developer integrations

- [x] Implement a local VS Code extension and repository-native GitHub Actions integration with scoped permissions.
- [x] Add CI for type checks, tests, build, dependency scanning, and secret scanning.
- [ ] Publish the extension or run GitHub Actions after connecting this workspace to a remote repository.

## Phase 13 — Quantum/research

- [x] Remove simulated QAOA outcomes and unsupported Qiskit speedup claims; keep the optional research area isolated from core coding flows.
- [x] Add a seeded, versioned knapsack instance generator and a same-input comparison between exact dynamic programming and a greedy heuristic.
- [x] Report the input fingerprint, algorithm complexity, objective value, warmup/repetition protocol, median runtime, and heuristic gap.
- [x] Add deterministic generation, exhaustive small-instance correctness, and report reproducibility checks.
- [x] Label the measurement as a local classical microbenchmark; make no quantum performance claims.

## Phase 14 — Security and operations

- [x] Validate JSON object/chat history shape and size; limit body size; add a configurable process-local rate limit and clear provider-unavailable errors.
- [x] Add shared validation, process-local rate limits, secure session handling, structured logs, session retention, account export/deletion, and baseline deployment hardening. Shared multi-instance quotas and content retention policies remain deployment/product decisions.
- [x] Add Docker Compose deployment instructions and operational backup/monitoring guidance. A live staged restore and host-specific monitoring setup remain operator tasks.

## Verification record

- `npm test`: 22 tests pass, including reproducible research data, exact knapsack baseline correctness, and benchmark report consistency.
- `npm run lint`: passes.
- `npm run build`: passes; Vite reports that the main JavaScript chunk is above 500 kB.
- Production smoke check: `/api/health` reports provider configuration; malformed execution requests return 400; missing `JUDGE0_API_URL` returns 503.
- Prompt benchmark smoke check: malformed requests return 400; missing `GEMINI_API_KEY` returns 503. A live matched evaluation could not be exercised until the key is configured.
- Account/database smoke check: PostgreSQL is connected; migrations `001_initial_schema.sql` and `002_workflows.sql` are recorded and workflow tables exist. Temporary registration, workflow create/read/list/run/delete, account deletion, non-owner `404`, and two-page cursor pagination passed; cleanup was confirmed with zero temporary rows. Password hashing and cursor validation unit tests pass. Staged backup restore remains unverified because `pg_dump` and `pg_restore` are unavailable.
- Phase 7 smoke check: Gemini now appears configured in `/api/health`; a minimal Gemini SQL generation request timed out after 60 seconds and returned 502. PostgreSQL remains healthy. Live provider behavior is still unverified.
- Phase 8 workflow validation: snapshot/run input bounds and local save/resume/history validation are covered by unit tests; account-backed workflow synchronization, history, pagination, and cleanup were verified against PostgreSQL.
- Phase 9 contract validation: SQL read-only and single-statement checks plus OpenAPI response validation have unit coverage. A Gemini key is configured, but the live SQL generation request timed out before returning an artifact.
- Initial dependency install exposed a Vite/esbuild peer mismatch. `esbuild` and both package lockfiles are aligned to 0.28.x.

## Explicit limitations

No Judge0 host, PostgreSQL database URL, or external model credentials are configured in this repository. Code execution remains disabled until deployment configures `JUDGE0_API_URL` and the target instance is verified. Account routes remain disabled until `DATABASE_URL` is configured and migrations are verified. Provider routing requires the relevant server-side API key. The UI must not report demo output as real results.
