import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  Clock,
} from 'lucide-react'
import { Task, Profile } from '@/types'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { formatDueDate } from '@/utils/dateUtils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { taskService } from '@/services/api'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'

interface TaskCardProps {
  task: Task
  assignee?: Profile | null
  onEdit: (task: Task) => void
  onDeleted: (taskId: string) => void
  isDragOverlay?: boolean
  showStatusBadge?: boolean
  showProjectName?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  onEdit,
  onDeleted,
  isDragOverlay = false,
  showStatusBadge = false,
  showProjectName,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { success, error: toastError } = useToast()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { label: dueDateLabel, isOverdue: overdue, isSoon: dueSoon } = formatDueDate(
    task.dueDate,
    task.status
  )

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await taskService.deleteTask(task.id)
      success('Task deleted', `"${task.title}" was removed.`)
      setShowConfirmDelete(false)
      onDeleted(task.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task'
      toastError('Delete Failed', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/90 p-3.5 shadow-subtle hover:shadow-card transition-all text-left select-none',
          isDragging && 'opacity-40 border-dashed border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20',
          isDragOverlay && 'shadow-elevated border-indigo-500 ring-2 ring-indigo-500/20 rotate-1 cursor-grabbing',
          overdue && 'border-l-4 border-l-rose-500 dark:border-l-rose-500'
        )}
      >
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {showStatusBadge && <StatusBadge status={task.status} />}
            {showProjectName && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {showProjectName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Drag Handle button */}
            {!isDragOverlay && (
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-grab active:cursor-grabbing transition-opacity"
                aria-label="Drag task to reorder or move column"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu((prev) => !prev)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity"
                aria-label="Task actions"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                    }}
                  />
                  <div className="absolute right-0 top-6 z-30 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-elevated border border-slate-200 dark:border-slate-800 py-1 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onEdit(task)
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
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
        </div>

        {/* Title */}
        <h4
          onClick={() => onEdit(task)}
          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug line-clamp-2 mb-1.5"
        >
          {task.title}
        </h4>

        {/* Description snippet */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Card Footer: Due Date & Assignee Avatar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70 text-xs">
          {/* Due date badge */}
          {task.dueDate ? (
            <div
              className={cn(
                'flex items-center gap-1 font-medium',
                overdue
                  ? 'text-rose-600 dark:text-rose-400'
                  : dueSoon
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {overdue ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : dueSoon ? (
                <Clock className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Calendar className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{dueDateLabel}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">No due date</span>
          )}

          {/* Assignee Avatar / Indicator */}
          {assignee ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${assignee.fullName}`}>
              {assignee.avatarUrl ? (
                <img
                  src={assignee.avatarUrl}
                  alt={assignee.fullName}
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white dark:ring-slate-900"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {assignee.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium max-w-[80px] truncate hidden sm:inline">
                {assignee.fullName.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
      />
    </>
  )
}
