/**
 * Utility functions for safe date handling, formatting, and overdue calculation.
 */

export function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  // dateStr is typically "YYYY-MM-DD"
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function isOverdue(dueDateStr: string | null | undefined, status?: string): boolean {
  if (!dueDateStr) return false
  if (status === 'done') return false

  const dueDate = parseLocalDate(dueDateStr)
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

export function isDueSoon(dueDateStr: string | null | undefined, withinDays = 3): boolean {
  if (!dueDateStr) return false

  const dueDate = parseLocalDate(dueDateStr)
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= withinDays
}

export function formatDueDate(
  dueDateStr: string | null | undefined,
  status?: string
): { label: string; isOverdue: boolean; isSoon: boolean } {
  if (!dueDateStr) {
    return { label: 'No due date', isOverdue: false, isSoon: false }
  }

  const dueDate = parseLocalDate(dueDateStr)
  if (!dueDate) {
    return { label: dueDateStr, isOverdue: false, isSoon: false }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dueDate)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  const overdue = diffDays < 0 && status !== 'done'
  const soon = diffDays >= 0 && diffDays <= 2 && status !== 'done'

  if (diffDays === 0) {
    return { label: 'Due today', isOverdue: false, isSoon: true }
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isSoon: true }
  }
  if (diffDays === -1) {
    return { label: overdue ? 'Overdue by 1d' : 'Yesterday', isOverdue: overdue, isSoon: false }
  }
  if (diffDays < -1) {
    return {
      label: overdue ? `Overdue by ${Math.abs(diffDays)}d` : `${Math.abs(diffDays)}d ago`,
      isOverdue: overdue,
      isSoon: false,
    }
  }

  // Format month and day
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  const formatted = `${monthNames[target.getMonth()]} ${target.getDate()}`
  return { label: formatted, isOverdue: false, isSoon: soon }
}

export function formatTimestamp(isoStr: string | null | undefined): string {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
