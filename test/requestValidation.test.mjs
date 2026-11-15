import test from 'node:test';
import assert from 'node:assert/strict';
import { hasValidStringFields, isValidChatMessages } from '../src/utils/requestValidation.js';
import { analyzePromptQuality } from '../src/utils/promptQuality.js';
import { isValidPromptExecutionResult, isValidPromptOptimizationResult, isValidCodeReviewResult, isValidImportedProblem, isValidCodeExplanationResult, isValidCodeDebugResult, isValidGeneratedTestCasesResult, isValidChatResponse, isValidPromptBenchmarkEvaluation, extractProviderUsage, isValidReadOnlySql, isValidSqlAssistantResult, isValidOpenApiContract, isValidApiAssistantResult } from '../src/utils/aiResponseValidation.js';
import { isValidPromptDiagnosticResult } from '../src/utils/aiResponseValidation.js';
import { diagnosePromptLocally } from '../src/utils/promptDiagnostics.js';
import { diffPromptVersions, loadPromptVersions, savePromptVersion } from '../src/utils/promptVersions.js';
import { JUDGE0_LANGUAGE_IDS, mapJudge0SubmissionToCase, normalizeProgramOutput, runJudge0Batch } from '../src/utils/judge0Execution.js';
import { hashPassword, hashSessionToken, readSessionToken, verifyPassword } from '../src/server/authCrypto.js';
import { decodePageCursor, encodePageCursor, parsePageRequest } from '../src/server/pagination.ts';
import { appendWorkflowRun, deleteWorkflow, loadWorkflows, saveWorkflow } from '../src/utils/workflows.js';
import { isValidWorkflowRun, isValidWorkflowSnapshot } from '../src/utils/workflowValidation.js';
import { generateKnapsackInstance, runClassicalBenchmark, solveKnapsackDynamicProgramming, solveKnapsackGreedy } from '../src/research/knapsackBench.ts';

test('accepts a non-empty list of bounded chat messages', () => {
  assert.equal(isValidChatMessages([{ sender: 'user', content: 'Help me debug this.' }]), true);
});

test('rejects missing, empty, and non-array message values', () => {
  assert.equal(isValidChatMessages(undefined), false);
  assert.equal(isValidChatMessages([]), false);
  assert.equal(isValidChatMessages({ content: 'not an array' }), false);
});

test('rejects malformed message entries and oversized content', () => {
  assert.equal(isValidChatMessages([null]), false);
  assert.equal(isValidChatMessages([{ content: 42 }]), false);
  assert.equal(isValidChatMessages([{ content: 'x'.repeat(10_001) }]), false);
});

test('rejects histories with more than 100 messages', () => {
  assert.equal(isValidChatMessages(Array.from({ length: 101 }, () => ({ content: 'x' }))), false);
});

test('validates required and optional request text fields and length limits', () => {
  assert.equal(hasValidStringFields({ prompt: 'Explain this.', language: 'python' }, { prompt: 100 }, { language: 40 }), true);
  assert.equal(hasValidStringFields({ prompt: '   ' }, { prompt: 100 }), false);
  assert.equal(hasValidStringFields({ prompt: 'x'.repeat(101) }, { prompt: 100 }), false);
  assert.equal(hasValidStringFields({ prompt: 'okay', language: null }, { prompt: 100 }, { language: 40 }), false);
});

test('prompt quality estimate is deterministic and returns a complete weighted breakdown', () => {
  const prompt = 'Implement a parser for this input. Return JSON with the result. Must handle empty input. Example: input [] output {}. Verify the expected behavior.';
  const first = analyzePromptQuality(prompt);
  const second = analyzePromptQuality(prompt);

  assert.deepEqual(first, second);
  assert.equal(first.overallScore, 90);
  assert.equal(Object.values(first.categoryScores).reduce((sum, category) => sum + category.weight, 0), 100);
  assert.match(first.methodology, /does not measure correctness/);
});

