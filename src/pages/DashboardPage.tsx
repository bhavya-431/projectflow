import React, { useEffect, useState } from 'react'
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  FolderPlus,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Project, Task } from '@/types'
import { projectService, taskService } from '@/services/api'
import { calculateDashboardMetrics } from '@/utils/taskUtils'
import { StatCard } from '@/components/dashboard/StatCard'
import { TaskCompletionChart } from '@/components/dashboard/TaskCompletionChart'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { ProjectProgressList } from '@/components/dashboard/ProjectProgressList'
import { StatCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { useAuth } from '@/context/AuthContext'

export const DashboardPage: React.FC = () => {
  const { user, isDemoMode, resetDemoData } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [allProjects, allTasks] = await Promise.all([
        projectService.getProjects(),
        taskService.getAllTasks(),
      ])
      setProjects(allProjects)
      setTasks(allTasks)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    const handleUpdate = () => loadDashboardData()
    window.addEventListener('projectflow:data-updated', handleUpdate)
    return () => window.removeEventListener('projectflow:data-updated', handleUpdate)
  }, [])

  const metrics = calculateDashboardMetrics(projects, tasks)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.fullName.split(' ')[0] || 'there'}!
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is what is happening across your projects and tasks today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProjectModalOpen(true)}
            leftIcon={<FolderPlus className="w-4 h-4" />}
          >
            New Project
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTaskModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="space-y-0.5">
            <span className="font-semibold block text-indigo-950 dark:text-indigo-100">
              Interactive Demo & Local Mode Active
            </span>
            <span>
              All modifications, drag-and-drop updates, and new tasks persist in local storage. Connect Supabase via <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code> for cloud multi-user PostgreSQL.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemoData}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="shrink-0 bg-white dark:bg-slate-900 text-xs self-start sm:self-center"
          >
            Reset Seed Data
          </Button>
        </div>
      )}

      {/* Metrics Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={metrics.totalProjects}
            icon={<FolderKanban className="w-5 h-5" />}
            description="Active workspaces"
            colorVariant="indigo"
          />
          <StatCard
            title="Active Tasks"
            value={metrics.activeTasks}
            icon={<Clock className="w-5 h-5" />}
            description="In To Do or In Progress"
            colorVariant="amber"
          />
          <StatCard
            title="Completed Tasks"
            value={metrics.completedTasks}
            icon={<CheckCircle2 className="w-5 h-5" />}
            description={`${metrics.overallProgress}% overall completion`}
            colorVariant="emerald"
            trend={metrics.overallProgress > 0 ? `${metrics.overallProgress}%` : undefined}
          />
          <StatCard
            title="Overdue Tasks"
            value={metrics.overdueTasks}
            icon={<AlertCircle className="w-5 h-5" />}
            description={metrics.overdueTasks > 0 ? 'Requires attention' : 'All up to date'}
            colorVariant="rose"
          />
        </div>
      )}

      {/* Main Content Layout */}
      {!isLoading && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Get started by creating your first project workspace to organize tasks and visualize progress on a Kanban board."
          actionLabel="Create Project"
          onAction={() => setIsProjectModalOpen(true)}
          className="mt-6"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual: Chart */}
          <div className="lg:col-span-2 space-y-6">
            <TaskCompletionChart projects={projects} tasks={tasks} />
            <ProjectProgressList projects={projects} tasks={tasks} />
          </div>

          {/* Right Sidebar: Upcoming Deadlines */}
          <div className="space-y-6">
            <UpcomingDeadlines tasks={tasks} projects={projects} />
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  )
}
