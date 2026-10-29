import React from 'react'
import { Menu, Plus, FolderPlus, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  onOpenMobileMenu: () => void
  onOpenNewTaskModal?: () => void
  onOpenNewProjectModal?: () => void
  title?: string
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  title,
}) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1222]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenNewProjectModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewProjectModal}
            leftIcon={<FolderPlus className="w-4 h-4" />}
            className="hidden sm:inline-flex"
          >
            New Project
          </Button>
        )}

        {onOpenNewTaskModal && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewTaskModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span>Add Task</span>
          </Button>
        )}

        {/* Theme toggle icon for small screens */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* User initials / avatar avatar for mobile */}
        {user && (
          <div className="lg:hidden flex items-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
