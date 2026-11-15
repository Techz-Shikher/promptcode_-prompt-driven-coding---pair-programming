const ACTION = /\b(build|create|write|implement|explain|debug|analy[sz]e|solve|review|generate|compare|design|optimi[sz]e)\b/i;
const REQUIREMENT = /\b(must|must not|should|avoid|only|within|under|limit|constraint|time complexity|space complexity|o\s*\(|acceptance criteria|success criteria|verify|test case|expected behavior)\b/i;
const FORMAT = /\b(output|format|return|respond|provide|include|json|markdown|bullet|table|code block)\b/i;
const VAGUE = /\b(good|better|fast|efficient|clean|appropriate|as needed|somehow|etc\.?|and so on)\b/gi;

/**
 * @param {string} input
 * @returns {import('../types').PromptDiagnosticResult}
 */
export function diagnosePromptLocally(input) {
  const prompt = typeof input === 'string' ? input.trim() : '';
  const issues = [];

  if (!prompt) {
    issues.push({
      severity: 'high', category: 'Task clarity', issue: 'No task was provided.',
      explanation: 'The model has no instruction to act on.',
      suggestedCorrection: 'State the action you want and what result you expect.',
    });
  } else {
    if (!ACTION.test(prompt)) {
      issues.push({
        severity: 'high', category: 'Task clarity', issue: 'The requested action is unclear.',
        explanation: 'The prompt does not contain a clear task verb such as implement, explain, debug, or compare.',
        suggestedCorrection: 'Start with a specific action and name the target.',
      });
    }
    if (prompt.length < 35) {
      issues.push({
        severity: 'medium', category: 'Context', issue: 'The prompt contains little context.',
        explanation: 'A short prompt may omit relevant input, existing behavior, or constraints.',
        suggestedCorrection: 'Add the relevant background, inputs, and current state.',
      });
    }
    const vagueTerms = [...new Set(prompt.match(VAGUE) || [])];
    if (vagueTerms.length) {
      issues.push({
        severity: 'medium', category: 'Specificity', issue: `Vague wording: ${vagueTerms.join(', ')}.`,
        explanation: 'These terms do not define observable or measurable behavior.',
        suggestedCorrection: 'Replace them with concrete limits, examples, or acceptance criteria.',
      });
    }
    if (!REQUIREMENT.test(prompt)) {
      issues.push({
        severity: 'low', category: 'Constraints', issue: 'No explicit constraints or acceptance criteria were detected.',
        explanation: 'The response may choose assumptions about edge cases, complexity, or what counts as done.',
        suggestedCorrection: 'Add constraints, edge cases, or a way to verify the result.',
      });
    }
    if (!FORMAT.test(prompt)) {
      issues.push({
        severity: 'low', category: 'Output format', issue: 'The expected response format is unspecified.',
        explanation: 'The response structure may not match what you need to use it.',
        suggestedCorrection: 'Name the desired format, such as code plus explanation or a JSON object.',
      });
    }
    if (/\b(be concise|brief)\b/i.test(prompt) && /\b(comprehensive|exhaustive|in detail)\b/i.test(prompt)) {
      issues.push({
        severity: 'high', category: 'Consistency', issue: 'The prompt asks for both brevity and exhaustive detail.',
        explanation: 'The output cannot reliably satisfy both competing length requirements.',
        suggestedCorrection: 'Set a priority or bound, such as “under 300 words, covering these three points.”',
      });
    }
  }

  return {
    summary: issues.length ? `Local checks found ${issues.length} potential issue${issues.length === 1 ? '' : 's'}.` : 'Local checks found no common prompt issues.',
    issues,
  };
}
