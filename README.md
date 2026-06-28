# ⬡ TaskFlow — MERN Stack Task Tracker

A full-stack task management application built with **MongoDB**, **Express.js**, **React.js**, and **Node.js**.

---

## ✦ Features

### Mandatory
- **Full CRUD** — Create, Read, Update, Delete tasks
- **Form validation** — Client-side (live) + server-side validation
- **REST API** — 7 endpoints with proper HTTP methods & status codes
- **MongoDB integration** — Mongoose ODM with indexed schema
- **Responsive UI** — Mobile-first, adapts from 320px to 4K
- **Dynamic updates** — No page refreshes; React Context + Axios

### Bonus
- **Filter by status & priority** with pill buttons
- **Full-text search** with debouncing (400ms)
- **Multi-field sorting** (date, title, priority, due date)
- **Toast notifications** for every action
- **Skeleton loading** UI while fetching
- **Overdue detection** — highlights tasks past their due date
- **Quick status cycling** — move tasks through workflow with one click
- **Bulk delete** completed tasks
- **Double-confirm delete** (click twice to confirm)
- **Tag support** with visual tag chips
- **Progress stats bar** with live counts
- **Environment variables** for all config

---

## 🗂 Project Structure

```
task-tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── validate.js        # express-validator middleware
│   ├── models/
│   │   └── Task.js            # Mongoose schema
│   ├── routes/
│   │   └── tasks.js           # REST routes (CRUD + extras)
│   ├── .env.example           # Environment variable template
│   ├── package.json
│   └── server.js              # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterBar.js   # Filter/sort controls
│   │   │   ├── Notifications.js # Toast system
│   │   │   ├── StatsBar.js    # Summary cards
│   │   │   ├── TaskCard.js    # Individual task card
│   │   │   ├── TaskForm.js    # Create/Edit form
│   │   │   └── TaskList.js    # Grid + empty/error states
│   │   ├── context/
│   │   │   └── TaskContext.js # Global state (useReducer)
│   │   ├── hooks/
│   │   │   └── useTaskForm.js # Form state + validation
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance + taskService
│   │   ├── App.css            # Full design system
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json               # Root scripts (concurrently)
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas account (free tier works)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd task-tracker

# Install all dependencies
npm run install:all
# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tasktracker?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run in development

```bash
# From root (runs both concurrently):
npm install   # installs concurrently
npm run dev

# Or separately:
npm run dev:backend    # → http://localhost:5000
npm run dev:frontend   # → http://localhost:3000
```

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/tasks` | Get all tasks (with filters/sort/pagination) |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create new task |
| `PUT` | `/tasks/:id` | Full update task |
| `PATCH` | `/tasks/:id/status` | Quick status update |
| `DELETE` | `/tasks/:id` | Delete single task |
| `DELETE` | `/tasks` | Bulk delete completed tasks |

### Query Parameters for `GET /tasks`

| Param | Values | Description |
|-------|--------|-------------|
| `status` | `todo`, `in-progress`, `completed` | Filter by status |
| `priority` | `low`, `medium`, `high` | Filter by priority |
| `search` | any string | Full-text search on title & description |
| `sortBy` | `createdAt`, `updatedAt`, `title`, `priority`, `dueDate` | Sort field |
| `order` | `asc`, `desc` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 50) |

### Task Schema

```json
{
  "_id": "ObjectId",
  "title": "string (3–100 chars, required)",
  "description": "string (max 500 chars)",
  "status": "todo | in-progress | completed",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 date | null",
  "tags": ["string"],
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### Sample Requests

**Create a task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build REST API",
    "description": "Implement all CRUD endpoints",
    "priority": "high",
    "status": "in-progress",
    "dueDate": "2024-12-31",
    "tags": ["backend", "api"]
  }'
```

**Get filtered tasks:**
```bash
curl "http://localhost:5000/api/tasks?status=in-progress&priority=high&sortBy=dueDate&order=asc"
```

**Update status:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## ☁️ Deployment

### Backend — Render.com (Free)

1. Push backend folder to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     ```
     MONGODB_URI=<your atlas connection string>
     NODE_ENV=production
     CLIENT_URL=<your frontend vercel URL>
     PORT=10000
     ```

### Frontend — Vercel (Free)

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Settings:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Environment Variables:**
     ```
     REACT_APP_API_URL=https://<your-render-service>.onrender.com/api
     ```

### Alternative: Railway (Backend) + Netlify (Frontend)

**Railway:**
```bash
railway init
railway add mongodb  # Adds MongoDB plugin
railway up
```

**Netlify:**
```toml
# netlify.toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🧪 Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, 3–100 characters |
| `description` | Optional, max 500 characters |
| `status` | Must be `todo`, `in-progress`, or `completed` |
| `priority` | Must be `low`, `medium`, or `high` |
| `dueDate` | Optional, must be valid ISO 8601 date |
| `tags` | Optional array of strings |

---

## 🏗 Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Context API | UI, state management |
| HTTP Client | Axios | API calls with interceptors |
| Styling | Pure CSS (custom design system) | No CSS framework dependency |
| Date handling | date-fns | Lightweight date formatting |
| Backend | Node.js + Express 4 | REST API server |
| Validation | express-validator | Server-side input validation |
| Database | MongoDB Atlas | Cloud document database |
| ODM | Mongoose 8 | Schema, validation, queries |
| Logging | Morgan | HTTP request logging |
| CORS | cors | Cross-origin resource sharing |

---

## 🔑 Key Design Decisions

1. **useReducer over useState** for complex task state — easier to trace state transitions
2. **Debounced search** (400ms) to avoid excessive API calls while typing
3. **Optimistic local updates** via dispatch before re-fetching for snappy UX
4. **Double-confirm delete** — avoids accidental deletion without a modal
5. **Server + client validation** — client gives instant feedback; server is the source of truth
6. **CSS custom properties** for theming — easy to swap palettes
7. **Compound index** on `(status, priority, createdAt)` for fast filtered queries
