export interface ProblemProgress {
  passedCount: number;
  totalCount: number;
  isCompleted: boolean;
}

const STORAGE_KEY = 'promptcode_problem_progress_v2';

export const DEFAULT_PROBLEM_PROGRESS: Record<string, ProblemProgress> = {};

export function loadStoredProblemProgress(): Record<string, ProblemProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROBLEM_PROGRESS;
    return { ...DEFAULT_PROBLEM_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROBLEM_PROGRESS;
  }
}

export function saveStoredProblemProgress(progress: Record<string, ProblemProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // no-op
  }
}
