import React, { useEffect, useState } from 'react';
import { Copy, DoorOpen, Plus, Users, X } from 'lucide-react';

export interface RoomSummary { id: string; title: string; language: string; revision: number; role: 'owner' | 'editor' | 'viewer'; memberCount?: number }
interface Props { isOpen: boolean; onClose: () => void; onChoose: (room: RoomSummary | null) => void; activeRoomId?: string }

export const CollaborationRoomsModal: React.FC<Props> = ({ isOpen, onClose, onChoose, activeRoomId }) => {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [title, setTitle] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const response = await fetch('/api/rooms', { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load rooms.');
    setRooms(data.rooms || []);
  };
  useEffect(() => { if (isOpen) { setError(''); refresh().catch((e) => setError(e.message)); } }, [isOpen]);
  if (!isOpen) return null;

  const request = async (url: string, body: unknown) => {
    const response = await fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Room request failed.');
    return data;
  };
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await request('/api/rooms', { title, language: 'typescript' }); setCreatedCode(data.inviteCode); setTitle(''); await refresh(); onChoose(data.room); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create room.'); } finally { setBusy(false); }
  };
  const join = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await request('/api/rooms/join', { inviteCode }); setInviteCode(''); await refresh(); onChoose(data.room); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not join room.'); } finally { setBusy(false); }
  };
  const leave = async (room: RoomSummary) => {
    setBusy(true); setError('');
    try {
      if (room.role === 'owner') { const r = await fetch(`/api/rooms/${room.id}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!r.ok) throw new Error('Could not delete room.'); }
      else { const r = await fetch(`/api/rooms/${room.id}/members/me`, { method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!r.ok) throw new Error('Could not leave room.'); }
      if (activeRoomId === room.id) onChoose(null);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not leave room.'); } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="font-bold text-lg">Collaboration rooms</h2><p className="text-xs text-slate-400">Share code and chat with signed-in teammates.</p></div><button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X size={18}/></button></header>
      <div className="grid md:grid-cols-2 gap-4 p-5">
        <form onSubmit={create} className="space-y-2 rounded-xl border border-slate-800 p-4"><h3 className="font-semibold flex items-center gap-2"><Plus size={16}/> Create a room</h3><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required placeholder="Room name" className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-sm"/><button disabled={busy} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">Create room</button>
          {createdCode && <div className="text-xs text-emerald-300 break-all">Invite code (copy now): {createdCode}<button type="button" onClick={() => navigator.clipboard.writeText(createdCode)} className="ml-2 inline-flex items-center gap-1"><Copy size={13}/>Copy</button></div>}
        </form>
        <form onSubmit={join} className="space-y-2 rounded-xl border border-slate-800 p-4"><h3 className="font-semibold flex items-center gap-2"><DoorOpen size={16}/> Join with invite</h3><input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required placeholder="Paste invite code" className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-sm"/><button disabled={busy} className="rounded-lg bg-slate-700 px-3 py-2 text-sm disabled:opacity-50">Join room</button></form>
      </div>
      {error && <p role="alert" className="mx-5 mb-3 rounded-lg bg-red-950/60 p-3 text-sm text-red-300">{error}{error.includes('Sign in') && <button onClick={onClose} className="ml-2 underline">Sign in from the account menu.</button>}</p>}
      <div className="px-5 pb-5"><h3 className="mb-2 text-sm font-semibold">Your rooms</h3>{rooms.length ? <div className="space-y-2">{rooms.map((room) => <div key={room.id} className="flex items-center gap-3 rounded-xl border border-slate-800 p-3"><Users size={16} className="text-indigo-300"/><button onClick={() => { onChoose(room); onClose(); }} className="flex-1 text-left"><span className="font-semibold">{room.title}</span><span className="ml-2 text-xs text-slate-400">{room.role} · {room.memberCount || 1} members</span></button><button disabled={busy} onClick={() => leave(room)} className="text-xs text-slate-400 hover:text-red-300">{room.role === 'owner' ? 'Delete' : 'Leave'}</button></div>)}</div> : <p className="text-sm text-slate-500">No rooms yet.</p>}</div>
    </section>
  </div>;
};
