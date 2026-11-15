const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function isValidWorkflowSnapshot(value) {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length > 80
    || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 200
    || typeof value.problemId !== 'string' || value.problemId.length > 200
    || typeof value.problemTitle !== 'string' || value.problemTitle.length > 300
    || !['solve', 'debug', 'develop'].includes(value.mode)
    || typeof value.language !== 'string' || value.language.length > 40
    || typeof value.prompt !== 'string' || value.prompt.length > 20_000
    || typeof value.code !== 'string' || value.code.length > 100_000
    || !['active', 'paused', 'completed'].includes(value.status)
    || !Number.isInteger(value.currentStep) || value.currentStep < 0 || value.currentStep > 20
    || !Array.isArray(value.steps) || value.steps.length > 20
    || !value.steps.every((step) => isRecord(step) && typeof step.key === 'string' && step.key.length <= 80
      && ['pending', 'active', 'completed', 'failed'].includes(step.status)
      && (step.error === undefined || (typeof step.error === 'string' && step.error.length <= 4_000)))
    || !Array.isArray(value.runHistory) || value.runHistory.length > 50
    || !value.runHistory.every((run) => isValidWorkflowRun(run))) return false;
  try { return JSON.stringify(value).length <= 750_000; } catch { return false; }
}

export function isValidWorkflowRun(value) {
  return isRecord(value) && ['prompt', 'execution', 'review', 'assistant'].includes(value.kind)
    && ['completed', 'failed'].includes(value.status)
    && typeof value.startedAt === 'string' && Number.isFinite(Date.parse(value.startedAt))
    && typeof value.finishedAt === 'string' && Number.isFinite(Date.parse(value.finishedAt))
    && typeof value.summary === 'string' && value.summary.length <= 2_000
    && typeof value.error === 'string' && value.error.length <= 4_000
    && (value.metadata === undefined || (isRecord(value.metadata) && JSON.stringify(value.metadata).length <= 10_000));
}
