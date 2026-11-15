import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { Pool } from 'pg';
import type { PoolClient } from 'pg';

let pool: Pool | null = null;

export function getDatabasePool(): Pool | null {
  return pool;
}

export async function initializeDatabase(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return false;
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('DATABASE_URL must use PostgreSQL.');

  const candidate = new Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 10_000,
    application_name: 'promptcode',
  });
  let client: PoolClient | null = null;
  try {
    client = await candidate.connect();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [72819426]);
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const migrationsPath = path.join(process.cwd(), 'migrations');
    const migrationFiles = (await readdir(migrationsPath))
      .filter((file) => /^\d{3,}_[a-z0-9_-]+\.sql$/i.test(file))
      .sort((left, right) => left.localeCompare(right));
    if (!migrationFiles.length) throw new Error('No valid database migration files were found.');
    for (const migrationFile of migrationFiles) {
      const migration = await readFile(path.join(migrationsPath, migrationFile), 'utf8');
      const checksum = createHash('sha256').update(migration).digest('hex');
      const current = await client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE version = $1', [migrationFile]);
      if (current.rowCount === 0) {
        await client.query(migration);
        await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2)', [migrationFile, checksum]);
      } else if (current.rows[0].checksum !== checksum) throw new Error(`Applied migration was modified: ${migrationFile}`);
    }
    await client.query('COMMIT');
    pool = candidate;
    return true;
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
      client.release();
      client = null;
    }
    await candidate.end();
    throw error;
  } finally {
    client?.release();
  }
}
