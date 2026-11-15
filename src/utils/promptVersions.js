import { analyzePromptQuality } from './promptQuality.js';

const STORAGE_KEY = 'promptcode_prompt_versions_v1';
const MAX_VERSIONS_PER_PROBLEM = 50;

/** @param {string} problemId */
export function loadPromptVersions(problemId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    const versions = data && typeof data === 'object' && Array.isArray(data[problemId]) ? data[problemId] : [];
    return versions
      .filter((version) => version && typeof version.id === 'string' && typeof version.prompt === 'string'
        && typeof version.createdAt === 'string' && Number.isFinite(version.qualityScore))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/** @param {string} problemId @param {string} prompt */
export function savePromptVersion(problemId, prompt) {
  const normalizedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
  if (!problemId || !normalizedPrompt) throw new Error('A problem and a non-empty prompt are required to save a version.');

  const existing = loadPromptVersions(problemId);
  const duplicate = existing.find((version) => version.prompt === normalizedPrompt);
  if (duplicate) return { version: duplicate, created: false };

  const version = {
    id: `${Date.now()}-${existing.length + 1}`,
    prompt: normalizedPrompt,
    createdAt: new Date().toISOString(),
    qualityScore: analyzePromptQuality(normalizedPrompt).overallScore,
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : {};
  const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  data[problemId] = [version, ...existing].slice(0, MAX_VERSIONS_PER_PROBLEM);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return { version, created: true };
}

/** @param {string} before @param {string} after */
export function diffPromptVersions(before, after) {
  const beforeLines = String(before || '').split('\n');
  const afterLines = String(after || '').split('\n');
  let prefix = 0;
  while (prefix < beforeLines.length && prefix < afterLines.length && beforeLines[prefix] === afterLines[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < beforeLines.length - prefix && suffix < afterLines.length - prefix
    && beforeLines[beforeLines.length - 1 - suffix] === afterLines[afterLines.length - 1 - suffix]) suffix += 1;

  return {
    unchangedBefore: beforeLines.slice(0, prefix),
    removed: beforeLines.slice(prefix, beforeLines.length - suffix),
    added: afterLines.slice(prefix, afterLines.length - suffix),
    unchangedAfter: suffix ? beforeLines.slice(beforeLines.length - suffix) : [],
  };
}
