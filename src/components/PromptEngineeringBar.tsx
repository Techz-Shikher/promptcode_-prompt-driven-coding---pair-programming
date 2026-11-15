import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Paperclip,
  Wand2,
  Bug
} from 'lucide-react';
import { ProblemCategory } from '../types';
import { analyzePromptQuality } from '../utils/promptQuality.js';
import { sounds } from '../utils/sounds';

interface PromptEngineeringBarProps {
  prompt: string;
  onChangePrompt: (newPrompt: string) => void;
  onExecutePrompt: () => void;
  isExecuting: boolean;
  onOptimizePrompt: () => void;
  onDebugPrompt: () => void;
  category: ProblemCategory;
}

export const PromptEngineeringBar: React.FC<PromptEngineeringBarProps> = ({
  prompt,
  onChangePrompt,
  onExecutePrompt,
  isExecuting,
  onOptimizePrompt,
  onDebugPrompt,
  category,
}) => {
  const getTemplates = () => {
    switch (category) {
      case 'debug':
        return [
          {
            icon: '🔍',
            label: 'Trace Infinite Loop Bug',
            text: 'Act as a Senior Debugger. Trace why the while loop hangs on two-element arrays. Explain the pointer updates and provide the minimal fix.',
          },
          {
            icon: '🎯',
            label: 'Root Cause & Fix',
            text: 'Identify the exact root cause of failure. Explain the off-by-one boundary condition and patch with invariant preservation.',
          },
          {
            icon: '🛡️',
            label: 'Adversarial Edge Tests',
            text: 'Analyze the current function for subtle regression vulnerabilities and write 3 edge-case unit tests to stress-test it.',
          },
        ];
      case 'develop':
        return [
          {
            icon: '📐',
            label: 'Contract-First Spec',
            text: 'Act as a Principal Backend Architect. Implement this module in TypeScript with strict typing, zero background timers, and full test contracts.',
          },
          {
            icon: '⚡',
            label: 'High-Concurrency Refill',
            text: 'Implement lazy timestamp-based refill math to avoid interval leaks. Handle sub-millisecond precision and burst deductions safely.',
          },
          {
            icon: '🔒',
            label: 'Type-Safe Event Map',
            text: 'Build strongly typed event emitter using generic event maps. Include automatic unsubscribe handlers and leak warnings.',
          },
        ];
      case 'solve':
      default:
        return [
          {
            icon: '🎯',
            label: '7-Section DSA Standard',
            text: 'Solve this DSA question strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.',
          },
          {
            icon: '⚡',
            label: 'Technique & Observations',
            text: 'Solve using the 7-section DSA format with deep emphasis on Section 2: Naming the Technique and Section 3: Key Observations & Invariants.',
          },
          {
            icon: '🛡️',
            label: 'Correctness & Pitfalls',
            text: 'Solve using the 7-section DSA format highlighting Section 5: Correctness Arguments and Section 7: Potential Pitfalls & Corner Cases.',
          },
        ];
    }
  };

  const templates = getTemplates();
  const quality = analyzePromptQuality(prompt);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isExecuting && prompt.trim()) {
        sounds.playSuccess();
        onExecutePrompt();
      }
    }
  };

  const handleSelectTemplate = (text: string) => {
    sounds.playPop(520);
    onChangePrompt(text);
  };

  const handleApply7SectionFormat = () => {
    sounds.playPop(560);
    const baseTopic = prompt.trim()
      ? prompt.replace(/^solve\s*/i, '').replace(/strictly using the 7-section format.*/i, '').trim()
      : 'this DSA question';
    const formatted = `Solve ${baseTopic} strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.`;
    onChangePrompt(formatted);
  };

  return (
    <div className="bg-[#0b0f19] border-t border-[#172033] p-3.5 flex flex-col gap-2.5 shadow-xl select-none">
      {/* Header: Prompt Studio, Prompt-Driven Coding badge, Prompt Power meter */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
            <span className="text-pink-400">✨</span>
            <span>Prompt Studio</span>
          </div>

          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#231742] text-purple-300 border border-purple-500/50 text-[11px] font-semibold">
            <span className="text-[9px]">▶</span>
            <span>Prompt-Driven Coding</span>
          </span>
        </div>

        {/* Transparent prompt quality estimate */}
        <button
          type="button"
          onClick={() => setShowQualityDetails((current) => !current)}
          aria-expanded={showQualityDetails}
          title={quality.methodology}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <span className="text-slate-400 font-medium">Prompt Quality:</span>
          <div className="w-16 h-2 bg-[#141b2e] rounded-full overflow-hidden p-0.5 border border-[#1e2a47]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 rounded-full"
              initial={{ width: '60%' }}
              animate={{ width: `${quality.overallScore}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-slate-300 font-mono font-bold text-[11px]">
            {quality.overallScore}/100
          </span>
        </button>
      </div>

      {showQualityDetails && (
        <div className="rounded-xl border border-[#1e2a47] bg-[#080c18] p-3 text-[11px] text-slate-300 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
            {Object.entries(quality.categoryScores).map(([key, categoryScore]) => (
              <span key={key} className="flex justify-between gap-2">
                <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                <strong>{categoryScore.score}</strong>
              </span>
            ))}
          </div>
          {quality.weaknesses.length > 0 ? (
            <div><strong className="text-amber-300">Gaps:</strong> {quality.suggestions.join(' ')}</div>
          ) : (
            <div className="text-emerald-300">No gaps detected by these text checks.</div>
          )}
          <p className="text-slate-500">{quality.methodology}</p>
        </div>
      )}

      {/* Template Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
        {templates.map((tpl, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectTemplate(tpl.text)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0f1527] hover:bg-[#162039] text-slate-200 text-[11px] font-medium whitespace-nowrap transition-all border border-[#1e2a47] cursor-pointer"
          >
            <span>{tpl.icon}</span>
            <span>{tpl.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Main Single-line Search/Prompt Input Field */}
      <div className="relative flex items-center gap-2.5 bg-[#080c18] border border-[#1b253d] focus-within:border-purple-500/70 rounded-2xl p-2 px-3.5 shadow-inner transition-all">
        <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-pulse" />

        <input
          type="text"
          id="prompt-input-field"
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Describe what you want to do... (e.g. "Give optimal solution with explanation")'
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none font-normal"
        />

        {/* 7-Section DSA Quick Format Button */}
        {category === 'solve' && (
          <button
            onClick={handleApply7SectionFormat}
            className="px-2.5 py-1 rounded-lg bg-[#1a1236] hover:bg-[#281a54] text-purple-300 border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            title="Convert to Standard 7-Section DSA Format (Restating, Technique, Observations, Algorithm, Correctness, Complexity, Pitfalls)"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">7-Section DSA</span>
          </button>
        )}

        {/* Paperclip icon */}
        <button
          onClick={() => {
            sounds.playPop(460);
            onOptimizePrompt();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Attach Context or Optimize"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onDebugPrompt}
          disabled={!prompt.trim()}
          className="p-1 rounded-lg text-amber-300 hover:text-amber-200 disabled:opacity-40 transition-colors cursor-pointer"
          title="Diagnose missing, ambiguous, or conflicting prompt instructions"
          aria-label="Debug prompt"
        >
          <Bug className="w-4 h-4" />
        </button>

        {/* Generate Solution Action Button */}
        <motion.button
          id="btn-execute-prompt"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sounds.playSuccess();
            onExecutePrompt();
          }}
          disabled={isExecuting || !prompt.trim()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer select-none"
        >
          {isExecuting ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span className="text-amber-300">⚡</span>
              <span>Generate Solution</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
