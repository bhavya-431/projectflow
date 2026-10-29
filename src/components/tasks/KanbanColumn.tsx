import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { Task, TaskStatus, Profile } from '@/types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  assignees: Profile[]
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeletedTask: (taskId: string) => void
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  assignees,
  onAddTask,
  onEditTask,
  onDeletedTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  })

  const getHeaderIcon = () => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-slate-400" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-indigo-500" />
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    }
  }

  const getBorderAccent = () => {
    switch (status) {
      case 'todo':
        return 'border-t-slate-400 dark:border-t-slate-500'
      case 'in_progress':
        return 'border-t-indigo-500 dark:border-t-indigo-400'
      case 'done':
        return 'border-t-emerald-500 dark:border-t-emerald-400'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 border-t-4 ${getBorderAccent()} p-3.5 transition-colors min-h-[500px] ${
        isOver ? 'bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-400/40' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          {getHeaderIcon()}
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title={`Add task to ${title}`}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List (Sortable Area) */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => {
            const assignee = assignees.find((a) => a.id === task.assigneeId)
            return (
              <TaskCard
                key={task.id}
                task={task}
                assignee={assignee}
                onEdit={onEditTask}
                onDeleted={onDeletedTask}
              />
            )
          })}
        </SortableContext>

        {/* Empty column placeholder */}
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl my-auto">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
              No tasks in {title}
            </p>
            <button
              type="button"
              onClick={() => onAddTask(status)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
