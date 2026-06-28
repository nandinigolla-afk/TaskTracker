import React, { useState } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import { useTasks } from '../context/TaskContext';
import TaskForm from './TaskForm';

const priorityConfig = {
  high: { label: 'High', color: 'priority--high', dot: '🔴' },
  medium: { label: 'Medium', color: 'priority--medium', dot: '🟡' },
  low: { label: 'Low', color: 'priority--low', dot: '🟢' },
};

const statusConfig = {
  todo: { label: 'To Do', class: 'status--todo', next: 'in-progress', nextLabel: 'Start' },
  'in-progress': { label: 'In Progress', class: 'status--progress', next: 'completed', nextLabel: 'Complete' },
  completed: { label: 'Done', class: 'status--done', next: 'todo', nextLabel: 'Reopen' },
};

export default function TaskCard({ task }) {
  const { updateStatus, deleteTask } = useTasks();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const p = priorityConfig[task.priority] || priorityConfig.medium;
  const s = statusConfig[task.status] || statusConfig.todo;

  const isOverdue = task.dueDate && task.status !== 'completed' && isAfter(new Date(), parseISO(task.dueDate));

  const handleStatusCycle = async () => {
    setStatusChanging(true);
    try {
      await updateStatus(task._id, s.next);
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await deleteTask(task._id);
  };

  if (editing) {
    return (
      <div className="task-card task-card--editing">
        <div className="task-card__edit-header">
          <span>Editing task</span>
          <button className="btn-icon" onClick={() => setEditing(false)}>✕</button>
        </div>
        <TaskForm task={task} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`task-card task-card--${task.status} ${isOverdue ? 'task-card--overdue' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__meta">
          <span className={`priority-badge ${p.color}`}>{p.dot} {p.label}</span>
          <span className={`status-badge ${s.class}`}>{s.label}</span>
        </div>
        <div className="task-card__actions">
          <button className="btn-icon btn-icon--edit" onClick={() => setEditing(true)} title="Edit">✎</button>
          <button
            className={`btn-icon btn-icon--delete ${confirming ? 'btn-icon--confirm' : ''}`}
            onClick={handleDelete}
            title={confirming ? 'Click again to confirm' : 'Delete'}
          >
            {confirming ? '?' : '✕'}
          </button>
        </div>
      </div>

      <div className="task-card__body">
        <h3 className={`task-card__title ${task.status === 'completed' ? 'task-card__title--done' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
        {task.tags?.length > 0 && (
          <div className="task-card__tags">
            {task.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        )}
      </div>

      <div className="task-card__footer">
        <div className="task-card__dates">
          {task.dueDate && (
            <span className={`due-date ${isOverdue ? 'due-date--overdue' : ''}`}>
              {isOverdue ? '⚠ Overdue · ' : '📅 '}
              {format(parseISO(task.dueDate), 'MMM d, yyyy')}
            </span>
          )}
          <span className="created-date">
            Created {format(parseISO(task.createdAt), 'MMM d')}
          </span>
        </div>
        <button
          className={`btn btn--sm btn--status btn--${task.status}`}
          onClick={handleStatusCycle}
          disabled={statusChanging}
        >
          {statusChanging ? '…' : `→ ${s.nextLabel}`}
        </button>
      </div>
    </div>
  );
}
