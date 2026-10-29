# ProjectFlow — Full-Stack Project Management Platform

> **"Plan clearly. Execute confidently."**

A production-grade, responsive project and task management web application built with **React**, **TypeScript**, **Tailwind CSS v3**, **React Router**, **dnd-kit**, and **Supabase (PostgreSQL + Auth + Row Level Security)**.

---

## 🌟 Key Features

- **Interactive Kanban Board**: Drag-and-drop task management across *To Do*, *In Progress*, and *Done* columns with accessible keyboard controls (`@dnd-kit`), column counts, empty states, and optimistic UI updates with automatic rollback.
- **Real-Time Analytics Dashboard**: Live metrics calculated from persisted database records:
  - Total Projects, Active Tasks, Completed Tasks, and Overdue Tasks
  - Interactive Task Distribution Chart powered by **Recharts**
  - Upcoming Deadlines tracker with overdue alerts
  - Project completion percentage progress bars
- **Robust Task Management**:
  - Reusable `TaskModal` with strict **Zod** schema validation and field-level error messages
  - Multi-criteria filtering: Search by keyword, filter by status, priority (High, Medium, Low), and assignee
  - Multi-sort: Sort by due date (earliest/latest), priority, or title
  - Delete with destructive action confirmation modals
- **Multi-Project Workspaces**:
  - Create, edit, and delete project workspaces
  - Dynamic progress calculations and task ownership
- **"My Tasks" View**:
  - Filtered task board specifically assigned to the active user
  - Direct status toggling and overdue indicators
- **Dark & Light Mode**:
  - Built-in theme switcher with instant CSS token transitions and `localStorage` persistence
- **Security & Authorization (RLS)**:
  - Supabase PostgreSQL schema with **Row Level Security (RLS)** policies on all tables
  - Security Definer helper functions to prevent recursive policy loops
  - Strict membership and role enforcement (`owner`, `admin`, `member`)
- **Interactive Local / Demo Mode**:
  - Runs out of the box with zero external configuration required
  - Seeded with realistic engineering projects and team members
  - Persists all mutations and drag-and-drop moves to browser storage
  - Includes a quick demo user switcher in Settings to evaluate multi-user workflows

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Language** | TypeScript (Strict mode enabled) |
| **Styling** | Tailwind CSS v3 (Custom brand palette, dark mode class) |
| **Routing** | React Router v7 |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **State & Forms** | React Hook Form + Zod schema validation |
| **Data Visualizations** | Recharts |
| **Icons** | Lucide React |
| **Backend / DB** | Supabase PostgreSQL + Supabase Auth |
| **Testing** | Vitest, React Testing Library, jsdom |

---

## 📁 Project Architecture

