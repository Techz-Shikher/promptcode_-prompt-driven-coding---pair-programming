const SAFE_FIELD_KEYS = new Set(['requestId', 'method', 'route', 'statusCode', 'durationMs', 'port', 'dependency', 'task', 'errorName', 'errorCode']);

function safeFields(fields: Record<string, unknown>) {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!SAFE_FIELD_KEYS.has(key)) continue;
    if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
    else if (typeof value === 'boolean') result[key] = value;
    else if (typeof value === 'string' && value.length <= 120 && /^[A-Za-z0-9_./:-]*$/.test(value)) result[key] = value;
  }
  return result;
}

export function logEvent(level: 'info' | 'warn' | 'error', event: string, fields: Record<string, unknown> = {}) {
  const entry = { timestamp: new Date().toISOString(), level, event, ...safeFields(fields) };
  const output = `${JSON.stringify(entry)}\n`;
  if (level === 'error') process.stderr.write(output);
  else process.stdout.write(output);
}

export function logException(event: string, error: unknown, fields: Record<string, unknown> = {}) {
  const errorRecord = error && typeof error === 'object' ? error as { name?: unknown; code?: unknown } : {};
  const errorName = typeof errorRecord.name === 'string' && /^[A-Za-z0-9_-]{1,60}$/.test(errorRecord.name) ? errorRecord.name : 'UnknownError';
  const errorCode = typeof errorRecord.code === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(errorRecord.code) ? errorRecord.code : undefined;
  logEvent('error', event, { ...fields, errorName, ...(errorCode ? { errorCode } : {}) });
}
