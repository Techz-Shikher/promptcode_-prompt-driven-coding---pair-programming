# PostgreSQL schema and operations

## Runtime status

The server now has a PostgreSQL-backed account and persistence layer. Set server-side `DATABASE_URL` to enable it. During startup the server takes a PostgreSQL advisory lock, creates `schema_migrations` if needed, and applies pending numbered SQL migrations in order. It stores a SHA-256 checksum for each migration and fails startup if an already applied migration was edited. Migration `001_initial_schema.sql` creates accounts, hashed sessions, owner-scoped projects/prompts/versions, runs/evaluations, code submissions/test cases/results, progress, templates, feedback, and audit events.

The initial migration enforces account ownership in the database with composite foreign keys and cascades owned project data on deletion. Application queries still scope every project/prompt read and write by the signed-in account. The project, prompt, and prompt-version APIs use opaque timestamp/UUID cursor pagination, default limit 20, maximum 100 (20 for version content).

## Account and session data

- Email addresses are normalized to lowercase and protected by a unique normalized-email index.
- Passwords are stored as salted scrypt hashes (N=32768, r=8, p=1), never as plaintext.
- Session tokens are random opaque values in an `HttpOnly`, `SameSite=Strict` cookie; only their SHA-256 hashes are stored in PostgreSQL. Sessions expire after seven days. Password changes revoke all other sessions.
- Deleting an account cascades sessions and owned records. Foreign keys null the actor reference on retained audit records.

## Migrations

Migrations are append-only SQL files in `migrations/`. Never edit a migration after it has been applied in a deployed environment; add a new numbered migration. On startup, PromptCode applies pending migrations in a transaction under an advisory lock. A misconfigured database or failed migration prevents startup when `DATABASE_URL` is present. Without a database URL, the app starts but account APIs return `503`.

## Backup and restore

Use PostgreSQL's custom archive format. Keep the dump encrypted and access controlled; it contains account emails, project content, prompts, source code, and test data.

```powershell
$env:DATABASE_URL = 'postgresql://...'
pg_dump --format=custom --no-owner --file promptcode-backup.dump $env:DATABASE_URL
```

Verify backups by restoring to a separate empty staging database first:

```powershell
$env:RESTORE_DATABASE_URL = 'postgresql://.../promptcode_restore'
pg_restore --no-owner --dbname $env:RESTORE_DATABASE_URL promptcode-backup.dump
```

Validate the restored application and row counts before changing production traffic. A restore into an existing database is destructive; create a fresh target instead. Retain backups according to the deployment's privacy and retention policy, and delete them when account deletion/retention obligations require it.

## Limits and current coverage

Account/session, project/prompt, and authenticated workflow APIs use PostgreSQL. Workflow snapshots and bounded run records are introduced in migration `002_workflows.sql`; snapshots include resumable progress and failure details. Existing local preferences, custom problem bank, problem progress, and prompt version history remain browser-local. Configure TLS and managed credentials according to the selected PostgreSQL host; do not commit a populated `.env`.
