import { useState } from 'react';
import type { Priority } from '../types';
import type { FormEvent } from 'react';

export function NewTaskModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (v: { title: string; description?: string; priority: Priority; due_date?: string | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErr('Title is required');
    setBusy(true); setErr(null);
    try {
      await onCreate({ title, description, priority, due_date: due || null });
      onClose();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h3>New task</h3>
        <label>Title
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" />
        </label>
        <label>Description
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <div className="row">
          <label>Priority
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
            </select>
          </label>
          <label>Due date
            <input type="date" value={due} onChange={e => setDue(e.target.value)} />
          </label>
        </div>
        {err && <div className="form-error">{err}</div>}
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Create task'}</button>
        </div>
      </form>
    </div>
  );
}