import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Project, Task } from '@/types'
import { calculateProjectProgress } from '@/utils/taskUtils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { projectService } from '@/services/api'
import { useToast } from '@/context/ToastContext'

interface ProjectCardProps {
  project: Project
  tasks: Task[]
  onEdit: (project: Project) => void
  onDeleted: (projectId: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  tasks,
  onEdit,
  onDeleted,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { success, error: toastError } = useToast()

  const { total, completed, percentage } = calculateProjectProgress(project.id, tasks)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await projectService.deleteProject(project.id)
      success('Project deleted', `"${project.name}" and its tasks have been removed.`)
      setShowConfirmDelete(false)
      onDeleted(project.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project'
      toastError('Delete Failed', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card hover:shadow-elevated hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base line-clamp-1 block"
                >
                  {project.name}
                </Link>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {total} {total === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Project actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-elevated border border-slate-200 dark:border-slate-800 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        onEdit(project)
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        setShowConfirmDelete(true)
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
            {project.description || 'No description provided.'}
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{completed} of {total} completed</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Open Kanban workspace link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove all associated tasks.`}
        confirmText="Delete Project"
      />
    </>
  )
}
