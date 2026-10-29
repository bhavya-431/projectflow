import React from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import {
  Profile,
  TaskFilterOptions,
  TaskPriority,
  TaskSortOption,
  TaskStatus,
} from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface TaskFiltersProps {
  filters: TaskFilterOptions
  onChange: (updated: TaskFilterOptions) => void
  onClear: () => void
  assignees?: Profile[]
  totalCount: number
  filteredCount: number
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  onClear,
  assignees = [],
  totalCount,
  filteredCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim().length > 0 ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assigneeId !== 'all' ||
    filters.sortBy !== 'positionAsc'

  const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ]

  const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ]

  const sortOptions: { value: TaskSortOption; label: string }[] = [
    { value: 'positionAsc', label: 'Default Order' },
    { value: 'dueDateAsc', label: 'Due Date: Earliest First' },
    { value: 'dueDateDesc', label: 'Due Date: Latest First' },
    { value: 'priorityDesc', label: 'Priority: High to Low' },
    { value: 'priorityAsc', label: 'Priority: Low to High' },
    { value: 'titleAsc', label: 'Title: A to Z' },
  ]

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...assignees.map((a) => ({
      value: a.id,
      label: a.fullName,
    })),
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 shadow-subtle mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tasks by title or details..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              filters.searchQuery ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, searchQuery: '' })}
                  className="p-1 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Select */}
          <div className="w-36">
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) =>
                onChange({ ...filters, status: e.target.value as TaskStatus | 'all' })
              }
            />
          </div>

          {/* Priority Select */}
          <div className="w-36">
            <Select
              options={priorityOptions}
              value={filters.priority}
              onChange={(e) =>
                onChange({ ...filters, priority: e.target.value as TaskPriority | 'all' })
              }
            />
          </div>

          {/* Assignee Select */}
          {assignees.length > 0 && (
            <div className="w-36">
              <Select
                options={assigneeOptions}
                value={filters.assigneeId}
                onChange={(e) =>
                  onChange({ ...filters, assigneeId: e.target.value })
                }
              />
            </div>
          )}

          {/* Sort Select */}
          <div className="w-44">
            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as TaskSortOption })
              }
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              leftIcon={<X className="w-3.5 h-3.5" />}
              className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Matching summary line */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> tasks
          </span>
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Filters active</span>
        )}
      </div>
    </div>
  )
}
