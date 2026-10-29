import { Profile, Project, ProjectMember, Task } from '@/types'

export const MOCK_CURRENT_USER: Profile = {
  id: 'usr-alex',
  fullName: 'Alex Rivera',
  email: 'alex@projectflow.dev',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&q=80',
  createdAt: '2026-01-15T09:00:00Z',
}

export const MOCK_USERS: Profile[] = [
  MOCK_CURRENT_USER,
  {
    id: 'usr-sarah',
    fullName: 'Sarah Chen',
    email: 'sarah@projectflow.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&fit=crop&q=80',
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'usr-marcus',
    fullName: 'Marcus Johnson',
    email: 'marcus@projectflow.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&q=80',
    createdAt: '2026-01-17T11:00:00Z',
  },
]

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign & Brand Revamp',
    description: 'Modernize marketing landing page, design system tokens, and interactive product demo.',
    ownerId: 'usr-alex',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2.0',
    description: 'Cross-platform mobile application build for iOS and Android with offline-first synchronization.',
    ownerId: 'usr-alex',
    createdAt: '2026-10-12T09:30:00Z',
    updatedAt: '2026-10-26T16:45:00Z',
  },
  {
    id: 'proj-3',
    name: 'Cloud Infrastructure & CI/CD',
    description: 'Migrating backend deployments to container orchestration, Redis cache, and automated integration tests.',
    ownerId: 'usr-sarah',
    createdAt: '2026-10-15T11:15:00Z',
    updatedAt: '2026-10-27T10:20:00Z',
  },
]

export const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  // Project 1
  { projectId: 'proj-1', userId: 'usr-alex', role: 'owner', joinedAt: '2026-10-10T08:00:00Z' },
  { projectId: 'proj-1', userId: 'usr-sarah', role: 'admin', joinedAt: '2026-10-11T09:00:00Z' },
  { projectId: 'proj-1', userId: 'usr-marcus', role: 'member', joinedAt: '2026-10-11T10:00:00Z' },

  // Project 2
  { projectId: 'proj-2', userId: 'usr-alex', role: 'owner', joinedAt: '2026-10-12T09:30:00Z' },
  { projectId: 'proj-2', userId: 'usr-marcus', role: 'member', joinedAt: '2026-10-13T11:00:00Z' },

  // Project 3
  { projectId: 'proj-3', userId: 'usr-sarah', role: 'owner', joinedAt: '2026-10-15T11:15:00Z' },
  { projectId: 'proj-3', userId: 'usr-alex', role: 'member', joinedAt: '2026-10-16T12:00:00Z' },
]

// Dynamic dates relative to today for realistic presentation
function getOffsetDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export const MOCK_TASKS: Task[] = [
  // Project 1: Website Redesign
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Audit accessibility & WCAG 2.1 compliance',
    description: 'Ensure color contrast ratios pass AA standard and keyboard focus indicators are visible on all interactive elements.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'usr-alex',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(1), // Tomorrow
    position: 1000,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Design responsive navigation drawer & header',
    description: 'Implement mobile drawer with backdrop overlay, smooth open/close transitions, and active route highlights.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'usr-sarah',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(-3),
    position: 2000,
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-10-24T15:00:00Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Implement Dark Mode with Tailwind and CSS variables',
    description: 'Add persistent theme toggle supporting system preference, light mode, and dark mode without flash of unstyled content.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'usr-alex',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(-1),
    position: 2100,
    createdAt: '2026-10-19T14:00:00Z',
    updatedAt: '2026-10-26T17:30:00Z',
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Optimize web fonts and core web vitals LCP score',
    description: 'Preload Inter font, reduce hero image sizes, and ensure Largest Contentful Paint stays under 1.2s.',
    status: 'todo',
    priority: 'low',
    assigneeId: 'usr-marcus',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(5),
    position: 1000,
    createdAt: '2026-10-21T08:30:00Z',
    updatedAt: '2026-10-21T08:30:00Z',
  },
  {
    id: 'task-5',
    projectId: 'proj-1',
    title: 'Create reusable TaskModal with Zod validation',
    description: 'Form includes validation for title, status, priority, due date, and dynamic assignee dropdown populated by project members.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'usr-alex',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(0), // Today
    position: 1100,
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'task-6',
    projectId: 'proj-1',
    title: 'Write automated unit tests for dashboard metrics',
    description: 'Verify project completion percentages, overdue calculations, and zero-task project guards.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'usr-alex',
    createdBy: 'usr-sarah',
    dueDate: getOffsetDate(3),
    position: 1200,
    createdAt: '2026-10-23T13:00:00Z',
    updatedAt: '2026-10-23T13:00:00Z',
  },

  // Project 2: Mobile App
  {
    id: 'task-7',
    projectId: 'proj-2',
    title: 'Setup biometric authentication (FaceID / Fingerprint)',
    description: 'Integrate native keychain storage for token caching with fallback to PIN code.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'usr-marcus',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(-2), // Overdue
    position: 1000,
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'task-8',
    projectId: 'proj-2',
    title: 'Configure push notification delivery tokens',
    description: 'Setup APNs and FCM integration for instant task assignment notifications.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'usr-alex',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(4),
    position: 1000,
    createdAt: '2026-10-17T15:00:00Z',
    updatedAt: '2026-10-17T15:00:00Z',
  },
  {
    id: 'task-9',
    projectId: 'proj-2',
    title: 'Offline SQLite database synchronization logic',
    description: 'Build local conflict resolution queue when reconnecting to network.',
    status: 'done',
    priority: 'high',
    assigneeId: 'usr-alex',
    createdBy: 'usr-alex',
    dueDate: getOffsetDate(-5),
    position: 2000,
    createdAt: '2026-10-14T08:00:00Z',
    updatedAt: '2026-10-22T14:00:00Z',
  },

  // Project 3: Cloud Infrastructure
  {
    id: 'task-10',
    projectId: 'proj-3',
    title: 'Configure automated PostgreSQL automated backups',
    description: 'Nightly point-in-time recovery WAL archiving to encrypted S3 storage.',
    status: 'done',
    priority: 'high',
    assigneeId: 'usr-sarah',
    createdBy: 'usr-sarah',
    dueDate: getOffsetDate(-4),
    position: 2000,
    createdAt: '2026-10-16T12:00:00Z',
    updatedAt: '2026-10-23T16:00:00Z',
  },
  {
    id: 'task-11',
    projectId: 'proj-3',
    title: 'Stress-test database connection pooler limits',
    description: 'Simulate 1,000 concurrent requests with pgbench to tune pool sizes.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'usr-alex',
    createdBy: 'usr-sarah',
    dueDate: getOffsetDate(2),
    position: 1000,
    createdAt: '2026-10-24T09:30:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
  },
]
