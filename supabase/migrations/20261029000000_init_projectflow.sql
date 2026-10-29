-- ==============================================================================
-- PROJECTFLOW: Initial Database Migration
-- Version: 1.0.1 (Hardened Security Release)
-- Description: Production-ready PostgreSQL schema with RLS, triggers, & indexes
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ------------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index on projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- ------------------------------------------------------------------------------
-- 3. PROJECT MEMBERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON public.project_members(project_id, role);

-- ------------------------------------------------------------------------------
-- 4. TASKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date DATE,
  position NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes on tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON public.tasks(project_id, status, position);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. AUTH PROFILE AUTO-CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. AUTO-ADD PROJECT OWNER AS MEMBER TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_project_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'owner';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_project_created_add_owner ON public.projects;
CREATE TRIGGER on_project_created_add_owner
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project_owner();

-- ------------------------------------------------------------------------------
-- 8. SECURITY DEFINER HELPER FUNCTIONS (Avoid RLS Recursion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_project_role(_project_id UUID, _user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.project_members
  WHERE project_id = _project_id AND user_id = _user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------
-- Authenticated users can view profiles (to display team members and assignees)
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------
-- PROJECTS POLICIES
-- -----------------------------------------
-- Users can view projects they own or belong to
CREATE POLICY "Projects viewable by members or owners"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    public.is_project_member(id, auth.uid())
  );

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owners and admins can update project details
CREATE POLICY "Owners and admins can update projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    public.get_project_role(id, auth.uid()) IN ('owner', 'admin')
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    public.get_project_role(id, auth.uid()) IN ('owner', 'admin')
  );

-- Only owners can delete projects
CREATE POLICY "Only owners can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- -----------------------------------------
-- PROJECT MEMBERS POLICIES
-- -----------------------------------------
-- Members can view other members in their projects
CREATE POLICY "Members can view project membership"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    public.is_project_member(project_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );

-- Owners and admins can add new members
CREATE POLICY "Owners and admins can add project members"
  ON public.project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    ) OR
    public.get_project_role(project_id, auth.uid()) IN ('owner', 'admin')
  );

-- Only owners can update member roles
CREATE POLICY "Owners can update member roles"
  ON public.project_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    ) OR
    public.get_project_role(project_id, auth.uid()) = 'owner'
  )
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.owner_id = auth.uid()
      ) OR
      public.get_project_role(project_id, auth.uid()) = 'owner'
    ) AND
    role IN ('owner', 'admin', 'member')
  );

-- Owners can remove members, and members can remove themselves
CREATE POLICY "Owners or self can remove membership"
  ON public.project_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    ) OR
    public.get_project_role(project_id, auth.uid()) = 'owner'
  );

-- -----------------------------------------
-- TASKS POLICIES
-- -----------------------------------------
-- Users can view tasks in projects they are a member of
CREATE POLICY "Tasks viewable by project members"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    public.is_project_member(project_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );

-- Members can insert tasks (assignee must be member or null)
CREATE POLICY "Members can create tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (
      public.is_project_member(project_id, auth.uid()) OR
      EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    ) AND
    (
      assignee_id IS NULL OR
      public.is_project_member(project_id, assignee_id)
    )
  );

-- Members can update tasks (assignee must remain member or null)
CREATE POLICY "Members can update tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    public.is_project_member(project_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  )
  WITH CHECK (
    (
      public.is_project_member(project_id, auth.uid()) OR
      EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    ) AND
    (
      assignee_id IS NULL OR
      public.is_project_member(project_id, assignee_id)
    )
  );

-- Members can delete tasks (task creator or project owner/admin)
CREATE POLICY "Members can delete tasks"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.get_project_role(project_id, auth.uid()) IN ('owner', 'admin') OR
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );
