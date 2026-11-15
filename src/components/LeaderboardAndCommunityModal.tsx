import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Copy, Flag, Heart, Medal, Plus, Sparkles, Trash2, Trophy, Users, X } from 'lucide-react';
import { sounds } from '../utils/sounds';

type Tab = 'leaderboard' | 'achievements' | 'challenges' | 'community';
interface PromptItem { id: string; title: string; content: string; author: string; ownerId: string; votes: number; votedByMe: boolean; createdAt: string }
interface Props { isOpen: boolean; onClose: () => void; onApplyPrompt: (prompt: string) => void; isSignedIn: boolean; userId?: string; onSignIn: () => void; onOpenAcademy: (lessonId?: string) => void }

export const LeaderboardAndCommunityModal: React.FC<Props> = ({ isOpen, onClose, onApplyPrompt, isSignedIn, userId, onSignIn, onOpenAcademy }) => {
  const [tab, setTab] = useState<Tab>('leaderboard');
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [entries, setEntries] = useState<Array<{ id: string; name: string; points: number; lessonsCompleted: number; rank: number }>>([]);
  const [summary, setSummary] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [popular, setPopular] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);

  const loadPrompts = async () => {
    const response = await fetch(`/api/community/prompts?sort=${popular ? 'popular' : 'recent'}`, { credentials: 'same-origin' });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not load community prompts.'); setPrompts(data.prompts || []);
  };
  const loadData = async () => {
    const [boardResponse, promptsResponse] = await Promise.all([
      fetch('/api/learning/leaderboard', { credentials: 'same-origin' }),
      fetch(`/api/community/prompts?sort=${popular ? 'popular' : 'recent'}`, { credentials: 'same-origin' }),
    ]);
    const [board, community] = await Promise.all([boardResponse.json(), promptsResponse.json()]);
    if (!boardResponse.ok) throw new Error(board.error || 'Could not load leaderboard.');
    if (!promptsResponse.ok) throw new Error(community.error || 'Could not load community prompts.');
    setEntries(board.entries || []); setPrompts(community.prompts || []);
    if (isSignedIn) {
      const [summaryResponse, privacyResponse, challengeResponse] = await Promise.all([
        fetch('/api/learning/summary', { credentials: 'same-origin' }), fetch('/api/learning/privacy', { credentials: 'same-origin' }), fetch('/api/learning/challenge/today', { credentials: 'same-origin' }),
      ]);
      const [summaryData, privacyData, challengeData] = await Promise.all([summaryResponse.json(), privacyResponse.json(), challengeResponse.json()]);
      if (summaryResponse.ok) setSummary(summaryData);
      if (privacyResponse.ok) setLeaderboardOptIn(privacyData.leaderboardOptIn);
      if (challengeResponse.ok) setChallenge(challengeData);
    } else { setSummary(null); setChallenge(null); setLeaderboardOptIn(false); }
  };

  useEffect(() => {
    if (!isOpen) return;
    let active = true; setError('');
    loadData().catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Could not load learning and community data.'); });
    return () => { active = false; };
  }, [isOpen, isSignedIn, popular]);
  if (!isOpen) return null;

  const updatePrivacy = async (checked: boolean) => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/learning/privacy', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leaderboardOptIn: checked }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not save privacy setting.');
      setLeaderboardOptIn(data.leaderboardOptIn); const board = await fetch('/api/learning/leaderboard').then((r) => r.json()); setEntries(board.entries || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save privacy setting.'); }
    finally { setBusy(false); }
  };
  const publish = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/community/prompts', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not share prompt.');
      setTitle(''); setContent(''); await loadPrompts(); setNotice('Prompt shared with the community.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not share prompt.'); }
    finally { setBusy(false); }
  };
  const vote = async (prompt: PromptItem) => {
    if (!isSignedIn) return onSignIn();
    const method = prompt.votedByMe ? 'DELETE' : 'POST';
    const response = await fetch(`/api/community/prompts/${prompt.id}/vote`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...(method === 'DELETE' ? { body: '{}' } : { body: '{}' }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Could not update vote.'); return; }
    setPrompts((current) => current.map((item) => item.id === prompt.id ? { ...item, votedByMe: data.voted, votes: data.votes } : item));
  };
  const removePrompt = async (prompt: PromptItem) => {
    const response = await fetch(`/api/community/prompts/${prompt.id}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!response.ok) { setError('Could not delete your prompt.'); return; }
    setPrompts((current) => current.filter((item) => item.id !== prompt.id));
  };
  const report = async (prompt: PromptItem) => {
    if (!isSignedIn) return onSignIn();
    const response = await fetch(`/api/community/prompts/${prompt.id}/report`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'other' }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'Could not report prompt.'); else { setNotice('Report received.'); setPrompts((current) => current.filter((item) => item.id !== prompt.id)); }
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={14}/> }, { id: 'achievements', label: 'Achievements', icon: <Award size={14}/> },
    { id: 'challenges', label: 'Daily challenge', icon: <Sparkles size={14}/> }, { id: 'community', label: 'Community', icon: <Users size={14}/> },
  ];
  const achievements = summary?.achievements || [];

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
    <section className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#1e2a47] bg-[#0c101d] text-slate-200 shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#172033] bg-[#090d18] px-5 py-4"><div><h2 className="font-bold text-white">Learning and community</h2><p className="text-xs text-slate-400">Progress, opt-in rankings, daily practice, and shared prompts.</p></div><button onClick={() => { sounds.playPop(420); onClose(); }} className="rounded-lg p-2 hover:bg-slate-800"><X size={18}/></button></header>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-800 px-4 py-2">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${tab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>{item.icon}{item.label}</button>)}</nav>
      {(error || notice) && <div className={`mx-5 mt-3 rounded-lg p-2 text-xs ${error ? 'bg-red-950/50 text-red-300' : 'bg-emerald-950/50 text-emerald-300'}`}>{error || notice}</div>}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === 'leaderboard' && <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><h3 className="font-bold">Learning points</h3><p className="mt-1 text-xs text-slate-400">Points use your best server-scored result per lesson, plus 10 points for each featured daily challenge. Only people who opt in appear.</p>
            {!isSignedIn ? <button onClick={onSignIn} className="mt-3 text-xs text-indigo-300 underline">Sign in to manage your privacy setting</button> : <label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={leaderboardOptIn} disabled={busy} onChange={(e) => void updatePrivacy(e.target.checked)}/> Show my display name and learning points on the leaderboard</label>}</div>
          {entries.length ? <div className="space-y-2">{entries.map((entry) => <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-slate-800 p-3"><span className="w-8 text-center font-bold text-amber-300">#{entry.rank}</span><Medal size={17} className="text-indigo-300"/><span className="flex-1 text-sm">{entry.name}</span><span className="text-xs text-slate-400">{entry.lessonsCompleted} passed</span><strong className="text-sm">{entry.points} pts</strong></div>)}</div> : <p className="rounded-xl border border-slate-800 p-4 text-xs text-slate-400">No one has opted in yet. Your learning record stays private unless you choose to appear here.</p>}
        </div>}
        {tab === 'achievements' && (!isSignedIn ? <SignInNotice onSignIn={onSignIn}/> : <div className="grid gap-3 sm:grid-cols-2">{achievements.map((item: any) => <div key={item.id} className={`rounded-xl border p-4 ${item.unlocked ? 'border-emerald-800 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/50 opacity-70'}`}><div className="flex items-center gap-2 font-bold"><Award size={17} className={item.unlocked ? 'text-emerald-400' : 'text-slate-500'}/>{item.title}<span className="ml-auto text-[10px]">{item.unlocked ? 'Earned' : 'Locked'}</span></div><p className="mt-2 text-xs text-slate-400">{item.description}</p></div>)}</div>)}
        {tab === 'challenges' && (!isSignedIn ? <SignInNotice onSignIn={onSignIn}/> : challenge ? <div className="rounded-2xl border border-amber-800/60 bg-amber-950/20 p-5"><Sparkles className="text-amber-300"/><div className="mt-3 text-[10px] uppercase tracking-widest text-amber-300">{challenge.challenge.date} · daily assessment</div><h3 className="mt-1 text-lg font-bold">{challenge.challenge.title}</h3><p className="mt-2 text-sm text-slate-300">Answer the featured lesson’s knowledge check. Your best result earns 10 leaderboard points; the server allows up to three daily challenge attempts.</p><div className="mt-3 text-xs text-slate-400">{challenge.challenge.completed ? `Completed · best score ${challenge.challenge.bestScore}%` : 'Not completed yet'}</div><button onClick={() => { onClose(); onOpenAcademy(challenge.challenge.lessonId); }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white"><BookOpen size={14}/>Open today’s assessment</button></div> : <p className="text-xs text-slate-400">Loading today’s challenge…</p>)}
        {tab === 'community' && <div className="space-y-4">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Community prompts</h3><p className="text-xs text-slate-400">Published prompts and your account display name are public. Three distinct reports hide a post.</p></div><button onClick={() => setPopular((value) => !value)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Sort: {popular ? 'Popular' : 'Recent'}</button></div>
          {isSignedIn ? <form onSubmit={(e) => void publish(e)} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4"><label className="block text-xs font-semibold">Share a prompt (up to 3 per day)</label><input value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={120} required placeholder="Short title" className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs"/><textarea value={content} onChange={(e) => setContent(e.target.value)} minLength={20} maxLength={6000} required placeholder="Write a reusable prompt (20–6,000 characters)" className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs"/><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold disabled:opacity-50"><Plus size={14}/>Publish publicly</button></form> : <SignInNotice onSignIn={onSignIn}/>}
          {prompts.length ? <div className="space-y-3">{prompts.map((prompt) => <article key={prompt.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h4 className="font-semibold">{prompt.title}</h4><p className="mt-1 text-[10px] text-slate-500">by {prompt.author} · {new Date(prompt.createdAt).toLocaleDateString()}</p></div><button onClick={() => { navigator.clipboard.writeText(prompt.content); setNotice('Prompt copied.'); }} title="Copy"><Copy size={15}/></button><button onClick={() => { onApplyPrompt(prompt.content); onClose(); }} title="Use prompt"><BookOpen size={15}/></button></div><p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 font-mono text-xs text-slate-300">{prompt.content}</p><div className="mt-3 flex items-center gap-3"><button onClick={() => void vote(prompt)} className={`inline-flex items-center gap-1 text-xs ${prompt.votedByMe ? 'text-pink-300' : 'text-slate-400'}`}><Heart size={14} fill={prompt.votedByMe ? 'currentColor' : 'none'}/>{prompt.votes}</button>{isSignedIn && prompt.ownerId === userId ? <button onClick={() => void removePrompt(prompt)} className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-300"><Trash2 size={13}/>Delete</button> : isSignedIn && <button onClick={() => void report(prompt)} className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-300"><Flag size={13}/>Report</button>}</div></article>)}</div> : <p className="rounded-xl border border-slate-800 p-4 text-xs text-slate-400">No public prompts yet. Share one to start the community collection.</p>}
        </div>}
      </div>
    </section>
  </div>;
};

function SignInNotice({ onSignIn }: { onSignIn: () => void }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">Sign in to save progress and use this feature. <button onClick={onSignIn} className="text-indigo-300 underline">Sign in</button></div>;
}
