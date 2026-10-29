import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { localStore } from '@/services/storage'

const ProtectedComponent = () => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Loading session...</div>
  if (!user) return <Navigate to="/login" replace />
  return <div>Protected Content for {user.fullName}</div>
}

const LoginComponent = () => {
  return <div>Login Screen</div>
}

describe('Protected Routes & Navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    localStore.resetAll()
  })

  it('renders protected content when user is logged in', async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<ProtectedComponent />} />
                <Route path="/login" element={<LoginComponent />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    )

    expect(await screen.findByText(/Protected Content for/)).toBeInTheDocument()
  })

  it('redirects to login when user is logged out', async () => {
    localStore.clearCurrentUser()

    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<ProtectedComponent />} />
                <Route path="/login" element={<LoginComponent />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    )

    expect(await screen.findByText('Login Screen')).toBeInTheDocument()
  })
})
