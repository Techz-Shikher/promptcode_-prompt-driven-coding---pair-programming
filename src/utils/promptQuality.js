const SIGNALS = {
  task: /\b(build|create|write|implement|explain|debug|analy[sz]e|solve|review|generate|compare|design|optimi[sz]e)\b/i,
  context: /\b(context|background|currently|existing|given|using|for the|in the|problem|code|system)\b/i,
  constraints: /\b(must|must not|should|avoid|only|within|under|limit|constraint|time complexity|space complexity|o\s*\()/i,
  output: /\b(output|format|return|respond|provide|include|json|markdown|bullet|table|code block)\b/i,
  example: /\b(example|for instance|e\.g\.|sample input|sample output)\b/i,
  acceptance: /\b(acceptance criteria|success criteria|definition of done|verify|assert|test case|expected behavior|correctness)\b/i,
  vague: /\b(good|better|fast|efficient|clean|appropriate|as needed|somehow|etc\.?|and so on)\b/i,
};

const CATEGORIES = [
  ['taskClarity', 'Task clarity', 20],
  ['contextCompleteness', 'Context completeness', 15],
  ['specificity', 'Specificity', 15],
  ['constraints', 'Constraints', 15],
  ['outputFormat', 'Output format', 10],
  ['examples', 'Examples', 5],
  ['acceptanceCriteria', 'Acceptance criteria', 10],
  ['ambiguity', 'Ambiguity', 5],
  ['consistency', 'Consistency', 5],
];

/**
 * Produce a transparent, deterministic prompt-quality estimate.
 * This is a rule-based heuristic, not an AI judgment or measured outcome.
 * @param {string} input
 */
export function analyzePromptQuality(input) {
  const prompt = typeof input === 'string' ? input.trim() : '';
  const words = prompt.match(/\S+/g) || [];
  const scores = {
    taskClarity: !prompt ? 0 : SIGNALS.task.test(prompt) ? 100 : 35,
    contextCompleteness: !prompt ? 0 : Math.min(100, 25 + (prompt.length >= 80 ? 25 : 0) + (SIGNALS.context.test(prompt) ? 25 : 0) + (words.length >= 25 ? 25 : 0)),
    specificity: !prompt ? 0 : Math.min(100, 25 + Math.min(50, Math.floor(words.length / 8) * 10) + (/[\d`{}()[\]]/.test(prompt) ? 25 : 0)),
    constraints: !prompt ? 0 : SIGNALS.constraints.test(prompt) ? 100 : 25,
    outputFormat: !prompt ? 0 : SIGNALS.output.test(prompt) ? 100 : 25,
    examples: !prompt ? 0 : SIGNALS.example.test(prompt) ? 100 : 0,
    acceptanceCriteria: !prompt ? 0 : SIGNALS.acceptance.test(prompt) ? 100 : 20,
    ambiguity: !prompt ? 0 : Math.max(0, 100 - (prompt.match(new RegExp(SIGNALS.vague.source, 'gi')) || []).length * 25),
    consistency: !prompt ? 0 : /\b(be concise|brief)\b/i.test(prompt) && /\b(comprehensive|exhaustive|in detail)\b/i.test(prompt) ? 40 : 100,
  };
  const overallScore = Math.round(CATEGORIES.reduce((total, [key, , weight]) => total + scores[key] * weight / 100, 0));
  const weaknesses = CATEGORIES
    .filter(([key]) => scores[key] < 60)
    .map(([, label]) => label);
  const suggestionsByCategory = {
    taskClarity: 'State the action and the result you want.',
    contextCompleteness: 'Add the relevant background, inputs, or existing code.',
    specificity: 'Name the concrete behavior, scope, or target conditions.',
    constraints: 'State limits, requirements, or approaches to avoid.',
    outputFormat: 'Specify the structure or format of the response.',
    examples: 'Add a representative input/output example when useful.',
    acceptanceCriteria: 'Define how you will judge the result as correct or complete.',
    ambiguity: 'Replace vague words with measurable or observable requirements.',
    consistency: 'Resolve instructions that ask for conflicting levels of detail.',
  };
  const suggestions = weaknesses.map((weakness) => {
    const category = CATEGORIES.find(([, label]) => label === weakness);
    return category ? suggestionsByCategory[category[0]] : '';
  });

  return {
    overallScore,
    categoryScores: Object.fromEntries(CATEGORIES.map(([key, , weight]) => [key, { score: scores[key], weight }])),
    weaknesses,
    suggestions,
    methodology: 'Deterministic text-signal heuristic. Category scores use the displayed weights; this estimate does not measure correctness or predict model output quality.',
  };
}
