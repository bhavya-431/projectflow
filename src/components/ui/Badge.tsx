import React from 'react'
import {
  Circle,
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import { TaskPriority, TaskStatus } from '@/types'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
  showIcon?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  switch (status) {
    case 'done':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
          <span>Done</span>
        </span>
      )
    case 'in_progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50',
            className
          )}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
          <span>In Progress</span>
        </span>
      )
    case 'todo':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
            className
          )}
        >
          {showIcon && <Circle className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />}
          <span>To Do</span>
        </span>
      )
  }
}

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
  showIcon?: boolean
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
  showIcon = true,
}) => {
  switch (priority) {
    case 'high':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
            className
          )}
        >
          {showIcon && <ArrowUp className="w-3 h-3 shrink-0 text-rose-600 dark:text-rose-400" />}
          <span>High</span>
        </span>
      )
    case 'medium':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
            className
          )}
        >
          {showIcon && <Minus className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />}
          <span>Medium</span>
        </span>
      )
    case 'low':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/60',
            className
          )}
        >
          {showIcon && <ArrowDown className="w-3 h-3 shrink-0 text-slate-500 dark:text-slate-400" />}
          <span>Low</span>
        </span>
      )
  }
}

interface RoleBadgeProps {
  role: 'owner' | 'admin' | 'member'
  className?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const styles = {
    owner: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    member: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border',
        styles[role],
        className
      )}
    >
      {role}
    </span>
  )
}
