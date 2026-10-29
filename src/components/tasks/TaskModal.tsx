import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Project,
  Profile,
  Task,
  TaskFormData,
  taskFormSchema,
  TaskPriority,
  TaskStatus,
} from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { taskService, projectService, authService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: Task | null
  defaultProjectId?: string
  defaultStatus?: TaskStatus
  onSuccess?: (task: Task) => void
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultProjectId,
  defaultStatus = 'todo',
  onSuccess,
}) => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [assignees, setAssignees] = useState<Profile[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'medium',
      projectId: defaultProjectId || '',
      assigneeId: '',
      dueDate: '',
    },
  })

  // Load project options and user profiles when modal opens
  useEffect(() => {
    if (!isOpen) return

    async function loadData() {
      setIsLoadingMetadata(true)
      try {
        const [loadedProjects, loadedUsers] = await Promise.all([
          projectService.getProjects(),
          authService.getUsers(),
        ])
        setProjects(loadedProjects)
        setAssignees(loadedUsers)

        // Reset form values with edit data or defaults
        if (taskToEdit) {
          reset({
            title: taskToEdit.title,
            description: taskToEdit.description || '',
            status: taskToEdit.status,
            priority: taskToEdit.priority,
            projectId: taskToEdit.projectId,
            assigneeId: taskToEdit.assigneeId || '',
            dueDate: taskToEdit.dueDate || '',
          })
        } else {
          reset({
            title: '',
            description: '',
            status: defaultStatus,
            priority: 'medium',
            projectId: defaultProjectId || (loadedProjects[0]?.id ?? ''),
            assigneeId: user?.id || '',
            dueDate: '',
          })
        }
      } catch (err) {
        console.error('Failed to load projects/users for TaskModal:', err)
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    loadData()
  }, [isOpen, taskToEdit, defaultProjectId, defaultStatus, reset, user?.id])

  const onSubmit = async (data: TaskFormData) => {
    if (!user) {
      toastError('Unauthorized', 'You must be signed in to manage tasks')
      return
    }

    try {
      let result: Task
      if (taskToEdit) {
        result = await taskService.updateTask(taskToEdit.id, data)
        success('Task updated', `"${result.title}" was saved.`)
      } else {
        result = await taskService.createTask(data, user.id)
        success('Task created', `"${result.title}" added to board.`)
      }

      onSuccess?.(result)
      window.dispatchEvent(new CustomEvent('projectflow:data-updated'))
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task'
      toastError('Save Failed', msg)
    }
  }

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ]

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }))

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...assignees.map((a) => ({
      value: a.id,
      label: a.fullName,
    })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      description="Fill in the task details to organize and prioritize work."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {projects.length === 0 && !isLoadingMetadata && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            No projects available. Please create a project workspace first before creating tasks.
          </div>
        )}

        {/* Title */}
        <Input
          label="Title"
          required
          placeholder="e.g. Audit accessibility & contrast"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Project Selector */}
        <Select
          label="Project"
          required
          options={projectOptions}
          error={errors.projectId?.message}
          disabled={isLoadingMetadata || (projects.length === 0)}
          {...register('projectId')}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Add details, acceptance criteria, links, or notes..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Status and Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>

        {/* Assignee and Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assignee"
            options={assigneeOptions}
            error={errors.assigneeId?.message}
            {...register('assigneeId')}
          />

          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
