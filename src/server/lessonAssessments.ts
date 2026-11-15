export const LESSON_ASSESSMENTS: Record<string, Array<{ question: string; options: string[]; answer: number; explanation: string }>> = {
  'lesson-1-foundations': [
    { question: 'Which detail makes a coding prompt easiest to verify?', options: ['A request for elegant code', 'Input bounds and an explicit output contract', 'A longer role description'], answer: 1, explanation: 'Input bounds and the output contract make requirements testable.' },
    { question: 'Why state a complexity target?', options: ['It rules out unsuitable approaches and sets a measurable constraint', 'It guarantees the code compiles', 'It replaces edge-case requirements'], answer: 0, explanation: 'A complexity target constrains the algorithm but does not replace correctness requirements.' },
    { question: 'What should an edge-case requirement do?', options: ['Ask for defensive code generally', 'Name concrete boundary inputs and expected behavior', 'Avoid discussing empty inputs'], answer: 1, explanation: 'Concrete boundary cases let the response be checked.' },
  ],
  'lesson-2-dsa-prompting': [
    { question: 'What is the purpose of an invariant in an algorithm explanation?', options: ['State a property that remains true as the algorithm progresses', 'List the programming language features used', 'Describe only the final output'], answer: 0, explanation: 'An invariant gives a correctness argument throughout the algorithm.' },
    { question: 'Which order best supports a rigorous solution?', options: ['Code, then guess complexity', 'Observations, algorithm, correctness, complexity, pitfalls', 'Complexity, code, then input contract'], answer: 1, explanation: 'The explanation builds from reasoning through implementation and verification.' },
    { question: 'How should complexity be reported?', options: ['Give a bound and identify the input size it uses', 'Say “fast” when it passes examples', 'Report only memory use'], answer: 0, explanation: 'A useful complexity claim names the bound and relevant input size.' },
  ],
  'lesson-3-debugging-prompting': [
    { question: 'What information most helps isolate a bug?', options: ['Expected and actual behavior with a reproducing input', 'A request to rewrite the module', 'Only the language name'], answer: 0, explanation: 'A reproducible mismatch narrows the cause and supports regression checks.' },
    { question: 'Why ask for a minimal fix?', options: ['It limits unrelated changes and makes review easier', 'It prevents adding regression tests', 'It guarantees the original design is correct'], answer: 0, explanation: 'A focused change reduces the surface area for new regressions.' },
    { question: 'What should follow a proposed bug fix?', options: ['A claim that it works', 'A regression case that reproduces the original failure', 'A change to unrelated formatting'], answer: 1, explanation: 'A targeted regression case checks the reported failure stays fixed.' },
  ],
  'lesson-4-development-prompting': [
    { question: 'Why define interfaces before implementation?', options: ['They clarify boundaries and expected behavior', 'They remove the need for validation', 'They make integration tests unnecessary'], answer: 0, explanation: 'A contract makes the module boundary clear before details are built.' },
    { question: 'Which requirement helps avoid resource leaks?', options: ['Specify cleanup and unsubscribe behavior', 'Use a background timer everywhere', 'Keep callbacks undocumented'], answer: 0, explanation: 'Explicit cleanup defines who releases resources and when.' },
    { question: 'What makes a self-test request useful?', options: ['Include expected behavior for normal and adversarial cases', 'Ask for many tests without inputs', 'Ask the model to guarantee no bugs'], answer: 0, explanation: 'Concrete cases make generated checks reviewable.' },
  ],
};

export const LESSON_IDS = Object.keys(LESSON_ASSESSMENTS);

export function getDailyChallenge(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  const lessonId = LESSON_IDS[((day % LESSON_IDS.length) + LESSON_IDS.length) % LESSON_IDS.length];
  return { date: date.toISOString().slice(0, 10), lessonId };
}
