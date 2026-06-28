import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskService } from '../utils/api';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  summary: { todo: 0, 'in-progress': 0, completed: 0 },
  filters: { status: 'all', priority: 'all', search: '', sortBy: 'createdAt', order: 'desc' },
  notifications: [],
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload.tasks, summary: action.payload.summary, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t._id === action.payload._id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t._id !== action.payload) };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [{ id: Date.now(), ...action.payload }, ...state.notifications].slice(0, 5),
      };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const notify = useCallback((message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), 3500);
  }, []);

  const fetchTasks = useCallback(async (filters = state.filters) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      params.sortBy = filters.sortBy;
      params.order = filters.order;

      const res = await taskService.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: { tasks: res.data, summary: res.summary } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      notify(err.message, 'error');
    }
  }, [state.filters, notify]);

  const createTask = useCallback(async (data) => {
    const res = await taskService.create(data);
    dispatch({ type: 'ADD_TASK', payload: res.data });
    notify('Task created successfully!', 'success');
    await fetchTasks();
    return res.data;
  }, [fetchTasks, notify]);

  const updateTask = useCallback(async (id, data) => {
    const res = await taskService.update(id, data);
    dispatch({ type: 'UPDATE_TASK', payload: res.data });
    notify('Task updated!', 'success');
    await fetchTasks();
    return res.data;
  }, [fetchTasks, notify]);

  const updateStatus = useCallback(async (id, status) => {
    const res = await taskService.updateStatus(id, status);
    dispatch({ type: 'UPDATE_TASK', payload: res.data });
    notify(`Status changed to ${status}`, 'info');
    await fetchTasks();
  }, [fetchTasks, notify]);

  const deleteTask = useCallback(async (id) => {
    await taskService.delete(id);
    dispatch({ type: 'DELETE_TASK', payload: id });
    notify('Task deleted', 'error');
    await fetchTasks();
  }, [fetchTasks, notify]);

  const deleteCompleted = useCallback(async () => {
    const res = await taskService.deleteCompleted();
    notify(res.message, 'info');
    await fetchTasks();
  }, [fetchTasks, notify]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      createTask,
      updateTask,
      updateStatus,
      deleteTask,
      deleteCompleted,
      setFilters,
      notify,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
