const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value) => typeof value === 'string';
const isStringArray = (value) => Array.isArray(value) && value.every(isString);
const isScore = (value) => Number.isFinite(value) && value >= 0 && value <= 100;

export function isValidPromptExecutionResult(value) {
  return isRecord(value)
    && isScore(value.promptScore)
    && isBoundedString(value.promptFeedback, 2_000)
    && isBoundedStringArray(value.promptStrengths, 20, 500)
    && isBoundedStringArray(value.promptImprovements, 20, 500)
    && Array.isArray(value.steps)
    && value.steps.length > 0
    && value.steps.length <= 30
    && value.steps.every((step) => isRecord(step)
      && Number.isInteger(step.stepNumber)
      && isBoundedString(step.title, 300)
      && isBoundedString(step.explanation, 5_000)
      && isBoundedString(step.insight, 2_000))
    && isBoundedString(value.generatedCode, 100_000)
    && isBoundedString(value.timeComplexity, 300)
    && isBoundedString(value.spaceComplexity, 300)
    && isBoundedString(value.complexityExplanation, 3_000)
    && Array.isArray(value.suggestedTestCases)
    && value.suggestedTestCases.length <= 30
    && value.suggestedTestCases.every((testCase) => isRecord(testCase)
      && isBoundedString(testCase.input, 4_000)
      && isBoundedString(testCase.expected, 4_000)
      && isBoundedString(testCase.purpose, 500));
}

export function isValidPromptOptimizationResult(value) {
  return isRecord(value)
    && isBoundedString(value.optimizedPrompt, 20_000)
    && isScore(value.promptRating)
    && isScore(value.optimizedRating)
    && isBoundedString(value.critique, 4_000)
    && isBoundedStringArray(value.appliedTechniques, 30, 500)
    && isBoundedString(value.promptTemplateUsed, 1_000)
    && Array.isArray(value.changes)
    && value.changes.length <= 20
    && value.changes.every((change) => isRecord(change)
      && isString(change.aspect)
      && change.aspect.length <= 120
      && isString(change.before)
      && change.before.length <= 2_000
      && isString(change.after)
      && change.after.length <= 2_000
      && isString(change.reason)
      && change.reason.length <= 1_000);
}

export function isValidPromptDiagnosticResult(value) {
  return isRecord(value)
    && isString(value.summary)
    && value.summary.length <= 1_000
    && Array.isArray(value.issues)
    && value.issues.length <= 30
    && value.issues.every((issue) => isRecord(issue)
      && ['high', 'medium', 'low'].includes(issue.severity)
      && isString(issue.category)
      && issue.category.length <= 120
      && isString(issue.issue)
      && issue.issue.length <= 1_000
      && isString(issue.explanation)
      && issue.explanation.length <= 2_000
      && isString(issue.suggestedCorrection)
      && issue.suggestedCorrection.length <= 2_000);
}

const isBoundedString = (value, max = 10_000) => isString(value) && value.length <= max;
const isBoundedStringArray = (value, maxItems, maxLength) => Array.isArray(value)
  && value.length <= maxItems && value.every((item) => isBoundedString(item, maxLength));
export function isValidCodeExplanationResult(value) {
  return isRecord(value) && isBoundedString(value.summary, 2_000)
    && Array.isArray(value.sections) && value.sections.length >= 1 && value.sections.length <= 20
    && value.sections.every((item) => isRecord(item) && isBoundedString(item.title, 160) && isBoundedString(item.explanation, 4_000))
    && isStringArray(value.keyTerms) && value.keyTerms.length <= 30 && value.keyTerms.every((item) => item.length <= 200)
    && isStringArray(value.caveats) && value.caveats.length <= 20 && value.caveats.every((item) => item.length <= 1_000);
}

