import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Search,
  X,
  ExternalLink,
} from 'lucide-react'
import { Task, Project, TaskStatus, TaskPriority } from '@/types'
import { taskService, projectService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { formatDueDate, isOverdue } from '@/utils/dateUtils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TaskCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { TaskModal } from '@/components/tasks/TaskModal'

export const MyTasksPage: React.FC = () => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all')

  // Edit task modal
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [userTasks, allProjects] = await Promise.all([
        taskService.getMyTasks(user.id),
        projectService.getProjects(),
      ])
      setTasks(userTasks)
      setProjects(allProjects)
    } catch (err) {
      console.error('Failed to load my tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('projectflow:data-updated', handleUpdate)
    return () => window.removeEventListener('projectflow:data-updated', handleUpdate)
  }, [user?.id])

  // Quick toggle status directly from row
  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updated = await taskService.updateTask(task.id, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      success('Status updated', `Task status set to ${newStatus.replace('_', ' ')}.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status'
      toastError('Update Failed', msg)
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesTitle = t.title.toLowerCase().includes(q)
        const matchesDesc = t.description?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }

      // Project
      if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) {
        return false
      }

      // Status
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false
      }

      // Priority
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
        return false
      }

      return true
    })
  }, [tasks, searchQuery, selectedProjectId, selectedStatus, selectedPriority])

  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tasks assigned to you across all projects.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span>{overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />

          <Select
            options={[
              { value: 'all', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
          />

          <Select
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
          />
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title="No tasks found"
          description={
            tasks.length === 0
              ? 'You do not have any tasks assigned yet. Pick a project from the Projects tab to create or assign tasks.'
              : 'No tasks match your active filters. Try resetting the search or filter selections.'
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId)
            const { label: dueDateLabel, isOverdue: overdue } = formatDueDate(
              task.dueDate,
              task.status
            )

            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    {project && (
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{project.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <h3
                    onClick={() => {
                      setTaskToEdit(task)
                      setIsModalOpen(true)
                    }}
                    className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right Column: Due Date and Status Dropdown */}
                <div className="flex items-center gap-3 shrink-0">
                  {task.dueDate && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        overdue
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {dueDateLabel}
                    </span>
                  )}

                  {/* Quick Status Select */}
                  <div className="w-32">
                    <Select
                      options={[
                        { value: 'todo', label: 'To Do' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'done', label: 'Done' },
                      ]}
                      value={task.status}
                      onChange={(e) =>
                        handleQuickStatusChange(task, e.target.value as TaskStatus)
                      }
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTaskToEdit(task)
                      setIsModalOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTaskToEdit(null)
        }}
        taskToEdit={taskToEdit}
        onSuccess={() => loadData()}
      />
    </div>
  )
}
