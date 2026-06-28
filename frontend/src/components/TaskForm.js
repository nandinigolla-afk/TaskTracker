import React, { useState } from 'react';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTasks } from '../context/TaskContext';

export default function TaskForm({ task = null, onClose }) {
  const { createTask, updateTask } = useTasks();
  const { form, errors, touched, handleChange, handleBlur, getPayload, isValid, reset } = useTaskForm(task);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  const isEdit = Boolean(task);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors([]);
    if (!isValid()) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTask(task._id, getPayload());
      } else {
        await createTask(getPayload());
        reset();
      }
      onClose?.();
    } catch (err) {
      if (err.errors) {
        setServerErrors(err.errors.map(e => e.message));
      } else {
        setServerErrors([err.message || 'Failed to save task']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={`form-input ${touched.title && errors.title ? 'form-input--error' : ''}`}
          placeholder="What needs to be done?"
          value={form.title}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          maxLength={100}
        />
        {touched.title && errors.title && (
          <span className="form-error">{errors.title}</span>
        )}
        <span className="form-hint">{form.title.length}/100</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className={`form-textarea ${touched.description && errors.description ? 'form-input--error' : ''}`}
          placeholder="Add more details…"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          maxLength={500}
        />
        {touched.description && errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
        <span className="form-hint">{form.description.length}/500</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="priority">Priority</label>
          <select id="priority" name="priority" className={`form-select form-select--priority-${form.priority}`} value={form.priority} onChange={handleChange}>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={`form-input ${touched.dueDate && errors.dueDate ? 'form-input--error' : ''}`}
            value={form.dueDate}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.dueDate && errors.dueDate && (
            <span className="form-error">{errors.dueDate}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="form-input"
            placeholder="design, frontend, bug"
            value={form.tags}
            onChange={handleChange}
          />
          <span className="form-hint">Comma-separated</span>
        </div>
      </div>

      {serverErrors.length > 0 && (
        <div className="form-server-errors">
          {serverErrors.map((e, i) => <p key={i}>⚠ {e}</p>)}
        </div>
      )}

      <div className="form-actions">
        {onClose && (
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? (
            <><span className="spinner" /> {isEdit ? 'Saving…' : 'Creating…'}</>
          ) : (
            isEdit ? '✓ Save changes' : '+ Add task'
          )}
        </button>
      </div>
    </form>
  );
}
