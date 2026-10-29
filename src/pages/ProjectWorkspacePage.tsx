import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  FolderKanban,
  Edit2,
  CheckCircle2,
} from 'lucide-react'
import {
  Project,
  Task,
  Profile,
  TaskFilterOptions,
  TaskStatus,
} from '@/types'
import { projectService, taskService, memberService, authService } from '@/services/api'
import { filterAndSortTasks, calculateProjectProgress } from '@/utils/taskUtils'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { KanbanBoardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignees, setAssignees] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  // Filters state
  const [filters, setFilters] = useState<TaskFilterOptions>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    sortBy: 'positionAsc',
  })

  const loadWorkspace = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const [proj, projectTasks, members, allUsers] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getTasksByProject(projectId),
        memberService.getProjectMembers(projectId),
        authService.getUsers(),
      ])

      if (!proj) {
        navigate('/projects', { replace: true })
        return
      }

      setProject(proj)
      setTasks(projectTasks)

      // Available assignees: project members with fallback to all users
      const memberProfiles = members
        .map((m) => m.profile || allUsers.find((u) => u.id === m.userId))
        .filter((p): p is Profile => Boolean(p))

      setAssignees(memberProfiles.length > 0 ? memberProfiles : allUsers)
    } catch (err) {
      console.error('Failed to load project workspace:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, navigate])

  useEffect(() => {
    loadWorkspace()
    const handleUpdate = () => loadWorkspace()
    window.addEventListener('projectflow:data-updated', handleUpdate)
    return () => window.removeEventListener('projectflow:data-updated', handleUpdate)
  }, [loadWorkspace])

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(tasks, filters)
  }, [tasks, filters])

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      priority: 'all',
      assigneeId: 'all',
      sortBy: 'positionAsc',
    })
  }

  const handleOpenAddTask = (status: TaskStatus = 'todo') => {
    setDefaultTaskStatus(status)
    setTaskToEdit(null)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskDeleted = (deletedId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId))
  }

  const { total, completed, percentage } = useMemo(() => {
    if (!projectId) return { total: 0, completed: 0, percentage: 0 }
    return calculateProjectProgress(projectId, tasks)
  }, [projectId, tasks])

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <KanbanBoardSkeleton />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Project Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The requested project does not exist or you do not have permission to view it.
        </p>
        <Link to="/projects">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workspace Header & Metadata */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Link
              to="/projects"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-0.5"
              title="Back to Projects"
              aria-label="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {project.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                  title="Edit project details"
                  aria-label="Edit project details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {project.description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Add Task Primary Action */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAddTask('todo')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>{completed}</strong> of <strong>{total}</strong> tasks completed ({percentage}%)
            </span>
          </div>

          <div className="w-full sm:w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Filter & Search Toolbar */}
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        assignees={assignees}
        totalCount={tasks.length}
        filteredCount={filteredTasks.length}
      />

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title="Board is empty"
          description="There are no tasks in this project yet. Add your first task to start organizing work across To Do, In Progress, and Done."
          actionLabel="Add Task"
          onAction={() => handleOpenAddTask('todo')}
        />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          assignees={assignees}
          onTasksChange={(updated) => {
            // Reconcile updated tasks with full task list
            setTasks((prev) => {
              const updatedMap = new Map(updated.map((t) => [t.id, t]))
              return prev.map((t) => updatedMap.get(t.id) || t)
            })
          }}
          onAddTask={handleOpenAddTask}
          onEditTask={handleEditTask}
          onDeletedTask={handleTaskDeleted}
        />
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setTaskToEdit(null)
        }}
        taskToEdit={taskToEdit}
        defaultProjectId={project.id}
        defaultStatus={defaultTaskStatus}
        onSuccess={() => loadWorkspace()}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={project}
        onSuccess={(updated) => setProject(updated)}
      />
    </div>
  )
}
