import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  FileText,
  BarChart3,
  Zap,
  ListOrdered,
  Scale,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  HardDrive,
  Copy,
  Check,
  RotateCcw,
  Bot,
  Layers,
  AlertTriangle,
  Eye,
  Compass,
  Bug,
  ShieldAlert,
  Cpu,
  Search,
  Wrench,
  Send,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { PromptExecutionResult, ProblemCategory } from '../types';
import { RobotMascot, CyberWaveGraphic } from './RobotMascot';
import { sounds } from '../utils/sounds';

interface RealtimeStepsPanelProps {
  executionResult: PromptExecutionResult | null;
  executionError?: string | null;
  isExecuting: boolean;
  onApplyCode: (code: string) => void;
  onSelectQuickPrompt?: (promptText: string) => void;
  activeRightTab: 'steps' | 'tests' | 'assistant';
  onChangeRightTab: (tab: 'steps' | 'tests' | 'assistant') => void;
  testCasesCount?: number;
  category?: ProblemCategory;
}

export const RealtimeStepsPanel: React.FC<RealtimeStepsPanelProps> = ({
  executionResult,
  executionError,
  isExecuting,
  onApplyCode,
  onSelectQuickPrompt,
  activeRightTab,
  onChangeRightTab,
  testCasesCount = 4,
  category = 'solve',
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);
  const [viewMode, setViewMode] = useState<'step' | 'full'>('full');
  const [copilotInput, setCopilotInput] = useState('');

  const getCopilotQuestions = () => {
    if (category === 'debug') {
      return [
        {
          label: 'Why does while loop hang on [1, 3, 5, 6]?',
          prompt: 'Act as a Senior Debugger. Explain step-by-step why the while loop hangs in an infinite loop on target=2 with [1, 3, 5, 6]. Trace pointer updates and state table.',
          icon: '🐞',
        },
        {
          label: 'Identify Violated Loop Invariant',
          prompt: 'Identify the exact loop invariant violated by right = mid and explain how it breaks termination progress.',
          icon: '🔍',
        },
        {
          label: 'Dry-Run State Machine Table',
          prompt: 'Generate an iteration-by-iteration dry-run state table with columns: Iteration, left, right, mid, nums[mid], action taken.',
          icon: '📋',
        },
        {
          label: 'Generate 4 Adversarial Unit Tests',
          prompt: 'Formulate 4 adversarial edge cases (empty array, single element missing, duplicates, extreme bounds) to stress-test this bug fix.',
          icon: '🛡️',
        },
      ];
    }
    if (category === 'develop') {
      return [
        {
          label: 'Audit Thread-Safety & Race Conditions',
          prompt: 'Audit this system architecture for concurrent access hazards, race conditions, and mutex deadlocks.',
          icon: '⚡',
        },
        {
          label: 'Formulate TypeScript Schema & DTOs',
          prompt: 'Design clean TypeScript schema interfaces, DTO contracts, and strict validation models.',
          icon: '📐',
        },
        {
          label: 'Estimate p99 Latency & SLO Bounds',
          prompt: 'Estimate throughput capacity, memory footprint, and p99 latency SLO bottlenecks for this service.',
          icon: '📊',
        },
        {
          label: 'Design Circuit Breaker & Fallback',
          prompt: 'Formulate a circuit breaker state machine with exponential backoff and graceful degradation fallbacks.',
          icon: '🛡️',
        },
      ];
    }
    return [
      {
        label: 'Explain 7-Section Algorithm Step-by-Step',
        prompt: 'Solve this DSA question strictly using the 7-section format with comprehensive algorithmic derivation.',
        icon: '🎯',
      },
      {
        label: 'What is the Monotonicity Invariant?',
        prompt: 'Explain the core mathematical and monotonicity invariant that makes this optimal solution correct.',
        icon: '👁️',
      },
      {
        label: 'Formal Asymptotic Complexity Big-O Proof',
        prompt: 'Derive a formal mathematical proof for the worst-case Time and Space complexity Big-O bounds.',
        icon: '⏱️',
      },
      {
        label: 'Analyze Tricky Edge Cases & Traps',
        prompt: 'Analyze boundary edge cases, integer overflow risks, empty inputs, and duplicate element handling.',
        icon: '⚠️',
      },
    ];
  };

  const handleAskCopilot = (promptText: string) => {
    if (!promptText.trim()) return;
    sounds.playSuccess();
    if (onSelectQuickPrompt) {
      onSelectQuickPrompt(promptText);
    }
    onChangeRightTab('steps');
  };

  const getQuickPrompts = () => {
    if (category === 'debug') {
      return [
        {
          icon: '🔍',
          title: 'Root Cause & Minimal Bug Fix',
          prompt:
            'Act as a Senior Debugger. In the provided code, identify the exact root cause of the bug, explain which invariant was violated, and provide the corrected code.',
          color: 'text-amber-400',
        },
        {
          icon: '🔁',
          title: 'Dry-Run Trace & State Table',
          prompt:
            'Perform a step-by-step dry-run execution trace on the failing input, tracking all variable states, loop indices, and pointer updates where the failure occurs.',
          color: 'text-cyan-400',
        },
        {
          icon: '🛡️',
          title: 'Boundary & Midpoint Rounding Check',
          prompt:
            'Audit this implementation for boundary condition defects, midpoint calculation overflow, off-by-one index loops, and empty input handling.',
          color: 'text-emerald-400',
        },
        {
          icon: '🧪',
          title: 'Adversarial Regression Tests',
          prompt:
            'Generate 4 adversarial edge cases designed to stress-test this bug fix and verify correctness.',
          color: 'text-pink-400',
        },
      ];
    }

    if (category === 'develop') {
      return [
        {
          icon: '🏗️',
          title: 'Production System Blueprint',
          prompt:
            'Design a clean production system architecture with modular components, API schema contracts, and storage model.',
          color: 'text-cyan-400',
        },
        {
          icon: '⚡',
          title: 'High-Throughput In-Memory Caching',
          prompt:
            'Design a high-throughput caching tier with eviction policy, O(1) reads, and TTL invalidation semantics.',
          color: 'text-amber-400',
        },
        {
          icon: '🔒',
          title: 'Thread-Safety & Concurrency Audit',
          prompt:
            'Analyze concurrency race conditions, mutex lock granularity, and deadlock-free guarantees for multi-threaded access.',
          color: 'text-purple-400',
        },
        {
          icon: '📡',
          title: 'API Contract & Idempotency',
          prompt:
            'Define OpenAPI schema specifications, error response codes, and idempotency key handling for external callers.',
          color: 'text-emerald-400',
        },
      ];
    }

    // Default DSA
    return [
      {
        icon: '🎯',
        title: '7-Section DSA Standard',
        prompt:
          'Solve this DSA question strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
        color: 'text-pink-400',
      },
      {
        icon: '⚡',
        title: 'Technique & Observations',
        prompt:
          'Solve using the 7-section DSA format with deep emphasis on Section 2: Naming the Technique and Section 3: Key Observations & Invariants.',
        color: 'text-amber-400',
      },
      {
        icon: '🛡️',
        title: 'Correctness Arguments & Proof',
        prompt:
          'Solve using the 7-section DSA format highlighting Section 5: Correctness Arguments and loop invariant preservation.',
        color: 'text-emerald-400',
      },
      {
        icon: '⚠️',
        title: 'Potential Pitfalls & Edge Cases',
        prompt:
          'Analyze this problem using the 7-section DSA format with special focus on Section 7: Potential Pitfalls, boundary edge cases, and overflow traps.',
        color: 'text-cyan-400',
      },
    ];
  };

  const getCategoryCards = () => {
    if (category === 'debug') {
      return [
        {
          id: 'root-cause',
          title: 'Root-cause\nanalysis',
          icon: <Bug className="w-4 h-4" />,
          boxBg: 'bg-[#181008] border-[#3d230e]',
          iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          hoverBorder: 'hover:border-amber-500/60',
          prompt:
            'Act as a Senior Debugger. Perform a root-cause analysis on this code: identify the exact line where the invariant breaks, explain why it fails, and provide the corrected logic.',
        },
        {
          id: 'trace',
          title: 'Trace state\n& dry-run',
          icon: <RotateCcw className="w-4 h-4" />,
          boxBg: 'bg-[#091122] border-[#1b2b4e]',
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          hoverBorder: 'hover:border-cyan-500/60',
          prompt:
            'Perform a step-by-step dry-run execution trace with a state variable table showing loop pointers and where the freeze or error happens.',
        },
        {
          id: 'adversarial',
          title: 'Adversarial\nedge tests',
          icon: <ShieldAlert className="w-4 h-4" />,
          boxBg: 'bg-[#190d1c] border-[#381640]',
          iconBg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
          hoverBorder: 'hover:border-pink-500/60',
          prompt:
            'Formulate 4 adversarial edge cases (empty input, single element, extreme bounds, off-by-one triggers) to stress-test this bug fix.',
        },
      ];
    }

    if (category === 'develop') {
      return [
        {
          id: 'schema',
          title: 'API & schema\narchitecture',
          icon: <Layers className="w-4 h-4" />,
          boxBg: 'bg-[#091122] border-[#1b2b4e]',
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          hoverBorder: 'hover:border-cyan-500/60',
          prompt:
            'Design a clean API contract and normalized data model schema with TypeScript interfaces and idempotency guarantees.',
        },
        {
          id: 'concurrency',
          title: 'Concurrency\n& thread-safety',
          icon: <Cpu className="w-4 h-4" />,
          boxBg: 'bg-[#140f28] border-[#2d1b54]',
          iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          hoverBorder: 'hover:border-purple-500/60',
          prompt:
            'Audit concurrency, race conditions, mutex locking, and deadlock prevention for high-throughput multi-worker access.',
        },
        {
          id: 'scaling',
          title: 'Fault tolerance\n& caching',
          icon: <BarChart3 className="w-4 h-4" />,
          boxBg: 'bg-[#0a181b] border-[#163836]',
          iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          hoverBorder: 'hover:border-emerald-500/60',
          prompt:
            'Design an in-memory caching tier and retry/circuit-breaker strategy for sub-50ms latency at scale.',
        },
      ];
    }

    // Default DSA
    return [
      {
        id: 'reasoning',
        title: 'Step-by-step\nreasoning',
        icon: <Code2 className="w-4 h-4" />,
        boxBg: 'bg-[#091122] border-[#1b2b4e]',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
        hoverBorder: 'hover:border-cyan-500/60',
        prompt: 'Provide step-by-step algorithmic reasoning and break down invariants.',
      },
      {
        id: 'execution',
        title: 'Visualize\nexecution',
        icon: <FileText className="w-4 h-4" />,
        boxBg: 'bg-[#140f28] border-[#2d1b54]',
        iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        hoverBorder: 'hover:border-purple-500/60',
        prompt: 'Visualize execution with memory pointers and dry-run table trace.',
      },
      {
        id: 'complexity',
        title: 'Time & space\ncomplexity',
        icon: <BarChart3 className="w-4 h-4" />,
        boxBg: 'bg-[#0a181b] border-[#163836]',
        iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        hoverBorder: 'hover:border-emerald-500/60',
        prompt: 'Analyze time and space complexity with Big-O derivation and boundary proofs.',
      },
    ];
  };

  const quickPromptsList = getQuickPrompts();
  const featureCards = getCategoryCards();

  const handleCopyCode = () => {
    if (!executionResult) return;
    sounds.playPop(640);
    navigator.clipboard.writeText(executionResult.generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFullBreakdown = () => {
    if (!executionResult) return;
    sounds.playPop(640);
    const writeup = executionResult.steps
      .map((s) => `### ${s.title}\n${s.explanation}\n> Key Insight: ${s.insight}`)
      .join('\n\n');
    const headerTitle =
      category === 'debug'
        ? '# Root-Cause Debugging & Verified Fix'
        : category === 'develop'
        ? '# Production System Architecture Blueprint'
        : '# 7-Section DSA Algorithmic Solution';
    const fullText = `${headerTitle}\nTime: ${executionResult.timeComplexity} | Space: ${executionResult.spaceComplexity}\n\n${writeup}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBreakdown(true);
    setTimeout(() => setCopiedBreakdown(false), 2000);
  };

  const getStepIcon = (idx: number, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('restate') || t.includes('failing')) return '🎯';
    if (t.includes('technique') || t.includes('cause') || t.includes('root')) return '🔍';
    if (t.includes('observation') || t.includes('invariant')) return '👁️';
    if (t.includes('algorithm') || t.includes('trace') || t.includes('fix')) return '🧭';
    if (t.includes('correctness') || t.includes('proof') || t.includes('regression')) return '🛡️';
    if (t.includes('complexity') || t.includes('scale')) return '📊';
    if (t.includes('pitfall') || t.includes('edge') || t.includes('boundary')) return '⚠️';
    return `${idx + 1}`;
  };

  const getShortTitle = (title: string, stepNumber: number) => {
    const clean = title.replace(/^\d+\.\s*/, '');
    if (clean.toLowerCase().includes('restate')) return 'Restatement';
    if (clean.toLowerCase().includes('technique')) return 'Technique';
    if (clean.toLowerCase().includes('observation')) return 'Observations';
    if (clean.toLowerCase().includes('algorithm')) return 'Algorithm';
    if (clean.toLowerCase().includes('correctness')) return 'Correctness';
    if (clean.toLowerCase().includes('complexity')) return 'Complexity';
    if (clean.toLowerCase().includes('pitfall')) return 'Pitfalls';
    if (clean.toLowerCase().includes('cause')) return 'Root Cause';
    if (clean.toLowerCase().includes('fix')) return 'The Fix';
    if (clean.toLowerCase().includes('trace')) return 'Trace';
    return clean.slice(0, 14);
  };

  const getHeaderBadge = () => {
    if (category === 'debug') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
          <Bug className="w-3 h-3 text-amber-400" />
          <span>Root Cause & Fix Analysis</span>
        </span>
      );
    }
    if (category === 'develop') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>System Architecture Blueprint</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
        <span>🎯</span>
        <span>7-Section DSA Format</span>
      </span>
    );
  };

  const getSubtitle = () => {
    if (category === 'debug') {
      return 'Write a prompt to isolate root causes, trace variable states, and apply verified bug fixes.';
    }
    if (category === 'develop') {
      return 'Write a prompt to design scalable architectures, API schema contracts, and concurrency models.';
    }
    return 'Write a prompt or use a template to generate step-by-step solutions, explanations and more.';
  };

  return (
    <div className="relative h-full flex flex-col bg-[#0b0f19] text-slate-200 overflow-hidden select-none">
      {/* Top Header Tabs: Real-Time Steps | Test Cases | AI Assistant */}
      <div className="px-4 py-2.5 border-b border-[#172033] bg-[#0c101d] flex items-center gap-2 text-xs">
        {/* Real-Time Steps Tab */}
        <button
          onClick={() => {
            sounds.playPop(480);
            onChangeRightTab('steps');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeRightTab === 'steps'
              ? 'bg-[#3b1f63] text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {category === 'debug' ? 'Debugging Trace' : category === 'develop' ? 'Architecture Steps' : 'Real-Time Steps'}
        </button>

        {/* Test Cases Tab with Badge */}
        <button
          onClick={() => {
            sounds.playPop(500);
            onChangeRightTab('tests');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeRightTab === 'tests'
              ? 'bg-[#3b1f63] text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Test Cases</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#112a20] text-emerald-400 border border-emerald-500/40">
            {testCasesCount}
          </span>
        </button>

        {/* AI Assistant Tab */}
        <button
          onClick={() => {
            sounds.playPop(520);
            onChangeRightTab('assistant');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
            activeRightTab === 'assistant'
              ? 'bg-[#3b1f63] text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
        {/* Executing Loading Animation */}
        {isExecuting ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 my-8">
            <RobotMascot category={category} className="scale-110" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>
                  {category === 'debug'
                    ? 'Isolating Root Cause & Synthesizing Fix'
                    : category === 'develop'
                    ? 'Synthesizing System Architecture'
                    : 'Synthesizing Step-by-Step Solution'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {category === 'debug'
                  ? 'Tracing execution state table, checking boundary conditions, and verifying minimal fix...'
                  : category === 'develop'
                  ? 'Analyzing concurrency models, formulating API schema, and validating fault tolerance...'
                  : 'Deriving algorithm invariants, analyzing complexity, and suggesting test assertions...'}
              </p>
            </div>
            <div className="w-48 bg-[#141b2e] rounded-full h-1.5 overflow-hidden p-0.5 border border-[#1e2a47]">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        ) : executionError ? (
          <div role="alert" className="rounded-2xl border border-rose-700/50 bg-rose-950/30 p-4 text-sm text-rose-200">
            {executionError}
          </div>
        ) : executionResult && activeRightTab === 'steps' ? (
          /* Step-by-Step Breakdown View */
          <div className="space-y-4 select-text">
            {/* Score & Complexity Header */}
            <div className="p-3.5 rounded-2xl bg-[#090d18] border border-[#1e2742] flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getHeaderBadge()}
                  <span className="text-xs text-slate-400 font-medium">AI Prompt Estimate:</span>
                  <span className="text-sm font-black text-emerald-400">
                    {executionResult.promptScore}/100
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span
                    className="px-2 py-0.5 rounded bg-[#121b2d] text-cyan-300 border border-[#1e2e4f]"
                    title="Time Complexity"
                  >
                    ⏱ {executionResult.timeComplexity}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded bg-[#121b2d] text-purple-300 border border-[#1e2e4f]"
                    title="Space Complexity"
                  >
                    💾 {executionResult.spaceComplexity}
                  </span>
                </div>
              </div>

              {executionResult.providerMetadata && (
                <div className="text-[10px] text-slate-500" title="Provider-reported token counts and server-measured request latency">
                  Model: {executionResult.providerMetadata.requestedModel}
                  {executionResult.providerMetadata.modelVersion && executionResult.providerMetadata.modelVersion !== executionResult.providerMetadata.requestedModel ? ` · served as ${executionResult.providerMetadata.modelVersion}` : ''}
                  {' · '}{executionResult.providerMetadata.latencyMs} ms
                  {executionResult.providerMetadata.usage?.totalTokenCount !== undefined ? ` · ${executionResult.providerMetadata.usage.totalTokenCount} tokens` : ''}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-[#162138] text-xs">
                <div className="flex items-center gap-1 bg-[#0d1424] p-0.5 rounded-xl border border-[#192642]">
                  <button
                    onClick={() => {
                      sounds.playPop(480);
                      setViewMode('full');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      viewMode === 'full'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {category === 'debug' ? 'Full Analysis' : 'All Sections'}
                  </button>
                  <button
                    onClick={() => {
                      sounds.playPop(500);
                      setViewMode('step');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      viewMode === 'step'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Step-by-Step
                  </button>
                </div>

                <button
                  onClick={handleCopyFullBreakdown}
                  className="px-2.5 py-1 rounded-lg bg-[#11192e] hover:bg-[#1a2542] text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-all border border-[#1c2a4a] cursor-pointer"
                  title="Copy full solution text"
                >
                  {copiedBreakdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBreakdown ? 'Copied Write-up' : 'Copy Write-up'}</span>
                </button>
              </div>
            </div>

            {/* View Mode: All Sections Full View */}
            {viewMode === 'full' ? (
              <div className="space-y-3">
                {executionResult.steps.map((s, idx) => {
                  const icon = getStepIcon(idx, s.title);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="p-3.5 rounded-2xl bg-[#080d18] border border-[#1c2742] space-y-2 hover:border-[#2d3e68] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {icon}
                        </span>
                        <h4 className="font-bold text-white text-xs leading-snug">{s.title}</h4>
                      </div>

                      <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line pl-8">
                        {s.explanation}
                      </div>

                      {s.insight && (
                        <div className="ml-8 p-2 rounded-xl bg-[#0c1426] border border-[#182644] text-[11px] text-cyan-300 flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold shrink-0">
                            {category === 'debug' ? '💡 Root Cause:' : '💡 Invariant:'}
                          </span>
                          <span className="text-slate-300">{s.insight}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* View Mode: Step by Step */
              <div className="space-y-3">
                {/* Step Navigation Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {executionResult.steps.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playPop(480);
                        setActiveStepIdx(idx);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 text-[11px] ${
                        activeStepIdx === idx
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-[#0f1728] text-slate-400 hover:text-slate-200 border border-[#1e2a47]'
                      }`}
                    >
                      <span>{getStepIcon(idx, s.title)}</span>
                      <span>{getShortTitle(s.title, s.stepNumber)}</span>
                    </button>
                  ))}
                </div>

                {/* Active Step Content */}
                {executionResult.steps[activeStepIdx] && (
                  <div className="p-4 rounded-2xl bg-[#080d18] border border-[#1c2742] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {getStepIcon(activeStepIdx, executionResult.steps[activeStepIdx].title)}
                      </span>
                      <h4 className="font-bold text-white text-xs">
                        {executionResult.steps[activeStepIdx].title}
                      </h4>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line pl-8">
                      {executionResult.steps[activeStepIdx].explanation}
                    </p>

                    {executionResult.steps[activeStepIdx].insight && (
                      <div className="ml-8 p-2.5 rounded-xl bg-[#0c1426] border border-[#182644] text-[11px] text-cyan-300 flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold shrink-0">
                          {category === 'debug' ? '💡 Root Cause:' : '💡 Invariant:'}
                        </span>
                        <span className="text-slate-300">{executionResult.steps[activeStepIdx].insight}</span>
                      </div>
                    )}

                    {executionResult.steps[activeStepIdx].dryRunState && (
                      <div className="p-2.5 rounded-xl bg-[#0a1122] border border-[#182642] text-[11px] font-mono text-cyan-300">
                        <span className="text-slate-400 block mb-0.5 font-sans font-bold text-[10px] uppercase tracking-wider">
                          Dry-Run State:
                        </span>
                        {executionResult.steps[activeStepIdx].dryRunState}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Apply Code Action Bar */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-600/40 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-300 font-medium">Ready to update editor?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#1e2a47]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playSuccess();
                    onApplyCode(executionResult.generatedCode);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {category === 'debug' ? 'Apply Bug Fix' : 'Apply Solution'}
                </button>
              </div>
            </div>
          </div>
        ) : activeRightTab === 'assistant' ? (
          /* Dedicated Category-Specific AI Copilot View */
          <div className="space-y-4">
            {/* Copilot Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#12182c] via-[#0c1222] to-[#160f24] border border-[#232f4e] shadow-lg relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-lg shadow-inner">
                    {category === 'debug' ? '🐞' : category === 'develop' ? '🏗️' : '🎯'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>
                        {category === 'debug'
                          ? 'Debugging Copilot'
                          : category === 'develop'
                          ? 'System Architecture Copilot'
                          : 'DSA Algorithm Copilot'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {category === 'debug'
                        ? 'Root-Cause & Invariant Diagnostics'
                        : category === 'develop'
                        ? 'Distributed Systems & Scalability Spec'
                        : '7-Section Algorithmic Solver'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Ready
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed relative z-10">
                {category === 'debug'
                  ? 'Ask me to isolate infinite loops, explain pointer state traces, formulate invariant assertions, or generate adversarial unit tests.'
                  : category === 'develop'
                  ? 'Ask me to audit concurrency bottlenecks, design API schemas, formulate cache invalidation patterns, or evaluate latency SLOs.'
                  : 'Ask me to derive mathematical invariants, prove algorithm correctness, derive asymptotic Big-O, or identify subtle boundary pitfalls.'}
              </p>
            </div>

            {/* Quick Diagnostic Inquiry Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {category === 'debug'
                      ? 'Root-Cause Inquiries'
                      : category === 'develop'
                      ? 'System Design Inquiries'
                      : 'Algorithmic Inquiries'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">Click to run</span>
              </div>

              <div className="space-y-1.5">
                {getCopilotQuestions().map((q, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAskCopilot(q.prompt)}
                    className="w-full p-2.5 rounded-xl bg-[#0a1020] hover:bg-[#131c36] border border-[#192540] hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs shrink-0">{q.icon}</span>
                      <span className="text-xs text-slate-200 group-hover:text-cyan-300 font-medium truncate">
                        {q.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Ask Copilot Custom Question Input Bar */}
            <div className="p-3 rounded-2xl bg-[#090e1c] border border-[#1a2744] space-y-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ask Copilot Custom Inquiry</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && copilotInput.trim()) {
                      handleAskCopilot(copilotInput);
                      setCopilotInput('');
                    }
                  }}
                  placeholder={
                    category === 'debug'
                      ? 'e.g. Why does right = mid cause an infinite loop?'
                      : category === 'develop'
                      ? 'e.g. How to prevent race conditions during token refill?'
                      : 'e.g. Why is two-pointer O(N) instead of O(N^2)?'
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-[#050811] border border-[#1d2b4a] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={() => {
                    if (copilotInput.trim()) {
                      handleAskCopilot(copilotInput);
                      setCopilotInput('');
                    }
                  }}
                  disabled={!copilotInput.trim()}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </div>

            {/* Core Discipline & Rules Card */}
            <div className="p-3 rounded-2xl bg-[#0c1224] border border-[#1b2644] text-[11px] space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <span>⚡</span>
                <span>
                  {category === 'debug'
                    ? 'Root-Cause Debugging Golden Rules'
                    : category === 'develop'
                    ? 'System Architecture Golden Rules'
                    : '7-Section DSA Discipline Rules'}
                </span>
              </div>
              <ul className="space-y-1 text-slate-400">
                {category === 'debug' ? (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Loop termination invariant: ensure search space strictly contracts on every branch.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Midpoint integer division: <code className="text-cyan-300 font-mono">Math.floor((l+r)/2)</code> rounds down, requiring <code className="text-cyan-300 font-mono">left = mid + 1</code>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>Always test 2-element arrays, extreme boundaries, and missing keys before applying fix.</span>
                    </li>
                  </>
                ) : category === 'develop' ? (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>Define clean interface contracts & idempotency keys before writing implementation logic.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>Prefer timestamp-based lazy state calculations over continuous background timer intervals.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>Enforce circuit breakers and bounded queues to prevent cascading resource starvation.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Restate constraints and boundary invariants before choosing data structures.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Verify asymptotic Big-O matches time constraints (e.g. N ≤ 10⁵ requires O(N log N)).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Audit Section 7 Pitfalls: integer overflow, duplicate keys, empty arrays, and singletons.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        ) : (
          /* Default Companion & Category-Aware Feature Cards View */
          <>
            {/* 3D Robot Mascot & Welcome */}
            <div className="flex flex-col items-center justify-center pt-3 pb-1 text-center">
              <RobotMascot category={category} className="mb-2" onAskPrompt={onSelectQuickPrompt} />

              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
                {getSubtitle()}
              </p>
            </div>

            {/* 3 Interactive Feature Cards in Row (Category-Aware) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {featureCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sounds.playPop(520);
                    if (onSelectQuickPrompt) {
                      onSelectQuickPrompt(card.prompt);
                    }
                  }}
                  className={`p-3 rounded-2xl ${card.boxBg} border flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-sm ${card.hoverBorder} transition-all`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${card.iconBg} border flex items-center justify-center`}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200 leading-tight whitespace-pre-line">
                    {card.title}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Quick Prompts Section (Category-Aware) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-white text-xs">
                  {category === 'debug'
                    ? 'Debugging Quick Prompts'
                    : category === 'develop'
                    ? 'Architecture Quick Prompts'
                    : 'Quick Prompts'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize bg-[#162035] px-2 py-0.5 rounded-full border border-[#223150]">
                  {category === 'debug' ? '🐞 Debug Lab' : category === 'develop' ? '⚙️ System Dev' : '⚡ DSA'}
                </span>
              </div>

              {/* Quick Prompts Action Rows */}
              <div className="space-y-1.5">
                {quickPromptsList.map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      sounds.playPop(500);
                      if (onSelectQuickPrompt) onSelectQuickPrompt(item.prompt);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#090e1c] hover:bg-[#11192e] border border-[#172238] flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs ${item.color}`}>{item.icon}</span>
                      <span className="text-xs text-slate-200 font-medium group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bottom Cyber Wave Accent at Corner */}
            <div className="h-20 pointer-events-none overflow-hidden -mx-4 -mb-4 flex items-end">
              <CyberWaveGraphic className="w-full h-full opacity-60" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
