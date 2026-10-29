import { Profile, Project, ProjectMember, Task } from '@/types'
import {
  MOCK_CURRENT_USER,
  MOCK_PROJECTS,
  MOCK_PROJECT_MEMBERS,
  MOCK_TASKS,
  MOCK_USERS,
} from './mockData'

const STORAGE_KEYS = {
  CURRENT_USER: 'projectflow_current_user_v1',
  IS_LOGGED_OUT: 'projectflow_is_logged_out_v1',
  USERS: 'projectflow_users_v1',
  PROJECTS: 'projectflow_projects_v1',
  PROJECT_MEMBERS: 'projectflow_members_v1',
  TASKS: 'projectflow_tasks_v1',
  THEME: 'projectflow_theme_preference',
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e)
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error writing localStorage key "${key}":`, e)
  }
}

export const localStore = {
  // Current user
  getCurrentUser(): Profile | null {
    try {
      if (localStorage.getItem(STORAGE_KEYS.IS_LOGGED_OUT) === 'true') {
        return null
      }
    } catch {
      // Fallback
    }
    return getItem<Profile>(STORAGE_KEYS.CURRENT_USER, MOCK_CURRENT_USER)
  },

  setCurrentUser(user: Profile): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_OUT)
    } catch {
      // Ignore
    }
    setItem(STORAGE_KEYS.CURRENT_USER, user)
  },

  clearCurrentUser(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_OUT, 'true')
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    } catch (e) {
      console.error('Error clearing user session:', e)
    }
  },

  // All Users
  getUsers(): Profile[] {
    return getItem<Profile[]>(STORAGE_KEYS.USERS, MOCK_USERS)
  },
  setUsers(users: Profile[]): void {
    setItem(STORAGE_KEYS.USERS, users)
  },

  // Projects
  getProjects(): Project[] {
    return getItem<Project[]>(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS)
  },
  setProjects(projects: Project[]): void {
    setItem(STORAGE_KEYS.PROJECTS, projects)
  },

  // Project Members
  getProjectMembers(): ProjectMember[] {
    return getItem<ProjectMember[]>(STORAGE_KEYS.PROJECT_MEMBERS, MOCK_PROJECT_MEMBERS)
  },
  setProjectMembers(members: ProjectMember[]): void {
    setItem(STORAGE_KEYS.PROJECT_MEMBERS, members)
  },

  // Tasks
  getTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.TASKS, MOCK_TASKS)
  },
  setTasks(tasks: Task[]): void {
    setItem(STORAGE_KEYS.TASKS, tasks)
  },

  // Reset to default seed data
  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_OUT)
    } catch {
      // Ignore
    }
    setItem(STORAGE_KEYS.CURRENT_USER, MOCK_CURRENT_USER)
    setItem(STORAGE_KEYS.USERS, MOCK_USERS)
    setItem(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS)
    setItem(STORAGE_KEYS.PROJECT_MEMBERS, MOCK_PROJECT_MEMBERS)
    setItem(STORAGE_KEYS.TASKS, MOCK_TASKS)
  },
}
