import React, { useState } from 'react';
import { Clock3, Play, Save, Trash2, X } from 'lucide-react';
import type { WorkflowRecord } from '../utils/workflows.js';

interface WorkflowHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: WorkflowRecord[];
  hasCurrentWorkflow: boolean;
  onSaveCurrent: () => Promise<void>;
  onResume: (workflow: WorkflowRecord) => void;
  onDelete: (id: string) => void;
}

export const WorkflowHistoryModal: React.FC<WorkflowHistoryModalProps> = ({ isOpen, onClose, workflows, hasCurrentWorkflow, onSaveCurrent, onResume, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="workflow-history-title" className="w-full max-w-3xl max-h-[85vh] rounded-2xl border border-[#26334f] bg-[#0b1020] text-slate-200 shadow-2xl flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-5 border-b border-[#202a40]">
          <div><h2 id="workflow-history-title" className="text-lg font-bold text-white">Development workflows</h2><p className="text-xs text-slate-400 mt-1">Save a working state, resume at its current step, and review earlier runs or failures.</p></div>
          <button onClick={onClose} aria-label="Close workflow history" className="p-2 rounded-lg hover:bg-slate-800"><X size={18} /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3">
            <div><p className="text-sm font-semibold text-white">Current editor state</p><p className="text-xs text-slate-400">Includes prompt, code, test cases, generated result, and current workflow step.</p></div>
            <button disabled={!hasCurrentWorkflow || isSaving} onClick={async () => { setIsSaving(true); try { await onSaveCurrent(); } finally { setIsSaving(false); } }} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><Save size={14} /> {isSaving ? 'Saving…' : 'Save workflow'}</button>
          </div>
          {!workflows.length ? <div className="py-12 text-center text-sm text-slate-500">No saved workflows yet.</div> : workflows.map((workflow) => (
            <article key={workflow.id} className="rounded-xl border border-[#26334f] bg-[#0d1424] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><h3 className="font-semibold text-white truncate">{workflow.title}</h3><p className="mt-1 text-xs text-slate-400">{workflow.problemTitle} · {workflow.language} · Updated {new Date(workflow.updatedAt || Date.now()).toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">Step {workflow.currentStep + 1} of {Math.max(workflow.steps.length, 1)} · {workflow.status} · {workflow.runHistory.length} recorded runs</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { onResume(workflow); onClose(); }} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700/70 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600"><Play size={13} /> Resume</button>
                  <button onClick={() => setExpandedId(expandedId === workflow.id ? null : workflow.id)} aria-label="Toggle workflow run history" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><Clock3 size={15} /></button>
                  <button onClick={() => onDelete(workflow.id)} aria-label="Delete workflow" className="rounded-lg border border-rose-900/70 p-2 text-rose-300 hover:bg-rose-950/60"><Trash2 size={15} /></button>
                </div>
              </div>
              {workflow.steps.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{workflow.steps.map((step) => <span key={step.key} className={`rounded-full border px-2 py-1 text-[10px] ${step.status === 'failed' ? 'border-rose-800 text-rose-300' : step.status === 'completed' ? 'border-emerald-800 text-emerald-300' : 'border-slate-700 text-slate-400'}`}>{step.key}: {step.status}{step.error ? ` · ${step.error}` : ''}</span>)}</div>}
              {expandedId === workflow.id && <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">{workflow.runHistory.slice().reverse().map((run) => <div key={run.id} className="rounded-lg bg-[#080d18] p-2.5 text-xs"><div className="flex justify-between gap-3"><span className="font-semibold text-slate-200">{run.kind} · {run.status}</span><time className="text-slate-500">{new Date(run.finishedAt).toLocaleString()}</time></div><p className="mt-1 text-slate-400">{run.error || run.summary}</p></div>)}{!workflow.runHistory.length && <p className="text-xs text-slate-500">No runs recorded.</p>}</div>}
            </article>
          ))}
        </div>
        <footer className="border-t border-[#202a40] px-5 py-3 text-[11px] text-slate-500">Guest workflows stay in this browser. Signed-in workflows sync to PostgreSQL when account storage is configured.</footer>
      </section>
    </div>
  );
};
