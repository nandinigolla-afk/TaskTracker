import React from 'react';
import { useTasks } from '../context/TaskContext';

export default function StatsBar() {
  const { summary } = useTasks();
  const total = summary.todo + summary['in-progress'] + summary.completed;
  const completedPct = total ? Math.round((summary.completed / total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stat-card stat-card--total">
        <span className="stat-card__count">{total}</span>
        <span className="stat-card__label">Total</span>
      </div>
      <div className="stat-card stat-card--todo">
        <span className="stat-card__count">{summary.todo}</span>
        <span className="stat-card__label">To Do</span>
      </div>
      <div className="stat-card stat-card--progress">
        <span className="stat-card__count">{summary['in-progress']}</span>
        <span className="stat-card__label">In Progress</span>
      </div>
      <div className="stat-card stat-card--done">
        <span className="stat-card__count">{summary.completed}</span>
        <span className="stat-card__label">Completed</span>
        {total > 0 && (
          <span className="stat-card__pct">{completedPct}%</span>
        )}
      </div>
    </div>
  );
}
