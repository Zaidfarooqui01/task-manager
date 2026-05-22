# TaskFlow — Team Task Manager

A production-ready, full-stack Team Task Manager web application with role-based access control (Admin/Member), project management, task tracking, and real-time dashboards.

> **Built for Ethara.ai Internship Assignment**

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | *[To be deployed on Railway]* |
| **Backend API** | *[To be deployed on Railway]* |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.com` | `Demo@123` |
| Member | `member@demo.com` | `Demo@123` |
| Member | `member2@demo.com` | `Demo@123` |

---

## ⚙️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v22 |
| Framework | Express.js v5 |
| ORM | Prisma v7.8 |
| Database | PostgreSQL 18 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod v4 |
| Language | TypeScript |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Language | TypeScript |

### Deployment
| Service | Platform |
|---------|---------|
| Backend API | Railway |
| Frontend | Railway |
| Database | Railway PostgreSQL |

---

## 🚀 Features

### Authentication
- JWT-based signup and login
- Session persistence with token refresh on page reload
- Secure password hashing with bcryptjs

### Role-Based Access Control (RBAC)
**Admin can:**
- Create, update, delete projects
- Add/remove members from projects
- Create, assign, update, delete all tasks
- View all projects, all tasks, all users
- View full dashboard with global stats

**Member can:**
- View only projects they are a member of
- View tasks assigned to them
- Update ONLY the `status` field of their assigned tasks
- View personal dashboard (assigned tasks, overdue, progress)
- Cannot manage members, create projects, or delete anything

> RBAC is enforced on **both backend middleware AND frontend UI**

### Project Management
- Create projects with name and description
- Add/remove team members
- View project-specific task lists
- Edit and delete projects (Admin only)

### Task Management
- Create tasks with title, description, status, priority, due date, and assignee
- Filter tasks by status
- Track overdue tasks (past due date + not done)
- Priority badges: Low (green), Medium (amber), High (red)
- Status pills: Todo (gray), In Progress (blue), Done (green)

### Dashboard
- **Admin Dashboard:** Total projects, total tasks, tasks by status (visual progress bar), overdue tasks, tasks due today, project-wise summary table
- **Member Dashboard:** My tasks count, completed tasks, overdue, due today, recent task activity

### UI/UX
- Dark mode with glassmorphism design
- Light/dark mode toggle
- Left sidebar navigation with responsive mobile hamburger menu
- Skeleton loaders on all data-fetching views
- Empty states with action buttons
- Toast notifications for success/error
- Confirm dialogs before destructive actions
- Fully responsive (mobile, tablet, desktop)

---

## 📁 Project Structure

```
Task_Manager/
├── server/                  ← Node + Express + Prisma + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma    # Database models & enums
│   │   ├── seed.ts          # Demo data seeder
│   │   └── migrations/      # Auto-generated migrations
│   ├── src/
│   │   ├── controllers/     # Route handlers (auth, user, project, task, dashboard)
│   │   ├── middleware/       # JWT auth, admin guard, Zod validation
│   │   ├── routes/           # Express route definitions
│   │   ├── validators/       # Zod schemas for input validation
│   │   ├── lib/prisma.ts     # Prisma client singleton
│   │   └── index.ts          # Express app entry point
│   ├── prisma.config.ts      # Prisma v7 config
│   ├── tsconfig.json
│   └── package.json
├── client/                  ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/            # Login, Signup, Dashboard, Projects, Tasks, Profile
│   │   ├── components/       # Layout, ProtectedRoute, UI components
│   │   ├── context/          # AuthContext (JWT session management)
│   │   ├── hooks/            # useAuth hook
│   │   ├── api/              # Axios instance + API service modules
│   │   └── types/            # TypeScript interfaces & enums
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v22+
- PostgreSQL 18+
- npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Task_Manager
```

### 2. Backend Setup
```bash
cd server
npm install

# Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE task_manager_db;"

# Configure environment variables
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```
The backend will start at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client
npm install

# Configure environment variables
# .env should have VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```
The frontend will start at `http://localhost:5173`

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Protected | Get current user info |

### Users — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/:id` | Protected | Get user by ID |

### Projects — `/api/projects`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects` | Protected | List projects (role-filtered) |
| GET | `/api/projects/:id` | Protected | Project detail + members + tasks |
| PATCH | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks — `/api/tasks`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks` | Protected | List tasks (role-filtered) |
| GET | `/api/tasks/:id` | Protected | Task detail |
| PATCH | `/api/tasks/:id` | Protected | Update task (Member: status only) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | Protected | Role-aware dashboard stats |

---

## 🗄️ Database Schema

```
User            ─┬─── projectsCreated  ──→ Project
                 ├─── projectMembers   ──→ ProjectMember
                 ├─── tasksCreated     ──→ Task
                 └─── tasksAssigned    ──→ Task

Project         ─┬─── members          ──→ ProjectMember
                 └─── tasks            ──→ Task

ProjectMember   ─── @@unique([projectId, userId])

Task            ─── belongs to Project, optionally assigned to User
```

### Enums
- **UserRole:** `ADMIN` | `MEMBER`
- **TaskStatus:** `TODO` | `IN_PROGRESS` | `DONE`
- **TaskPriority:** `LOW` | `MEDIUM` | `HIGH`

---

## 🔐 RBAC Summary

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Update/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| View all projects | ✅ | Own only |
| Create task | ✅ | ❌ |
| Update task (all fields) | ✅ | Status only |
| Delete task | ✅ | ❌ |
| View all tasks | ✅ | Assigned only |
| Dashboard | Global stats | Personal stats |

---

## 🚀 Railway Deployment

### Structure
| Service | Root Directory | Build Command | Start Command |
|---------|---------------|---------------|---------------|
| Backend | `server` | `npm run build` | `npm start` |
| Frontend | `client` | `npm run build` | `npx serve dist` |
| Database | — | Railway PostgreSQL | — |

### Steps
1. Create a new Railway project
2. Add a PostgreSQL service
3. Add Backend service (set root to `server/`)
   - Set env vars: `DATABASE_URL` (from Railway Postgres), `JWT_SECRET`, `PORT`, `CLIENT_URL`, `NODE_ENV=production`
   - After deploy: run `npx prisma migrate deploy && npm run db:seed`
4. Add Frontend service (set root to `client/`)
   - Set env var: `VITE_API_URL` = backend Railway URL + `/api`
5. Test with demo credentials

---

## 📋 Submission Checklist
- [x] Full-stack web app with authentication
- [x] Project & team management
- [x] Task creation, assignment & status tracking
- [x] Role-based access control (Admin/Member)
- [x] Dashboard with stats, status, overdue tracking
- [x] REST APIs with proper validations
- [x] Database with proper relationships
- [x] Seed data with demo accounts
- [x] Responsive UI with dark mode
- [ ] Live URL on Railway
- [ ] GitHub repo with clean commit history
- [ ] Demo video (2–5 min)

---

*Built with ❤️ for Ethara.ai Internship Assignment*
