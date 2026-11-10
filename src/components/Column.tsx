import { useDroppable } from '@dnd-kit/core';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

export function Column({ id, label, color, tasks, onOpen }: {
  id: string; label: string; color: string; tasks: Task[]; onOpen: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section className={`column ${isOver ? 'over' : ''}`}>
      <header className="column-head">
        <span className="dot" style={{ background: color }} />
        <h2>{label}</h2>
        <span className="count">{tasks.length}</span>
      </header>
      <div className="column-body" ref={setNodeRef}>
        {tasks.map(t => <TaskCard key={t.id} task={t} onOpen={onOpen} />)}
        {tasks.length === 0 && (
          <div className="empty">
            <div className="empty-icon">✦</div>
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </section>
  );
}