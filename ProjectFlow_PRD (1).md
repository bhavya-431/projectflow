# ProjectFlow — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft for implementation  
**Product type:** Responsive project and task management web application  
**Primary audience:** Individual developers, student teams, and small teams  
**Proposed stack:** React, TypeScript, Tailwind CSS, React Router, dnd-kit, Supabase, Recharts, Lucide React  
**Budget constraint:** Prefer free-tier and open-source tools; verify provider limits before deployment.

---

## 1. Executive Summary

ProjectFlow is a responsive project management application that helps users organize projects, create and assign tasks, visualize work on a Kanban board, track deadlines, and understand progress from a centralized dashboard. It is intended as a portfolio-grade application demonstrating frontend engineering, API/database integration, authentication, access control, responsive design, and reliable user interactions.

The initial release should prioritize a complete, dependable core workflow over a large number of unfinished features.

## 2. Problem Statement

Small teams and individual contributors often track work across chat messages, spreadsheets, and notes. This makes task ownership, status, deadlines, and project progress difficult to understand. ProjectFlow centralizes this information and makes it easy to update and review work.

## 3. Goals and Success Criteria

### Product goals
- Let users create and manage projects and tasks.
- Make task status easy to understand and update using a Kanban board.
- Provide useful task search, filters, and sorting.
- Display accurate dashboard metrics derived from persisted data.
- Keep each user's and each project's data protected by server-side authorization.
- Deliver an accessible, responsive, deployable application.

### Portfolio success criteria
- A new user can register, sign in, create a project, create tasks, move tasks across columns, and see changes persist after refresh.
- Search and filters work together correctly.
- Unauthorized users cannot read or modify project data through direct database requests.
- Main flows work on desktop and mobile layouts.
- Repository includes a clear README, setup instructions, screenshots, environment variable documentation, and a live demo when deployed.

No user-growth, performance, or business-impact metrics are claimed before measurement.

## 4. Target Users

1. **Individual contributor:** Wants to organize personal projects and deadlines.
2. **Student or project team:** Needs shared task visibility and clear ownership.
3. **Small-team lead:** Wants to monitor project progress and overdue tasks.

## 5. Scope

### MVP — Must Have
- Email/password registration, login, logout, and session restoration.
- Protected application routes.
- Dashboard with task/project summary metrics.
- Create, view, edit, and delete projects.
- Project workspace with To Do, In Progress, and Done columns.
- Create, edit, and delete tasks.
- Task fields: title, description, status, priority, due date, assignee, project, creator, timestamps.
- Drag-and-drop task status changes.
- Search by task title.
- Filter by status and priority; combine filters.
- Sort tasks by due date or priority.
- Loading, error, success, and empty states.
- Responsive layout and keyboard-accessible controls.
- Supabase persistence and Row Level Security policies.

### Should Have
- Project membership and roles (owner/admin/member).
- Assignee selection from project members.
- Progress charts and upcoming/overdue task summaries.
- Dark mode with persisted preference.
- Confirmation before destructive actions.
- Basic automated tests.

### Could Have — Later Release
- Activity feed.
- Task labels/tags.
- Comments and attachments.
- Notifications and email invitations.
- Realtime updates across multiple users.
- Calendar view and advanced reporting.

### Out of Scope for MVP
- Billing/subscriptions.
- Enterprise SSO.
- Native mobile applications.
- Complex automation rules.
- Offline-first synchronization.
- AI task generation.

## 6. Core User Journeys

### Journey A: New user
1. Open the application.
2. Register with name, email, and password.
3. Verify/authenticate as required by configured Supabase Auth settings.
4. Land on the dashboard.
5. See a helpful empty state and create the first project.

### Journey B: Create and update a task
1. Open a project.
2. Select **Add task**.
3. Enter a title and optional description, priority, due date, and assignee.
4. Save the task.
5. See it in the selected Kanban column.
6. Drag it to another column.
7. Receive clear feedback that the change was saved, or an error if it failed.

### Journey C: Find a task
1. Open a project board.
2. Enter a search term.
3. Apply status and priority filters.
4. See only matching tasks.
5. Clear filters to restore the full task list.

### Journey D: Access control
1. A user signs in.
2. The user sees only projects they own or are authorized to access.
3. Direct requests for unauthorized records are rejected by database policies, not merely hidden by the UI.

