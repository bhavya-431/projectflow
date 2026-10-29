import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Profile } from '@/types'
import { authService } from '@/services/api'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { localStore } from '@/services/storage'

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  isDemoMode: boolean
  signIn: (email: string, password?: string) => Promise<void>
  signUp: (fullName: string, email: string, password?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: { fullName: string; avatarUrl?: string }) => Promise<void>
  switchDemoUser: (userId: string) => void
  resetDemoData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isDemo = !isSupabaseConfigured()

  // Initialize auth
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
        }
      } catch (err) {
        console.error('Failed to initialize user session:', err)
        if (mounted && isDemo) {
          setUser(localStore.getCurrentUser())
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen to Supabase auth events if connected
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          const profile = await authService.getCurrentUser()
          setUser(profile)
        } else {
          setUser(null)
        }
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    }

    return () => {
      mounted = false
    }
  }, [isDemo])

  const signIn = useCallback(async (email: string, password?: string) => {
    setIsLoading(true)
    try {
      const loggedIn = await authService.signIn(email, password)
      setUser(loggedIn)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (fullName: string, email: string, password?: string) => {
    setIsLoading(true)
    try {
      const registered = await authService.signUp(fullName, email, password)
      setUser(registered)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: { fullName: string; avatarUrl?: string }) => {
    if (!user) return
    const updated = await authService.updateProfile(user.id, data)
    setUser(updated)
  }, [user])

  const switchDemoUser = useCallback((userId: string) => {
    const users = localStore.getUsers()
    const target = users.find((u) => u.id === userId)
    if (target) {
      localStore.setCurrentUser(target)
      setUser(target)
    }
  }, [])

  const resetDemoData = useCallback(() => {
    localStore.resetAll()
    setUser(localStore.getCurrentUser())
    window.location.reload()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode: isDemo,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoUser,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
