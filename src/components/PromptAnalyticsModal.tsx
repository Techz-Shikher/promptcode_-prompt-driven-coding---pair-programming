import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Clock3, X } from 'lucide-react';
import { PROMPT_ACADEMY_LESSONS } from '../data/lessons';
import { sounds } from '../utils/sounds';

interface Summary { progress: Array<{ lessonId: string; attempts: number; bestScore: number; completedAt: string | null }>; recent: Array<{ id: string; lessonId: string; score: number; correctCount: number; questionCount: number; createdAt: string }>; totalAttempts: number; points: number; lessonCount: number }
interface Props { isOpen: boolean; onClose: () => void; isSignedIn: boolean; onSignIn: () => void }

export const PromptAnalyticsModal: React.FC<Props> = ({ isOpen, onClose, isSignedIn, onSignIn }) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isOpen || !isSignedIn) return;
    let active = true;
    fetch('/api/learning/summary', { credentials: 'same-origin' }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; })
      .then((data) => { if (active) { setSummary(data); setError(''); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Learning analytics are unavailable.'); });
    return () => { active = false; };
  }, [isOpen, isSignedIn]);
  if (!isOpen) return null;

  const completed = summary?.progress.filter((item) => item.completedAt).length || 0;
  const avg = summary?.progress.length ? Math.round(summary.progress.reduce((sum, item) => sum + item.bestScore, 0) / summary.progress.length) : 0;
  const categories = ['Foundations', 'DSA', 'Debugging', 'Development'].map((category) => {
    const lessons = PROMPT_ACADEMY_LESSONS.filter((lesson) => lesson.category === category);
    const rows = lessons.map((lesson) => summary?.progress.find((progress) => progress.lessonId === lesson.id)).filter(Boolean) as NonNullable<Summary>['progress'];
    return { category, total: lessons.length, completed: rows.filter((row) => row.completedAt).length, score: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.bestScore, 0) / rows.length) : 0 };
  });

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
    <section className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl border border-[#1e2a47] bg-[#0c101d] text-slate-200 shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#172033] bg-[#090d18] px-6 py-4"><div className="flex items-center gap-3"><BarChart3 className="text-purple-400"/><div><h2 className="font-bold text-white">Learning analytics</h2><p className="text-xs text-slate-400">Scores and activity from your saved lesson assessments.</p></div></div><button onClick={() => { sounds.playPop(420); onClose(); }} className="rounded-lg p-2 hover:bg-slate-800"><X size={18}/></button></header>
      <div className="space-y-5 p-6">
        {!isSignedIn ? <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm">Sign in to save assessments and view your progress. <button onClick={onSignIn} className="ml-2 text-indigo-300 underline">Sign in</button></div> : error ? <p role="alert" className="text-sm text-red-300">{error}</p> : !summary ? <p className="text-sm text-slate-400">Loading your learning record…</p> : <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[
            ['Lessons passed', `${completed}/${summary.lessonCount}`], ['Best-score average', `${avg}%`], ['Assessments taken', String(summary.totalAttempts)], ['Learning points', String(summary.points)],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-[#1b2640] bg-[#090e1c] p-4 text-center"><div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-2xl font-black text-white">{value}</div></div>)}</div>
          <section className="rounded-xl border border-[#1b2640] bg-[#090e1c] p-4"><h3 className="mb-3 text-sm font-bold">Progress by skill</h3><div className="space-y-3">{categories.map((item) => <div key={item.category}><div className="flex justify-between text-xs"><span>{item.category}</span><span>{item.completed}/{item.total} passed{item.completed ? ` · best average ${item.score}%` : ''}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400" style={{ width: `${item.total ? Math.round((item.completed / item.total) * 100) : 0}%` }}/></div></div>)}</div></section>
          <section><h3 className="mb-2 text-sm font-bold">Recent assessments</h3>{summary.recent.length ? <div className="space-y-2">{summary.recent.map((entry) => <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"><CheckCircle2 size={16} className={entry.score >= 67 ? 'text-emerald-400' : 'text-amber-400'}/><div className="min-w-0 flex-1"><div className="text-xs font-semibold">{PROMPT_ACADEMY_LESSONS.find((lesson) => lesson.id === entry.lessonId)?.title || 'Lesson assessment'}</div><div className="text-[10px] text-slate-500">{entry.correctCount}/{entry.questionCount} correct · {new Date(entry.createdAt).toLocaleString()}</div></div><strong className="text-sm">{entry.score}%</strong></div>)}</div> : <p className="rounded-xl border border-slate-800 p-4 text-xs text-slate-400">No assessment attempts yet. Take a lesson knowledge check to start your record.</p>}</section>
          <p className="flex items-center gap-2 text-[11px] text-slate-500"><Clock3 size={13}/> Learning points use your best server-scored result per lesson, plus today’s challenge when completed.</p>
        </>}
      </div>
    </section>
  </div>;
};