## 7. Functional Requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | Authentication | Must | Register, login, logout, and session restoration work; invalid credentials show understandable errors. |
| FR-02 | Protected routes | Must | Signed-out users cannot access protected pages; they are redirected to login. |
| FR-03 | Project CRUD | Must | Authorized users can create, view, update, and delete projects; destructive actions require confirmation. |
| FR-04 | Task CRUD | Must | Authorized users can create, view, edit, and delete tasks with validation. |
| FR-05 | Kanban board | Must | Tasks are grouped by status and can be moved between columns. |
| FR-06 | Persistence | Must | Successful changes remain after refresh and re-login. |
| FR-07 | Search and filters | Must | Search, status filter, and priority filter can be combined and cleared. |
| FR-08 | Sorting | Must | Tasks can be sorted by due date and priority with predictable behavior for missing dates. |
| FR-09 | Dashboard metrics | Must | Counts are calculated from authorized persisted records; zero-task projects do not cause division errors. |
| FR-10 | Loading/error/empty states | Must | Every major data view communicates loading, failure, and no-data conditions. |
| FR-11 | Responsive layout | Must | Core workflows remain usable on common desktop, tablet, and mobile widths. |
| FR-12 | Authorization | Must | Database policies enforce access to projects, memberships, and tasks. |
| FR-13 | Team membership | Should | Owners/admins can manage membership; only project members can be assigned tasks. |
| FR-14 | Dark mode | Should | User can switch themes and the preference persists. |
| FR-15 | Activity feed | Could | Key task and project events are recorded and displayed. |

## 8. UX and Interface Requirements

### Main navigation
- Dashboard
- Projects
- My Tasks
- Settings/Profile
- Sign out

### Dashboard
- Summary cards: total projects, active tasks, completed tasks, overdue tasks.
- Project progress list.
- Upcoming deadlines.
- Recent activity (if activity feed is implemented).
- Clear first-use empty state.

### Project workspace
- Project title and description.
- Task search, filters, sorting, and Add Task action.
- Three Kanban columns: To Do, In Progress, Done.
- Task cards showing title, priority, due date, and assignee.
- Accessible task details/edit dialog.

### Visual design
- Consistent spacing, typography, button hierarchy, and status/priority labels.
- Avoid relying on color alone to communicate status.
- Visible keyboard focus indicators.
- Responsive navigation and a usable mobile board (horizontal scrolling or a suitable compact view).
- Confirm dialogs for irreversible actions.

## 9. Data Model

### profiles
- `id` UUID primary key referencing the authenticated user.
- `full_name` text.
- `avatar_url` text, nullable.
- `created_at` timestamp.

### projects
- `id` UUID primary key.
- `name` text, required.
- `description` text, nullable.
- `owner_id` UUID referencing the user.
- `created_at`, `updated_at` timestamps.

### project_members
- `project_id` UUID referencing projects.
- `user_id` UUID referencing profiles/auth users.
- `role` enum/text constrained to `owner`, `admin`, or `member`.
- `joined_at` timestamp.
- Composite unique constraint on (`project_id`, `user_id`).

### tasks
- `id` UUID primary key.
- `project_id` UUID referencing projects.
- `title` text, required.
- `description` text, nullable.
- `status` constrained to `todo`, `in_progress`, or `done`.
- `priority` constrained to `low`, `medium`, or `high`.
- `assignee_id` UUID, nullable.
- `created_by` UUID referencing user.
- `due_date` date, nullable.
- `position` numeric/integer for ordering within a column.
- `created_at`, `updated_at` timestamps.

### Data integrity
- Use foreign keys and appropriate delete behavior.
- Validate task status and priority at the database level.
- Ensure an assignee is a member of the associated project.
- Use database triggers or explicit update logic for `updated_at`.
- Define and test authorization for every table and operation.

## 10. Security and Privacy

- Use Supabase Auth for authentication.
- Enable and test Row Level Security on all user-owned or project-scoped tables.
- Users may access a project only if they own it or have valid membership.
- Task access must be derived from authorized project access.
- Only owners/admins may perform designated project or membership management actions.
- Never expose a Supabase service-role key in frontend code.
- Store only public client configuration in frontend environment variables; RLS remains mandatory.
- Validate inputs on both client and database/server side.
- Avoid logging passwords, access tokens, or sensitive user content.
- Test policies using multiple test users, including unauthorized direct queries.

## 11. Technical Architecture

### Frontend
- React + TypeScript + Vite.
- Tailwind CSS for responsive styling.
- React Router for navigation.
- dnd-kit for drag-and-drop.
- Lucide React for icons.
- Recharts for dashboard visualizations.
- Vitest and React Testing Library for unit/component tests; Playwright for key end-to-end flows.

### Backend and data
- Supabase Auth.
- Supabase PostgreSQL.
- Row Level Security policies.
- Supabase JavaScript client for authorized database operations.

### Suggested source organization
```text
src/
  components/
    layout/
    dashboard/
    projects/
    tasks/
    ui/
  pages/
  hooks/
  services/
  types/
  utils/
  App.tsx
  main.tsx
```

Keep page components focused on composition, reusable UI in components, database operations in service modules, and shared stateful logic in hooks. Avoid placing all logic in a single component.

