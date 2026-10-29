import {
  Task,
  Project,
  DashboardMetrics,
  TaskFilterOptions,
  TaskPriority,
} from '@/types'
import { isOverdue, parseLocalDate } from './dateUtils'

/**
 * Priority rank helper for sorting
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

/**
 * Calculates dashboard metrics from real persisted database/local records.
 * Protects against zero division errors.
 */
export function calculateDashboardMetrics(
  projects: Project[],
  tasks: Task[]
): DashboardMetrics {
  const totalProjects = projects.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const activeTasks = tasks.filter((t) => t.status !== 'done').length
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length

  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    totalProjects,
    activeTasks,
    completedTasks,
    overdueTasks,
    overallProgress,
  }
}

/**
 * Calculates progress percentage for a specific project.
 */
export function calculateProjectProgress(
  projectId: string,
  tasks: Task[]
): { total: number; completed: number; percentage: number } {
  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const total = projectTasks.length
  if (total === 0) return { total: 0, completed: 0, percentage: 0 }

  const completed = projectTasks.filter((t) => t.status === 'done').length
  const percentage = Math.round((completed / total) * 100)

  return { total, completed, percentage }
}

/**
 * Filters and sorts tasks based on user search query, status, priority, assignee, and sort option.
 */
export function filterAndSortTasks(
  tasks: Task[],
  options: Partial<TaskFilterOptions>
): Task[] {
  let result = [...tasks]

  // Search by title or description
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim()
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    )
  }

  // Filter by status
  if (options.status && options.status !== 'all') {
    result = result.filter((t) => t.status === options.status)
  }

  // Filter by priority
  if (options.priority && options.priority !== 'all') {
    result = result.filter((t) => t.priority === options.priority)
  }

  // Filter by assignee
  if (options.assigneeId && options.assigneeId !== 'all') {
    if (options.assigneeId === 'unassigned') {
      result = result.filter((t) => !t.assigneeId)
    } else {
      result = result.filter((t) => t.assigneeId === options.assigneeId)
    }
  }

  // Sorting
  if (options.sortBy) {
    result.sort((a, b) => {
      switch (options.sortBy) {
        case 'dueDateAsc': {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          const dateA = parseLocalDate(a.dueDate)?.getTime() || 0
          const dateB = parseLocalDate(b.dueDate)?.getTime() || 0
          return dateA - dateB
        }
        case 'dueDateDesc': {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          const dateA = parseLocalDate(a.dueDate)?.getTime() || 0
          const dateB = parseLocalDate(b.dueDate)?.getTime() || 0
          return dateB - dateA
        }
        case 'priorityDesc': {
          const diff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]
          return diff !== 0 ? diff : a.position - b.position
        }
        case 'priorityAsc': {
          const diff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]
          return diff !== 0 ? diff : a.position - b.position
        }
        case 'titleAsc':
          return a.title.localeCompare(b.title)
        case 'positionAsc':
        default:
          return a.position - b.position
      }
    })
  }

  return result
}
