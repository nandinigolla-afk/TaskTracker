import { useState, useCallback } from 'react';

const defaultForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: '',
};

const validate = (data) => {
  const errors = {};
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }
  if (data.description && data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  if (data.dueDate) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.dueDate = 'Invalid date';
    }
  }
  return errors;
};

export function useTaskForm(initialData = null) {
  const [form, setForm] = useState(
    initialData
      ? {
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'todo',
          priority: initialData.priority || 'medium',
          dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
          tags: (initialData.tags || []).join(', '),
        }
      : defaultForm
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    // Live validation
    const newErrors = validate({ ...form, [name]: value });
    setErrors(prev => ({ ...prev, [name]: newErrors[name] || undefined }));
  }, [form]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErrors = validate(form);
    setErrors(prev => ({ ...prev, [name]: newErrors[name] || undefined }));
  }, [form]);

  const getPayload = useCallback(() => ({
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
    dueDate: form.dueDate || null,
    tags: form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [],
  }), [form]);

  const isValid = useCallback(() => {
    const errs = validate(form);
    setErrors(errs);
    setTouched({ title: true, description: true, dueDate: true });
    return Object.keys(errs).length === 0;
  }, [form]);

  const reset = useCallback(() => {
    setForm(defaultForm);
    setErrors({});
    setTouched({});
  }, []);

  return { form, errors, touched, handleChange, handleBlur, getPayload, isValid, reset };
}
