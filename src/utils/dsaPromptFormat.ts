export interface DsaPromptSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  exampleNote: string;
}

export const DSA_7_SECTIONS: DsaPromptSection[] = [
  {
    id: 'restating-the-problem',
    number: 1,
    title: 'Restating the Problem',
    subtitle: 'Inputs, Outputs & Constraints',
    description: 'Clearly restate the problem statement, input types and bounds, expected output requirements, and invariants without ambiguity.',
    icon: '🎯',
    color: 'text-cyan-400',
    exampleNote: 'Define parameters, return types, whether array is sorted, distinct indices, empty inputs.',
  },
  {
    id: 'naming-the-technique',
    number: 2,
    title: 'Naming the Technique',
    subtitle: 'Paradigm & Data Structure',
    description: 'Identify the exact algorithmic paradigm or data structure (e.g., Dynamic Programming, Two Pointers, Sliding Window, Monotonic Stack, Disjoint Set Union).',
    icon: '⚡',
    color: 'text-amber-400',
    exampleNote: 'e.g. Single-Pass Hash Map lookup, Sliding Window with Character Index Map, Doubly-Linked List + Hash Map.',
  },
  {
    id: 'key-observations',
    number: 3,
    title: 'Key Observations',
    subtitle: 'Core Insights & Invariants',
    description: 'Highlight the mathematical properties, monotonic structures, optimal substructure, or lookup invariants that unlock the optimal algorithm.',
    icon: '👁️',
    color: 'text-purple-400',
    exampleNote: 'For every element x, the required complement (target - x) must either already exist in the seen set or be tracked.',
  },
  {
    id: 'the-algorithm',
    number: 4,
    title: 'The Algorithm',
    subtitle: 'Step-by-Step Logic (No Code Fluff)',
    description: 'Provide a structured, step-by-step walkthrough of the algorithmic flow, state initialization, transition rules, and termination condition.',
    icon: '🧭',
    color: 'text-blue-400',
    exampleNote: '1. Initialize hash map. 2. For each index and value, check complement. 3. Return indices if found; else record value.',
  },
  {
    id: 'correctness-arguments',
    number: 5,
    title: 'Correctness Arguments',
    subtitle: 'Proof & Invariant Preservation',
    description: 'Provide an inductive proof, loop invariant argument, or contradiction proof demonstrating why this approach is guaranteed to always produce the correct result.',
    icon: '🛡️',
    color: 'text-emerald-400',
    exampleNote: 'Loop invariant: at step i, map contains all elements from 0 to i-1. If solution exists with second element at i, it is guaranteed to be detected.',
  },
  {
    id: 'complexity-analyses',
    number: 6,
    title: 'Complexity Analyses',
    subtitle: 'Time & Space Big-O Bounds',
    description: 'Derive tight asymptotic worst-case Time Complexity and Space Complexity with mathematical justification for all operations.',
    icon: '📊',
    color: 'text-indigo-400',
    exampleNote: 'Time Complexity: O(N) because each element is visited once and hash map lookups are O(1) average. Space Complexity: O(N) for hash map.',
  },
  {
    id: 'potential-pitfalls',
    number: 7,
    title: 'Potential Pitfalls',
    subtitle: 'Edge Cases & Common Traps',
    description: 'Detail critical boundary conditions, off-by-one errors, duplicate values, extreme bounds, negative numbers, or traps to avoid.',
    icon: '⚠️',
    color: 'text-rose-400',
    exampleNote: 'Using an element twice with itself, integer overflow when target is large, negative numbers in indices, handling empty arrays.',
  },
];

export function buildDsa7StepPrompt(problemTitle: string, userQuery?: string): string {
  const querySuffix = userQuery && userQuery.trim() ? ` Additional requirement: ${userQuery.trim()}` : '';
  return `Solve the DSA question "${problemTitle}" strictly using this 7-section format:
1. Restating the problem: Clarify input, output, constraints, and objective.
2. Naming the technique: Specify the algorithm or data structure (e.g. Dynamic Programming, Two Pointers, Hash Table).
3. Key observations: Highlight the essential invariants and insights.
4. The algorithm: Provide a step-by-step walkthrough of the logic without code syntax.
5. Correctness arguments: Prove why the solution is guaranteed to be correct.
6. Complexity analyses: Provide Big-O Time and Space Complexity with justification.
7. Potential pitfalls: Detail edge cases, boundary failures, and tricky corner traps.${querySuffix}`;
}

export function isDsaCategoryOrPrompt(category: string, promptText: string): boolean {
  if (category === 'solve') return true;
  const lower = promptText.toLowerCase();
  return (
    lower.includes('dsa') ||
    lower.includes('7-section') ||
    lower.includes('restating the problem') ||
    lower.includes('key observations') ||
    lower.includes('two sum') ||
    lower.includes('leetcode') ||
    lower.includes('algorithm')
  );
}
