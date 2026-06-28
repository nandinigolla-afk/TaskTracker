import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';

export default function TaskList() {
  const { tasks, loading, error, filters } = useTasks();

  if (loading) {
    return (
      <div className="task-list-state">
        <div className="loading-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton--sm" />
              <div className="skeleton skeleton--lg" />
              <div className="skeleton skeleton--md" />
              <div className="skeleton skeleton--sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list-state task-list-state--error">
        <span className="state-icon">⚡</span>
        <h3>Connection error</h3>
        <p>{error}</p>
        <p className="state-hint">Make sure your backend is running and MongoDB is connected.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    const hasFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search;
    return (
      <div className="task-list-state task-list-state--empty">
        <span className="state-icon">{hasFilters ? '🔍' : '✓'}</span>
        <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
        <p>{hasFilters ? 'Try adjusting your filters or search.' : 'Create your first task to get started!'}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list__count">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </div>
      <div className="task-grid">
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}
