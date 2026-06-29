const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDeadlineReminder = async ({ to, userName, tasks }) => {
  const taskRows = tasks.map(t => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2d3e;color:#f1f5f9;font-weight:500;">${t.title}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2d3e;text-align:center;">
        <span style="padding:3px 10px;border-radius:100px;font-size:12px;background:${
          t.priority === 'high' ? 'rgba(239,68,68,.2)' :
          t.priority === 'medium' ? 'rgba(245,158,11,.2)' : 'rgba(16,185,129,.2)'
        };color:${
          t.priority === 'high' ? '#ef4444' :
          t.priority === 'medium' ? '#f59e0b' : '#10b981'
        };">${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2d3e;text-align:center;color:${
        t.isOverdue ? '#ef4444' : '#f59e0b'
      };font-weight:600;">${t.isOverdue ? '⚠ Overdue' : '📅 Due Today'}</td>
    </tr>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      
      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 24px;">
          <div style="width:36px;height:36px;background:#6c63ff;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:18px;">⬡</div>
          <span style="font-size:20px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em;">TaskFlow</span>
        </div>
      </div>

      <!-- Card -->
      <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
        
        <!-- Top accent -->
        <div style="height:4px;background:linear-gradient(90deg,#6c63ff,#f59e0b);"></div>
        
        <!-- Body -->
        <div style="padding:28px 28px 24px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">
            ⏰ Deadline Reminder
          </h1>
          <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
            Hi <strong style="color:#f1f5f9;">${userName}</strong>, you have ${tasks.length} task${tasks.length > 1 ? 's' : ''} that need${tasks.length === 1 ? 's' : ''} your attention.
          </p>

          <!-- Tasks table -->
          <table style="width:100%;border-collapse:collapse;background:#21253a;border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#272b3e;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.06em;">Task</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.06em;">Priority</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.06em;">Status</th>
              </tr>
            </thead>
            <tbody>${taskRows}</tbody>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;padding:12px 28px;background:#6c63ff;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:.01em;">
              Open TaskFlow →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
          <p style="margin:0;font-size:12px;color:#475569;">
            You're receiving this because you have tasks with approaching deadlines.<br>
            © ${new Date().getFullYear()} TaskFlow
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `⏰ ${tasks.length} task${tasks.length > 1 ? 's' : ''} due soon — TaskFlow`,
    html,
  });
};

const sendWelcomeEmail = async ({ to, userName }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 24px;">
          <div style="width:36px;height:36px;background:#6c63ff;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:18px;">⬡</div>
          <span style="font-size:20px;font-weight:700;color:#f1f5f9;">TaskFlow</span>
        </div>
      </div>
      <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
        <div style="height:4px;background:linear-gradient(90deg,#6c63ff,#10b981);"></div>
        <div style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f1f5f9;">Welcome, ${userName}! 🎉</h1>
          <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
            Your TaskFlow account is ready. Start creating tasks, set priorities and deadlines — we'll send you reminders so nothing slips through.
          </p>
          <div style="text-align:center;">
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;padding:12px 28px;background:#6c63ff;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              Get Started →
            </a>
          </div>
        </div>
        <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} TaskFlow</p>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to TaskFlow, ${userName}! 🎉`,
    html,
  });
};

module.exports = { sendDeadlineReminder, sendWelcomeEmail };
