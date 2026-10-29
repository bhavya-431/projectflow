import {
  Profile,
  Project,
  ProjectMember,
  Task,
  TaskFormData,
  ProjectFormData,
  TaskStatus,
} from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { localStore } from './storage'

// -----------------------------------------------------------------------------
// Database <-> Frontend Mappers
// -----------------------------------------------------------------------------

interface DbProfile {
  id: string
  full_name: string
  avatar_url?: string | null
  created_at?: string
}

interface DbProject {
  id: string
  name: string
  description?: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

interface DbProjectMember {
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

interface DbTask {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee_id?: string | null
  created_by: string
  due_date?: string | null
  position: number
  created_at: string
  updated_at: string
}

function mapProfileFromDb(row: DbProfile, email?: string): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    email,
    createdAt: row.created_at,
  }
}

function mapProjectFromDb(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTaskFromDb(row: DbTask): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    createdBy: row.created_by,
    dueDate: row.due_date,
    position: Number(row.position) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// -----------------------------------------------------------------------------
// Unified API Services
// -----------------------------------------------------------------------------

export const authService = {
  isConfigured: isSupabaseConfigured(),

  async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session?.user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        return mapProfileFromDb(profile, session.user.email)
      }
      return {
        id: session.user.id,
        fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email,
        avatarUrl: session.user.user_metadata?.avatar_url,
      }
    }

    // Local / Demo Mode
    return localStore.getCurrentUser()
  },

  async signIn(email: string, password?: string): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      if (!password) throw new Error('Password is required for Supabase authentication')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Sign in failed')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return profile
        ? mapProfileFromDb(profile, data.user.email)
        : {
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email,
          }
    }

    // Demo Mode Sign In: Match or create local user
    const users = localStore.getUsers()
    let user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        fullName: email.split('@')[0] || 'Demo User',
        email,
        createdAt: new Date().toISOString(),
      }
      localStore.setUsers([...users, user])
    }
    localStore.setCurrentUser(user)
    return user
  },

  async signUp(fullName: string, email: string, password?: string): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      if (!password) throw new Error('Password is required for registration')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Sign up failed')

      return {
        id: data.user.id,
        fullName,
        email: data.user.email,
      }
    }

    // Demo Mode Sign Up
    const newUser: Profile = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      createdAt: new Date().toISOString(),
    }
    const users = localStore.getUsers()
    localStore.setUsers([...users, newUser])
    localStore.setCurrentUser(newUser)
    return newUser
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut()
    } else {
      localStore.clearCurrentUser()
    }
  },

  async updateProfile(userId: string, data: { fullName: string; avatarUrl?: string }): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName, avatar_url: data.avatarUrl || null })
        .eq('id', userId)

      if (error) throw new Error(error.message)
      return {
        id: userId,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      }
    }

    // Local Store update
    const currentUser = localStore.getCurrentUser()
    if (!currentUser) throw new Error('User not found in session')
    const updated: Profile = {
      ...currentUser,
      id: currentUser.id,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl || currentUser.avatarUrl,
    }
    localStore.setCurrentUser(updated)

    // Update in users list
    const users = localStore.getUsers().map((u) => (u.id === userId ? updated : u))
    localStore.setUsers(users)
    return updated
  },

  async getUsers(): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw new Error(error.message)
      return (data || []).map((p) => mapProfileFromDb(p))
    }
    return localStore.getUsers()
  },
}

// -----------------------------------------------------------------------------
// Project Service
// -----------------------------------------------------------------------------

export const projectService = {
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data || []).map(mapProjectFromDb)
    }

    // Local / Demo Mode
    return localStore.getProjects()
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) return null
      return mapProjectFromDb(data)
    }

    const projects = localStore.getProjects()
    return projects.find((p) => p.id === projectId) || null
  },

  async createProject(data: ProjectFormData, ownerId: string): Promise<Project> {
    if (isSupabaseConfigured() && supabase) {
      const { data: created, error } = await supabase
        .from('projects')
        .insert({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          owner_id: ownerId,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return mapProjectFromDb(created)
    }

    // Local Store
    const now = new Date().toISOString()
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      ownerId,
      createdAt: now,
      updatedAt: now,
    }

    const projects = [newProject, ...localStore.getProjects()]
    localStore.setProjects(projects)

    // Add owner as project member
    const members = [
      ...localStore.getProjectMembers(),
      {
        projectId: newProject.id,
        userId: ownerId,
        role: 'owner' as const,
        joinedAt: now,
      },
    ]
    localStore.setProjectMembers(members)

    return newProject
  },

  async updateProject(projectId: string, data: ProjectFormData): Promise<Project> {
    const now = new Date().toISOString()
    if (isSupabaseConfigured() && supabase) {
      const { data: updated, error } = await supabase
        .from('projects')
        .update({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          updated_at: now,
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return mapProjectFromDb(updated)
    }

    const projects = localStore.getProjects()
    const index = projects.findIndex((p) => p.id === projectId)
    if (index === -1) throw new Error('Project not found')

    const updated = {
      ...projects[index],
      name: data.name.trim(),
      description: data.description?.trim() || null,
      updatedAt: now,
    }
    projects[index] = updated
    localStore.setProjects([...projects])
    return updated
  },

  async deleteProject(projectId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) throw new Error(error.message)
      return
    }

    // Cascade delete tasks and members in local store
    const projects = localStore.getProjects().filter((p) => p.id !== projectId)
    const tasks = localStore.getTasks().filter((t) => t.projectId !== projectId)
    const members = localStore.getProjectMembers().filter((m) => m.projectId !== projectId)

    localStore.setProjects(projects)
    localStore.setTasks(tasks)
    localStore.setProjectMembers(members)
  },
}

