import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Task, Profile } from '@/types'
import { ToastProvider } from '@/context/ToastContext'

const sampleTask: Task = {
  id: 't-101',
  projectId: 'proj-1',
  title: 'Implement drag and drop Kanban',
  description: 'Use dnd-kit for smooth sorting',
  status: 'in_progress',
  priority: 'high',
  assigneeId: 'usr-1',
  createdBy: 'usr-1',
  dueDate: '2026-12-31',
  position: 1000,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
}

const sampleAssignee: Profile = {
  id: 'usr-1',
  fullName: 'Alex Rivera',
  email: 'alex@projectflow.dev',
}

describe('TaskCard Component', () => {
  it('renders task title and description correctly', () => {
    render(
      <ToastProvider>
        <TaskCard
          task={sampleTask}
          assignee={sampleAssignee}
          onEdit={vi.fn()}
          onDeleted={vi.fn()}
        />
      </ToastProvider>
    )

    expect(screen.getByText('Implement drag and drop Kanban')).toBeInTheDocument()
    expect(screen.getByText('Use dnd-kit for smooth sorting')).toBeInTheDocument()
  })

  it('renders priority badge and assignee name', () => {
    render(
      <ToastProvider>
        <TaskCard
          task={sampleTask}
          assignee={sampleAssignee}
          onEdit={vi.fn()}
          onDeleted={vi.fn()}
        />
      </ToastProvider>
    )

    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
  })
})
