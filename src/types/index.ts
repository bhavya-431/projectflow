import { z } from 'zod'

// -----------------------------------------------------------------------------
// Core Domain Types
// -----------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type ProjectRole = 'owner' | 'admin' | 'member'

export interface Profile {
  id: string
  fullName: string
  avatarUrl?: string | null
  email?: string
  createdAt?: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  // Derived/joined fields
  owner?: Profile
  members?: ProjectMember[]
  taskCount?: number
  completedTaskCount?: number
  progress?: number
}

export interface ProjectMember {
  projectId: string
  userId: string
  role: ProjectRole
  joinedAt: string
  profile?: Profile
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string | null
  createdBy: string
  dueDate?: string | null // ISO string: YYYY-MM-DD
  position: number
  createdAt: string
  updatedAt: string
  // Joined fields
  assignee?: Profile | null
  project?: Project | null
}

export interface DashboardMetrics {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  overdueTasks: number
  overallProgress: number
}

// -----------------------------------------------------------------------------
// Filter & Sort Types
// -----------------------------------------------------------------------------

export type TaskSortOption =
  | 'dueDateAsc'
  | 'dueDateDesc'
  | 'priorityDesc'
  | 'priorityAsc'
  | 'titleAsc'
  | 'positionAsc'

export interface TaskFilterOptions {
  searchQuery: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  assigneeId: string | 'all'
  sortBy: TaskSortOption
}

// -----------------------------------------------------------------------------
// Validation Schemas (Zod)
// -----------------------------------------------------------------------------

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(120, 'Title cannot exceed 120 characters')
    .refine((val) => val.trim().length > 0, 'Title cannot be only whitespace'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export type TaskFormData = z.infer<typeof taskFormSchema>

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(80, 'Project name cannot exceed 80 characters')
    .refine((val) => val.trim().length > 0, 'Name cannot be only whitespace'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
})

export type ProjectFormData = z.infer<typeof projectFormSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name cannot exceed 60 characters')
      .refine((val) => val.trim().length > 0, 'Name cannot be blank'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .refine((val) => val.trim().length > 0, 'Name cannot be blank'),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>
