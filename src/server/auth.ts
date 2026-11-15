import { randomBytes, randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { getDatabasePool } from './database.js';
import { hashPassword, hashSessionToken, readSessionToken as parseSessionToken, SESSION_TTL_SECONDS, verifyPassword } from './authCrypto.js';

export interface PublicAccount {
  id: string;
  email: string;
  name: string;
}

export class AuthDatabaseUnavailableError extends Error {
  constructor() { super('Account services are unavailable. Configure DATABASE_URL and apply migrations.'); }
}

function db() {
  const pool = getDatabasePool();
  if (!pool) throw new AuthDatabaseUnavailableError();
  return pool;
}

export function readSessionToken(req: Request): string | null {
  return parseSessionToken(req.headers.cookie);
}

export function setSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `promptcode_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`);
}

export function clearSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `promptcode_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`);
}

export async function createAccount(email: string, name: string, password: string): Promise<PublicAccount> {
  const id = randomUUID();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const result = await db().query<PublicAccount>(
    'INSERT INTO users(id, email, display_name, password_hash) VALUES($1, $2, $3, $4) RETURNING id, email, display_name AS name',
    [id, normalizedEmail, name.trim(), passwordHash],
  );
  return result.rows[0];
}

export async function registerAccountAndSession(email: string, name: string, password: string): Promise<{ token: string; account: PublicAccount }> {
  const pool = db();
  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  const id = randomUUID();
  const token = randomBytes(32).toString('base64url');
  try {
    await client.query('BEGIN');
    const inserted = await client.query<PublicAccount>(
      'INSERT INTO users(id, email, display_name, password_hash) VALUES($1, $2, $3, $4) RETURNING id, email, display_name AS name',
      [id, email.trim().toLowerCase(), name.trim(), passwordHash],
    );
    await client.query('INSERT INTO sessions(token_hash, user_id, expires_at) VALUES($1, $2, now() + interval \'7 days\')', [hashSessionToken(token), id]);
    await client.query('COMMIT');
    return { token, account: inserted.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function authenticateAccount(email: string, password: string): Promise<PublicAccount | null> {
  const result = await db().query<PublicAccount & { password_hash: string }>(
    'SELECT id, email, display_name AS name, password_hash FROM users WHERE email = $1 AND disabled_at IS NULL',
    [email.trim().toLowerCase()],
  );
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) return null;
  const { password_hash: _passwordHash, ...publicAccount } = user;
  return publicAccount;
}

export async function createSession(userId: string): Promise<{ token: string; account: PublicAccount }> {
  const token = randomBytes(32).toString('base64url');
  const pool = db();
  await pool.query('DELETE FROM sessions WHERE expires_at <= now()');
  const result = await pool.query<PublicAccount>(
    `INSERT INTO sessions(token_hash, user_id, expires_at)
     SELECT $1, u.id, now() + interval '7 days'
     FROM users u WHERE u.id = $2 AND u.disabled_at IS NULL
     RETURNING user_id AS id`,
    [hashSessionToken(token), userId],
  );
  if (result.rowCount !== 1) throw new Error('Could not create the account session.');
  const accountResult = await pool.query<PublicAccount>('SELECT id, email, display_name AS name FROM users WHERE id = $1', [userId]);
  return { token, account: accountResult.rows[0] };
}

export async function getSessionAccount(token: string): Promise<PublicAccount | null> {
  const result = await db().query<PublicAccount>(
    `SELECT u.id, u.email, u.display_name AS name
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.disabled_at IS NULL`,
    [hashSessionToken(token)],
  );
  return result.rows[0] || null;
}

export async function revokeSession(token: string): Promise<void> {
  await db().query('DELETE FROM sessions WHERE token_hash = $1', [hashSessionToken(token)]);
}

export async function updateAccountName(userId: string, name: string): Promise<PublicAccount | null> {
  const result = await db().query<PublicAccount>(
    'UPDATE users SET display_name = $2, updated_at = now() WHERE id = $1 AND disabled_at IS NULL RETURNING id, email, display_name AS name',
    [userId, name.trim()],
  );
  return result.rows[0] || null;
}

export async function changeAccountPassword(userId: string, currentPassword: string, newPassword: string, token: string): Promise<boolean> {
  const pool = db();
  const current = await pool.query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1 AND disabled_at IS NULL', [userId]);
  if (!current.rows[0] || !(await verifyPassword(currentPassword, current.rows[0].password_hash))) return false;
  const newHash = await hashPassword(newPassword);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1', [userId, newHash]);
    await client.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [userId, hashSessionToken(token)]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function deleteAccount(userId: string, password: string): Promise<boolean> {
  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1 AND disabled_at IS NULL FOR UPDATE', [userId]);
    if (!result.rows[0] || !(await verifyPassword(password, result.rows[0].password_hash))) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
