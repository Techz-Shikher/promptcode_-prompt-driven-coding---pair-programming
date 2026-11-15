import React, { useState } from 'react';
import { Bug, FlaskConical, Lightbulb, Loader2, X } from 'lucide-react';
import { SupportedLanguage } from '../types';

type Task = 'explain' | 'debug' | 'tests';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: SupportedLanguage;
  problemTitle: string;
  problemDescription: string;
  onApplyFix: (suggestedFix: string) => void;
}
const tasks: Array<{ id: Task; label: string; icon: React.ReactNode; endpoint: string }> = [
  { id: 'explain', label: 'Explain', icon: <Lightbulb size={15} />, endpoint: '/api/code/explain' },
  { id: 'debug', label: 'Debug', icon: <Bug size={15} />, endpoint: '/api/code/debug' },
  { id: 'tests', label: 'Test cases', icon: <FlaskConical size={15} />, endpoint: '/api/code/test-cases' },
];

export function CodingAssistantModal({ isOpen, onClose, code, language, problemTitle, problemDescription, onApplyFix }: Props) {
  const [task, setTask] = useState<Task>('explain');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const selected = tasks.find((item) => item.id === task)!;
      const response = await fetch(selected.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemTitle, problemDescription }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI coding assistance is unavailable.');
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'AI coding assistance failed.');
    } finally { setLoading(false); }
  };
  const suggestedFix = typeof result?.suggestedFix === 'string' ? result.suggestedFix : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="AI coding assistant" onClick={(event) => event.stopPropagation()} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 p-5">
          <div><h2 className="text-lg font-bold text-white">AI coding assistant</h2><p className="mt-1 text-xs text-slate-400">Analysis is based on the code and task context; it has not been compiled or run.</p></div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X size={18} /></button>
        </header>
        <div className="flex gap-2 border-b border-slate-800 p-4">
          {tasks.map((item) => <button key={item.id} onClick={() => { setTask(item.id); setResult(null); setError(''); }} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${task === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>{item.icon}{item.label}</button>)}
          <button disabled={loading || !code.trim()} onClick={() => void run()} className="ml-auto flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading && <Loader2 size={15} className="animate-spin" />}{loading ? 'Working…' : 'Analyze code'}</button>
        </div>
        <div className="min-h-48 flex-1 overflow-auto p-5">
          {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">{error}</div>}
          {!result && !error && <p className="text-sm text-slate-400">Choose an analysis and run it to receive structured, task specific feedback.</p>}
          {result && <div className="space-y-4 text-sm text-slate-200">
            {typeof result.summary === 'string' && <p className="rounded-xl bg-slate-900 p-4 leading-relaxed">{result.summary}</p>}
            {typeof result.rootCause === 'string' && <section><h3 className="mb-2 font-semibold text-amber-300">Likely root cause</h3><p className="whitespace-pre-wrap text-slate-300">{result.rootCause}</p></section>}
            {Array.isArray(result.sections) && <div className="space-y-3">{result.sections.map((item, index) => <section key={index} className="rounded-xl bg-slate-900 p-4"><h3 className="mb-1 font-semibold text-indigo-300">{String((item as {title?: unknown}).title)}</h3><p className="whitespace-pre-wrap text-slate-300">{String((item as {explanation?: unknown}).explanation)}</p></section>)}</div>}
            {Array.isArray(result.findings) && <div className="space-y-2">{result.findings.map((item, index) => <section key={index} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{String((item as {title?: unknown}).title)}{(item as {lineNumber?: unknown}).lineNumber ? ` · line ${(item as {lineNumber: number}).lineNumber}` : ''}</h3><p className="mt-1 text-slate-400">{String((item as {explanation?: unknown}).explanation)}</p></section>)}</div>}
            {suggestedFix && <section className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4"><h3 className="mb-2 font-semibold text-emerald-300">Suggested fix</h3><pre className="overflow-auto whitespace-pre-wrap text-xs">{suggestedFix}</pre><button onClick={() => onApplyFix(suggestedFix)} className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Replace editor code with this fix</button></section>}
            {Array.isArray(result.testCases) && <div className="space-y-2">{result.testCases.map((item, index) => <section key={index} className="rounded-xl bg-slate-900 p-4"><h3 className="font-semibold text-purple-300">{String((item as {name?: unknown}).name)} · {String((item as {kind?: unknown}).kind)}</h3><p className="mt-2"><strong>Input:</strong> <code>{String((item as {input?: unknown}).input)}</code></p><p><strong>Expected:</strong> {String((item as {expectedBehavior?: unknown}).expectedBehavior)}</p><p className="mt-1 text-slate-400">{String((item as {rationale?: unknown}).rationale)}</p></section>)}</div>}
            {Array.isArray(result.keyTerms) && <p className="text-xs text-slate-400">Key terms: {result.keyTerms.join(' · ')}</p>}
            {Array.isArray(result.caveats) && result.caveats.map((item, index) => <p key={index} className="text-xs text-amber-200">Note: {String(item)}</p>)}
            {Array.isArray(result.regressionTests) && <section><h3 className="mb-1 font-semibold text-purple-300">Suggested regression tests</h3><ul className="list-disc space-y-1 pl-5 text-slate-300">{result.regressionTests.map((item, index) => <li key={index}>{String(item)}</li>)}</ul></section>}
          </div>}
        </div>
      </section>
    </div>
  );
}
