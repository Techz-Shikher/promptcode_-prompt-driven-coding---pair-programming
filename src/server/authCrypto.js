import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;
let passwordDerivationsInFlight = 0;
const MAX_PASSWORD_DERIVATIONS = 4;

function derivePassword(password, salt, cost = SCRYPT_N) {
  if (passwordDerivationsInFlight >= MAX_PASSWORD_DERIVATIONS) return Promise.reject(new Error('Authentication capacity reached.'));
  passwordDerivationsInFlight += 1;
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, { N: cost, r: SCRYPT_R, p: SCRYPT_P, maxmem: SCRYPT_MAXMEM }, (error, key) => {
      passwordDerivationsInFlight -= 1;
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await derivePassword(password, salt);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password, encoded) {
  const [algorithm, nText, rText, pText, saltText, hashText] = encoded.split('$');
  const n = Number(nText);
  if (algorithm !== 'scrypt' || n !== SCRYPT_N || Number(rText) !== SCRYPT_R || Number(pText) !== SCRYPT_P || !saltText || !hashText) return false;
  try {
    const expected = Buffer.from(hashText, 'base64url');
    const actual = await derivePassword(password, Buffer.from(saltText, 'base64url'), n);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest();
}

export function readSessionToken(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('promptcode_session='));
  const token = match?.slice('promptcode_session='.length);
  return token && /^[A-Za-z0-9_-]{40,60}$/.test(token) ? token : null;
}
