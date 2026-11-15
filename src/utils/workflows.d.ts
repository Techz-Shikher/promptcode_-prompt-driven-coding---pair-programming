export interface WorkflowStep { key: string; status: 'pending' | 'active' | 'completed' | 'failed'; error?: string }
export interface WorkflowRun {
  id: string; kind: 'prompt' | 'execution' | 'review' | 'assistant'; status: 'completed' | 'failed';
  startedAt: string; finishedAt: string; summary: string; error: string; metadata?: Record<string, unknown>;
}
export interface WorkflowRecord {
  id: string; title: string; problemId: string; problemTitle: string; mode: 'solve' | 'debug' | 'develop';
  language: string; prompt: string; code: string; status: 'active' | 'paused' | 'completed';
  currentStep: number; steps: WorkflowStep[]; runHistory: WorkflowRun[]; updatedAt?: string;
  progress?: { executionResult?: unknown; testResults?: unknown; testCases?: unknown; aiGeneratedCode?: string | null; promptExecutionError?: string | null; testRunMessage?: string | null; reviewResult?: unknown; reviewError?: string | null };
}
export function createWorkflowId(): string;
export function isValidWorkflow(value: unknown): value is WorkflowRecord;
export function loadWorkflows(): WorkflowRecord[];
export function saveWorkflow(workflow: WorkflowRecord): WorkflowRecord;
export function appendWorkflowRun(workflow: WorkflowRecord, run: Omit<WorkflowRun, 'id'> & { id?: string }): WorkflowRecord;
export function deleteWorkflow(id: string): WorkflowRecord[];
