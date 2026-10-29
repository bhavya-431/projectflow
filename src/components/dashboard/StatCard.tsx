import React from 'react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  trend?: string
  colorVariant?: 'indigo' | 'amber' | 'emerald' | 'rose'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  colorVariant = 'indigo',
}) => {
  const iconBgClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBgClasses[colorVariant])}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}
