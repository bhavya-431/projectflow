import { describe, it, expect } from 'vitest'
import { taskFormSchema, projectFormSchema, registerSchema, loginSchema } from '@/types'

describe('Form Validation Schemas', () => {
  it('validates task form successfully with valid inputs', () => {
    const valid = {
      title: 'Valid task title',
      description: 'Some optional description',
      status: 'todo' as const,
      priority: 'high' as const,
      projectId: 'proj-123',
    }
    const result = taskFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects empty or whitespace-only task title', () => {
    const invalid = {
      title: '   ',
      status: 'todo' as const,
      priority: 'medium' as const,
      projectId: 'proj-123',
    }
    const result = taskFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates project form and rejects blank name', () => {
    expect(projectFormSchema.safeParse({ name: 'Valid Project' }).success).toBe(true)
    expect(projectFormSchema.safeParse({ name: '' }).success).toBe(false)
    expect(projectFormSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('validates registration passwords matching', () => {
    const mismatch = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password999',
    }
    const result = registerSchema.safeParse(mismatch)
    expect(result.success).toBe(false)
  })

  it('validates email format in login schema', () => {
    expect(loginSchema.safeParse({ email: 'invalid-email', password: '123' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'password' }).success).toBe(true)
  })
})
