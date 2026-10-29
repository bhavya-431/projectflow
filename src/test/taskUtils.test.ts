import { describe, it, expect } from 'vitest'
import {
  calculateDashboardMetrics,
  calculateProjectProgress,
  filterAndSortTasks,
} from '@/utils/taskUtils'
import { Project, Task } from '@/types'

const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Project Alpha',
    ownerId: 'usr-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Project Beta',
    ownerId: 'usr-1',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

const sampleTasks: Task[] = [
  {
    id: 't-1',
    projectId: 'proj-1',
    title: 'Fix authentication bug',
    status: 'done',
    priority: 'high',
    createdBy: 'usr-1',
    position: 1000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 't-2',
    projectId: 'proj-1',
    title: 'Add dark mode support',
    status: 'in_progress',
    priority: 'medium',
    createdBy: 'usr-1',
    dueDate: '2020-01-01', // overdue
    position: 2000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 't-3',
    projectId: 'proj-2',
    title: 'Setup PostgreSQL schema',
    status: 'todo',
    priority: 'low',
    createdBy: 'usr-1',
    dueDate: '2099-01-01',
    position: 1000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

describe('taskUtils', () => {
  it('calculates dashboard metrics accurately without zero-division error', () => {
    // Empty state test
    const emptyMetrics = calculateDashboardMetrics([], [])
    expect(emptyMetrics.totalProjects).toBe(0)
    expect(emptyMetrics.overallProgress).toBe(0)

    // Populated state test
    const metrics = calculateDashboardMetrics(sampleProjects, sampleTasks)
    expect(metrics.totalProjects).toBe(2)
    expect(metrics.activeTasks).toBe(2)
    expect(metrics.completedTasks).toBe(1)
    expect(metrics.overdueTasks).toBe(1)
    expect(metrics.overallProgress).toBe(33) // 1 out of 3 = 33%
  })

  it('calculates project progress percentage', () => {
    const progress = calculateProjectProgress('proj-1', sampleTasks)
    expect(progress.total).toBe(2)
    expect(progress.completed).toBe(1)
    expect(progress.percentage).toBe(50)

    const emptyProject = calculateProjectProgress('proj-unknown', sampleTasks)
    expect(emptyProject.total).toBe(0)
    expect(emptyProject.percentage).toBe(0)
  })

  it('filters tasks by search query', () => {
    const filtered = filterAndSortTasks(sampleTasks, { searchQuery: 'dark mode' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('t-2')
  })

  it('filters tasks by status', () => {
    const doneTasks = filterAndSortTasks(sampleTasks, { status: 'done' })
    expect(doneTasks).toHaveLength(1)
    expect(doneTasks[0].id).toBe('t-1')
  })

  it('filters tasks by priority', () => {
    const highTasks = filterAndSortTasks(sampleTasks, { priority: 'high' })
    expect(highTasks).toHaveLength(1)
    expect(highTasks[0].id).toBe('t-1')
  })

  it('sorts tasks by priority descending (high -> medium -> low)', () => {
    const sorted = filterAndSortTasks(sampleTasks, { sortBy: 'priorityDesc' })
    expect(sorted[0].priority).toBe('high')
    expect(sorted[1].priority).toBe('medium')
    expect(sorted[2].priority).toBe('low')
  })
})
