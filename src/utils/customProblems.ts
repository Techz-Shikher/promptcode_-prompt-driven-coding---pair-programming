import { Problem, ProblemPack } from '../types';
import { PROBLEMS, CURATED_PACKS } from '../data/problems';

const STORAGE_KEY = 'promptcode_custom_problems_v1';

export function loadStoredCustomProblems(): Problem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => ({ ...p, isCustom: true }));
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom problems from localStorage:', err);
    return [];
  }
}

export function saveCustomProblem(problem: Problem): Problem[] {
  try {
    const existing = loadStoredCustomProblems();
    const problemWithMeta: Problem = {
      ...problem,
      isCustom: true,
      importedAt: problem.importedAt || new Date().toISOString(),
      source: problem.source || 'Custom Import',
    };

    const index = existing.findIndex((p) => p.id === problemWithMeta.id);
    let updated: Problem[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = problemWithMeta;
    } else {
      updated = [problemWithMeta, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save custom problem:', err);
    return loadStoredCustomProblems();
  }
}

export function deleteCustomProblem(id: string): Problem[] {
  try {
    const existing = loadStoredCustomProblems();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete custom problem:', err);
    return loadStoredCustomProblems();
  }
}

export function importProblemPack(pack: ProblemPack): { added: number; problems: Problem[] } {
  try {
    const existing = loadStoredCustomProblems();
    const existingIds = new Set([...PROBLEMS.map((p) => p.id), ...existing.map((p) => p.id)]);
    
    const newItems: Problem[] = [];
    for (const prob of pack.problems) {
      if (!existingIds.has(prob.id)) {
        newItems.push({
          ...prob,
          isCustom: true,
          source: pack.title,
          importedAt: new Date().toISOString(),
        });
        existingIds.add(prob.id);
      }
    }

    const updated = [...newItems, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { added: newItems.length, problems: updated };
  } catch (err) {
    console.error('Failed to import pack:', err);
    return { added: 0, problems: loadStoredCustomProblems() };
  }
}

export function exportProblemsAsJSON(problems: Problem[]): void {
  const jsonStr = JSON.stringify(problems, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `promptcode-problems-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportProblemAsMarkdown(problem: Problem): void {
  const md = `# ${problem.title} (${problem.difficulty} · ${problem.acceptance} Acceptance)
**Category**: ${problem.category.toUpperCase()}
**Tags**: ${problem.tags.join(', ')}
**Source**: ${problem.source || 'PromptCode'}

## Description
${problem.description}

## Learning Target
${problem.learningObjective}

## Canonical 7-Section DSA Prompt
\`\`\`text
${problem.recommendedPrompt}
\`\`\`

## 7 Essential Sections Breakdown
1. **Restating the Problem**: Clarify input, output, constraints, and edge boundary behaviors.
2. **Naming the Technique**: State the exact paradigm (${problem.tags.slice(0, 2).join(' / ')}).
3. **Key Observations**: Structural properties, invariants, or mathematical bounds.
4. **The Algorithm**: Procedural steps without language syntax.
5. **Correctness Arguments**: Inductive proof / loop invariant why this never fails.
6. **Complexity Analyses**: Asymptotic Time & Space Big-O derivation.
7. **Potential Pitfalls**: Edge cases, memory overflow, null pointers, off-by-one errors.

## Examples
${problem.examples.map((ex, i) => `### Example ${i + 1}
- **Input**: \`${ex.input}\`
- **Output**: \`${ex.output}\`
${ex.explanation ? `- **Explanation**: ${ex.explanation}` : ''}
`).join('\n')}

## Constraints
${problem.constraints.map((c) => `- ${c}`).join('\n')}

## Starter Code (TypeScript)
\`\`\`typescript
${problem.starterCode.typescript}
\`\`\`

---
*Exported from PromptCode IDE 2.0*
`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${problem.id}-dsa-study-guide.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
