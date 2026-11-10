import { useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { COLUMNS } from './types';
import type { Priority, Status} from './types';
import { useTasks } from './hooks/useTasks';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { NewTaskModal } from './components/NewTaskModal';
import { TaskDetail } from './components/TaskDetail';
import { urgency } from './lib/utils';

export default function App() {
  const { tasks, loading, error, setError, reload, createTask, moveTask, deleteTask } = useTasks();
  const [query, setQuery] = useState('');
  const [prio, setPrio] = useState<Priority | 'all'>('all');
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), // lets clicks still open the card
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const filtered = useMemo(() => tasks.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) && (prio === 'all' || t.priority === prio)
  ), [tasks, query, prio]);

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => urgency(t.due_date, t.status === 'done') === 'overdue').length,
  }), [tasks]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const task = tasks.find(t => t.id === e.active.id);
    const to = e.over.id as Status;
    if (task && task.status !== to) moveTask(task.id, to);
  };

  const active = tasks.find(t => t.id === activeId);
  const open = tasks.find(t => t.id === openId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="logo">▦</span> Flowboard</div>
        <div className="stats">
          <div><b>{stats.total}</b> total</div>
          <div><b>{stats.done}</b> done</div>
          <div className={stats.overdue ? 'warn' : ''}><b>{stats.overdue}</b> overdue</div>
        </div>
        <div className="tools">
          <input className="search" placeholder="Search tasks…" value={query} onChange={e => setQuery(e.target.value)} />
          <select value={prio} onChange={e => setPrio(e.target.value as any)}>
            <option value="all">All priorities</option>
            <option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option>
          </select>
          <button className="btn primary" onClick={() => setCreating(true)}>+ New task</button>
        </div>
      </header>

      {error && (
        <div className="banner">
          {error}
          <button onClick={() => { setError(null); reload(); }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="board">
          {COLUMNS.map(c => (
            <div key={c.id} className="column"><div className="skeleton" /><div className="skeleton" /></div>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
          <main className="board">
            {COLUMNS.map(c => (
              <Column key={c.id} {...c} tasks={filtered.filter(t => t.status === c.id)} onOpen={t => setOpenId(t.id)} />
            ))}
          </main>
          <DragOverlay>{active ? <TaskCard task={active} overlay /> : null}</DragOverlay>
        </DndContext>
      )}

      {creating && <NewTaskModal onClose={() => setCreating(false)} onCreate={createTask} />}
      {open && <TaskDetail task={open} onClose={() => setOpenId(null)} onDelete={deleteTask} />}
    </div>
  );
}