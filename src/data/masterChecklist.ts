export type ChecklistCategory =
  | 'Prompt Engineering'
  | 'AI Coding'
  | 'Advanced AI'
  | 'Developer Integrations'
  | 'Collaboration'
  | 'Infrastructure'
  | 'Research Extensions';

export interface ChecklistItem {
  id: string;
  name: string;
  category: ChecklistCategory;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  launchAction?: string;
  badge?: string;
}

export const MASTER_CHECKLIST: ChecklistItem[] = [
  // 1. Prompt Engineering (9 items)
  {
    id: 'pe-analyzer',
    name: 'Prompt Analyzer',
    category: 'Prompt Engineering',
    description: 'Real-time scoring (0-100), strength extraction, invariant detection, and improvement recommendations.',
    status: 'completed',
    launchAction: 'steps',
    badge: 'Core Engine',
  },
  {
    id: 'pe-enhancer',
    name: 'Prompt Enhancer',
    category: 'Prompt Engineering',
    description: 'Transform informal prompts into production-grade prompts with role, constraints, and 7-section DSA formatting.',
    status: 'completed',
    launchAction: 'optimizer',
    badge: 'AI Powered',
  },
  {
    id: 'pe-debugger',
    name: 'Prompt Debugger',
    category: 'Prompt Engineering',
    description: 'Diagnose failing prompts, trace off-by-one errors, and formulate invariant-preserving bug patches.',
    status: 'completed',
    launchAction: 'debug',
    badge: 'Interactive',
  },
  {
    id: 'pe-versioning',
    name: 'Prompt Versioning',
    category: 'Prompt Engineering',
    description: 'Track prompt iteration history (v1, v2, v3), revert to previous iterations, and view prompt diffs.',
    status: 'completed',
    launchAction: 'compare',
    badge: 'New',
  },
  {
    id: 'pe-templates',
    name: 'Prompt Templates',
    category: 'Prompt Engineering',
    description: 'Curated library of 7-Section DSA standards, debugging recipes, and architectural contract templates.',
    status: 'completed',
    launchAction: 'guide',
    badge: 'Curated',
  },
  {
    id: 'pe-history',
    name: 'Prompt History',
    category: 'Prompt Engineering',
    description: 'Persistent log of all executed prompts with timestamp, model score, and quick restore capability.',
    status: 'completed',
    launchAction: 'analytics',
    badge: 'Saved',
  },
  {
    id: 'pe-comparison',
    name: 'Prompt Comparison',
    category: 'Prompt Engineering',
    description: 'Side-by-side A/B testing comparing Prompt A vs Prompt B on code quality, Big-O, and test pass rate.',
    status: 'completed',
    launchAction: 'compare',
    badge: 'A/B Studio',
  },
  {
    id: 'pe-analytics',
    name: 'Prompt Skill Analytics',
    category: 'Prompt Engineering',
    description: 'Radar chart and metrics tracking user prompt mastery: Invariant Rigor, Complexity Bounds, and Edge Cases.',
    status: 'completed',
    launchAction: 'analytics',
    badge: 'Radar V2',
  },
  {
    id: 'pe-export',
    name: 'Prompt Export',
    category: 'Prompt Engineering',
    description: 'Export prompts and complete 7-section study guides to Markdown, PDF cheatsheets, and JSON formats.',
    status: 'completed',
    launchAction: 'importer-json',
    badge: 'Markdown/JSON',
  },

  // 2. AI Coding (10 items)
  {
    id: 'ac-code-gen',
    name: 'Code Generation',
    category: 'AI Coding',
    description: 'Polyglot code synthesis across TypeScript, Python, C++, Java, and Go with 1-click apply to editor.',
    status: 'completed',
    launchAction: 'editor',
    badge: '5 Languages',
  },
  {
    id: 'ac-code-explanation',
    name: 'Code Explanation',
    category: 'AI Coding',
    description: 'Transparent 7-section procedural breakdown explaining algorithms, invariants, and mathematical proofs.',
    status: 'completed',
    launchAction: 'steps',
    badge: '7-Section',
  },
  {
    id: 'ac-ai-debugging',
    name: 'AI Debugging',
    category: 'AI Coding',
    description: 'Automated root cause isolation, execution trace visualization, and minimal surgical patch proposals.',
    status: 'completed',
    launchAction: 'debug',
    badge: 'Automated',
  },
  {
    id: 'ac-code-review',
    name: 'Code Review',
    category: 'AI Coding',
    description: 'Interactive senior engineer code review modal with line-by-line annotations, ratings, and instant fixes.',
    status: 'completed',
    launchAction: 'review',
    badge: 'Staff Engineer',
  },
  {
    id: 'ac-algo-rec',
    name: 'Algorithm Recommendation',
    category: 'AI Coding',
    description: 'Intelligent paradigm matching (Two Pointers, DP, Monotonic Stack, Trie, Binary Search Partitioning).',
    status: 'completed',
    launchAction: 'steps',
    badge: 'DSA Matrix',
  },
  {
    id: 'ac-complexity',
    name: 'Complexity Analysis',
    category: 'AI Coding',
    description: 'Rigorous Big-O worst-case time & auxiliary space complexity derivations with mathematical bounds.',
    status: 'completed',
    launchAction: 'steps',
    badge: 'Big-O',
  },
  {
    id: 'ac-test-generation',
    name: 'Test Case Generation',
    category: 'AI Coding',
    description: 'Automated synthesis of boundary cases, empty inputs, singletons, and large adversarial stress-test cases.',
    status: 'completed',
    launchAction: 'tests',
    badge: 'Adversarial',
  },
  {
    id: 'ac-code-refactoring',
    name: 'Code Refactoring',
    category: 'AI Coding',
    description: 'One-click code refactoring for O(1) in-place memory reduction, strict typing, and functional cleanup.',
    status: 'completed',
    launchAction: 'editor',
    badge: 'Refactor',
  },
  {
    id: 'ac-sql-assistant',
    name: 'SQL Assistant',
    category: 'AI Coding',
    description: 'Natural language to SQL query generation, query plan explainability, and index optimization recommendations.',
    status: 'completed',
    launchAction: 'sql-api',
    badge: 'PostgreSQL/MySQL',
  },
  {
    id: 'ac-api-assistant',
    name: 'API Assistant',
    category: 'AI Coding',
    description: 'REST, GraphQL, and OpenAPI 3.0 schema contract generator from plain English functional specifications.',
    status: 'completed',
    launchAction: 'sql-api',
    badge: 'OpenAPI 3.0',
  },

  // 3. Advanced AI (9 items)
  {
    id: 'aai-outcome-eval',
    name: 'Prompt-to-Outcome Evaluation',
    category: 'Advanced AI',
    description: 'Automated correlation between prompt instructions and final unit test pass rate and asymptotic runtimes.',
    status: 'completed',
    launchAction: 'steps',
    badge: 'Metrics',
  },
  {
    id: 'aai-adaptive-learning',
    name: 'Adaptive Prompt Learning',
    category: 'Advanced AI',
    description: 'Dynamic recommendations that adapt to user weaknesses (e.g., prompting for memory bounds or corner cases).',
    status: 'completed',
    launchAction: 'academy',
    badge: 'Personalized',
  },
  {
    id: 'aai-secure-exec',
    name: 'Secure Code Execution',
    category: 'Advanced AI',
    description: 'Client-side sandboxed test execution with timeouts and memory guards preventing malicious scripts.',
    status: 'completed',
    launchAction: 'tests',
    badge: 'Sandboxed',
  },
  {
    id: 'aai-multi-agent',
    name: 'Multi-Agent Architecture',
    category: 'Advanced AI',
    description: 'Collaborative agent deliberation: Architect Agent, Security Reviewer, and Algorithm Specialist.',
    status: 'completed',
    launchAction: 'multi-model',
    badge: 'Swarm AI',
  },
  {
    id: 'aai-multi-llm',
    name: 'Multi-LLM Integration',
    category: 'Advanced AI',
    description: 'Seamless support & switching across Gemini 3.8 Flash, Gemini Pro, Claude 3.5 Sonnet, GPT-4o, and DeepSeek-R1.',
    status: 'completed',
    launchAction: 'multi-model',
    badge: '5 Foundation Models',
  },
  {
    id: 'aai-model-routing',
    name: 'Model Routing',
    category: 'Advanced AI',
    description: 'Intelligent task routing directing fast syntax queries to Flash and complex DP reasoning to deep thought models.',
    status: 'completed',
    launchAction: 'multi-model',
    badge: 'Cost/Speed Router',
  },
  {
    id: 'aai-rag-knowledge',
    name: 'RAG Knowledge System',
    category: 'Advanced AI',
    description: 'Retrieval Augmented Knowledge base of DSA algorithm theorems, standard library signatures, and invariants.',
    status: 'completed',
    launchAction: 'academy',
    badge: 'Vector DSA Base',
  },
  {
    id: 'aai-cost-optimization',
    name: 'AI Cost Optimization',
    category: 'Advanced AI',
    description: 'Intelligent prompt compression, token caching, and instant zero-cost fallback generation.',
    status: 'completed',
    launchAction: 'optimizer',
    badge: 'Token Saver',
  },
  {
    id: 'aai-fallback-system',
    name: 'Fallback System',
    category: 'Advanced AI',
    description: 'Resilient multi-tier fallback architecture ensuring 100% uptime when external LLM endpoints are unreachable.',
    status: 'completed',
    launchAction: 'health',
    badge: 'High Resilience',
  },

  // 4. Developer Integrations (6 items)
  {
    id: 'di-vscode',
    name: 'VS Code Extension',
    category: 'Developer Integrations',
    description: 'Interactive VS Code extension simulator with exportable snippet definitions, keybindings, and launch configs.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Simulated + Config',
  },
  {
    id: 'di-github',
    name: 'GitHub Integration',
    category: 'Developer Integrations',
    description: '1-click export to GitHub Gist, repository sync preparation, and pull request description generator.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Gists & Sync',
  },
  {
    id: 'di-git',
    name: 'Git Integration',
    category: 'Developer Integrations',
    description: 'Git visual history, commit generator, branch management simulator, and clean unified diff views.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Visual Git',
  },
  {
    id: 'di-cicd',
    name: 'CI/CD Integration',
    category: 'Developer Integrations',
    description: 'Export ready-to-run GitHub Actions CI/CD workflows for automated prompt linting and unit testing.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'GitHub Actions',
  },
  {
    id: 'di-public-api',
    name: 'Public API',
    category: 'Developer Integrations',
    description: 'Interactive REST API documentation and live playground console for /api/prompt/execute and /api/review.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Swagger Console',
  },
  {
    id: 'di-webhooks',
    name: 'Webhooks',
    category: 'Developer Integrations',
    description: 'Configurable webhook dispatcher simulator triggering external alerts on test failures and prompt completions.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Event Bus',
  },

  // 5. Collaboration (8 items)
  {
    id: 'collab-workspace',
    name: 'Team Workspace',
    category: 'Collaboration',
    description: 'Multi-workspace switcher (Personal Lab, Core Engineering Team, Competitive Programming Club).',
    status: 'completed',
    launchAction: 'workspace',
    badge: 'Multi-Tenant',
  },
  {
    id: 'collab-shared-prompts',
    name: 'Shared Prompts',
    category: 'Collaboration',
    description: 'Community prompt repository with upvotes, tags, and one-click prompt cloning into active editor.',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: 'Community',
  },
  {
    id: 'collab-editing',
    name: 'Collaborative Editing',
    category: 'Collaboration',
    description: 'Real-time Driver / Navigator role swapping with simulated peer presence and voice toggle.',
    status: 'completed',
    launchAction: 'driver-role',
    badge: 'Live Pair',
  },
  {
    id: 'collab-community',
    name: 'Prompt Community',
    category: 'Collaboration',
    description: 'Community discussion feed, prompt tips exchange, and collaborative challenge solutions.',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: 'Social Feed',
  },
  {
    id: 'collab-profiles',
    name: 'Developer Profiles',
    category: 'Collaboration',
    description: 'Public developer profile modal displaying solve count, prompt accuracy score, streak, and specialties.',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: 'Dev Card',
  },
  {
    id: 'collab-leaderboard',
    name: 'Prompt Leaderboard',
    category: 'Collaboration',
    description: 'Global and team leaderboard ranking engineers by Prompt Score, algorithmic efficiency, and problem count.',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: 'Global Rank',
  },
  {
    id: 'collab-achievements',
    name: 'Achievements',
    category: 'Collaboration',
    description: 'Gamified achievement system with unlockable badges (7-Section Master, O(1) Wizard, Bug Obliterator).',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: '12 Badges',
  },
  {
    id: 'collab-challenges',
    name: 'Prompt Challenges',
    category: 'Collaboration',
    description: 'Daily prompt engineering challenges with strict constraints (e.g., "Under 25 words", "Zero loop keywords").',
    status: 'completed',
    launchAction: 'leaderboard',
    badge: 'Daily Challenge',
  },

  // 6. Infrastructure (10 items)
  {
    id: 'inf-auth',
    name: 'Authentication',
    category: 'Infrastructure',
    description: 'Interactive session manager with JWT simulation, Guest/Engineer mode, and persistent credentials.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'JWT/Session',
  },
  {
    id: 'inf-rbac',
    name: 'Role-Based Access',
    category: 'Infrastructure',
    description: 'Granular permissions (Admin, Senior Engineer, Navigator, Viewer) controlling code mutation rights.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'RBAC',
  },
  {
    id: 'inf-postgres',
    name: 'PostgreSQL',
    category: 'Infrastructure',
    description: 'Relational database schema definition (Drizzle ORM) and interactive SQL execution workbench.',
    status: 'completed',
    launchAction: 'sql-api',
    badge: 'Postgres DB',
  },
  {
    id: 'inf-redis',
    name: 'Redis',
    category: 'Infrastructure',
    description: 'In-memory cache layer for distributed rate limiting, ephemeral session sync, and prompt caching.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Cache / K-V',
  },
  {
    id: 'inf-docker',
    name: 'Docker',
    category: 'Infrastructure',
    description: 'Production Dockerfile and docker-compose.yml configuration generator for one-command containerized runs.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Containerized',
  },
  {
    id: 'inf-cicd-pipeline',
    name: 'CI/CD',
    category: 'Infrastructure',
    description: 'Automated continuous integration pipeline visualizer with live stage tracking (Lint -> Test -> Build -> Deploy).',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Pipeline Logs',
  },
  {
    id: 'inf-monitoring',
    name: 'Monitoring',
    category: 'Infrastructure',
    description: 'Real-time telemetry dashboard monitoring server response latency, request volume, token usage, and health.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Live Telemetry',
  },
  {
    id: 'inf-rate-limiting',
    name: 'Rate Limiting',
    category: 'Infrastructure',
    description: 'Production-ready Token Bucket rate limiter with burst tolerance and lazy timestamp refills.',
    status: 'completed',
    launchAction: 'develop',
    badge: 'Token Bucket',
  },
  {
    id: 'inf-audit-logs',
    name: 'Audit Logs',
    category: 'Infrastructure',
    description: 'Immutable security event logging tracking prompt evaluations, code mutations, and permissions checks.',
    status: 'completed',
    launchAction: 'dev-integrations',
    badge: 'Audit Trail',
  },
  {
    id: 'inf-automated-testing',
    name: 'Automated Testing',
    category: 'Infrastructure',
    description: 'Full test suite runner with assertion diagnostics, diff view on failure, and custom test builder.',
    status: 'completed',
    launchAction: 'tests',
    badge: 'Test Runner',
  },

  // 7. Research Extensions (3 items)
  {
    id: 'res-quantum-opt',
    name: 'Quantum-Inspired Optimization',
    category: 'Research Extensions',
    description: 'Simulated quantum annealing algorithm optimizing prompt token density vs semantic completeness.',
    status: 'completed',
    launchAction: 'quantum',
    badge: 'Annealing Lab',
  },
  {
    id: 'res-qaoa-selection',
    name: 'QAOA Prompt Component Selection',
    category: 'Research Extensions',
    description: 'Quantum Approximate Optimization Algorithm simulator finding optimal combinatorial prompt clauses.',
    status: 'completed',
    launchAction: 'quantum',
    badge: 'QAOA Matrix',
  },
  {
    id: 'res-qiskit-assistant',
    name: 'Qiskit Code Assistant',
    category: 'Research Extensions',
    description: 'Specialized quantum circuit synthesizer generating valid Qiskit Python code for Bell states, Grover, and QFT.',
    status: 'completed',
    launchAction: 'quantum',
    badge: 'Qiskit 1.0',
  },
];

const CHECKLIST_STORAGE_KEY = 'promptcode_master_checklist_overrides_v1';

export function loadChecklistOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveChecklistOverride(id: string, completed: boolean): Record<string, boolean> {
  try {
    const current = loadChecklistOverrides();
    current[id] = completed;
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (e) {
    return {};
  }
}

export function resetChecklistOverrides(): void {
  try {
    localStorage.removeItem(CHECKLIST_STORAGE_KEY);
  } catch (e) {
    // no-op
  }
}
