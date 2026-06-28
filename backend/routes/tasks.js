const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateTask } = require('../middleware/validate');

// GET /api/tasks — fetch all tasks with filtering & sorting
router.get('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    // Stats summary
    const stats = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = { todo: 0, 'in-progress': 0, completed: 0 };
    stats.forEach(s => { summary[s._id] = s.count; });

    res.json({
      success: true,
      data: tasks,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/:id — fetch single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/tasks — create task
router.post('/', validateTask, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate, tags });
    res.status(201).json({ success: true, data: task, message: 'Task created successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', validateTask, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task, message: 'Task updated successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PATCH /api/tasks/:id/status — quick status update
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id — delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully', data: { id: req.params.id } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks — bulk delete completed
router.delete('/', async (req, res) => {
  try {
    const result = await Task.deleteMany({ status: 'completed' });
    res.json({ success: true, message: `${result.deletedCount} completed tasks deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