```text
projectflow/
├── public/                     # Static assets and SVG brand logo
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── dashboard/          # StatCard, TaskCompletionChart, UpcomingDeadlines, ProjectProgressList
│   │   ├── layout/             # AppLayout, Sidebar, Header
│   │   ├── projects/           # ProjectCard, ProjectModal
│   │   ├── tasks/              # TaskCard, KanbanBoard, KanbanColumn, TaskModal, TaskFilters
│   │   └── ui/                 # Button, Input, Textarea, Select, Badge, Modal, ConfirmDialog, EmptyState, LoadingSkeleton
│   ├── context/
│   │   ├── AuthContext.tsx     # Unified auth state (Supabase + Local Demo fallback)
│   │   ├── ThemeContext.tsx    # Light / Dark theme management
│   │   └── ToastContext.tsx    # Notification toast system
│   ├── lib/
│   │   └── supabase.ts         # Supabase client wrapper and environment validator
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Overview metrics, charts, upcoming deadlines
│   │   ├── ProjectsPage.tsx    # Project workspaces grid & search
│   │   ├── ProjectWorkspacePage.tsx # Kanban workspace with dnd-kit
│   │   ├── MyTasksPage.tsx     # Assigned tasks filter & status updater
│   │   ├── SettingsPage.tsx    # Profile details, theme switcher, db status
│   │   ├── LoginPage.tsx       # Auth login with demo credentials
│   │   ├── RegisterPage.tsx    # User registration
│   │   └── NotFoundPage.tsx    # 404 handler
│   ├── services/
│   │   ├── api.ts              # Unified repository service layer
│   │   ├── mockData.ts         # Rich seed data for demo testing
│   │   └── storage.ts          # LocalStorage persistence repository
│   ├── test/                   # Vitest unit & component test suite
│   │   ├── dateUtils.test.ts
│   │   ├── forms.test.ts
│   │   ├── setup.ts
│   │   ├── TaskCard.test.tsx
│   │   └── taskUtils.test.ts
│   ├── types/
│   │   └── index.ts            # Domain TypeScript types and Zod schemas
│   ├── utils/
│   │   ├── cn.ts               # Tailwind class merge utility
│   │   ├── dateUtils.ts        # Overdue calculations and date formatters
│   │   └── taskUtils.ts        # Filtering, sorting, and progress math
│   ├── App.tsx                 # Route declarations & route protection
│   ├── index.css               # Design system tokens and scrollbar
│   └── main.tsx                # App entrypoint
├── supabase/
│   ├── migrations/
│   │   └── 20261029000000_init_projectflow.sql # Production PostgreSQL migration + RLS
│   └── seed.sql                # Database seed script
├── .env.example                # Environment variables template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start (Local Demo Mode)

ProjectFlow is designed to run immediately without requiring Supabase cloud setup:

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd projectflow
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:5174/](http://localhost:5174/) (or the port indicated in terminal).
   - In Demo Mode, you can log in instantly using the demo credentials provided on the login page (or switch between accounts in Settings).
   - All tasks, projects, drag-and-drop moves, and profile updates persist in your browser's local store.

---

## 🔒 Supabase Setup & Production Database

To connect ProjectFlow to your live Supabase PostgreSQL database:

### 1. Create a Supabase Project
- Visit [supabase.com](https://supabase.com) and create a free project.

### 2. Run Database Migration
- In the Supabase Dashboard, open the **SQL Editor**.
- Copy and run the entire SQL migration script from:
  [`supabase/migrations/20261029000000_init_projectflow.sql`](supabase/migrations/20261029000000_init_projectflow.sql)
- This creates:
  - `profiles`, `projects`, `project_members`, and `tasks` tables
  - Foreign key constraints, cascading deletions, and performance indexes
  - Automatic `updated_at` timestamps
  - Auth user profile auto-creation trigger
  - Security Definer helper functions (`is_project_member`, `get_project_role`)
  - Full Row Level Security (RLS) policies for owner and member access

### 3. Configure Frontend Environment Variables
Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
```

> **Note:** Only use the public `anon` key. Never expose your `service_role` key in frontend code.

Restart your dev server:
```bash
npm run dev
```
ProjectFlow will detect your credentials and switch to live cloud PostgreSQL!

---

## 🧪 Testing

Run the automated test suite powered by **Vitest** and **React Testing Library**:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Verified Test Coverage:
- **Unit Tests (`dateUtils.test.ts`)**: Overdue calculation, date parsing, edge cases.
- **Unit Tests (`taskUtils.test.ts`)**: Dashboard metrics calculation, zero-division prevention, progress %, multi-criteria search and sorting.
- **Unit Tests (`forms.test.ts`)**: Zod validation schemas for tasks, projects, login, and registration.
- **Component Tests (`TaskCard.test.tsx`)**: TaskCard DOM rendering, badge presentation, and assignee formatting.

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

The production bundle is compiled into the `dist/` directory, optimized with minification and CSS extraction.

---

## 🌐 Deployment

ProjectFlow can be deployed to any static host:

- **Vercel**: Import the GitHub repository, framework preset *Vite*, set build command `npm run build` and output directory `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Settings.
- **Netlify**: Set publish directory to `dist` and build command to `npm run build`.
- **Cloudflare Pages**: Framework preset *Vite*, build directory `dist`.

---

## 📄 License

MIT License. Designed and built with pride as a portfolio-grade full-stack platform.
