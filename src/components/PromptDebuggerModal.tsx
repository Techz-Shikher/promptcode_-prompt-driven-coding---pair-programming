import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Bug, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { ProblemCategory, PromptDiagnosticResult } from '../types';
import { diagnosePromptLocally } from '../utils/promptDiagnostics.js';
import { sounds } from '../utils/sounds';

interface PromptDebuggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  category: ProblemCategory;
  problemTitle: string;
}

const severityClasses = {
  high: 'border-rose-700/50 bg-rose-950/30 text-rose-200',
  medium: 'border-amber-700/50 bg-amber-950/30 text-amber-200',
  low: 'border-slate-700 bg-slate-950/60 text-slate-300',
};

export const PromptDebuggerModal: React.FC<PromptDebuggerModalProps> = ({
  isOpen,
  onClose,
  prompt,
  category,
  problemTitle,
}) => {
  const localResult = useMemo(() => diagnosePromptLocally(prompt), [prompt]);
  const [aiResult, setAiResult] = useState<PromptDiagnosticResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setAiResult(null);
    setAiError(null);
  }, [isOpen, prompt]);

  if (!isOpen) return null;

  const runAiDiagnostics = async () => {
    setIsChecking(true);
    setAiError(null);
    sounds.playPop(520);
    try {
      const response = await fetch('/api/prompt/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, goalType: category, problemTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI prompt diagnostics are unavailable.');
      setAiResult(data);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI prompt diagnostics failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const renderIssues = (result: PromptDiagnosticResult, source: string) => (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{source}</h3>
        <span className="text-slate-400">{result.issues.length} finding{result.issues.length === 1 ? '' : 's'}</span>
      </div>
      <p className="text-slate-400">{result.summary}</p>
      {result.issues.length ? result.issues.map((issue, index) => (
        <article key={`${issue.category}-${index}`} className={`rounded-xl border p-3.5 space-y-1.5 ${severityClasses[issue.severity]}`}>
          <div className="flex items-center justify-between gap-3">
            <strong>{issue.issue}</strong>
            <span className="uppercase text-[10px] font-bold tracking-wide">{issue.severity} · {issue.category}</span>
          </div>
          <p>{issue.explanation}</p>
          <p><strong>Suggested correction:</strong> {issue.suggestedCorrection}</p>
        </article>
      )) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-3 text-emerald-200">
          <CheckCircle2 className="w-4 h-4" /> No issues detected by this check.
        </div>
      )}
    </section>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[88vh] rounded-2xl border border-[#1e2a47] bg-[#0c101d] shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs"
      >
        <header className="flex items-center justify-between border-b border-[#172033] bg-[#090d18] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-white">Prompt Debugger</h2>
              <p className="text-slate-400">Find unclear, missing, or conflicting instructions.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close prompt debugger" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-5 p-5 select-text">
          <div className="rounded-xl border border-[#1e2a47] bg-[#080c18] p-3.5">
            <div className="mb-1 font-semibold text-slate-400">Prompt under review · {problemTitle}</div>
            <div className="whitespace-pre-wrap font-mono text-slate-200">{prompt || '(empty prompt)'}</div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-slate-400">
            Local findings come from disclosed text rules. Gemini findings are shown separately and depend on server configuration.
          </div>

          {renderIssues(localResult, 'Local rule checks')}
          {aiError && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {aiError}
            </div>
          )}
          {aiResult && renderIssues(aiResult, 'Gemini diagnostics')}
        </div>

        <footer className="border-t border-[#172033] bg-[#090d18] p-4 flex justify-end">
          <button
            type="button"
            onClick={runAiDiagnostics}
            disabled={isChecking || !prompt.trim()}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {isChecking ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
            {isChecking ? 'Checking with Gemini…' : 'Run AI diagnostics'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};
