import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, GitCompare, History, Loader2, Play, Save, X } from 'lucide-react';
import { Problem, PromptBenchmarkDimension, PromptBenchmarkResult, PromptVersion, SupportedLanguage } from '../types';
import { sounds } from '../utils/sounds';
import { analyzePromptQuality } from '../utils/promptQuality.js';
import { diffPromptVersions, loadPromptVersions, savePromptVersion } from '../utils/promptVersions.js';

interface PromptCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProblem: Problem;
  currentPrompt: string;
  code: string;
  language: SupportedLanguage;
  onApplyPrompt: (prompt: string) => void;
}

export const PromptCompareModal: React.FC<PromptCompareModalProps> = ({
  isOpen,
  onClose,
  activeProblem,
  currentPrompt,
  code,
  language,
  onApplyPrompt,
}) => {
  const recommendedPrompt = activeProblem.recommendedPrompt || `Solve ${activeProblem.title} and explain the result.`;
  const [promptA, setPromptA] = useState(currentPrompt || recommendedPrompt);
  const [promptB, setPromptB] = useState(recommendedPrompt);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<PromptBenchmarkResult | null>(null);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setVersions(loadPromptVersions(activeProblem.id));
    setPromptA(currentPrompt || recommendedPrompt);
    setPromptB(recommendedPrompt);
    setHistoryMessage(null);
    setBenchmarkResult(null);
    setBenchmarkError(null);
  }, [isOpen, activeProblem.id, currentPrompt, recommendedPrompt]);

  const promptDiff = useMemo(() => diffPromptVersions(promptA, promptB), [promptA, promptB]);
  const scoreA = analyzePromptQuality(promptA).overallScore;
  const scoreB = analyzePromptQuality(promptB).overallScore;

  if (!isOpen) return null;

  const saveVersion = (promptText: string) => {
    try {
      const result = savePromptVersion(activeProblem.id, promptText);
      setVersions(loadPromptVersions(activeProblem.id));
      setHistoryMessage(result.created ? 'Saved this prompt version.' : 'That exact prompt is already saved.');
    } catch (error) {
      setHistoryMessage(error instanceof Error ? error.message : 'Could not save this version.');
    }
  };

  const loadVersion = (version: PromptVersion, variant: 'A' | 'B') => {
    sounds.playPop(480);
    if (variant === 'A') setPromptA(version.prompt);
    else setPromptB(version.prompt);
    setHistoryMessage(`Loaded version from ${new Date(version.createdAt).toLocaleString()} as Variant ${variant}.`);
  };

  const restoreVersion = (version: PromptVersion) => {
    onApplyPrompt(version.prompt);
    sounds.playSuccess();
    onClose();
  };

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    setBenchmarkError(null);
    setBenchmarkResult(null);
    try {
      const response = await fetch('/api/prompt/compare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptA, promptB, problemTitle: activeProblem.title, problemContext: activeProblem.description,
          category: activeProblem.category, language, currentCode: code,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prompt benchmark failed.');
      setBenchmarkResult(data as PromptBenchmarkResult);
    } catch (error) {
      setBenchmarkError(error instanceof Error ? error.message : 'Prompt benchmark failed.');
    } finally {
      setIsBenchmarking(false);
    }
  };

  const dimensions: Array<{ key: PromptBenchmarkDimension; label: string }> = [
    { key: 'correctness', label: 'Correctness' },
    { key: 'requirementCoverage', label: 'Requirement coverage' },
    { key: 'clarity', label: 'Clarity' },
    { key: 'verification', label: 'Verification' },
    { key: 'efficiency', label: 'Efficiency' },
  ];

  const renderDiffLines = (kind: 'removed' | 'added', lines: string[]) => lines.map((line, index) => (
    <div key={`${kind}-${index}`} className={kind === 'removed' ? 'bg-rose-950/30 text-rose-200' : 'bg-emerald-950/30 text-emerald-200'}>
      <span className="mr-2 opacity-60">{kind === 'removed' ? '−' : '+'}</span>{line || ' '}
    </div>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl h-[88vh] bg-[#0c101d] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        <div className="p-4 px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Prompt Versions & Comparison</h2>
              <p className="text-xs text-slate-400">{activeProblem.title} · versions are saved in this browser</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close prompt versions" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-xs text-slate-400">
            Prompt quality estimates are local text signals. Run the matched benchmark to generate both answers with the same model and settings, then have a blinded AI evaluator score them. This is an AI judgment, not code execution or a correctness proof.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={isBenchmarking || !promptA.trim() || !promptB.trim()} onClick={() => void runBenchmark()} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {isBenchmarking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isBenchmarking ? 'Running matched comparison…' : 'Run matched AI comparison'}
            </button>
            <span className="text-xs text-slate-500">Runs two answers plus one evaluator request using {language} and the same task context.</span>
          </div>
          {benchmarkError && <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{benchmarkError}</div>}

          {benchmarkResult && <section className="space-y-4 rounded-xl border border-emerald-700/40 bg-[#080e19] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-bold text-white">Matched answer evaluation · {benchmarkResult.evaluation.winner === 'tie' ? 'Tie' : `Variant ${benchmarkResult.evaluation.winner} scored higher`}</h3><p className="mt-1 text-xs text-slate-400">Requested model: {benchmarkResult.requestedModel}{benchmarkResult.variantA.modelVersion ? ` · Provider version A: ${benchmarkResult.variantA.modelVersion}` : ''}{benchmarkResult.variantB.modelVersion ? ` · Provider version B: ${benchmarkResult.variantB.modelVersion}` : ''}</p></div>
              <div className="text-right text-[11px] text-slate-400">Measured server latency: A {benchmarkResult.variantA.latencyMs} ms · B {benchmarkResult.variantB.latencyMs} ms · evaluator {benchmarkResult.evaluationLatencyMs} ms</div>
            </div>
            <p className="text-sm text-slate-300">{benchmarkResult.evaluation.summary}</p>
            <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="text-slate-400"><th className="py-2">Evaluation rubric (0–5)</th><th className="py-2 text-cyan-300">A</th><th className="py-2 text-purple-300">B</th></tr></thead><tbody>
              {dimensions.map(({ key, label }) => <tr key={key} className="border-t border-slate-800"><td className="py-2 text-slate-300">{label}<span className="ml-2 text-slate-500">{benchmarkResult.rubric.dimensions[key]}</span></td><td className="py-2 font-bold text-cyan-200">{benchmarkResult.evaluation.scores.A[key]}</td><td className="py-2 font-bold text-purple-200">{benchmarkResult.evaluation.scores.B[key]}</td></tr>)}
            </tbody></table></div>
            <div className="grid gap-3 md:grid-cols-2"><div className="rounded-lg bg-slate-950 p-3"><h4 className="mb-1 font-semibold text-cyan-300">Variant A evaluator notes</h4><p className="whitespace-pre-wrap text-xs text-slate-300">{benchmarkResult.evaluation.reasons.A}</p></div><div className="rounded-lg bg-slate-950 p-3"><h4 className="mb-1 font-semibold text-purple-300">Variant B evaluator notes</h4><p className="whitespace-pre-wrap text-xs text-slate-300">{benchmarkResult.evaluation.reasons.B}</p></div></div>
            <p className="rounded-lg border border-slate-800 p-3 text-xs text-slate-400">{benchmarkResult.evaluation.reasons.decision}<br />{benchmarkResult.disclosure}</p>
            {benchmarkResult.evaluation.caveats.map((caveat, index) => <p key={index} className="text-xs text-amber-200">Caveat: {caveat}</p>)}
            {benchmarkResult.usageMetadata && <div className="text-[11px] text-slate-500">Provider-reported token counts only: {Object.entries(benchmarkResult.usageMetadata).map(([key, usage]) => `${key} ${usage?.totalTokenCount ?? 'partial'}`).join(' · ')}. Cost was not returned.</div>}
            <div className="grid gap-3 md:grid-cols-2"><details className="rounded-lg bg-slate-950 p-3"><summary className="cursor-pointer font-semibold text-cyan-300">Variant A answer</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-300">{benchmarkResult.variantA.text}</pre></details><details className="rounded-lg bg-slate-950 p-3"><summary className="cursor-pointer font-semibold text-purple-300">Variant B answer</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-300">{benchmarkResult.variantB.text}</pre></details></div>
          </section>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { key: 'A' as const, value: promptA, setValue: setPromptA, score: scoreA, borderClass: 'border-cyan-500/30', labelClass: 'text-cyan-300' },
              { key: 'B' as const, value: promptB, setValue: setPromptB, score: scoreB, borderClass: 'border-purple-500/30', labelClass: 'text-purple-300' },
            ]).map((variant) => (
              <section key={variant.key} className={`p-4 rounded-xl bg-[#090e1c] border ${variant.borderClass} space-y-3 flex flex-col`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`prompt-version-${variant.key}`} className={`text-xs font-bold ${variant.labelClass}`}>
                    Variant {variant.key} · Quality estimate {variant.score}/100
                  </label>
                  <button type="button" onClick={() => saveVersion(variant.value)} className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1 hover:bg-slate-700">
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
                <textarea
                  id={`prompt-version-${variant.key}`}
                  value={variant.value}
                  onChange={(event) => { variant.setValue(event.target.value); setBenchmarkResult(null); setBenchmarkError(null); }}
                  rows={7}
                  className="w-full bg-[#060a14] border border-[#18233c] rounded-xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 resize-y"
                />
                <button type="button" onClick={() => { onApplyPrompt(variant.value); onClose(); }} className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2">
                  Restore Variant {variant.key} to editor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>
            ))}
          </div>

          <section className="rounded-xl border border-[#1e2a47] bg-[#080c18] p-4 space-y-2">
            <h3 className="font-bold text-white">Text changes · A → B</h3>
            {promptDiff.removed.length === 0 && promptDiff.added.length === 0 ? (
              <p className="text-slate-400">These prompts are identical.</p>
            ) : (
              <div className="max-h-56 overflow-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {renderDiffLines('removed', promptDiff.removed)}
                {renderDiffLines('added', promptDiff.added)}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#1e2a47] bg-[#080c18] p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white"><History className="w-4 h-4 text-purple-400" /> Saved versions ({versions.length})</div>
            {historyMessage && <p role="status" className="text-[11px] text-emerald-300">{historyMessage}</p>}
            {versions.length ? (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-slate-300">{new Date(version.createdAt).toLocaleString()} · quality estimate {version.qualityScore}/100</div>
                      <p className="mt-1 text-slate-500 truncate">{version.prompt}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={() => loadVersion(version, 'A')} className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">Load A</button>
                      <button type="button" onClick={() => loadVersion(version, 'B')} className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">Load B</button>
                      <button type="button" onClick={() => restoreVersion(version)} className="px-2 py-1 rounded bg-purple-700 text-white hover:bg-purple-600">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500">No saved versions yet. Save a variant above or save an optimized prompt.</p>}
          </section>
        </div>
      </motion.div>
    </div>
  );
};
