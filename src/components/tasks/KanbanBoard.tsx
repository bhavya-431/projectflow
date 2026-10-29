import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Task, TaskStatus, Profile } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { taskService } from '@/services/api'
import { useToast } from '@/context/ToastContext'

interface KanbanBoardProps {
  tasks: Task[]
  assignees: Profile[]
  onTasksChange: (tasks: Task[]) => void
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeletedTask: (taskId: string) => void
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  assignees,
  onTasksChange,
  onAddTask,
  onEditTask,
  onDeletedTask,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const { error: toastError } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag begins
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const found = tasks.find((t) => t.id === active.id)
    if (found) {
      setActiveTask(found)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    // Dropping a Task over another Task in a different column
    if (isActiveTask && isOverTask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const overIndex = tasks.findIndex((t) => t.id === overId)

      if (tasks[activeIndex].status !== tasks[overIndex].status) {
        const updated = [...tasks]
        updated[activeIndex] = {
          ...updated[activeIndex],
          status: tasks[overIndex].status,
        }
        onTasksChange(arrayMove(updated, activeIndex, overIndex))
      }
    }

    // Dropping a Task over an empty Column container
    if (isActiveTask && isOverColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const newStatus = over.data.current?.status as TaskStatus

      if (tasks[activeIndex].status !== newStatus) {
        const updated = [...tasks]
        updated[activeIndex] = {
          ...updated[activeIndex],
          status: newStatus,
        }
        onTasksChange(arrayMove(updated, activeIndex, activeIndex))
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeIndex = tasks.findIndex((t) => t.id === activeId)
    if (activeIndex === -1) return

    const originalTask = tasks[activeIndex]
    const isOverColumn = over.data.current?.type === 'Column'
    const isOverTask = over.data.current?.type === 'Task'

    let targetStatus = originalTask.status
    let newTasks = [...tasks]

    if (isOverColumn) {
      targetStatus = over.data.current?.status as TaskStatus
    } else if (isOverTask) {
      const overIndex = tasks.findIndex((t) => t.id === overId)
      if (overIndex !== -1) {
        targetStatus = tasks[overIndex].status
        if (activeIndex !== overIndex) {
          newTasks = arrayMove(tasks, activeIndex, overIndex)
        }
      }
    }

    // Determine target column tasks to calculate numeric position
    const columnTasks = newTasks.filter((t) => t.status === targetStatus)
    const taskIndexInColumn = columnTasks.findIndex((t) => t.id === activeId)

    let computedPosition = 1000
    if (columnTasks.length <= 1) {
      computedPosition = 1000
    } else if (taskIndexInColumn === 0) {
      computedPosition = Math.max(1, (columnTasks[1]?.position ?? 2000) / 2)
    } else if (taskIndexInColumn === columnTasks.length - 1) {
      computedPosition = (columnTasks[columnTasks.length - 2]?.position ?? 1000) + 1000
    } else {
      const prevPos = columnTasks[taskIndexInColumn - 1]?.position ?? 0
      const nextPos = columnTasks[taskIndexInColumn + 1]?.position ?? (prevPos + 2000)
      computedPosition = (prevPos + nextPos) / 2
    }

    // Apply change locally
    const finalTasks = newTasks.map((t) =>
      t.id === activeId
        ? { ...t, status: targetStatus, position: computedPosition }
        : t
    )
    onTasksChange(finalTasks)

    // Persist to backend/store with rollback on failure
    try {
      await taskService.updateTaskStatusAndPosition(activeId, targetStatus, computedPosition)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task move'
      toastError('Sync Failed', `${msg}. Restoring previous position.`)
      // Rollback to previous state
      onTasksChange(tasks)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile Column Quick Navigation Tabs */}
      <div className="flex md:hidden items-center gap-2 mb-3 overflow-x-auto pb-1">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.status).length
          return (
            <button
              key={col.status}
              type="button"
              onClick={() => {
                const el = document.getElementById(`column-${col.status}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 whitespace-nowrap shadow-xs"
            >
              {col.title} ({count})
            </button>
          )
        })}
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 items-start overflow-x-auto pb-4 snap-x snap-mandatory">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.status)
            .sort((a, b) => a.position - b.position)

          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={colTasks}
              assignees={assignees}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeletedTask={onDeletedTask}
            />
          )
        })}
      </div>

      {/* Drag Overlay Ghost */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            assignee={assignees.find((a) => a.id === activeTask.assigneeId)}
            onEdit={() => {}}
            onDeleted={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
