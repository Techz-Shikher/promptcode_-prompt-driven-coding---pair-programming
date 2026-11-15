export type ProblemCategory = 'solve' | 'debug' | 'develop';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type SupportedLanguage = 'typescript' | 'python' | 'cpp' | 'java' | 'go';

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  label: string;
}

export interface TestCaseExecutionResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTimeMs: number;
  memoryMb: number;
  input: string;
  status: string;
}

export interface Problem {
  id: string;
  title: string;
  category: ProblemCategory;
  difficulty: Difficulty;
  acceptance: string;
  tags: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Record<SupportedLanguage, string>;
  buggyCode?: Record<SupportedLanguage, string>;
  testCases: TestCase[];
  recommendedPrompt: string;
  promptTips: string[];
  learningObjective: string;
  promptLearningTarget?: string;
  isCustom?: boolean;
  importedAt?: string;
  source?: string;
}

export interface ProblemPack {
  id: string;
  title: string;
  description: string;
  badge: string;
  category: ProblemCategory;
  tags: string[];
  problems: Problem[];
}

export interface StepExplanation {
  stepNumber: number;
  title: string;
  explanation: string;
  insight: string;
  dryRunState?: string;
}

export interface PromptExecutionResult {
  providerMetadata?: {
    requestedModel: string;
    modelVersion?: string;
    latencyMs: number;
    usage?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
  };
  promptScore: number;
  promptFeedback: string;
  promptStrengths: string[];
  promptImprovements: string[];
  steps: StepExplanation[];
  generatedCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityExplanation: string;
  suggestedTestCases: Array<{
    input: string;
    expected: string;
    purpose: string;
  }>;
}

export interface PromptDiagnosticIssue {
  severity: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  explanation: string;
  suggestedCorrection: string;
}

export interface PromptDiagnosticResult {
  summary: string;
  issues: PromptDiagnosticIssue[];
}

export interface PromptVersion {
  id: string;
  prompt: string;
  createdAt: string;
  qualityScore: number;
}

export interface CodeAnnotation {
  lineNumber: number;
  severity: 'suggestion' | 'warning' | 'error' | 'praise';
  title: string;
  comment: string;
  suggestedReplacement?: string;
}

export interface CodeReviewResult {
  overallScore: number;
  verdict: string;
  summary: string;
  ratings: {
    correctness: number;
    efficiency: number;
    readability: number;
    promptAlignment: number;
  };
  annotations: CodeAnnotation[];
  timeComplexity: string;
  spaceComplexity: string;
  promptEngineeringTip: string;
}

export interface CodeExplanationResult {
  summary: string;
  sections: Array<{ title: string; explanation: string }>;
  keyTerms: string[];
  caveats: string[];
}

export interface CodeDebugResult {
  summary: string;
  rootCause: string;
  findings: Array<{ lineNumber: number | null; severity: 'bug' | 'risk' | 'note'; title: string; explanation: string }>;
  suggestedFix: string;
  regressionTests: string[];
}

export interface GeneratedTestCasesResult {
  summary: string;
  testCases: Array<{ kind: 'example' | 'boundary' | 'edge' | 'adversarial'; name: string; input: string; expectedBehavior: string; rationale: string }>;
}

export interface PromptBenchmarkVariant {
  text: string;
  latencyMs: number;
  modelVersion?: string;
}

export type PromptBenchmarkDimension = 'correctness' | 'requirementCoverage' | 'clarity' | 'verification' | 'efficiency';
export interface PromptBenchmarkResult {
  requestedModel: string;
  variantA: PromptBenchmarkVariant;
  variantB: PromptBenchmarkVariant;
  evaluation: {
    summary: string;
    winner: 'A' | 'B' | 'tie';
    scores: Record<'A' | 'B', Record<PromptBenchmarkDimension, number>>;
    reasons: Record<'A' | 'B' | 'decision', string>;
    caveats: string[];
  };
  evaluationLatencyMs: number;
  totalLatencyMs: number;
  rubric: { scoreRange: string; dimensions: Record<PromptBenchmarkDimension, string>; evaluator: string };
  disclosure: string;
  usageMetadata?: Partial<Record<'A' | 'B' | 'evaluator', { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }>>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'peer' | 'ai';
  senderName: string;
  avatar: string;
  content: string;
  timestamp: string;
  isPromptSnippet?: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  role: 'Driver' | 'Navigator';
  cursorLine: number;
  status: 'active' | 'typing' | 'running_tests' | 'reviewing';
  color: string;
  avatar: string;
}

export interface PromptAcademyLesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'DSA' | 'Debugging' | 'Development' | 'Foundations';
  summary: string;
  keyPrinciples: string[];
  badPromptExample: string;
  whyItFails: string;
  elitePromptExample: string;
  whyItWins: string;
  practiceChallengeId: string;
}
