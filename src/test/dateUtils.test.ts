import { describe, it, expect } from 'vitest'
import { isOverdue, formatDueDate, parseLocalDate } from '@/utils/dateUtils'

describe('dateUtils', () => {
  it('correctly parses local YYYY-MM-DD date', () => {
    const parsed = parseLocalDate('2026-10-29')
    expect(parsed).not.toBeNull()
    expect(parsed?.getFullYear()).toBe(2026)
    expect(parsed?.getMonth()).toBe(9) // 0-indexed (October = 9)
    expect(parsed?.getDate()).toBe(29)
  })

  it('identifies overdue dates in the past when status is not done', () => {
    const pastDate = '2020-01-01'
    expect(isOverdue(pastDate, 'todo')).toBe(true)
    expect(isOverdue(pastDate, 'in_progress')).toBe(true)
  })

  it('does not mark completed tasks as overdue even if due date is in the past', () => {
    const pastDate = '2020-01-01'
    expect(isOverdue(pastDate, 'done')).toBe(false)
  })

  it('does not mark future dates as overdue', () => {
    const futureDate = '2099-12-31'
    expect(isOverdue(futureDate, 'todo')).toBe(false)
  })

  it('formats missing due date safely', () => {
    const result = formatDueDate(null)
    expect(result.label).toBe('No due date')
    expect(result.isOverdue).toBe(false)
  })
})
