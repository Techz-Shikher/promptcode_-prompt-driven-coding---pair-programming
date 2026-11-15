const STORAGE_KEY = 'promptcode_workflows_v1';
export const MAX_WORKFLOW_RUNS = 50;

export function createWorkflowId() {
  return globalThis.crypto?.randomUUID?.() || `workflow-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isValidWorkflow(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && typeof value.id === 'string' && value.id.length <= 80
    && typeof value.title === 'string' && value.title.length > 0 && value.title.length <= 200
    && typeof value.problemId === 'string' && value.problemId.length <= 200
    && typeof value.problemTitle === 'string' && value.problemTitle.length <= 300
    && ['solve', 'debug', 'develop'].includes(value.mode)
    && typeof value.language === 'string' && value.language.length <= 40
    && typeof value.prompt === 'string' && value.prompt.length <= 20_000
    && typeof value.code === 'string' && value.code.length <= 100_000
    && ['active', 'paused', 'completed'].includes(value.status)
    && Number.isInteger(value.currentStep) && value.currentStep >= 0 && value.currentStep <= 20
    && Array.isArray(value.steps) && value.steps.length <= 20
    && value.steps.every((step) => step && typeof step.key === 'string' && step.key.length <= 80
      && ['pending', 'active', 'completed', 'failed'].includes(step.status)
      && (step.error === undefined || (typeof step.error === 'string' && step.error.length <= 4000)))
    && Array.isArray(value.runHistory) && value.runHistory.length <= MAX_WORKFLOW_RUNS
    && value.runHistory.every((run) => run && typeof run.id === 'string'
      && ['prompt', 'execution', 'review', 'assistant'].includes(run.kind)
      && ['completed', 'failed'].includes(run.status) && typeof run.startedAt === 'string'
      && typeof run.finishedAt === 'string' && typeof run.summary === 'string'
      && typeof run.error === 'string'
      && (run.metadata === undefined || (run.metadata && typeof run.metadata === 'object' && JSON.stringify(run.metadata).length <= 10_000)))
    && JSON.stringify(value).length <= 750_000;
}

export function loadWorkflows() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(isValidWorkflow).slice(0, 30) : [];
  } catch { return []; }
}

export function saveWorkflow(workflow) {
  if (!isValidWorkflow(workflow)) throw new Error('Workflow state is invalid or exceeds its field limits.');
  const workflows = loadWorkflows().filter((item) => item.id !== workflow.id);
  const updated = { ...workflow, updatedAt: new Date().toISOString() };
  const next = [updated, ...workflows].slice(0, 30);
  while (next.length > 1 && JSON.stringify(next).length > 4_000_000) next.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
}

export function appendWorkflowRun(workflow, run) {
  if (!workflow || !run || !['prompt', 'execution', 'review', 'assistant'].includes(run.kind)
    || !['completed', 'failed'].includes(run.status) || typeof run.startedAt !== 'string'
    || typeof run.finishedAt !== 'string' || typeof run.summary !== 'string' || run.summary.length > 2000
    || typeof run.error !== 'string' || run.error.length > 4000) throw new Error('Workflow run record is invalid.');
  return saveWorkflow({ ...workflow, runHistory: [...workflow.runHistory, { ...run, id: run.id || createWorkflowId() }].slice(-MAX_WORKFLOW_RUNS) });
}

export function deleteWorkflow(id) {
  const workflows = loadWorkflows().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  return workflows;
}
