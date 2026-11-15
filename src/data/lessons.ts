import { PromptAcademyLesson } from '../types';

export const PROMPT_ACADEMY_LESSONS: PromptAcademyLesson[] = [
  {
    id: 'lesson-1-foundations',
    title: 'The 5-Pillar Matrix: Anatomy of a Flawless Coding Prompt',
    level: 'Beginner',
    category: 'Foundations',
    summary: 'Master the fundamental formula that separates generic buggy AI code from optimal, production-ready solutions on the very first try.',
    keyPrinciples: [
      'Role & Persona Anchoring (e.g. "Act as an ICPC Grandmaster / Staff Infrastructure Architect")',
      'Input/Output Contract (Explicit type signatures, bounds, and immutability rules)',
      'Target Complexity Constraints (Specify Big-O time and space to eliminate brute-force loops)',
      'Boundary Invariant Definition (Zero values, negative numbers, duplicates, empty collections)',
      'Chain-of-Thought Enforcer ("Explain the algorithmic invariant and dry-run before writing code")'
    ],
    badPromptExample: 'Solve Two Sum in TypeScript please.',
    whyItFails: 'Too vague. The AI will often output an O(N²) nested loop or basic brute force, lacks null checks, does not define distinct index guarantees, and provides no insight into the thought process.',
    elitePromptExample: 'Act as a Senior Competitive Programmer. Solve Two Sum in TypeScript with optimal O(N) time and O(N) space using a single-pass Hash Map. First explain the lookup invariant, dry-run with negative numbers and duplicate complements, then write the clean, typed function with defensive edge checks.',
    whyItWins: 'Forces the model into optimal linear time, prevents self-pairing index bugs, and demands a step-by-step invariant trace before implementation.',
    practiceChallengeId: 'two-sum'
  },
  {
    id: 'lesson-2-dsa-prompting',
    title: 'The Canonical 7-Section DSA Prompt Standard: From Invariants to Proof',
    level: 'Intermediate',
    category: 'DSA',
    summary: 'Master the rigorous 7-section prompt format used by top competitive programmers and software architects: Restating, Technique, Observations, Algorithm, Correctness, Complexity, and Pitfalls.',
    keyPrinciples: [
      '1. Restating the problem: Clarify parameters, return contracts, and domain constraints upfront',
      '2. Naming the technique: Specify the exact paradigm (e.g. Dynamic Programming, Sliding Window, Monotonic Stack)',
      '3. Key observations: Derive the fundamental invariants and structural insights',
      '4. The algorithm: Demand a high-level procedural walkthrough before code',
      '5. Correctness arguments: Prove correctness via loop invariants or inductive steps',
      '6. Complexity analyses: Big-O Time & Space Complexity with tight bounds',
      '7. Potential pitfalls: Expose boundary traps, duplicate handling, and overflow'
    ],
    badPromptExample: 'How to find the longest substring without repeating characters in javascript? Give me code.',
    whyItFails: 'Produces naive string slicing that runs in O(N³) or O(N²), lacks edge case verification, skips algorithm design, and causes Time Limit Exceeded (TLE) on competitive platforms.',
    elitePromptExample: 'Solve the DSA question "Longest Substring Without Repeating Characters" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
    whyItWins: 'Directs the model through the complete theoretical and algorithmic lifecycle, ensuring optimal O(N) runtime, flawless pointer jumping invariants, and comprehensive edge-case handling without syntax distractions.',
    practiceChallengeId: 'longest-substring-without-repeating'
  },
  {
    id: 'lesson-3-debugging-prompting',
    title: 'Root-Cause Prompting: Surgical Bug Hunting Without Regressions',
    level: 'Intermediate',
    category: 'Debugging',
    summary: 'How to prompt AI to diagnose subtle off-by-one errors, async race conditions, and memory leaks without rewriting working parts of your codebase.',
    keyPrinciples: [
      'Isolate the symptom: Provide the exact input, expected result, and actual broken behavior',
      'Surgical Edit Mandate: "Provide ONLY the line-level correction with justification"',
      'Execution Trace Request: "Step through the pointer values right before the infinite loop occurs"',
      'Adversarial Regression Guard: "Generate 2 edge test cases designed to break the patch"'
    ],
    badPromptExample: 'My binary search has a bug, fix it.',
    whyItFails: 'The AI will often rewrite the entire function using a different algorithm template, discarding your specific architecture and introducing new regressions.',
    elitePromptExample: 'Act as a Senior Debugger. In the provided search function, trace why input nums=[1, 3, 5, 6] with target=2 results in an infinite loop. Identify the flaw in the while loop condition and midpoint calculation. Explain why left=mid fails to contract the search space. Provide the minimal surgical fix and verify with an invariant proof.',
    whyItWins: 'Directs the AI straight to the root cause (left = mid vs left = mid + 1 and boundary division), explaining the mechanical cause of the lockup.',
    practiceChallengeId: 'debug-binary-search-loop'
  },
  {
    id: 'lesson-4-development-prompting',
    title: 'Contract-First Prompting: Building Production Modules from Scratch',
    level: 'Advanced',
    category: 'Development',
    summary: 'Transform high-level product requirements into rock-solid software modules with zero runtime polling, clean interfaces, and leak-free cleanups.',
    keyPrinciples: [
      'Interface First: Mandate TypeScript type definitions and public method signatures before logic',
      'Resource Management: Require explicit cleanup/unsubscription mechanisms and zero background leaks',
      'Defensive Bounds: Specify overflow, underflow, and concurrency constraints',
      'Self-Testing Contract: Require mock or unit tests checking both nominal and adversarial states'
    ],
    badPromptExample: 'Make a rate limiter class.',
    whyItFails: 'Produces a toy implementation using setInterval that leaks memory in serverless environments, drifts over time, and cannot handle high bursts.',
    elitePromptExample: 'Act as a Principal Backend Architect. Develop a production-grade Token Bucket Rate Limiter in TypeScript. Implement lazy timestamp-based refill math to avoid background setInterval leaks. Expose tryConsume(tokens), getAvailableTokens(), and getTimeUntilNextToken() methods. Bound memory to O(1) and include unit tests verifying burst consumption and lazy refill accuracy.',
    whyItWins: 'Forces professional engineering decisions (lazy math instead of background polling) and yields production-grade code that scales effortlessly.',
    practiceChallengeId: 'develop-token-bucket-limiter'
  }
];
