import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Wand2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Download,
  Save
} from 'lucide-react';
import { ProblemCategory } from '../types';
import { savePromptVersion } from '../utils/promptVersions.js';
import { DoodleBadge, DoodleSparkle, SquiggleUnderline } from './DoodleAssets';
import { sounds } from '../utils/sounds';

interface PromptOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  problemId: string;
  category: ProblemCategory;
  problemTitle: string;
  onApplyOptimizedPrompt: (prompt: string) => void;
}

export const PromptOptimizerModal: React.FC<PromptOptimizerModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  problemId,
  category,
  problemTitle,
  onApplyOptimizedPrompt,
}) => {
  const [rawPrompt, setRawPrompt] = useState(initialPrompt || '');
  const [goalType, setGoalType] = useState<ProblemCategory>(category || 'solve');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [optimizationResult, setOptimizationResult] = useState<{
    optimizedPrompt: string;
    promptRating: number;
    optimizedRating: number;
    critique: string;
    appliedTechniques: string[];
    promptTemplateUsed: string;
    changes: Array<{ aspect: string; before: string; after: string; reason: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunOptimization = async () => {
    if (!rawPrompt.trim()) return;
    sounds.playPop(520);
    setIsOptimizing(true);
    setOptimizationError(null);

    try {
      const res = await fetch('/api/prompt/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt,
          goalType,
          problemTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prompt optimization is unavailable.');
      sounds.playSuccess();
      setOptimizationResult(data);
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
      setOptimizationError(error instanceof Error ? error.message : 'Prompt optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (optimizationResult) {
      sounds.playPop(640);
      navigator.clipboard.writeText(optimizationResult.optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveVersion = () => {
    if (!optimizationResult) return;
    try {
      const result = savePromptVersion(problemId, optimizationResult.optimizedPrompt);
      setSaveMessage(result.created ? 'Saved as a prompt version.' : 'This prompt is already saved in the version history.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Could not save this prompt version.');
    }
  };

  const handleExport = () => {
    if (!optimizationResult) return;
    const blob = new Blob([optimizationResult.optimizedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${problemId || 'prompt'}-optimized-prompt.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs"
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-800 bg-slate-950/85 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/40 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Prompt Optimizer & Grader</h2>
                <DoodleBadge variant="pink" tilt={-1}>
                  Auto-Refine
                </DoodleBadge>
              </div>
              <p className="text-[11px] text-slate-400">
                Improve clarity, context, constraints, and verification criteria.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playPop(420);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4.5 select-text">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-slate-400">
            Prompt ratings are AI estimates based on the returned review; they are not measured code correctness or execution results.
          </div>

          {/* Input Form */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200">Your Raw Prompt:</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Goal:</span>
                <select
                  value={goalType}
                  onChange={(e) => {
                    sounds.playPop(480);
                    setGoalType(e.target.value as ProblemCategory);
                  }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold cursor-pointer"
                >
                  <option value="solve">DSA & Problem Solving</option>
                  <option value="debug">Debugging & Bug Patching</option>
                  <option value="develop">Module Development</option>
                </select>
              </div>
            </div>

            <textarea
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Solve two sum or fix the while loop in binary search..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 leading-relaxed font-mono text-xs"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop(540);
                  const title = problemTitle || 'Two Sum';
                  setGoalType('solve');
                  setRawPrompt(`Solve the DSA question "${title}" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🎯</span>
                <span>Load 7-Section DSA Standard Prompt</span>
              </button>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleRunOptimization}
                  disabled={isOptimizing || !rawPrompt.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-600/25 transition-all cursor-pointer"
                >
                  {isOptimizing ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading & Upgrading...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Grade & Upgrade Prompt</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {optimizationError && (
            <div role="alert" className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-amber-200">
              {optimizationError}
            </div>
          )}

          {/* Results Card with Smooth Animation */}
          <AnimatePresence>
            {optimizationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4 pt-3 border-t border-slate-800"
              >
                {/* Score comparison */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1 text-center">
                    <div className="text-[10px] uppercase font-bold text-rose-400">Raw Prompt Score</div>
                    <div className="text-2xl font-black text-rose-300">
                      {optimizationResult.promptRating}/100
                    </div>
                    <p className="text-[11px] text-slate-400">AI estimate for the original prompt</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Optimized Score</div>
                    <div className="text-2xl font-black text-emerald-300">
                      {optimizationResult.optimizedRating}/100
                    </div>
                    <p className="text-[11px] text-slate-400">AI estimate for the revised prompt</p>
                  </div>
                </div>

                {/* Explicit change explanations */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
                  <div className="font-bold text-slate-200">What changed and why</div>
                  {optimizationResult.changes.length ? optimizationResult.changes.map((change, index) => (
                    <div key={`${change.aspect}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1.5">
                      <div className="font-semibold text-pink-300">{change.aspect}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><span className="text-slate-500">Before: </span>{change.before || '(not specified)'}</div>
                        <div><span className="text-slate-500">After: </span>{change.after}</div>
                      </div>
                      <div className="text-slate-400"><span className="text-slate-500">Reason: </span>{change.reason}</div>
                    </div>
                  )) : <p className="text-slate-400">No specific changes were returned.</p>}
                </div>

                {/* Critique */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-200">Architect Critique:</div>
                  <p className="text-slate-300 leading-relaxed">{optimizationResult.critique}</p>
                </div>

                {/* Applied Techniques */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Applied Prompt Engineering Techniques:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {optimizationResult.appliedTechniques.map((tech, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgraded Prompt Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 to-pink-950/50 border border-purple-800/60 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      Optimized Prompt
                    </span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveVersion}
                        className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /><span>Save version</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /><span>Export</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          sounds.playSuccess();
                          onApplyOptimizedPrompt(optimizationResult.optimizedPrompt);
                          onClose();
                        }}
                        className="px-3.5 py-1 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <span>Insert into IDE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
                    {optimizationResult.optimizedPrompt}
                  </div>
                  {saveMessage && <p role="status" className="text-[11px] text-emerald-300">{saveMessage}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
