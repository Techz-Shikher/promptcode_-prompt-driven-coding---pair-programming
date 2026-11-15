import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, LogIn, LogOut, Shield, Trash2, UserPlus, X } from 'lucide-react';
import { sounds } from '../utils/sounds';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChanged: (user: UserAccount | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, onUserChanged }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'profile'>(currentUser ? 'profile' : 'signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentUser ? 'profile' : 'signin');
      setName(currentUser?.name || '');
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const request = async (url: string, method: string, body?: object) => {
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 204 && response.ok) return {};
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Account request failed.');
    return data;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setFeedback(null);
    try {
      const endpoint = activeTab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = activeTab === 'register' ? { email, name, password } : { email, password };
      const data = await request(endpoint, 'POST', body);
      onUserChanged({ ...data.user, avatar: '' });
      sounds.playSuccess(); setFeedback(activeTab === 'register' ? 'Account created and signed in.' : 'Signed in successfully.');
      setPassword(''); setActiveTab('profile');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Account request failed.');
    } finally { setBusy(false); }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setFeedback(null);
    try {
      const data = await request('/api/auth/profile', 'PATCH', { name });
      onUserChanged({ ...data.user, avatar: '' }); setFeedback('Profile updated.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Profile update failed.'); }
    finally { setBusy(false); }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setFeedback(null);
    try {
      await request('/api/auth/password', 'PATCH', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setFeedback('Password updated. Other active sessions were signed out.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Password update failed.'); }
    finally { setBusy(false); }
  };

  const handleLogout = async () => {
    setBusy(true); setError(null);
    try { await request('/api/auth/logout', 'POST'); onUserChanged(null); setActiveTab('signin'); setFeedback('Signed out.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Sign out failed.'); }
    finally { setBusy(false); }
  };

  const handleDeleteAccount = async () => {
    setBusy(true); setError(null);
    try {
      await request('/api/auth/account', 'DELETE', { password });
      onUserChanged(null); setPassword(''); setActiveTab('signin'); setFeedback('Account and owned data were deleted.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Account deletion failed.'); }
    finally { setBusy(false); }
  };

  const fieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400';
  const submitClass = 'flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <motion.section role="dialog" aria-modal="true" aria-label="Account and sign in" onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-200 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3"><Shield className="text-indigo-300" /><div><h2 className="font-bold text-white">Account & Security</h2><p className="text-xs text-slate-400">Server-managed account and session</p></div></div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X size={18} /></button>
        </header>
        <nav className="flex gap-1 border-b border-slate-800 p-3">
          {(currentUser ? ['profile'] : ['signin', 'register']).map((tab) => <button key={tab} onClick={() => { setActiveTab(tab as typeof activeTab); setError(null); }} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}>{tab === 'signin' ? 'Sign in' : tab === 'register' ? 'Create account' : 'Profile'}</button>)}
        </nav>
        <div className="max-h-[72vh] space-y-4 overflow-auto p-5">
          {feedback && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-200">{feedback}</p>}
          {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
          {!currentUser && <>
            <form onSubmit={handleSubmit} className="space-y-3">
              {activeTab === 'register' && <label className="block space-y-1 text-xs text-slate-400">Display name<input autoComplete="name" required minLength={1} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label>}
              <label className="block space-y-1 text-xs text-slate-400">Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label>
              <label className="block space-y-1 text-xs text-slate-400">Password<input type="password" autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'} required minLength={activeTab === 'register' ? 12 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} />{activeTab === 'register' && <span className="block text-[11px]">Use at least 12 characters.</span>}</label>
              <button disabled={busy} className={submitClass}>{activeTab === 'register' ? <UserPlus size={15} /> : <LogIn size={15} />}{busy ? 'Please wait…' : activeTab === 'register' ? 'Create account' : 'Sign in'}</button>
            </form>
            <p className="text-[11px] text-slate-500">Account services require the server operator to configure PostgreSQL. Passwords are stored as scrypt hashes; the browser receives only an HttpOnly session cookie.</p>
          </>}
          {currentUser && activeTab === 'profile' && <>
            <div className="rounded-xl bg-slate-900 p-4"><p className="font-semibold text-white">{currentUser.name}</p><p className="text-sm text-slate-400">{currentUser.email}</p><p className="mt-2 text-[11px] text-emerald-300">Authenticated account</p></div>
            <form onSubmit={handleProfileUpdate} className="space-y-2"><label className="block space-y-1 text-xs text-slate-400">Display name<input required minLength={1} maxLength={80} value={name || currentUser.name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><button disabled={busy} className={submitClass}>Save profile</button></form>
            <details className="rounded-xl border border-slate-800 p-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><KeyRound size={15} /> Change password</summary><form onSubmit={handlePasswordChange} className="mt-3 space-y-3"><input aria-label="Current password" type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" className={fieldClass} /><input aria-label="New password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password (12+ characters)" className={fieldClass} /><button disabled={busy} className={submitClass}>Update password</button></form></details>
            <button disabled={busy} onClick={() => void handleLogout()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-900"><LogOut size={15} /> Sign out</button>
            <details className="rounded-xl border border-rose-900/60 p-4"><summary className="flex cursor-pointer items-center gap-2 text-xs text-rose-300"><Trash2 size={14} /> Delete account and all owned data</summary><div className="mt-3 space-y-2"><p className="text-[11px] text-slate-400">This permanently deletes this account, sessions, projects, prompts, and associated records.</p><input aria-label="Confirm password to delete account" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Confirm password" className={fieldClass} /><button disabled={busy || !password} onClick={() => void handleDeleteAccount()} className="w-full rounded-xl bg-rose-700 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Delete account permanently</button></div></details>
          </>}
        </div>
      </motion.section>
    </div>
  );
};
