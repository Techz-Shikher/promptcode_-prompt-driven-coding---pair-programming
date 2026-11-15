import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';
import { CodeReviewResult } from '../types';
import { DoodleBadge, DoodleSparkle, SquiggleUnderline } from './DoodleAssets';
import { sounds } from '../utils/sounds';

interface InteractiveCodeReviewProps {
  isOpen: boolean;
  onClose: () => void;
  reviewResult: CodeReviewResult | null;
  errorMessage?: string | null;
  isLoading: boolean;
  onRunReview: (persona: string) => void;
  onApplyLineFix: (lineNumber: number, replacement: string) => void;
}

export const InteractiveCodeReview: React.FC<InteractiveCodeReviewProps> = ({
  isOpen,
  onClose,
  reviewResult,
  errorMessage,
  isLoading,
  onRunReview,
  onApplyLineFix,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('Senior Staff Engineer');

  if (!isOpen) return null;

  const personas = [
    'Senior Staff Engineer',
    'FAANG Technical Interviewer',
    'Security & Concurrency Auditor',
    'Clean Code & Pragmatic Mentor',
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
          color: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          color: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
        };
      case 'praise':
        return {
          icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-indigo-400" />,
          color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-800 bg-slate-950/85 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-sm">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Interactive Code Review Session</h2>
                <DoodleBadge variant="emerald" tilt={-1}>
                  AI & Peer Audit
                </DoodleBadge>
              </div>
              <p className="text-[11px] text-slate-400">
                Line-by-line static audit, algorithmic complexity evaluation, and prompt tips
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

        {/* Persona Selector & Refresh */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-semibold">Reviewer Persona:</span>
            <select
              value={selectedPersona}
              onChange={(e) => {
                sounds.playPop(480);
                setSelectedPersona(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 font-semibold cursor-pointer"
            >
              {personas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playSuccess();
              onRunReview(selectedPersona);
            }}
            disabled={isLoading}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Code...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>Run Review</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4.5 text-xs select-text">
          {isLoading ? (
            <div className="py-14 flex flex-col items-center justify-center space-y-4 text-center select-none">
              <RotateCcw className="w-9 h-9 text-indigo-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Analyzing Invariants, Edge Cases & Complexity...</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Generating line-by-line annotations and assessing prompt alignment.
                </p>
              </div>
            </div>
          ) : errorMessage ? (
            <div role="alert" className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 text-amber-200">
              {errorMessage}
            </div>
          ) : reviewResult ? (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-slate-400">
                Scores and annotations are AI review estimates; code has not been compiled or executed here.
              </div>
              {/* Score Summary Card */}
              <div className="p-4.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white">{reviewResult.overallScore}/100</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {reviewResult.verdict}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-indigo-300">Time: {reviewResult.timeComplexity}</span>
                    <span>•</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-emerald-300">Space: {reviewResult.spaceComplexity}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{reviewResult.summary}</p>

                {/* Metric Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-900">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Correctness</div>
                    <div className="text-base font-black text-indigo-400">{reviewResult.ratings.correctness}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Efficiency</div>
                    <div className="text-base font-black text-emerald-400">{reviewResult.ratings.efficiency}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Readability</div>
                    <div className="text-base font-black text-purple-400">{reviewResult.ratings.readability}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Prompt Align</div>
                    <div className="text-base font-black text-pink-400">{reviewResult.ratings.promptAlignment}%</div>
                  </div>
                </div>
              </div>

              {/* Line-by-Line Annotations */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                  Line-by-Line Annotations ({reviewResult.annotations.length})
                </h3>

                <div className="space-y-2">
                  {reviewResult.annotations.map((ann, idx) => {
                    const badge = getSeverityBadge(ann.severity);
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-slate-800">
                              Line {ann.lineNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}
                            >
                              {badge.icon}
                              <span className="capitalize">{ann.severity}</span>
                            </span>
                          </div>

                          {ann.suggestedReplacement && (
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                sounds.playSuccess();
                                onApplyLineFix(ann.lineNumber, ann.suggestedReplacement!);
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Apply Fix
                            </motion.button>
                          )}
                        </div>

                        <div className="font-bold text-slate-200">{ann.title}</div>
                        <p className="text-slate-400 leading-relaxed">{ann.comment}</p>

                        {ann.suggestedReplacement && (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-emerald-300">
                            <span className="text-slate-500 select-none">// Suggested fix: </span>
                            {ann.suggestedReplacement}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Engineering Tip */}
              {reviewResult.promptEngineeringTip && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-800/50 space-y-1 text-xs shadow-sm">
                  <div className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Prompt Tip to Avoid this Review Flaw</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{reviewResult.promptEngineeringTip}</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-14 text-center text-slate-400 space-y-3 select-none">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">No Review Performed Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Run Review" above to generate line-by-line feedback from your selected reviewer persona.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