test('prompt quality identifies missing requirements and conflicting brevity/detail instructions', () => {
  const result = analyzePromptQuality('Be concise and comprehensive. Make it good and fast.');

  assert.ok(result.weaknesses.includes('Task clarity'));
  assert.ok(result.weaknesses.includes('Constraints'));
  assert.ok(result.weaknesses.includes('Output format'));
  assert.ok(result.weaknesses.includes('Consistency'));
  assert.ok(result.suggestions.length > 0);
});

test('AI response validators reject malformed or out-of-range structured results', () => {
  const execution = {
    promptScore: 80,
    promptFeedback: 'Clear task.',
    promptStrengths: ['Specific goal'],
    promptImprovements: ['Add an example'],
    steps: [{ stepNumber: 1, title: 'Plan', explanation: 'Describe the plan.', insight: 'Plan before coding.' }],
    generatedCode: 'function solve() {}',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'One pass.',
    suggestedTestCases: [{ input: '[]', expected: '[]', purpose: 'Empty case' }],
  };
  assert.equal(isValidPromptExecutionResult(execution), true);
  assert.equal(isValidPromptExecutionResult({ ...execution, promptScore: 120 }), false);
  assert.equal(isValidPromptExecutionResult({ ...execution, suggestedTestCases: [{ input: '[]', expected: '[]', passed: true }] }), false);

  assert.equal(isValidPromptOptimizationResult({ optimizedPrompt: 'Do this.', promptRating: 40, optimizedRating: 80, critique: 'Add context.', appliedTechniques: [], promptTemplateUsed: 'Context', changes: [{ aspect: 'Context', before: '', after: 'Add inputs.', reason: 'Defines what is provided.' }] }), true);
  assert.equal(isValidCodeReviewResult({
    overallScore: 80,
    verdict: 'Approved',
    summary: 'Looks good.',
    ratings: { correctness: 80, efficiency: 80, readability: 80, promptAlignment: 80 },
    annotations: [{ lineNumber: 1, severity: 'suggestion', title: 'Rename', comment: 'Use a clearer name.' }],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    promptEngineeringTip: 'Include edge cases.',
  }), true);

  assert.equal(isValidImportedProblem({
    id: 'valid-problem',
    title: 'Valid Problem',
    category: 'solve',
    difficulty: 'Easy',
    tags: ['Array'],
    description: 'Description',
    examples: [{ input: '[]', output: '[]' }],
    constraints: ['Small input'],
    starterCode: { typescript: '', python: '', cpp: '', java: '', go: '' },
    testCases: [{ id: 'tc1', input: '[]', expected: '[]', label: 'Empty' }],
    recommendedPrompt: 'Solve the problem.',
    promptTips: ['Add constraints.'],
    learningObjective: 'Learn the technique.',
    promptLearningTarget: 'State the invariant.',
  }), true);
});

test('local prompt debugger finds vague terms, contradictions, and missing response shape', () => {
  const result = diagnosePromptLocally('Make it fast and good. Be concise and comprehensive.');
  assert.ok(result.issues.some((issue) => issue.category === 'Specificity'));
  assert.ok(result.issues.some((issue) => issue.category === 'Consistency' && issue.severity === 'high'));
  assert.ok(result.issues.some((issue) => issue.category === 'Output format'));
  assert.ok(diagnosePromptLocally('').issues.some((issue) => issue.severity === 'high'));
});

test('AI prompt diagnostics schema accepts valid findings and rejects invalid severity', () => {
  const diagnostic = { summary: 'One conflict found.', issues: [{ severity: 'high', category: 'Consistency', issue: 'Conflicting length goals.', explanation: 'Both cannot be prioritized at once.', suggestedCorrection: 'Set a word limit.' }] };
  assert.equal(isValidPromptDiagnosticResult(diagnostic), true);
  assert.equal(isValidPromptDiagnosticResult({ ...diagnostic, issues: [{ ...diagnostic.issues[0], severity: 'urgent' }] }), false);
});

