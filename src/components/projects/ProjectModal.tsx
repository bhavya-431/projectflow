import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Project, ProjectFormData, projectFormSchema } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { projectService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectToEdit?: Project | null
  onSuccess?: (project: Project) => void
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  onSuccess,
}) => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (projectToEdit) {
      reset({
        name: projectToEdit.name,
        description: projectToEdit.description || '',
      })
    } else {
      reset({
        name: '',
        description: '',
      })
    }
  }, [projectToEdit, reset, isOpen])

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toastError('Unauthorized', 'You must be signed in to manage projects')
      return
    }

    try {
      let result: Project
      if (projectToEdit) {
        result = await projectService.updateProject(projectToEdit.id, data)
        success('Project updated', `"${result.name}" has been updated successfully.`)
      } else {
        result = await projectService.createProject(data, user.id)
        success('Project created', `"${result.name}" was created successfully.`)
      }

      onSuccess?.(result)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project'
      toastError('Action Failed', msg)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
      description="Organize tasks, track deadlines, and collaborate with your team."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Name"
          required
          placeholder="e.g. Website Redesign"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description"
          placeholder="Brief summary of project scope, goals, or milestones..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