export function isValidCodeDebugResult(value) {
  return isRecord(value) && isBoundedString(value.summary, 2_000) && isBoundedString(value.rootCause, 4_000)
    && Array.isArray(value.findings) && value.findings.length <= 30
    && value.findings.every((item) => isRecord(item) && (item.lineNumber === null || (Number.isInteger(item.lineNumber) && item.lineNumber > 0))
      && ['bug', 'risk', 'note'].includes(item.severity) && isBoundedString(item.title, 200) && isBoundedString(item.explanation, 2_000))
    && isBoundedString(value.suggestedFix, 10_000) && isStringArray(value.regressionTests)
    && value.regressionTests.length <= 20 && value.regressionTests.every((item) => item.length <= 1_000);
}

export function isValidGeneratedTestCasesResult(value) {
  return isRecord(value) && isBoundedString(value.summary, 2_000)
    && Array.isArray(value.testCases) && value.testCases.length >= 1 && value.testCases.length <= 30
    && value.testCases.every((item) => isRecord(item) && ['example', 'boundary', 'edge', 'adversarial'].includes(item.kind)
      && isBoundedString(item.name, 160) && isBoundedString(item.input, 4_000)
      && isBoundedString(item.expectedBehavior, 2_000) && isBoundedString(item.rationale, 1_000));
}

export function isValidChatResponse(value) {
  return isRecord(value) && isBoundedString(value.reply, 4_000) && value.reply.trim().length > 0;
}

