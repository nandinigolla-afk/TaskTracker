const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDeadlineReminder } = require('./email');

// Runs every day at 8:00 AM
const startDeadlineCron = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running deadline reminder check...');
    try {
      const now = new Date();
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Find tasks due today or tomorrow, not completed, not already notified
      const dueTasks = await Task.find({
        dueDate: { $gte: now, $lte: tomorrowEnd },
        status: { $ne: 'completed' },
        deadlineNotified: false,
      }).populate('user', 'name email');

      // Also find overdue tasks not yet notified
      const overdueTasks = await Task.find({
        dueDate: { $lt: now },
        status: { $ne: 'completed' },
        deadlineNotified: false,
      }).populate('user', 'name email');

      const allTasks = [...dueTasks, ...overdueTasks];

      // Group by user
      const userTaskMap = {};
      allTasks.forEach(task => {
        if (!task.user) return;
        const userId = task.user._id.toString();
        if (!userTaskMap[userId]) {
          userTaskMap[userId] = {
            user: task.user,
            tasks: [],
          };
        }
        userTaskMap[userId].tasks.push({
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          isOverdue: task.dueDate < now,
          _id: task._id,
        });
      });

      // Send email per user
      for (const userId of Object.keys(userTaskMap)) {
        const { user, tasks } = userTaskMap[userId];
        try {
          await sendDeadlineReminder({
            to: user.email,
            userName: user.name,
            tasks,
          });
          // Mark tasks as notified
          const taskIds = tasks.map(t => t._id);
          await Task.updateMany(
            { _id: { $in: taskIds } },
            { deadlineNotified: true }
          );
          console.log(`✅ Reminder sent to ${user.email} for ${tasks.length} task(s)`);
        } catch (err) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, err.message);
        }
      }

      if (Object.keys(userTaskMap).length === 0) {
        console.log('✅ No deadline reminders to send today.');
      }
    } catch (err) {
      console.error('❌ Cron job error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' }); // IST timezone — change as needed

  console.log('⏰ Deadline reminder cron job scheduled (daily 8AM IST)');
};

module.exports = { startDeadlineCron };
