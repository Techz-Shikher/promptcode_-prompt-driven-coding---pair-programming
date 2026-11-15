export const JUDGE0_LANGUAGE_IDS = Object.freeze({
  typescript: 74,
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
});

const OUTPUT_LIMIT = 16_000;
const TERMINAL_STATUSES = new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function normalizeProgramOutput(output) {
  return String(output ?? '').replace(/\r\n/g, '\n').trimEnd();
}

export function isValidJudge0Submission(value) {
  return isRecord(value)
    && typeof value.token === 'string' && value.token.length > 0 && value.token.length <= 200
    && isRecord(value.status) && Number.isInteger(value.status.id)
    && typeof value.status.description === 'string' && value.status.description.length <= 200
    && (value.stdout === null || value.stdout === undefined || (typeof value.stdout === 'string' && value.stdout.length <= OUTPUT_LIMIT))
    && (value.stderr === null || value.stderr === undefined || (typeof value.stderr === 'string' && value.stderr.length <= OUTPUT_LIMIT))
    && (value.compile_output === null || value.compile_output === undefined || (typeof value.compile_output === 'string' && value.compile_output.length <= OUTPUT_LIMIT))
    && (value.message === null || value.message === undefined || (typeof value.message === 'string' && value.message.length <= OUTPUT_LIMIT))
    && (value.time === null || value.time === undefined || typeof value.time === 'string' || typeof value.time === 'number')
    && (value.memory === null || value.memory === undefined || Number.isFinite(value.memory));
}

export function mapJudge0SubmissionToCase(testCase, submission) {
  if (!isValidJudge0Submission(submission)) throw new Error('Execution provider returned an invalid test result.');
  const statusId = submission.status.id;
  const actualOutput = statusId === 3
    ? submission.stdout ?? ''
    : submission.stderr ?? submission.compile_output ?? submission.message ?? submission.stdout ?? '';
  const passed = statusId === 3
    && normalizeProgramOutput(actualOutput) === normalizeProgramOutput(testCase.expected);
  return {
    testCaseId: testCase.id,
    passed,
    actualOutput,
    expectedOutput: testCase.expected,
    executionTimeMs: Number.isFinite(Number(submission.time)) ? Math.round(Number(submission.time) * 1000) : 0,
    memoryMb: Number.isFinite(submission.memory) ? Math.round((submission.memory / 1024) * 100) / 100 : 0,
    input: testCase.input,
    status: submission.status.description,
  };
}

/** Execute a bounded group of stdin/stdout programs through a configured Judge0 CE-compatible host. */
export async function runJudge0Batch({ baseUrl, authToken, sourceCode, language, testCases, fetchImpl = fetch, wait = sleep, maxPolls = 30 }) {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) throw new Error('Unsupported execution language.');
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['X-Auth-Token'] = authToken;
  const url = `${baseUrl.replace(/\/$/, '')}/submissions/batch?base64_encoded=false`;
  const submissions = testCases.map((testCase) => ({
    language_id: languageId,
    source_code: sourceCode,
    stdin: testCase.input,
    cpu_time_limit: 2,
    cpu_extra_time: 0.5,
    wall_time_limit: 5,
    memory_limit: 131_072,
    stack_limit: 65_536,
    max_processes_and_or_threads: 30,
    max_file_size: 1_024,
  }));

  const createdResponse = await fetchImpl(url, {
    method: 'POST', headers, body: JSON.stringify({ submissions }), signal: AbortSignal.timeout(6_000),
  });
  if (!createdResponse.ok) throw new Error(`Execution provider rejected the batch (${createdResponse.status}).`);
  const created = await createdResponse.json();
  if (!Array.isArray(created) || created.length !== testCases.length
    || created.some((item) => !isRecord(item) || typeof item.token !== 'string' || !item.token || item.token.length > 200)) {
    throw new Error('Execution provider returned an invalid submission batch.');
  }
  const tokens = created.map((item) => item.token);
  const fields = 'token,stdout,stderr,compile_output,message,status,time,memory';
  const pollUrl = `${baseUrl.replace(/\/$/, '')}/submissions/batch?${new URLSearchParams({ tokens: tokens.join(','), base64_encoded: 'false', fields })}`;

  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    const response = await fetchImpl(pollUrl, { headers, signal: AbortSignal.timeout(6_000) });
    if (!response.ok) throw new Error(`Execution provider status check failed (${response.status}).`);
    const payload = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.submissions) || payload.submissions.length !== testCases.length) {
      throw new Error('Execution provider returned an invalid status batch.');
    }
    const results = payload.submissions;
    if (results.every((item) => isValidJudge0Submission(item) && TERMINAL_STATUSES.has(item.status.id))) {
      const byToken = new Map(results.map((item) => [item.token, item]));
      const ordered = tokens.map((token) => byToken.get(token));
      if (ordered.some((item) => !item)) throw new Error('Execution provider omitted a test result.');
      return testCases.map((testCase, index) => mapJudge0SubmissionToCase(testCase, ordered[index]));
    }
    await wait(500);
  }
  throw new Error('Execution provider timed out while waiting for test results.');
}
