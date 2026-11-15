import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Atom, BarChart3, Copy, FlaskConical, Gauge, Info, Play, X } from 'lucide-react';
import { runClassicalBenchmark, type ClassicalBenchmarkReport } from '../research/knapsackBench';
import { sounds } from '../utils/sounds';

interface QuantumAndResearchModalProps { isOpen: boolean; onClose: () => void }

export const QuantumAndResearchModal: React.FC<QuantumAndResearchModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'method'>('benchmark');
  const [seed, setSeed] = useState('1337');
  const [itemCount, setItemCount] = useState(320);
  const [capacity, setCapacity] = useState(1200);
  const [report, setReport] = useState<ClassicalBenchmarkReport | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const runBenchmark = () => {
    setError(''); setCopied(false); sounds.playPop(480);
    try {
      const parsedSeed = Number(seed);
      if (!/^\d+$/.test(seed) || !Number.isSafeInteger(parsedSeed)) throw new Error('Enter an unsigned integer seed.');
      setReport(runClassicalBenchmark(parsedSeed, itemCount, capacity));
      sounds.playSuccess();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not run the local benchmark.'); }
  };

  const copyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify({ browser: navigator.userAgent, measuredAt: new Date().toISOString(), ...report }, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
    <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#1e2a47] bg-[#0c101d] text-slate-200 shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#172033] bg-[#090d18] px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50"><Atom className="text-cyan-300" size={20}/></div><div><div className="flex items-center gap-2"><h2 className="font-bold text-white">Optional research bench</h2><span className="rounded-full border border-cyan-800 px-2 py-0.5 text-[10px] text-cyan-300">Classical baseline · local only</span></div><p className="text-xs text-slate-400">Reproducible knapsack comparison. No quantum backend or hardware is used.</p></div></div><button onClick={() => { sounds.playPop(420); onClose(); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={18}/></button></header>
      <nav className="flex gap-2 border-b border-slate-800 px-5 py-2"><button onClick={() => setActiveTab('benchmark')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${activeTab === 'benchmark' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><BarChart3 size={14}/>Benchmark</button><button onClick={() => setActiveTab('method')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${activeTab === 'method' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><FlaskConical size={14}/>Methodology</button></nav>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {activeTab === 'benchmark' ? <>
          <div className="flex items-start gap-2 rounded-xl border border-amber-800/50 bg-amber-950/20 p-3 text-xs text-amber-200"><Info className="mt-0.5 shrink-0" size={15}/><p>This is a browser-side classical algorithm comparison, not a quantum simulation. Timings vary by device and browser; one run is not evidence of a general performance advantage.</p></div>
          <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-3">
            <label className="space-y-2 text-xs"><span className="font-semibold">Reproducible seed</span><input inputMode="numeric" value={seed} onChange={(event) => setSeed(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-mono"/><span className="block text-[10px] text-slate-500">Unsigned 32-bit integer</span></label>
            <label className="space-y-2 text-xs"><span className="flex justify-between font-semibold"><span>Items</span><span>{itemCount}</span></span><input type="range" min="40" max="500" step="20" value={itemCount} onChange={(event) => setItemCount(Number(event.target.value))} className="w-full accent-cyan-500"/><span className="block text-[10px] text-slate-500">Generated weights and values are fixed by seed.</span></label>
            <label className="space-y-2 text-xs"><span className="flex justify-between font-semibold"><span>Capacity</span><span>{capacity}</span></span><input type="range" min="100" max="2000" step="50" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="w-full accent-cyan-500"/><span className="block text-[10px] text-slate-500">Both algorithms receive the same instance.</span></label>
          </div>
          <button onClick={runBenchmark} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-600"><Play size={14}/>Run local benchmark</button>
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          {report && <section className="space-y-4 rounded-xl border border-slate-800 bg-[#090e1c] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-white">Measured results</h3><p className="mt-1 text-[10px] text-slate-400">Data fingerprint <code>{report.itemsChecksum}</code> · seed {report.seed} · {report.itemCount} items · capacity {report.capacity}</p></div><button onClick={() => void copyReport()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs"> <Copy size={13}/>{copied ? 'Copied report' : 'Copy reproducibility report'}</button></div>
            <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4"><div className="text-[10px] uppercase tracking-wide text-emerald-300">Exact reference · {report.baseline.complexity}</div><div className="mt-2 text-2xl font-black text-white">Value {report.baseline.value}</div><div className="mt-1 text-xs text-slate-300">Median runtime: {report.baseline.medianMs.toFixed(3)} ms</div></div><div className="rounded-xl border border-indigo-800/50 bg-indigo-950/20 p-4"><div className="text-[10px] uppercase tracking-wide text-indigo-300">Greedy heuristic · {report.heuristic.complexity}</div><div className="mt-2 text-2xl font-black text-white">Value {report.heuristic.value}</div><div className="mt-1 text-xs text-slate-300">Median runtime: {report.heuristic.medianMs.toFixed(3)} ms · gap {report.optimalityGapPercent}%</div></div></div>
            <p className="flex items-start gap-2 text-[11px] text-slate-500"><Gauge size={14} className="mt-0.5 shrink-0"/>Three warmups and seven timed repetitions per algorithm; execution order alternates. Runtime is a local microbenchmark, not a cross-device comparison.</p>
          </section>}
        </> : <div className="space-y-4 text-sm">
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><h3 className="font-bold text-white">Question under study</h3><p className="mt-2 text-xs leading-relaxed text-slate-300">How does a simple value-to-weight greedy heuristic compare with an exact dynamic-programming solution on the same generated 0/1 knapsack instance?</p></section>
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><h3 className="font-bold text-white">Controls and baselines</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-300"><li>Input data comes from a seeded, versioned generator; the report includes the seed and an item fingerprint.</li><li>The reference is exact dynamic programming with O(n × capacity) time.</li><li>The comparison is a value/weight greedy heuristic with O(n log n) time. It may produce a lower value; the reported gap is relative to the exact reference.</li><li>Both algorithms use one identical input, three warmups, seven timed repetitions, alternating order, and median runtime.</li></ul></section>
          <section className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-4"><h3 className="font-bold text-amber-200">Interpretation boundary</h3><p className="mt-2 text-xs leading-relaxed text-amber-100">No quantum algorithm, Qiskit simulator, quantum hardware, or quantum advantage is measured here. Any future quantum comparison must use a defined backend, account for compilation and measurement costs, compare against tuned classical baselines, and report repeated trials with uncertainty.</p></section>
        </div>}
      </div>
    </motion.section>
  </div>;
};
