# API Documentation

All endpoints are same-origin JSON routes served by Express. Request bodies are limited to 1 MB and the process applies a limit of 60 API requests per client IP per 15-minute window. The limiter is in-memory and resets when the server restarts.

## Health

### `GET /api/health`

Returns `{ "status": "ok", "hasAIProvider": boolean, "defaultModel": string, "hasExecutionProvider": boolean, "hasDatabase": boolean }`.

### `GET /api/ai/models`

Returns the configured default and supported model catalog as `{ defaultModel, models: [{ id, name, provider, available }] }`. `available` only indicates that the matching server environment key is set; provider acceptance is confirmed by a live request.

### `POST /api/execute/tests`

Body: `{ code, language, testCases: [{ id, input, expected }] }`. Executes complete stdin/stdout programs through a server-configured Judge0 CE-compatible host. Supported language values are `typescript`, `python`, `cpp`, `java`, and `go`. Test cases are limited to 10 per request; source is limited to 100 KB; each input and expected output is limited to 4 KB. CPU time is capped at 2 seconds, wall time at 5 seconds, memory at 128 MiB, and generated file size at 1 MiB. Results are validated, outputs are compared after line-ending normalization and trailing whitespace removal, and provider-reported time and memory are returned. The provider host and its limits must be configured by the deployment operator.

This runner passes each `input` as stdin and compares stdout with `expected`. It does not infer function signatures or call function-only snippets. Bundled starter code is primarily function templates, and bundled case descriptions may need to be converted to stdin/stdout test data before they are suitable for this runner.

## AI endpoints

AI endpoints use the selected model sent in the `X-AI-Model` header, falling back to `AI_DEFAULT_MODEL`. `GET /api/ai/models` lists supported models and whether each provider key is configured. Provider keys remain server-side. Endpoints return `503` when the selected model is unavailable and `502` when the provider request or structured response fails. Successful AI results include `providerMetadata` with requested model, measured latency, and provider-reported usage/model version when available. Error bodies use `{ "error": "..." }`.

All POST endpoints require a JSON object. Prompt, code, language, mode, and title fields are checked for type and length before AI calls.

- `POST /api/assistant/sql`: `{ action: "generate", dialect, requirement, schema? }` or `{ action: "explain", dialect, query }`. Dialects are PostgreSQL, MySQL, and SQLite. The response is schema-checked; validation rejects multiple statements and common write, DDL, locking, and known side-effect patterns. This cannot prove arbitrary database functions harmless. The service never executes SQL.
- `POST /api/assistant/api-contract`: `{ action: "generate", requirement, schema? }` or `{ action: "explain", contract }`. Returns bounded OpenAPI 3.0/3.1 JSON with validated paths, operations, and responses.

## Account and project endpoints

Account endpoints require `DATABASE_URL` and an active PostgreSQL migration. The server uses an opaque `promptcode_session` cookie with `HttpOnly`, `SameSite=Strict`, and `Secure` in production. Registration and login are limited to 10 requests per IP per 15 minutes in addition to the global API limit. Login uses a generic error for invalid credentials; registration returns `409` when an email is already registered.

- `POST /api/auth/register`: `{ email, name, password }`, password length 12–128; creates account and session.
- `POST /api/auth/login`: `{ email, password }`; returns the generic error for invalid credentials.
- `GET /api/auth/me`: current account or `401`.
- `POST /api/auth/logout`: revokes the current session and clears the cookie.
- `PATCH /api/auth/profile`: `{ name }`.
- `PATCH /api/auth/password`: `{ currentPassword, newPassword }`; password changes revoke other sessions.
- `DELETE /api/auth/account`: `{ password }`; permanently deletes the account and cascading owned rows.
- `GET /api/projects?limit=20&cursor=...`: returns only the signed-in user's projects and an optional next cursor.
- `POST /api/projects`: `{ name, description? }`.
- `GET /api/projects/:projectId/prompts?limit=20&cursor=...`: owner-scoped prompt page.
- `POST /api/projects/:projectId/prompts`: `{ title, content }`; creates prompt version 1.
- `GET /api/projects/:projectId/prompts/:promptId/versions?limit=20&cursor=...`: owner-scoped version page (maximum 20 per page).
- `POST /api/projects/:projectId/prompts/:promptId/versions`: `{ content }`; appends a version atomically and advances the current version.

