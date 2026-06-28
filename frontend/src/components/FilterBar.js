import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

export default function FilterBar() {
  const { filters, setFilters, fetchTasks, deleteCompleted, summary } = useTasks();
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        const newFilters = { ...filters, search: searchInput };
        setFilters(newFilters);
        fetchTasks(newFilters);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line

  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchTasks(newFilters);
  };

  const handleSort = (e) => {
    const [sortBy, order] = e.target.value.split(':');
    const newFilters = { ...filters, sortBy, order };
    setFilters(newFilters);
    fetchTasks(newFilters);
  };

  const currentSort = `${filters.sortBy}:${filters.order}`;

  return (
    <div className="filter-bar">
      <div className="filter-bar__search">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="search-input"
        />
        {searchInput && (
          <button className="search-clear" onClick={() => { setSearchInput(''); handleFilter('search', ''); }}>✕</button>
        )}
      </div>

      <div className="filter-bar__controls">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <div className="filter-pills">
            {['all', 'todo', 'in-progress', 'completed'].map(s => (
              <button
                key={s}
                className={`filter-pill ${filters.status === s ? 'filter-pill--active' : ''}`}
                onClick={() => handleFilter('status', s)}
              >
                {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <div className="filter-pills">
            {['all', 'high', 'medium', 'low'].map(p => (
              <button
                key={p}
                className={`filter-pill filter-pill--${p} ${filters.priority === p ? 'filter-pill--active' : ''}`}
                onClick={() => handleFilter('priority', p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group filter-group--sort">
          <label className="filter-label">Sort by</label>
          <select className="sort-select" value={currentSort} onChange={handleSort}>
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="dueDate:asc">Due date (soonest)</option>
            <option value="dueDate:desc">Due date (latest)</option>
            <option value="title:asc">Title A–Z</option>
            <option value="title:desc">Title Z–A</option>
            <option value="priority:desc">Priority (high first)</option>
          </select>
        </div>

        {summary.completed > 0 && (
          <button className="btn btn--ghost btn--sm" onClick={() => {
            if (window.confirm(`Delete all ${summary.completed} completed tasks?`)) deleteCompleted();
          }}>
            🗑 Clear completed ({summary.completed})
          </button>
        )}
      </div>
    </div>
  );
}
