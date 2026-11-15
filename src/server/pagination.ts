const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PageCursor { createdAt: string; id: string }
export interface PageRequest { limit: number; cursor: PageCursor | null }

export function encodePageCursor(cursor: PageCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodePageCursor(value: string): PageCursor | null {
  if (!value || value.length > 256 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (parsed === null || typeof parsed !== 'object' || typeof parsed.createdAt !== 'string'
      || !Number.isFinite(Date.parse(parsed.createdAt)) || typeof parsed.id !== 'string' || !UUID_PATTERN.test(parsed.id)) return null;
    return { createdAt: new Date(parsed.createdAt).toISOString(), id: parsed.id };
  } catch { return null; }
}

export function parsePageRequest(params: URLSearchParams): PageRequest | null {
  const rawLimit = params.get('limit');
  const limit = rawLimit === null ? 20 : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return null;
  const rawCursor = params.get('cursor');
  if (rawCursor === null) return { limit, cursor: null };
  const cursor = decodePageCursor(rawCursor);
  return cursor ? { limit, cursor } : null;
}
