import React from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, ArrowRight } from 'lucide-react'
import { Project, Task } from '@/types'
import { calculateProjectProgress } from '@/utils/taskUtils'

interface ProjectProgressListProps {
  projects: Project[]
  tasks: Task[]
}

export const ProjectProgressList: React.FC<ProjectProgressListProps> = ({
  projects,
  tasks,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Project Progress
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Task completion rates across active workspaces.
          </p>
        </div>
        <Link
          to="/projects"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
          No projects found. Create your first project to track progress!
        </div>
      ) : (
        <div className="space-y-4">
          {projects.slice(0, 4).map((project) => {
            const { total, completed, percentage } = calculateProjectProgress(
              project.id,
              tasks
            )

            return (
              <div key={project.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate max-w-[200px]">{project.name}</span>
                  </Link>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {percentage}% ({completed}/{total})
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <span>Manage all projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
