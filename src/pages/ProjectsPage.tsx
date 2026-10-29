import React, { useEffect, useState } from 'react'
import { Plus, Search, FolderPlus, X } from 'lucide-react'
import { Project, Task } from '@/types'
import { projectService, taskService } from '@/services/api'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [allProjects, allTasks] = await Promise.all([
        projectService.getProjects(),
        taskService.getAllTasks(),
      ])
      setProjects(allProjects)
      setTasks(allTasks)
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('projectflow:data-updated', handleUpdate)
    return () => window.removeEventListener('projectflow:data-updated', handleUpdate)
  }, [])

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  })

  const handleEdit = (project: Project) => {
    setProjectToEdit(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setProjectToEdit(null)
  }

  const handleDeleted = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your workspaces, track tasks, and monitor delivery progress.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setProjectToEdit(null)
            setIsModalOpen(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total: <strong className="text-slate-800 dark:text-slate-200">{projects.length}</strong>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        searchQuery ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching projects
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No projects matched "{searchQuery}". Try a different keyword or clear your search.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={<FolderPlus className="w-6 h-6" />}
            title="Create your first project"
            description="Projects contain your tasks, deadlines, and Kanban boards. Start by creating a project workspace."
            actionLabel="Create Project"
            onAction={() => {
              setProjectToEdit(null)
              setIsModalOpen(true)
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Project Modal (Create/Edit) */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectToEdit={projectToEdit}
        onSuccess={() => loadData()}
      />
    </div>
  )
}
