import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Project, Task } from '@/types'
import { useTheme } from '@/context/ThemeContext'

interface TaskCompletionChartProps {
  projects: Project[]
  tasks: Task[]
}

export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({
  projects,
  tasks,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Build chart dataset per project
  const data = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id)
    const todo = projectTasks.filter((t) => t.status === 'todo').length
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length
    const done = projectTasks.filter((t) => t.status === 'done').length

    return {
      name: project.name.length > 16 ? `${project.name.substring(0, 16)}…` : project.name,
      'To Do': todo,
      'In Progress': inProgress,
      Done: done,
    }
  })

  if (projects.length === 0 || tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          No task activity yet
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Create projects and tasks to see completion charts and analytics.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card">
      <div className="mb-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Task Distribution by Project
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Breakdown of tasks across To Do, In Progress, and Completed states.
        </p>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e293b' : '#f1f5f9'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#1e293b' : '#e2e8f0' }}
            />
            <YAxis
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Bar dataKey="To Do" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
