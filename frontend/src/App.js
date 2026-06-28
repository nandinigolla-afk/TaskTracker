import React, { useEffect, useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import Notifications from './components/Notifications';
import './App.css';

function AppContent() {
  const { fetchTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []); // eslint-disable-line

  return (
    <div className="app">
      <Notifications />

      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">⬡</div>
            <h1 className="brand-name">TaskFlow</h1>
          </div>
          <button
            className={`btn btn--primary btn--add ${showForm ? 'btn--cancel' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <StatsBar />

          {showForm && (
            <div className="new-task-panel">
              <h2 className="panel-title">New task</h2>
              <TaskForm onClose={() => setShowForm(false)} />
            </div>
          )}

          <FilterBar />
          <TaskList />
        </div>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} TaskFlow</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
