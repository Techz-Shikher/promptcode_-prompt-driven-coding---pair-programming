/**
 * Validate the untrusted chat history supplied to the chat endpoint.
 * @param {unknown} messages
 * @returns {boolean}
 */
export function isValidChatMessages(messages) {
  return Array.isArray(messages)
    && messages.length > 0
    && messages.length <= 100
    && messages.every((message) => (
      message !== null
      && typeof message === 'object'
      && typeof message.content === 'string'
      && message.content.length <= 10_000
    ));
}

/**
 * Check required and optional text fields on an untrusted JSON object.
 * Required values must be non-empty after trimming. Optional values may be empty.
 * @param {unknown} value
 * @param {Record<string, number>} requiredFields
 * @param {Record<string, number>} [optionalFields]
 * @returns {boolean}
 */
export function hasValidStringFields(value, requiredFields, optionalFields = {}) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value;
  for (const [field, maxLength] of Object.entries(requiredFields)) {
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].length > maxLength) return false;
  }
  for (const [field, maxLength] of Object.entries(optionalFields)) {
    if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > maxLength)) return false;
  }
  return true;
}