Pagination limits are 1–100 and cursors are opaque, timestamp/UUID-based continuation tokens. Unknown and non-owned project IDs return the same `404` response.

## Development workflows

Workflow routes require an authenticated account and an applied database migration. Guest workflows remain local to the browser.

- `GET /api/workflows?limit=20&cursor=...`: owner-scoped, cursor-paginated workflow snapshots.
- `POST /api/workflows`: `{ workflow }`; creates an owned snapshot.
- `GET /api/workflows/:workflowId`: returns the snapshot and its 50 most recent run records.
- `PUT /api/workflows/:workflowId`: replaces the owner-scoped snapshot.
- `POST /api/workflows/:workflowId/runs`: `{ run }`; stores a bounded prompt, execution, review, or assistant run outcome, including failures.
- `DELETE /api/workflows/:workflowId`: deletes the workflow and cascades its run history.

Snapshots are limited to 750 KB and include current editor state, progress step, generated result, test cases/results, and bounded run history. Active workflow edits are autosaved, and failures are retained so users can resume at the affected step.

## Collaboration rooms

Room routes require an authenticated account and the collaboration migration. Invite codes are returned only when a room is created; the database stores a SHA-256 digest. WebSocket connections use the same-origin session cookie and must belong to the room.

- `GET /api/rooms`: list rooms for the signed-in user.
- `POST /api/rooms`: `{ title, language? }`; creates an owner room and returns the one-time `inviteCode`.
- `POST /api/rooms/join`: `{ inviteCode }`; joins as editor (existing membership keeps its role).
- `GET /api/rooms/:roomId`: return room metadata for a member.
- `PATCH /api/rooms/:roomId/members/:userId`: `{ role: "editor" | "viewer" }`; room owner only.
- `DELETE /api/rooms/:roomId/members/me`: leave a room; owners must delete their room instead.
- `DELETE /api/rooms/:roomId`: owner-only room deletion.
- `wss://<host>/api/rooms/:roomId/socket` (or `ws://` locally): cookie-authenticated room stream.

WebSocket JSON messages include `room:snapshot`, `code:update`, `code:ack`, `code:conflict`, `chat:send`, `chat:message`, `presence:update`, and `error`. Code edits are limited to 100 KB, use a base revision for conflict detection, and are persisted before broadcast. Viewers cannot write. Chat is persisted and limited to ten messages per user per ten seconds; cursor and typing events are ephemeral. Reconnects receive a fresh code, membership, online list, and the latest 50 messages.

## Learning, analytics, and community

Assessment, progress, challenge, and privacy endpoints require an active account and the Phase 11 database migration. Quiz answer keys are never returned by the assessment read route; the server scores submitted option indexes. A lesson is passed at 2 of 3 correct answers (67%), and the response recommends review or the next unpassed lesson. Accounts can submit at most 10 assessments per rolling 24 hours and three attempts for the featured daily challenge. Best scores and completion stay private to the account unless leaderboard visibility is enabled.

- `GET /api/learning/lessons/:lessonId/assessment`: returns question IDs, text, choices, and the account's saved progress, without answers.
- `POST /api/learning/lessons/:lessonId/assessment`: `{ answers: [number, ...], dailyChallenge?: boolean }`; returns server-calculated score, explanations, saved best score, and an adaptive recommendation.
- `GET /api/learning/challenge/today`: returns the UTC-dated featured lesson and remaining daily assessment allowance.
- `GET /api/learning/summary`: returns lesson progress, recent assessments, points, challenge status, and derived achievements.
- `GET /api/learning/privacy`, `PATCH /api/learning/privacy`: read or set `{ leaderboardOptIn: boolean }`. The default is false.
- `GET /api/learning/leaderboard`: lists only accounts that opted in; points use best lesson scores and completed daily challenges.
- `GET /api/community/prompts?sort=recent|popular`: lists public, non-hidden prompts; this route is readable without signing in.
- `POST /api/community/prompts`: `{ title, content }`; authenticated authors may publish at most three per rolling 24 hours. Content is plain text and public with the account display name.
- `DELETE /api/community/prompts/:promptId`: owner-only deletion.
- `POST` or `DELETE /api/community/prompts/:promptId/vote`: add or remove one vote per account; self-voting is rejected.
- `POST /api/community/prompts/:promptId/report`: `{ reason: "spam" | "unsafe" | "personal_data" | "other" }`; one report per account. Three distinct reports hide a prompt from the public list.