test('coding assistant and chat schemas validate dedicated bounded response contracts', () => {
  assert.equal(isValidCodeExplanationResult({ summary: 'Explains a loop.', sections: [{ title: 'Iteration', explanation: 'Visits each item once.' }], keyTerms: ['loop'], caveats: [] }), true);
  assert.equal(isValidCodeExplanationResult({ summary: 'x', sections: [], keyTerms: [], caveats: [] }), false);
  assert.equal(isValidCodeDebugResult({ summary: 'Possible bug.', rootCause: 'Index is not advanced.', findings: [{ lineNumber: 3, severity: 'bug', title: 'Stalled loop', explanation: 'The loop condition remains true.' }], suggestedFix: 'Increment the index.', regressionTests: ['Single item'] }), true);
  assert.equal(isValidCodeDebugResult({ summary: 'x', rootCause: 'y', findings: [{ lineNumber: 0, severity: 'bug', title: 'bad', explanation: 'bad' }], suggestedFix: '', regressionTests: [] }), false);
  assert.equal(isValidGeneratedTestCasesResult({ summary: 'Covers edges.', testCases: [{ kind: 'edge', name: 'Empty input', input: '[]', expectedBehavior: 'Return empty result.', rationale: 'Checks base case.' }] }), true);
  assert.equal(isValidGeneratedTestCasesResult({ summary: 'x', testCases: [] }), false);
  assert.equal(isValidChatResponse({ reply: 'Check the loop invariant.' }), true);
  assert.equal(isValidChatResponse({ reply: '' }), false);
});

test('Judge0 adapter enforces known language mapping, output comparison, and provider resource caps', async () => {
  assert.equal(JUDGE0_LANGUAGE_IDS.typescript, 74);
  assert.equal(normalizeProgramOutput('ok\r\n'), 'ok');
  const testCase = { id: 'tc1', input: '2 3', expected: '5\n' };
  const result = mapJudge0SubmissionToCase(testCase, {
    token: 'token-1', status: { id: 3, description: 'Accepted' }, stdout: '5\r\n', stderr: null,
    compile_output: null, message: null, time: '0.012', memory: 1024,
  });
  assert.equal(result.passed, true);
  assert.equal(result.executionTimeMs, 12);
  assert.equal(result.memoryMb, 1);

  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push({ url, options });
    if (options.method === 'POST') return { ok: true, json: async () => [{ token: 'token-1' }] };
    return { ok: true, json: async () => ({ submissions: [{ token: 'token-1', status: { id: 3, description: 'Accepted' }, stdout: '5', time: '0.01', memory: 2048 }] }) };
  };
  const results = await runJudge0Batch({ baseUrl: 'https://judge.example', authToken: 'server-secret', sourceCode: 'console.log(2 + 3)', language: 'typescript', testCases: [testCase], fetchImpl: fakeFetch, wait: async () => {} });
  const sent = JSON.parse(requests[0].options.body).submissions[0];
  assert.equal(sent.language_id, 74);
  assert.equal(sent.cpu_time_limit, 2);
  assert.equal(sent.wall_time_limit, 5);
  assert.equal(sent.memory_limit, 131072);
  assert.equal(requests[0].options.headers['X-Auth-Token'], 'server-secret');
  assert.equal(results[0].passed, true);
});

test('prompt benchmark evaluator requires bounded five-dimension scores and exposes only returned usage counts', () => {
  const dimensionScores = { correctness: 4, requirementCoverage: 4, clarity: 3, verification: 2, efficiency: 5 };
  const evaluation = {
    summary: 'A covers constraints more directly.', winner: 'X',
    scores: { X: dimensionScores, Y: { ...dimensionScores, correctness: 3 } },
    reasons: { X: 'Clear constraints.', Y: 'Missing an edge case.', decision: 'X is stronger on correctness.' },
    caveats: ['AI estimate only.'],
  };
  assert.equal(isValidPromptBenchmarkEvaluation(evaluation), true);
  assert.equal(isValidPromptBenchmarkEvaluation({ ...evaluation, scores: { ...evaluation.scores, X: { ...dimensionScores, clarity: 6 } } }), false);
  assert.deepEqual(extractProviderUsage({ promptTokenCount: 120, candidatesTokenCount: 55, totalTokenCount: 175 }), { promptTokenCount: 120, candidatesTokenCount: 55, totalTokenCount: 175 });
  assert.equal(extractProviderUsage(undefined), undefined);
  assert.deepEqual(extractProviderUsage({ promptTokenCount: 12, totalTokenCount: -1 }), { promptTokenCount: 12 });
});

