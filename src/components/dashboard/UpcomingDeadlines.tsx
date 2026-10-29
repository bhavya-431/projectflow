import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Task, Project } from '@/types'
import { formatDueDate, isOverdue } from '@/utils/dateUtils'
import { PriorityBadge } from '@/components/ui/Badge'

interface UpcomingDeadlinesProps {
  tasks: Task[]
  projects: Project[]
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
  tasks,
  projects,
}) => {
  // Filter active tasks with a due date, sorted by date
  const pendingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => {
      const timeA = new Date(a.dueDate!).getTime()
      const timeB = new Date(b.dueDate!).getTime()
      return timeA - timeB
    })
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tasks requiring attention based on due dates.
            </p>
          </div>
          <Link
            to="/my-tasks"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No upcoming deadlines. Great job staying ahead!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId)
              const { label, isOverdue: overdue, isSoon } = formatDueDate(
                task.dueDate,
                task.status
              )

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                        {project?.name || 'Project'}
                      </span>
                    </div>
                    <Link
                      to={`/projects/${task.projectId}`}
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                    >
                      {task.title}
                    </Link>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        overdue
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : isSoon
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-slate-200/60 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300'
                      }`}
                    >
                      {overdue ? (
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                      ) : isSoon ? (
                        <Clock className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Calendar className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <span>Explore project Kanban boards</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