Learning and community records cascade on account deletion. Community prompt publication is deliberately public; leaderboard display is opt-in. Daily assessment limits, a three-prompt daily cap, unique vote/report constraints, and report-based hiding provide basic abuse controls.

### `POST /api/prompt/execute`

Body: `{ prompt, problemTitle?, problemContext?, currentCode?, language?, mode? }`. Runs the selected prompt task using the configured provider and expects a validated JSON response.

### `POST /api/review`

Body: `{ code, language, problemTitle, reviewerPersona? }`. Requests a code review.

### `POST /api/code/explain`

Body: `{ code, language, problemTitle?, problemDescription? }`. Returns a validated summary, titled explanation sections, key terms, and caveats. The code is not executed.

### `POST /api/code/debug`

Body: `{ code, language, problemTitle?, problemDescription? }`. Returns validated likely root cause, line-based findings, a suggested fix, and regression test ideas. These are model analysis, not execution results.

### `POST /api/code/test-cases`

Body: `{ code, language, problemTitle?, problemDescription? }`. Returns validated example, boundary, edge, and adversarial test suggestions with expected behavior. Cases are not run.

### `POST /api/prompt/optimize`

Body: `{ rawPrompt, goalType?, language?, problemTitle? }`. Requests an optimized prompt, AI-estimated ratings, and structured before/after changes with reasons.

### `POST /api/prompt/debug`

Body: `{ prompt, goalType?, problemTitle? }`. Returns a summary and up to 30 validated issues. Each issue has `severity` (`high`, `medium`, `low`), category, explanation, and suggested correction.

### `POST /api/problem/import-ai`

Body: `{ rawText, targetCategory?, language? }`. Requires non-empty `rawText`; the current implementation truncates it to 6,000 characters before calling Gemini.

### `POST /api/chat`

Body includes `messages`, `currentCode?`, `problemTitle?`, and `language?`. `messages` must be a non-empty array of at most 100 objects with string `content` no longer than 10,000 characters. Invalid messages return `400`.

### `POST /api/prompt/compare`

Body: `{ promptA, promptB, problemTitle?, problemContext?, currentCode?, language?, category? }`. Runs both prompt variants concurrently with the same requested Gemini model, task context, temperature, and output-token limit, then uses a blinded evaluator request with the same model. Returns both answers, scores from 0–5 for correctness, requirement coverage, clarity, verification, and efficiency, evaluator reasons and caveats, requested model, server-measured latency, and the rubric. Provider model version and token usage appear only if returned by Gemini; cost is not estimated. Each comparison makes three Gemini requests and is an AI judgment, not execution, proof, or a statistically repeated benchmark. Missing Gemini configuration returns `503`; invalid fields return `400`; provider or schema failures return `502`.

## Error responses

- `400`: invalid JSON or chat message shape.
- `415`: non-JSON request body.
- `413`: body exceeds the 1 MB parser limit.
- `429`: process-local API request limit reached; `Retry-After` is included.
- `501`: requested comparison functionality is not implemented.
- `502`: upstream AI provider failed.
- `503`: Gemini, the execution provider, or PostgreSQL account services are not configured/available.
- `504`: execution provider did not finish the bounded test batch before timeout.

Provider results for code execution, review, prompt optimization/diagnostics, problem import, chat, and the code assistant routes are checked against runtime shape and size constraints. Treat this as an evolving API, not a stable public contract.
