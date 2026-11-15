# Security

## Current controls

- Gemini, Judge0, and PostgreSQL credentials are read on the server; do not expose them in client bundles.
- JSON request bodies are limited to 1 MB.
- The Express API has a configurable process-local limit of 60 requests per client IP per 15 minutes (`API_RATE_LIMIT_MAX_REQUESTS`, `API_RATE_LIMIT_WINDOW_MS`).
- Chat history is checked for array shape, entry count, string content, and per-message length.
- AI endpoint text fields are checked for required values and maximum lengths.
- Prompt execution, review, optimization, diagnostics, and imported-problem responses are checked against runtime shape validators.
- User-submitted code is never executed on the application host; it is sent to the separately configured Judge0-compatible isolated provider with fixed per-run limits.
- Accounts use server-side PostgreSQL records, scrypt password hashes, opaque random session cookies (`HttpOnly`, `SameSite=Strict`, `Secure` in production), seven-day expiry, and database-stored SHA-256 token hashes.
- Login and registration have a ten-attempt per-IP/15-minute limiter in addition to the global API throttle.
- Project, prompt, and prompt-version endpoints require a valid session and scope queries by owner. Composite foreign keys reinforce project/prompt ownership in PostgreSQL.
- Password updates revoke other sessions; account deletion cascades owned records. PostgreSQL migrations run transactionally under an advisory lock.
- `/api/account/export` provides the signed-in user a JSON export of account-owned product data; it omits password hashes, session tokens, and other users' room messages. Account deletion requires password confirmation and runs transactionally.
- Expired session rows are pruned at startup and every six hours. API responses are marked `no-store`; responses include request IDs and baseline browser security headers.
- Structured server logs use an allowlist of fields and avoid request contents, prompts, credentials, and raw exception messages. `/healthz` and `/readyz` support liveness and database readiness checks.

## Important limitations

The in-memory limiters do not coordinate across multiple workers and are not production quotas. When behind a reverse proxy, configure network-level limits and carefully set `TRUST_PROXY_HOPS` before relying on client IPs. Account endpoints are unavailable until `DATABASE_URL` is configured and migrations apply. This implementation does not include email verification, password recovery, MFA, cross-site account linking, or automatic deletion/retention of user content. Session cleanup is scheduled, but product data remains until the user deletes their account or the relevant feature data. This repository cannot verify the deployment's TLS, shared quotas, secret manager, monitoring, or backup restore process; operators must configure those for their host.

Never add secrets to `VITE_*` variables or commit a populated `.env`. Use a secret manager in deployment. Do not add local `eval`, shell execution, or direct host execution for submitted code. Code execution uses a separate isolated provider with explicit resource limits when configured.

See [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) for security work that remains.
