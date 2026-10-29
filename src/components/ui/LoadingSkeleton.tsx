import React from 'react'

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
  </div>
)

export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>
      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60">
      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="flex -space-x-1.5">
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

export const TaskCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
    <div className="flex items-center justify-between pt-2">
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
)

export const KanbanBoardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map((col) => (
      <div key={col} className="bg-slate-100/60 dark:bg-slate-900/40 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-5 w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    ))}
  </div>
)
