import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, Copy, Database, Globe, LoaderCircle, Sparkles, X } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface AssistantResult {
  kind: 'sql' | 'openapi';
  artifact?: string;
  dialect?: string;
  contract?: Record<string, unknown>;
  explanation: string;
  assumptions: string[];
  warnings: string[];
  indexSuggestions?: string[];
  providerMetadata?: { requestedModel: string; modelVersion?: string; latencyMs: number; usage?: { totalTokenCount?: number } };
}

interface SqlAndApiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlAndApiAssistantModal: React.FC<SqlAndApiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'api'>('sql');
  const [sqlPrompt, setSqlPrompt] = useState('Find the five customers with the greatest total spend during 2026.');
  const [sqlSchema, setSqlSchema] = useState('');
  const [sqlDialect, setSqlDialect] = useState<'PostgreSQL' | 'MySQL' | 'SQLite'>('PostgreSQL');
  const [apiPrompt, setApiPrompt] = useState('Create a REST contract for a collaborative prompt execution endpoint. Include rate limits, language selection, request and response schemas, and error responses.');
  const [sqlResult, setSqlResult] = useState<AssistantResult | null>(null);
  const [apiResult, setApiResult] = useState<AssistantResult | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeResult = activeTab === 'sql' ? sqlResult : apiResult;
  const artifactText = activeResult ? activeTab === 'sql' ? activeResult.artifact || '' : JSON.stringify(activeResult.contract, null, 2) : '';

  const runAssistant = async (action: 'generate' | 'explain') => {
    setIsWorking(true);
    setError(null);
    sounds.playPop(480);
    try {
      const endpoint = activeTab === 'sql' ? '/api/assistant/sql' : '/api/assistant/api-contract';
      const body = activeTab === 'sql'
        ? action === 'generate'
          ? { action, dialect: sqlDialect, requirement: sqlPrompt, schema: sqlSchema }
          : { action, dialect: sqlDialect, query: sqlResult?.artifact }
        : action === 'generate'
          ? { action, requirement: apiPrompt }
          : { action, contract: apiResult?.contract };
      if (action === 'explain' && !body.query && !body.contract) throw new Error('Generate an artifact before asking for an explanation.');
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The assistant could not complete this request.');
      if (activeTab === 'sql' && data.kind === 'sql' && typeof data.artifact === 'string') setSqlResult(data);
      else if (activeTab === 'api' && data.kind === 'openapi' && data.contract) setApiResult(data);
      else throw new Error('The assistant returned an invalid response.');
      sounds.playSuccess();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The assistant request failed.');
    } finally { setIsWorking(false); }
  };

  const handleCopy = async () => {
    if (!artifactText) return;
    try {
      await navigator.clipboard.writeText(artifactText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setError('Clipboard access is unavailable. Select and copy the artifact text instead.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-4xl max-h-[88vh] bg-[#0c101d] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        <header className="p-4 px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center">{activeTab === 'sql' ? <Database className="w-5 h-5 text-purple-400" /> : <Globe className="w-5 h-5 text-cyan-400" />}</div><div><div className="flex items-center gap-2"><h2 className="text-base font-bold text-white">SQL & API Assistant</h2><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">AI-backed</span></div><p className="text-xs text-slate-400">Generate and explain SQL or OpenAPI contracts with validation.</p></div></div>
          <button onClick={onClose} aria-label="Close assistant" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </header>

        <nav className="flex items-center gap-2 px-6 py-2.5 border-b border-[#172033] bg-[#0b0f19] text-xs">
          <button onClick={() => { setActiveTab('sql'); setError(null); }} className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 ${activeTab === 'sql' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Database className="w-3.5 h-3.5" /> SQL assistant</button>
          <button onClick={() => { setActiveTab('api'); setError(null); }} className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 ${activeTab === 'api' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Globe className="w-3.5 h-3.5" /> OpenAPI contract</button>
        </nav>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl border border-amber-700/50 bg-amber-950/25 p-3 text-xs text-amber-200">Generated content is never executed. SQL checks reject common writes, multiple statements, and known side-effect patterns, but cannot prove arbitrary database functions are harmless. Review all output before use.</div>
          {activeTab === 'sql' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <label className="sm:col-span-3 text-xs font-bold text-slate-300">Describe the query<input value={sqlPrompt} onChange={(event) => setSqlPrompt(event.target.value)} maxLength={20_000} className="mt-1 w-full bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500" /></label>
                <label className="text-xs font-bold text-slate-300">Dialect<select value={sqlDialect} onChange={(event) => setSqlDialect(event.target.value as typeof sqlDialect)} className="mt-1 w-full bg-[#0e1424] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"><option>PostgreSQL</option><option>MySQL</option><option>SQLite</option></select></label>
              </div>
              <label className="block text-xs font-bold text-slate-300">Optional schema and column notes<textarea value={sqlSchema} onChange={(event) => setSqlSchema(event.target.value)} maxLength={20_000} rows={3} placeholder="Table names, columns, relationships, and constraints" className="mt-1 w-full resize-y bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500" /></label>
            </div>
          ) : (
            <label className="block text-xs font-bold text-slate-300">Describe the API contract<textarea value={apiPrompt} onChange={(event) => setApiPrompt(event.target.value)} maxLength={20_000} rows={4} className="mt-1 w-full resize-y bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" /></label>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button disabled={isWorking} onClick={() => void runAssistant('generate')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50"><Sparkles size={14} /> {isWorking ? 'Working…' : activeTab === 'sql' ? 'Generate read-only SQL' : 'Generate OpenAPI JSON'}</button>
            <button disabled={isWorking || !activeResult} onClick={() => void runAssistant('explain')} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 font-bold text-xs disabled:opacity-40">Explain current artifact</button>
            {activeResult && <button onClick={() => void handleCopy()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs">{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}{copied ? 'Copied' : activeTab === 'sql' ? 'Copy SQL' : 'Copy JSON'}</button>}
            {isWorking && <LoaderCircle className="animate-spin text-indigo-300" size={16} />}
          </div>

          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs text-rose-200"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</div>}
          {activeResult && <div className="space-y-3">
            <section className="relative rounded-xl bg-[#080c16] border border-[#1c2946] p-4 font-mono text-xs text-slate-200"><pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">{artifactText}</pre></section>
            <section className="rounded-xl bg-[#0b1422] border border-[#1c2946] p-4 space-y-2"><h3 className="text-xs font-bold text-white">Explanation</h3><p className="text-xs text-slate-300 whitespace-pre-wrap">{activeResult.explanation}</p>
              {!!activeResult.assumptions.length && <div className="text-xs"><b className="text-slate-300">Assumptions</b><ul className="mt-1 list-disc pl-5 text-slate-400">{activeResult.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
              {!!activeResult.warnings.length && <div className="text-xs"><b className="text-amber-300">Caveats</b><ul className="mt-1 list-disc pl-5 text-amber-200/80">{activeResult.warnings.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
              {!!activeResult.indexSuggestions?.length && <div className="text-xs"><b className="text-slate-300">Index suggestions</b><ul className="mt-1 list-disc pl-5 text-slate-400">{activeResult.indexSuggestions.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
            </section>
            {activeResult.providerMetadata && <p className="text-[10px] text-slate-500">{activeResult.providerMetadata.requestedModel} · {activeResult.providerMetadata.latencyMs} ms{activeResult.providerMetadata.usage?.totalTokenCount !== undefined ? ` · ${activeResult.providerMetadata.usage.totalTokenCount} tokens` : ''}</p>}
          </div>}
        </div>
      </motion.div>
    </div>
  );
};
