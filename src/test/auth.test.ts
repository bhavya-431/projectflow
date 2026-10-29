import { describe, it, expect, beforeEach } from 'vitest'
import { localStore } from '@/services/storage'
import { authService } from '@/services/api'

describe('Authentication & Session Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    localStore.resetAll()
  })

  it('restores default demo user when initial session is checked', async () => {
    const user = await authService.getCurrentUser()
    expect(user).not.toBeNull()
    expect(user?.email).toBe('alex@projectflow.dev')
  })

  it('clears session when signOut is called in demo mode', async () => {
    await authService.signOut()
    const userAfterSignOut = await authService.getCurrentUser()
    expect(userAfterSignOut).toBeNull()
  })

  it('signs in a demo user and restores that specific user after reload', async () => {
    await authService.signOut()
    expect(await authService.getCurrentUser()).toBeNull()

    const loggedIn = await authService.signIn('sarah@projectflow.dev')
    expect(loggedIn.email).toBe('sarah@projectflow.dev')

    // Simulate page reload
    const restoredUser = await authService.getCurrentUser()
    expect(restoredUser?.email).toBe('sarah@projectflow.dev')
  })

  it('registers a new demo user and persists them in the user store', async () => {
    const newUser = await authService.signUp('Jane Developer', 'jane@example.com')
    expect(newUser.fullName).toBe('Jane Developer')
    expect(newUser.email).toBe('jane@example.com')

    const users = await authService.getUsers()
    expect(users.some((u) => u.email === 'jane@example.com')).toBe(true)
  })
})
