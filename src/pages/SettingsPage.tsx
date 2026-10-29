import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sun,
  Moon,
  Database,
  CloudCheck,
  RotateCcw,
  Users,
} from 'lucide-react'
import { ProfileFormData, profileSchema } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'
import { getSupabaseConfig } from '@/lib/supabase'
import { localStore } from '@/services/storage'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut, isDemoMode, switchDemoUser, resetDemoData } = useAuth()
  const { theme, setTheme } = useTheme()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)

  const config = getSupabaseConfig()
  const demoUsers = localStore.getUsers()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true)
    try {
      await updateProfile(data)
      success('Profile updated', 'Your profile information has been saved.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toastError('Update Failed', msg)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, theme preferences, and environment configuration.
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-card space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Profile Details
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Update your public display name and avatar URL.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <Input
            label="Full Name"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Avatar URL (Optional)"
            placeholder="https://example.com/avatar.jpg"
            error={errors.avatarUrl?.message}
            {...register('avatarUrl')}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Theme Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Theme Preference
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Choose your preferred interface theme. Preference is saved automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-900'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Light Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clean, crisp neutral backgrounds</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 text-white'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Dark Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep slate SaaS dark mode</p>
            </div>
          </button>
        </div>
      </div>

      {/* Demo Account Switcher (Only visible in Demo Mode for easy evaluation) */}
      {isDemoMode && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Switch Demo User Account
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Switch between accounts to evaluate project membership and task assignments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demoUsers.map((u) => {
              const isActive = user?.id === u.id
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => switchDemoUser(u.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isActive
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {u.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {isActive ? 'Active Account' : 'Switch'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemoData}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset All Seed Data to Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Supabase Connection Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Database & Backend Configuration
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Cloud PostgreSQL persistence and Supabase Auth status.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Connection Status
            </span>
            {config.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                <Database className="w-3.5 h-3.5" />
                <span>Local Storage Mode</span>
              </span>
            )}
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Endpoint:</span>
              <span className="font-mono text-[11px]">{config.url}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Security (RLS):</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Enabled in Migrations
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Sign Out
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            End your current session on this device.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}
