# Changelog

## Unreleased — 2026-11-12

- Completed the core prompt-intelligence slice: structured Gemini prompt diagnostics, explained prompt changes, export/save actions, and per-problem local version history with text comparison and restore.
- Added validated Gemini code explanation, debugging, and test-case suggestion endpoints with an editor assistant modal; all recommendations are clearly marked as unexecuted analysis.
- Added bounded validation for AI chat output and expanded response-contract tests.
- Added an optional Judge0 CE-compatible isolated execution adapter with hard resource limits, bounded batches, provider result validation, and per-case output comparison.
- Added server-side execution provider configuration and explicit stdin/stdout runner guidance; execution stays disabled until a host is configured.
- Implemented matched prompt comparison: identical request settings, parallel answer generation, blinded rubric evaluation, server-measured latency, and optional provider-returned model/usage metadata.
- Added PostgreSQL migrations, hashed-password registration/login, HttpOnly database-backed sessions, password/profile/account workflows, owner-scoped project/prompt/version APIs, cursor pagination, and backup/restore guidance.
- Added a documented repository audit and phased implementation roadmap.
- Replaced the prompt power keyword counter with a deterministic weighted quality estimate that discloses its methodology and suggestions.
- Removed fake source-length test outcomes and randomized runtime/memory figures. The UI now says secure execution is not configured.
- Removed heuristic prompt comparison results and fake version history; comparison now evaluates matched Gemini answer outputs.
- Changed Gemini endpoints to return explicit provider-unavailable/failure errors instead of canned AI fallback responses.
- Fixed quick-prompt execution to submit the selected prompt value.
- Added bounded chat-history validation, a 1 MB JSON limit, process-local API rate limiting, and sanitized JSON error responses.
- Added the Phase 2 debugger, optimization explanations, local prompt version history, comparison, and restore flows.
- Added AI response shape checks, server port/rate-limit configuration, and accurate sample-data disclosures across preview screens.
- Added sixteen passing tests, a passing type check, a passing production build, and production API smoke checks.
- Updated setup and feature-boundary documentation.
