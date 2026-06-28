import React from 'react';
import { useTasks } from '../context/TaskContext';

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export default function Notifications() {
  const { notifications } = useTasks();
  
  if (!notifications.length) return null;
  
  return (
    <div className="notifications">
      {notifications.map(n => (
        <div key={n.id} className={`notification notification--${n.type}`}>
          <span className="notification__icon">{icons[n.type] || icons.info}</span>
          <span className="notification__message">{n.message}</span>
        </div>
      ))}
    </div>
  );
}
