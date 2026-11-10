import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types';
import { formatDue, urgency } from '../lib/utils';

export function TaskCard({ task, onOpen, overlay = false }: {
  task: Task; onOpen?: (t: Task) => void; overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const u = urgency(task.due_date, task.status === 'done');

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={`card ${isDragging ? 'dragging' : ''} ${overlay ? 'overlay' : ''}`}
      {...(overlay ? {} : listeners)} {...(overlay ? {} : attributes)}
      onClick={() => onOpen?.(task)}
    >
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-desc">{task.description}</div>}
      <div className="card-meta">
        <span className={`pill prio-${task.priority}`}>{task.priority}</span>
        {task.due_date && u && (
          <span className={`pill due-${u}`}>
            {u === 'overdue' ? '⚠ Overdue · ' : u === 'soon' ? '⏰ Due soon · ' : '📅 '}
            {formatDue(task.due_date)}
          </span>
        )}
        {task.due_date && !u && <span className="pill due-normal">📅 {formatDue(task.due_date)}</span>}
      </div>
    </div>
  );
}