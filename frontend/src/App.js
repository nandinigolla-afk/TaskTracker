import React, { useEffect, useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import Notifications from './components/Notifications';
import AuthPage from './components/AuthPage';
import './App.css';

function AppContent() {
  const { fetchTasks } = useTasks();
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []); // eslint-disable-line

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app">
      <Notifications />

      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">⬡</div>
            <h1 className="brand-name">TaskFlow</h1>
          </div>
          <div className="header-right">
            <button
              className={`btn btn--primary btn--add ${showForm ? 'btn--cancel' : ''}`}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Cancel' : '+ New Task'}
            </button>
            <div className="user-menu-wrap">
              <button className="user-avatar" onClick={() => setShowUserMenu(v => !v)} title={user?.name}>
                {initials}
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown__info">
                    <span className="user-dropdown__name">{user?.name}</span>
                    <span className="user-dropdown__email">{user?.email}</span>
                  </div>
                  <button className="user-dropdown__logout" onClick={() => { setShowUserMenu(false); logout(); }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
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

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="brand-icon">⬡</div>
        <span className="spinner spinner--lg" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
