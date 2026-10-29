import { describe, it, expect } from 'vitest'
import { taskService, projectService } from '@/services/api'
import { localStore } from '@/services/storage'

describe('Database and Mutation Error Handling', () => {
  it('throws a descriptive error when updating a non-existent task', async () => {
    await expect(
      taskService.updateTask('non-existent-task-id', { title: 'Updated' })
    ).rejects.toThrow('Task not found')
  })

  it('throws a descriptive error when updating a non-existent project', async () => {
    await expect(
      projectService.updateProject('non-existent-project-id', { name: 'Updated' })
    ).rejects.toThrow('Project not found')
  })

  it('handles corrupted localStorage data without crashing', () => {
    localStorage.setItem('projectflow_tasks_v1', 'invalid-corrupted-json{{{')

    const tasks = localStore.getTasks()
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0) // Falls back to default mock data safely
  })
})