export function isValidReadOnlySql(sql) {
  if (typeof sql !== 'string' || !sql.trim() || sql.length > 30_000) return false;
  let visible = '';
  let state = 'normal';
  let blockDepth = 0;
  let dollarTag = '';
  let semicolonIndex = -1;
  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];
    if (state === 'line') { if (char === '\n') { state = 'normal'; visible += ' '; } continue; }
    if (state === 'block') {
      if (char === '/' && next === '*') { blockDepth += 1; i += 1; }
      else if (char === '*' && next === '/') { blockDepth -= 1; i += 1; if (!blockDepth) { state = 'normal'; visible += ' '; } }
      continue;
    }
    if (state === 'dollar') { if (sql.startsWith(dollarTag, i)) { i += dollarTag.length - 1; state = 'normal'; visible += ' '; } continue; }
    if (state === 'single' || state === 'double' || state === 'backtick' || state === 'bracket') {
      const close = state === 'single' ? "'" : state === 'double' ? '"' : state === 'backtick' ? '`' : ']';
      if (char === close) {
        if (next === close && state !== 'bracket') i += 1;
        else { state = 'normal'; visible += ' '; }
      } else if (char === '\\' && state === 'single' && next) i += 1;
      continue;
    }
    if (char === '-' && next === '-') { state = 'line'; i += 1; continue; }
    if (char === '/' && next === '*') { state = 'block'; blockDepth = 1; i += 1; continue; }
    if (char === "'") { state = 'single'; visible += ' '; continue; }
    if (char === '"') { state = 'double'; visible += ' '; continue; }
    if (char === '`') { state = 'backtick'; visible += ' '; continue; }
    if (char === '[') { state = 'bracket'; visible += ' '; continue; }
    if (char === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) { dollarTag = match[0]; state = 'dollar'; i += dollarTag.length - 1; visible += ' '; continue; }
    }
    if (char === ';') {
      if (semicolonIndex >= 0) return false;
      semicolonIndex = visible.length;
    }
    visible += char;
  }
  if (['single', 'double', 'backtick', 'bracket', 'block', 'dollar'].includes(state)) return false;
  if ((semicolonIndex >= 0 && visible.slice(semicolonIndex + 1).trim()) || visible.includes(':=')) return false;
  const tokens = visible.match(/[A-Za-z_][A-Za-z0-9_$]*/g)?.map((token) => token.toUpperCase()) || [];
  if (!['SELECT', 'WITH'].includes(tokens[0])) return false;
  const forbidden = new Set(['INSERT', 'UPDATE', 'DELETE', 'MERGE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'GRANT', 'REVOKE', 'COPY', 'CALL', 'DO', 'EXECUTE', 'VACUUM', 'ANALYZE', 'REFRESH', 'INTO']);
  if (tokens.some((token) => forbidden.has(token))) return false;
  for (let i = 0; i < tokens.length - 1; i += 1) if (tokens[i] === 'FOR' && ['UPDATE', 'SHARE', 'NO'].includes(tokens[i + 1])) return false;
  const sideEffectFunctions = new Set(['NEXTVAL', 'SETVAL', 'PG_SLEEP', 'PG_TERMINATE_BACKEND', 'PG_CANCEL_BACKEND', 'PG_ADVISORY_LOCK', 'PG_ADVISORY_XACT_LOCK', 'PG_NOTIFY', 'PG_LOGICAL_EMIT_MESSAGE', 'PG_STAT_RESET', 'PG_CREATE_RESTORE_POINT', 'PG_RELOAD_CONF', 'PG_ROTATE_LOGFILE', 'SET_CONFIG', 'LO_CREATE', 'LO_UNLINK', 'LO_IMPORT', 'LO_EXPORT', 'DBLINK_EXEC', 'LOAD_EXTENSION', 'READFILE', 'WRITEFILE', 'GET_LOCK', 'RELEASE_LOCK', 'SLEEP', 'BENCHMARK', 'LAST_INSERT_ID']);
  return !tokens.some((token) => sideEffectFunctions.has(token));
}

export function isValidSqlAssistantResult(value, dialect) {
  return isRecord(value) && value.kind === 'sql' && value.dialect === dialect
    && isValidReadOnlySql(value.artifact) && isBoundedString(value.explanation, 6_000)
    && isBoundedStringArray(value.assumptions, 30, 1_000)
    && isBoundedStringArray(value.warnings, 30, 1_000)
    && isBoundedStringArray(value.indexSuggestions, 20, 1_000);
}

export function isValidOpenApiContract(value) {
  if (!isRecord(value) || !/^3\.[01]\.\d+$/.test(value.openapi) || !isRecord(value.info)
    || !isBoundedString(value.info.title, 200) || !value.info.title.trim()
    || !isBoundedString(value.info.version, 80) || !value.info.version.trim()
    || !isRecord(value.paths) || Object.keys(value.paths).length < 1 || Object.keys(value.paths).length > 60) return false;
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
  return Object.entries(value.paths).every(([path, pathItem]) => {
    if (!path.startsWith('/') || path.length > 300 || !isRecord(pathItem)) return false;
    if (pathItem.parameters !== undefined && (!Array.isArray(pathItem.parameters) || pathItem.parameters.length > 30
      || !pathItem.parameters.every((parameter) => isRecord(parameter) && isBoundedString(parameter.name, 120)
        && ['query', 'path', 'header', 'cookie'].includes(parameter.in)
        && (parameter.required === undefined || typeof parameter.required === 'boolean')
        && isRecord(parameter.schema)))) return false;
    const operations = Object.entries(pathItem).filter(([key]) => methods.has(key));
    if (!operations.length || operations.length > methods.size) return false;
    return operations.every(([, operation]) => isRecord(operation)
      && isBoundedString(operation.summary, 300) && operation.summary.trim().length > 0
      && (operation.description === undefined || isBoundedString(operation.description, 3_000))
      && (operation.operationId === undefined || isBoundedString(operation.operationId, 120))
      && isRecord(operation.responses) && Object.keys(operation.responses).length >= 1 && Object.keys(operation.responses).length <= 30
      && Object.entries(operation.responses).every(([code, response]) => /^(default|[1-5][0-9]{2})$/.test(code)
        && isRecord(response) && isBoundedString(response.description, 1_000))
      && (operation.parameters === undefined || (Array.isArray(operation.parameters) && operation.parameters.length <= 30))
      && (operation.requestBody === undefined || isRecord(operation.requestBody)));
  }) && JSON.stringify(value).length <= 500_000;
}

export function isValidApiAssistantResult(value) {
  return isRecord(value) && value.kind === 'openapi' && isValidOpenApiContract(value.contract)
    && isBoundedString(value.explanation, 6_000)
    && isBoundedStringArray(value.assumptions, 30, 1_000)
    && isBoundedStringArray(value.warnings, 30, 1_000);
}

const BENCHMARK_DIMENSIONS = ['correctness', 'requirementCoverage', 'clarity', 'verification', 'efficiency'];
export function isValidPromptBenchmarkEvaluation(value) {
  const validScores = (scores) => isRecord(scores)
    && BENCHMARK_DIMENSIONS.every((key) => Number.isFinite(scores[key]) && scores[key] >= 0 && scores[key] <= 5);
  return isRecord(value) && isBoundedString(value.summary, 2_000)
    && ['X', 'Y', 'tie'].includes(value.winner)
    && isRecord(value.scores) && validScores(value.scores.X) && validScores(value.scores.Y)
    && isRecord(value.reasons) && isBoundedString(value.reasons.X, 2_000) && isBoundedString(value.reasons.Y, 2_000)
    && isBoundedString(value.reasons.decision, 2_000)
    && isBoundedStringArray(value.caveats, 20, 1_000);
}

export function extractProviderUsage(usageMetadata) {
  if (!isRecord(usageMetadata)) return undefined;
  const usage = {};
  for (const key of ['promptTokenCount', 'candidatesTokenCount', 'totalTokenCount']) {
    const value = usageMetadata[key];
    if (Number.isInteger(value) && value >= 0) usage[key] = value;
  }
  return Object.keys(usage).length ? usage : undefined;
}

export function isValidCodeReviewResult(value) {
  return isRecord(value)
    && isScore(value.overallScore)
    && isBoundedString(value.verdict, 300)
    && isBoundedString(value.summary, 3_000)
    && isRecord(value.ratings)
    && ['correctness', 'efficiency', 'readability', 'promptAlignment'].every((key) => isScore(value.ratings[key]))
    && Array.isArray(value.annotations)
    && value.annotations.length <= 100
    && value.annotations.every((annotation) => isRecord(annotation)
      && Number.isInteger(annotation.lineNumber)
      && annotation.lineNumber > 0
      && ['suggestion', 'warning', 'error', 'praise'].includes(annotation.severity)
      && isBoundedString(annotation.title, 300)
      && isBoundedString(annotation.comment, 2_000)
      && (annotation.suggestedReplacement === undefined || isBoundedString(annotation.suggestedReplacement, 10_000)))
    && isBoundedString(value.timeComplexity, 300)
    && isBoundedString(value.spaceComplexity, 300)
    && isBoundedString(value.promptEngineeringTip, 2_000);
}

export function isValidImportedProblem(value) {
  const languages = ['typescript', 'python', 'cpp', 'java', 'go'];
  return isRecord(value)
    && isBoundedString(value.title, 300)
    && value.title.trim().length > 0
    && ['solve', 'debug', 'develop'].includes(value.category)
    && ['Easy', 'Medium', 'Hard'].includes(value.difficulty)
    && isBoundedStringArray(value.tags, 30, 100)
    && isBoundedString(value.description, 20_000)
    && Array.isArray(value.examples)
    && value.examples.length <= 30
    && value.examples.every((example) => isRecord(example) && isBoundedString(example.input, 4_000) && isBoundedString(example.output, 4_000)
      && (example.explanation === undefined || isBoundedString(example.explanation, 2_000)))
    && Array.isArray(value.constraints)
    && value.constraints.length <= 100
    && value.constraints.every((item) => isBoundedString(item, 1_000))
    && isRecord(value.starterCode)
    && languages.every((language) => isBoundedString(value.starterCode[language], 20_000))
    && Array.isArray(value.testCases)
    && value.testCases.length <= 100
    && value.testCases.every((testCase) => isRecord(testCase)
      && isBoundedString(testCase.input, 4_000)
      && isBoundedString(testCase.expected, 4_000)
      && isBoundedString(testCase.label, 200))
    && isBoundedString(value.recommendedPrompt, 10_000)
    && isBoundedStringArray(value.promptTips, 30, 1_000)
    && isBoundedString(value.learningObjective, 2_000)
    && isBoundedString(value.promptLearningTarget, 2_000);
}
