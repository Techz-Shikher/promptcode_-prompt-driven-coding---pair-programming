# Deployment

## Current deployment shape

The production build creates static client assets in `dist/` and a bundled Express server at `dist/server.cjs`. The server serves the client and API from one process. Configure `NODE_ENV=production` and server-side `GEMINI_API_KEY` as needed. Configure `DATABASE_URL` to enable PostgreSQL accounts; pending migrations are applied before the listener starts, and a database connection or migration failure prevents startup.

The server listens on `0.0.0.0` and reads `PORT` (default `3000`). `/healthz` is a liveness check; `/readyz` checks PostgreSQL when configured and returns 503 on a failed database check. Set `REQUIRE_DATABASE=true` when the service must not start without PostgreSQL. Use a trusted reverse proxy for TLS and external exposure. Set `TRUST_PROXY_HOPS` only to the exact number of trusted proxy hops; the Docker setup defaults to no trusted forwarded headers and binds the app to localhost.

## Docker Compose deployment

1. Copy `.env.docker.example` to `.env.docker`, then set a long URL-safe random `POSTGRES_PASSWORD` and the server-side `GEMINI_API_KEY` (if AI is needed). Keep `.env.docker` private; it is excluded from the build context and Git.
2. Start with `docker compose --env-file .env.docker up -d --build`.
3. Check `docker compose --env-file .env.docker ps` and `curl http://127.0.0.1:3000/readyz`.
4. Put a TLS reverse proxy in front of the localhost-bound port before exposing it to users. If the proxy forwards client IP headers, set `TRUST_PROXY_HOPS` to its known hop count and configure the proxy to replace incoming forwarded headers.

PostgreSQL data is persisted in the `promptcode-postgres` named volume. Back up regularly and store encrypted copies outside the host. Example logical backup: `docker compose --env-file .env.docker exec -T db pg_dump -U promptcode -d promptcode -Fc > promptcode-YYYY-MM-DD.dump`. Restore only into a separate staging database first, then verify migrations and account data before a production restore. A named volume is persistence, not a backup. The application does not schedule or verify backups for you.

The current API and login throttles are process-local; for multiple app instances, configure a shared gateway or rate limiter and define provider-cost quotas. Monitor `/readyz`, container restarts, PostgreSQL storage, CPU/memory, 5xx and 429 counts, and backup age. Application JSON logs deliberately omit request bodies, prompts, credentials, and raw exception messages.

## Local production check

1. Install dependencies.
2. Set `GEMINI_API_KEY` if AI calls are needed and `DATABASE_URL` if accounts are enabled. Keep both in a deployment secret manager.
3. Run `npm run build`.
4. Set `NODE_ENV=production` and run `npm start`.
5. Confirm `GET /api/health`, `/healthz`, and `/readyz`; verify account registration, login, export, deletion, migration state, and a staged backup restore before enabling accounts for users.

Do not expose the service as a multi-user production platform until TLS, a shared limiter/quotas, secret management, monitoring, and a tested backup/restore process are configured for the actual hosting environment.
