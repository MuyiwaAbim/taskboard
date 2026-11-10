import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Activity, Task } from '../types';
import { timeAgo } from '../lib/utils';

export function TaskDetail({ task, onClose, onDelete }: {
  task: Task; onClose: () => void; onDelete: (id: string) => void;
}) {
  const [items, setItems] = useState<Activity[] | null>(null);

  useEffect(() => {
    supabase.from('task_activity').select('*').eq('task_id', task.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Activity[]) ?? []));
  }, [task.id, task.status]);

  return (
    <div className="backdrop" onClick={onClose}>
      <aside className="panel" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <h3>{task.title}</h3>
        {task.description && <p className="muted">{task.description}</p>}
        <h4>Activity</h4>
        {items === null ? <p className="muted">Loading…</p> : (
          <ul className="timeline">
            {items.map(a => (
              <li key={a.id}><span>{a.message}</span><time>{timeAgo(a.created_at)}</time></li>
            ))}
          </ul>
        )}
        <button className="btn danger" onClick={() => { onDelete(task.id); onClose(); }}>Delete task</button>
      </aside>
    </div>
  );
}