test('account security uses salted password hashes and opaque hashed session tokens', async () => {
  const encoded = await hashPassword('a-strong-password-123');
  assert.match(encoded, /^scrypt\$32768\$8\$1\$/);
  assert.equal(await verifyPassword('a-strong-password-123', encoded), true);
  assert.equal(await verifyPassword('a-different-password', encoded), false);
  assert.notDeepEqual(hashSessionToken('opaque-session-token'), Buffer.from('opaque-session-token'));
  const token = 'A'.repeat(43);
  assert.equal(readSessionToken(`other=x; promptcode_session=${token}`), token);
  assert.equal(readSessionToken('promptcode_session=short'), null);
});

test('database pagination cursors are bounded, ordered continuations', () => {
  const cursor = { createdAt: '2026-11-12T10:00:00.000Z', id: '123e4567-e89b-42d3-a456-426614174000' };
  assert.deepEqual(decodePageCursor(encodePageCursor(cursor)), cursor);
  assert.deepEqual(parsePageRequest(new URLSearchParams('limit=20')), { limit: 20, cursor: null });
  assert.equal(parsePageRequest(new URLSearchParams('limit=101')), null);
  assert.equal(decodePageCursor('not-a-valid-cursor'), null);
});

test('prompt versions persist per problem, deduplicate, and produce an added/removed diff', () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    const first = savePromptVersion('two-sum', 'Solve Two Sum.');
    const duplicate = savePromptVersion('two-sum', 'Solve Two Sum.');
    savePromptVersion('two-sum', 'Solve Two Sum. Return a JSON array.');
    savePromptVersion('reverse-list', 'Reverse a linked list.');
    assert.equal(first.created, true);
    assert.equal(duplicate.created, false);
    assert.equal(loadPromptVersions('two-sum').length, 2);
    assert.equal(loadPromptVersions('reverse-list').length, 1);
    assert.deepEqual(diffPromptVersions('Solve Two Sum.', 'Solve Two Sum.\nReturn a JSON array.').added, ['Return a JSON array.']);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('workflow snapshots and failed runs validate, persist, resume, and delete', () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  };
  const workflow = {
    id: 'test-workflow', title: 'Two Sum', problemId: 'two-sum', problemTitle: 'Two Sum', mode: 'solve',
    language: 'typescript', prompt: 'Solve this problem.', code: 'function solve() {}', status: 'active',
    currentStep: 0, steps: [{ key: 'prompt', status: 'failed', error: 'Provider unavailable' }], runHistory: [],
  };
  try {
    const run = { kind: 'prompt', status: 'failed', startedAt: '2026-11-13T10:00:00.000Z', finishedAt: '2026-11-13T10:00:01.000Z', summary: 'Prompt run failed', error: 'Provider unavailable' };
    assert.equal(isValidWorkflowSnapshot(workflow), true);
    assert.equal(isValidWorkflowSnapshot({ ...workflow, progress: { oversized: 'x'.repeat(750_001) } }), false);
    assert.equal(isValidWorkflowRun(run), true);
    assert.equal(isValidWorkflowRun({ ...run, error: 'x'.repeat(4001) }), false);
    const withRun = appendWorkflowRun(workflow, run);
    saveWorkflow(withRun);
    assert.equal(loadWorkflows()[0].steps[0].status, 'failed');
    assert.equal(loadWorkflows()[0].runHistory[0].error, 'Provider unavailable');
    assert.equal(deleteWorkflow(workflow.id).length, 0);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('SQL assistant accepts one read-only query and rejects writes, locks, and multiple statements', () => {
  assert.equal(isValidReadOnlySql("WITH totals AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) SELECT * FROM totals ORDER BY total DESC LIMIT 5; -- read only"), true);
  assert.equal(isValidReadOnlySql("SELECT 'delete; update' AS note"), true);
  assert.equal(isValidReadOnlySql('INSERT INTO users(id) VALUES (1)'), false);
  assert.equal(isValidReadOnlySql('SELECT 1; DELETE FROM users'), false);
  assert.equal(isValidReadOnlySql('SELECT * FROM users FOR UPDATE'), false);
  assert.equal(isValidReadOnlySql('SELECT nextval(\'seq\')'), false);
  assert.equal(isValidReadOnlySql('SELECT pg_advisory_lock(1)'), false);
  assert.equal(isValidReadOnlySql('SELECT @x := 1'), false);
  assert.equal(isValidReadOnlySql('SELECT * FROM users INTO new_users'), false);
  assert.equal(isValidReadOnlySql("SELECT 'unfinished"), false);
  assert.equal(isValidSqlAssistantResult({ kind: 'sql', dialect: 'PostgreSQL', artifact: 'SELECT 1', explanation: 'Returns one row.', assumptions: [], warnings: [], indexSuggestions: [] }, 'PostgreSQL'), true);
  assert.equal(isValidSqlAssistantResult({ kind: 'sql', dialect: 'PostgreSQL', artifact: 'DROP TABLE users', explanation: 'bad', assumptions: [], warnings: [], indexSuggestions: [] }, 'PostgreSQL'), false);
});

test('API assistant validates bounded OpenAPI paths, operations, and responses', () => {
  const contract = { openapi: '3.1.0', info: { title: 'Tasks API', version: '1.0.0' }, paths: { '/tasks': { get: { summary: 'List tasks', responses: { '200': { description: 'Task list' } } } } } };
  assert.equal(isValidOpenApiContract(contract), true);
  assert.equal(isValidOpenApiContract({ ...contract, paths: { '/tasks': { get: { summary: '', responses: {} } } } }), false);
  assert.equal(isValidApiAssistantResult({ kind: 'openapi', contract, explanation: 'Lists tasks.', assumptions: [], warnings: [] }), true);
});

test('research knapsack generator is deterministic for a versioned seed', () => {
  assert.deepEqual(generateKnapsackInstance(731, 12), generateKnapsackInstance(731, 12));
  assert.notDeepEqual(generateKnapsackInstance(731, 12), generateKnapsackInstance(732, 12));
});

test('exact knapsack baseline matches exhaustive search and greedy never exceeds it', () => {
  const items = [
    { id: 0, weight: 2, value: 12 }, { id: 1, weight: 1, value: 10 },
    { id: 2, weight: 3, value: 20 }, { id: 3, weight: 2, value: 15 },
  ];
  const capacity = 5;
  let bruteForce = 0;
  for (let subset = 0; subset < 2 ** items.length; subset += 1) {
    let weight = 0;
    let value = 0;
    items.forEach((item, index) => { if (subset & (1 << index)) { weight += item.weight; value += item.value; } });
    if (weight <= capacity) bruteForce = Math.max(bruteForce, value);
  }
  const exact = solveKnapsackDynamicProgramming(items, capacity);
  const greedy = solveKnapsackGreedy(items, capacity);
  assert.equal(exact, bruteForce);
  assert.ok(greedy <= exact);
});

test('classical benchmark report can be reproduced from seed and input fingerprint', () => {
  const first = runClassicalBenchmark(2026, 40, 120);
  const second = runClassicalBenchmark(2026, 40, 120);
  assert.equal(first.algorithmVersion, 'classical-knapsack-v1');
  assert.equal(first.itemsChecksum, second.itemsChecksum);
  assert.equal(first.baseline.value, second.baseline.value);
  assert.equal(first.heuristic.value, second.heuristic.value);
  assert.ok(first.baseline.medianMs >= 0);
  assert.ok(first.heuristic.medianMs >= 0);
  assert.ok(first.optimalityGapPercent >= 0);
});