## 12. Non-Functional Requirements

- **Usability:** Common actions should be discoverable and have clear feedback.
- **Accessibility:** Semantic HTML, labels, keyboard support, focus visibility, and accessible dialogs.
- **Responsiveness:** Core workflows usable on desktop, tablet, and mobile.
- **Reliability:** Failed writes must not be presented as successful; support retry or rollback messaging.
- **Maintainability:** TypeScript types, reusable components, clear service boundaries, and documented setup.
- **Performance:** Avoid unnecessary re-renders and excessive database requests; paginate or limit large datasets as needed.
- **Security:** Enforce access rules in the database, not only in the client.

## 13. Error and Edge Cases

- Empty project/task lists.
- Blank or whitespace-only task titles.
- Duplicate submissions from repeated clicks.
- Task due date missing.
- Task moved to a column but database save fails.
- Network disconnect or expired session.
- Deleted project with existing tasks.
- User removed from a project while viewing it.
- Invalid or inaccessible task/project ID.
- No results after search/filter.
- Two users updating the same task.
- Daylight-saving/timezone differences for timestamp fields.

For drag-and-drop, choose and document a consistent approach: optimistic UI with rollback on failure, or update-after-confirmation. Never leave the board and database inconsistent without visible feedback.

## 14. Testing Plan

### Unit/component tests
- Task validation.
- Dashboard metric calculations.
- Search/filter/sort combinations.
- Task card rendering.
- Modal required fields and error messages.

### Integration tests
- Task creation and update against a test backend.
- Persistence after refetch.
- Authentication state and route protection.
- Error handling for failed database writes.

### End-to-end tests
- Register/sign in.
- Create a project.
- Create a task.
- Move task from To Do to In Progress to Done.
- Refresh and verify persisted status.
- Verify a second unauthorized user cannot access the first user's private project.

### Manual QA
- Desktop, tablet, and mobile viewport checks.
- Keyboard-only navigation.
- Empty, loading, error, and success states.
- RLS policies tested using separate accounts.

## 15. Deployment and Environment

- Host the frontend on a suitable static hosting service with a free tier, subject to current limits.
- Use Supabase for hosted authentication and database, subject to current free-tier limits.
- Keep local secrets in `.env.local` and exclude it from Git.
- Example frontend variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (or the currently recommended public client key name supported by the chosen setup)
- Never place privileged server keys in Vite-exposed variables.
- Configure production redirect URLs and allowed origins in Supabase Auth.
- Include `.env.example` with placeholder values only.

## 16. Implementation Roadmap

| Phase | Work | Exit criteria |
|---|---|---|
| 1. Foundation | Vite, React, TypeScript, Tailwind, routes, layout | App starts; navigation and responsive shell work. |
| 2. UI with mock data | Dashboard, project list, task cards, modal | Main views render with realistic mock data. |
| 3. Task interactions | CRUD, filters, sorting, drag-and-drop | Core task workflow works locally and handles validation. |
| 4. Backend | Schema, Supabase client, persistence, RLS | Data persists and authorization tests pass. |
| 5. Team features | Membership, roles, assignees | Access and assignment rules work. |
| 6. Quality | Analytics, accessibility, tests, responsive fixes | Core acceptance tests pass. |
| 7. Release | Deployment, README, screenshots | Live demo and reproducible setup are available. |

A 14-day schedule can be used as an initial planning target, but adjust it based on experience, testing, and the complexity of RLS policies.

## 17. Risks and Mitigations

- **RLS complexity:** Start with a simple owner-only model, test it with separate users, then add membership policies.
- **Over-scoping:** Keep comments, notifications, realtime sync, and calendar views out of MVP.
- **Drag-and-drop persistence bugs:** Centralize status updates and implement rollback/error feedback.
- **Type mismatch between frontend and database:** Define shared TypeScript types and map database snake_case fields consistently.
- **Free-tier limitations:** Check current service limits and provide local development instructions.
- **Weak portfolio presentation:** Include screenshots, a short demo, architecture notes, and verified test instructions.

## 18. Release Definition of Done

The MVP is complete when:
- A user can register, sign in, sign out, and restore a session.
- Authorized users can create and manage projects and tasks.
- Kanban drag-and-drop persists task status.
- Search, filters, and sorting behave correctly.
- Dashboard metrics reflect actual data.
- Database policies prevent unauthorized access.
- Main flows have automated or documented manual tests.
- Loading, empty, error, and success states are implemented.
- The application is responsive and keyboard usable.
- README, environment example, screenshots, and deployment instructions are complete.

## 19. Future Enhancements

Potential follow-up releases may add task comments, activity history, notifications, calendar view, attachments, realtime collaboration, and configurable workflows. These should be prioritized only after the MVP is reliable and user feedback or portfolio goals justify the added complexity.