// -----------------------------------------------------------------------------
// Task Service
// -----------------------------------------------------------------------------

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw new Error(error.message)
      return (data || []).map(mapTaskFromDb)
    }

    return localStore.getTasks()
  },

  async getTasksByProject(projectId: string): Promise<Task[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (error) throw new Error(error.message)
      return (data || []).map(mapTaskFromDb)
    }

    const tasks = localStore.getTasks()
    return tasks.filter((t) => t.projectId === projectId)
  },

  async getMyTasks(userId: string): Promise<Task[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .order('due_date', { ascending: true, nullsFirst: false })

      if (error) throw new Error(error.message)
      return (data || []).map(mapTaskFromDb)
    }

    const tasks = localStore.getTasks()
    return tasks.filter((t) => t.assigneeId === userId)
  },

  async createTask(data: TaskFormData, userId: string): Promise<Task> {
    const now = new Date().toISOString()
    if (isSupabaseConfigured() && supabase) {
      // Calculate max position in column
      const { data: existing } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', data.projectId)
        .eq('status', data.status)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = (existing?.[0]?.position ?? 0) + 1000

      const { data: created, error } = await supabase
        .from('tasks')
        .insert({
          project_id: data.projectId,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          status: data.status,
          priority: data.priority,
          assignee_id: data.assigneeId || null,
          created_by: userId,
          due_date: data.dueDate || null,
          position: nextPosition,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return mapTaskFromDb(created)
    }

    // Local Store
    const tasks = localStore.getTasks()
    const columnTasks = tasks.filter(
      (t) => t.projectId === data.projectId && t.status === data.status
    )
    const maxPos = columnTasks.reduce((max, t) => Math.max(max, t.position), 0)

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: data.projectId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      createdBy: userId,
      dueDate: data.dueDate || null,
      position: maxPos + 1000,
      createdAt: now,
      updatedAt: now,
    }

    localStore.setTasks([...tasks, newTask])
    return newTask
  },

  async updateTask(taskId: string, data: Partial<TaskFormData>): Promise<Task> {
    const now = new Date().toISOString()
    if (isSupabaseConfigured() && supabase) {
      const updatePayload: Record<string, unknown> = {
        updated_at: now,
      }
      if (data.title !== undefined) updatePayload.title = data.title.trim()
      if (data.description !== undefined) updatePayload.description = data.description?.trim() || null
      if (data.status !== undefined) updatePayload.status = data.status
      if (data.priority !== undefined) updatePayload.priority = data.priority
      if (data.assigneeId !== undefined) updatePayload.assignee_id = data.assigneeId || null
      if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate || null
      if (data.projectId !== undefined) updatePayload.project_id = data.projectId

      const { data: updated, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return mapTaskFromDb(updated)
    }

    const tasks = localStore.getTasks()
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index === -1) throw new Error('Task not found')

    const updated: Task = {
      ...tasks[index],
      ...data,
      title: data.title !== undefined ? data.title.trim() : tasks[index].title,
      description: data.description !== undefined ? data.description?.trim() || null : tasks[index].description,
      assigneeId: data.assigneeId !== undefined ? data.assigneeId || null : tasks[index].assigneeId,
      dueDate: data.dueDate !== undefined ? data.dueDate || null : tasks[index].dueDate,
      updatedAt: now,
    }

    tasks[index] = updated
    localStore.setTasks([...tasks])
    return updated
  },

  async updateTaskStatusAndPosition(
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number
  ): Promise<Task> {
    const now = new Date().toISOString()
    if (isSupabaseConfigured() && supabase) {
      const { data: updated, error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          position: newPosition,
          updated_at: now,
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return mapTaskFromDb(updated)
    }

    const tasks = localStore.getTasks()
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index === -1) throw new Error('Task not found')

    const updated: Task = {
      ...tasks[index],
      status: newStatus,
      position: newPosition,
      updatedAt: now,
    }
    tasks[index] = updated
    localStore.setTasks([...tasks])
    return updated
  },

  async deleteTask(taskId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw new Error(error.message)
      return
    }

    const tasks = localStore.getTasks().filter((t) => t.id !== taskId)
    localStore.setTasks(tasks)
  },
}

// -----------------------------------------------------------------------------
// Project Member Service
// -----------------------------------------------------------------------------

export const memberService = {
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('project_members')
        .select('*, profiles(*)')
        .eq('project_id', projectId)

      if (error) throw new Error(error.message)
      return (data || []).map((row) => ({
        projectId: row.project_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        profile: row.profiles ? mapProfileFromDb(row.profiles) : undefined,
      }))
    }

    const members = localStore.getProjectMembers().filter((m) => m.projectId === projectId)
    const users = localStore.getUsers()
    return members.map((m) => ({
      ...m,
      profile: users.find((u) => u.id === m.userId),
    }))
  },

  async addMember(projectId: string, userId: string, role: 'owner' | 'admin' | 'member'): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: userId,
        role,
      })
      if (error) throw new Error(error.message)
      return
    }

    const members = localStore.getProjectMembers()
    const exists = members.some((m) => m.projectId === projectId && m.userId === userId)
    if (!exists) {
      localStore.setProjectMembers([
        ...members,
        {
          projectId,
          userId,
          role,
          joinedAt: new Date().toISOString(),
        },
      ])
    }
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw new Error(error.message)
      return
    }

    const members = localStore
      .getProjectMembers()
      .filter((m) => !(m.projectId === projectId && m.userId === userId))
    localStore.setProjectMembers(members)
  },
}
