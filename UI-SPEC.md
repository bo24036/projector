# Projector UI Specification

A project management app for tracking tasks, people, and notes across multiple projects. Built with vanilla JavaScript, lit-html, and IndexedDB using strict Unidirectional Data Flow.

---

## Application Structure

### Core Pages
1. **Overview Page** - All projects and their open tasks
2. **Project Page** - Single project detail view

### Navigation
- Hash-based routing: `#overview`, `#project/projectId/{id}`
- Sidebar persistent across all pages
- Back button: Project → Overview

---

## Page Layouts

### Overview Page

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PROJECTOR - OVERVIEW                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬────────────────────────────────────────────────────────┐
│              │                                                        │
│  SIDEBAR     │                   MAIN CONTENT                        │
│              │                                                        │
│ [📊 Overview]│ ┌──────────────────────────────────────────────────┐  │
│              │ │ Project Name 1  (3/5 tasks done)                 │  │
│ [Projects]   │ │ "Project description goes here"                  │  │
│              │ │                                                  │  │
│ • Project A  │ │ • [ ] Task name with due date indicator          │  │
│ • Project B  │ │ • [ ] Another task due in 2 days                 │  │
│ • Project C  │ │ • [ ] Task due TOMORROW (red)                    │  │
│              │ │                                                  │  │
│ [+] New      │ └──────────────────────────────────────────────────┘  │
│              │                                                        │
│ [≡] Archived │ ┌──────────────────────────────────────────────────┐  │
│              │ │ Project Name 2  (1/2 tasks done)                 │  │
│ [👤] Suppress│ ┌──────────────────────────────────────────────────┐  │
│              │ │ Project Name 2  (1/2 tasks done)                 │  │
│              │ │ "Another project description"                    │  │
│              │ │                                                  │
│              │ │ • [ ] Single task in this project                │  │
│              │ │                                                  │
│              │ └──────────────────────────────────────────────────┘  │
│              │                                                        │
│              │ "All tasks complete ✓"  [Project 3 - no open tasks]   │
│              │                                                        │
└──────────────┴────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Sidebar** contains:
  - "[📊 Overview]" link to navigate to overview page
  - Active project list (clickable to navigate to project page)
  - "+ New" button to create project
  - "≡ Archived" toggle to show/hide archived projects
  - "👤 Suppress" button for suppressed people management
  - Progress rings showing completion % for each project

- **Main Content** shows:
  - Each active project as a section
  - Project name (clickable to navigate to project page)
  - Project description (if set)
  - Open tasks listed (uncompleted only)
  - "All tasks complete ✓" message for projects with no open tasks
  - **Color-coded urgency** based on nearest task due date:
    - Red if task due TODAY or TOMORROW
    - Orange if task due in 2-3 days
    - Gray otherwise

---

### Project Page

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROJECTOR - PROJECT DETAIL                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬────────────────────────────────────────────────────────┐
│              │                                                        │
│  SIDEBAR     │  ┌──────────────────────────────────────────────────┐  │
│              │  │ PROJECT HEADER                                   │  │
│ [📊 Overview]│  │ ────────────────────────────────────────────────│  │
│              │  │                                                  │  │
│ [Projects]   │  │ [Editable Project Name Here]                    │  │
│              │  │ ⭐ (Funded)  [Archive]  [Delete]               │  │
│ • Project A  │  │                                                  │  │
│ • PROJECT B  │  │ [Editable project description. Click to edit.]  │  │
│   (selected) │  │                                                  │  │
│ • Project C  │  └──────────────────────────────────────────────────┘  │
│              │                                                        │
│ [+] New      │  ┌──────────────────────────────────────────────────┐  │
│              │  │ TASKS                                            │  │
│ [≡] Archived │  │ ────────────────────────────────────────────────│  │
│              │                                                        │
│ [👤] Suppress│  │ [Click to add task...]                          │  │
│              │  │                                                  │  │
│              │  │ [Click to add task...]                          │  │
│              │  │ or if editing:                                  │  │
│              │  │ ┌────────────────────────────────────────────┐  │  │
│              │  │ │ Task name...     │ Due date...    │ ✓  ✕  │  │  │
│              │  │ └────────────────────────────────────────────┘  │  │
│              │  │                                                  │  │
│              │  │ Open Tasks:                                      │  │
│              │  │ • [ ] Task 1   (due in 2 days)                  │  │
│              │  │ • [ ] Task 2   (due tomorrow)                   │  │
│              │  │ • [ ] Task 3   (no due date)                    │  │
│              │  │                                                  │  │
│              │  │ [Click to add another task...]                  │  │
│              │  │                                                  │  │
│              │  │ ──────────────────────────────────────────────  │  │
│              │  │ Completed (2)                                    │  │
│              │  │                                                  │  │
│              │  │ • [✓] Completed task 1                          │  │
│              │  │ • [✓] Completed task 2                          │  │
│              │  │                                                  │  │
│              │  └──────────────────────────────────────────────────┘  │
│              │                                                        │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │ PEOPLE                                           │  │
│              │  │ ────────────────────────────────────────────────│  │
│              │  │                                                  │  │
│              │  │ [Click to add person...]                        │  │
│              │  │ or if editing:                                  │  │
│              │  │ ┌────────────────────────────────────────────┐  │  │
│              │  │ │ Name...  │ Role...     │ ✓  ✕             │  │  │
│              │  │ └────────────────────────────────────────────┘  │  │
│              │  │                                                  │  │
│              │  │ • Person A - Developer                          │  │
│              │  │ • Person B - Manager                            │  │
│              │  │                                                  │  │
│              │  │ [Click to add another person...]                │  │
│              │  │                                                  │  │
│              │  └──────────────────────────────────────────────────┘  │
│              │                                                        │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │ NOTES                                            │  │
│              │  │ ────────────────────────────────────────────────│  │
│              │  │                                                  │  │
│              │  │ [Click to add note...]                          │  │
│              │  │ or if editing:                                  │  │
│              │  │ ┌────────────────────────────────────────────┐  │  │
│              │  │ │ Note content...                │ ✓  ✕      │  │  │
│              │  │ │ Link (optional)...             │            │  │  │
│              │  │ └────────────────────────────────────────────┘  │  │
│              │  │                                                  │  │
│              │  │ • Note 1: "Meeting notes about deployment"      │  │
│              │  │ • Note 2: "Link to design docs [text](url)"     │  │
│              │  │                                                  │  │
│              │  │ [Click to add another note...]                  │  │
│              │  │                                                  │  │
│              │  └──────────────────────────────────────────────────┘  │
│              │                                                        │
└──────────────┴────────────────────────────────────────────────────────┘

Notes:
- PEOPLE and NOTES sections do NOT appear for the "Personal" project
- Project name and description are inline-editable with debounced auto-save
- Archived projects show read-only view (no edit/create/delete capabilities)
```

---

## Component Inventory

### Layout Components

#### Sidebar
- **Props:**
  - `projects: Project[]` - Active projects
  - `archivedProjects: Project[]` - Archived projects
  - `progress: ProgressRing[]` - Progress data by project
  - `currentPage: 'overview' | 'project'`
  - `currentProjectId: string | null`
  - `creatingNewProject: boolean`
  - `showArchivedProjects: boolean`

- **Actions:**
  - `onProjectClick(id)` - Navigate to project
  - `onOverviewClick()` - Navigate to overview
  - `onCreateProjectStart()` - Show new project form
  - `onCreateProjectSubmit(name)` - Create project
  - `onCreateProjectCancel()` - Hide new project form
  - `onToggleArchivedProjects()` - Show/hide archived
  - `onSuppressedPeopleClick()` - Open suppressed people modal

#### ProjectHeader
- **Props:**
  - `project: Project` - Current project

- **Editable Fields:**
  - `name` (inline, debounced auto-save)
  - `description` (inline, debounced auto-save)
  - `funded` toggle (⭐ icon)

- **Actions:**
  - Archive button
  - Delete button

#### ProjectList
- **Props:**
  - `projects: Project[]`
  - `progress: ProgressRing[]`

- **Rendering:**
  - Each project as a clickable section
  - Progress indicator (e.g., "3/5 tasks")
  - Description if present
  - Color-coded urgency

### Task Section

#### TaskList
- **Props:**
  - `tasks: Task[]`
  - `editingTaskId: string | null`
  - `editingTaskName: string`
  - `editingTaskDueDate: string` (YYYY-MM-DD format)

- **Interactions:**
  - Checkbox to toggle completion
  - Click to edit inline
  - Delete button
  - Save (Enter) / Cancel (Esc)

#### TaskCreationForm
- **Props:**
  - `isVisible: boolean`

- **Fields:**
  - Task name (text input)
  - Due date (smart parsing: `+5`, `tomorrow`, `2025-02-25`)

- **Interactions:**
  - Enter to save
  - Esc to cancel
  - Auto-cancel if empty on blur

### People Section

#### PersonList
- **Props:**
  - `people: Person[]`
  - `editingPersonId: string | null`
  - `editingPersonName: string`
  - `editingPersonRole: string`

- **Interactions:**
  - Click name or role to edit inline
  - Delete button with confirmation
  - Save (Enter) / Cancel (Esc)

#### PersonCreationForm
- **Props:**
  - `isVisible: boolean`
  - `allPeopleNames: string[]` - For autocomplete
  - `allRoles: string[]` - For role autocomplete

- **Fields:**
  - Person name (autocomplete datalist)
  - Role (optional, autocomplete datalist)

- **Interactions:**
  - Enter to save
  - Esc to cancel
  - Auto-cancel if empty on blur

### Notes Section

#### NoteList
- **Props:**
  - `notes: Note[]`
  - `editingNoteId: string | null`
  - `editingNoteContent: string`
  - `editingNoteLink: string`

- **Interactions:**
  - Click to edit inline
  - Delete button with confirmation
  - Save (Shift+Enter or click) / Cancel (Esc)

#### NoteCreationForm
- **Props:**
  - `isVisible: boolean`

- **Fields:**
  - Content (textarea, supports markdown links `[text](url)`)
  - Link (optional URL field)

- **Interactions:**
  - Shift+Enter to save
  - Esc to cancel
  - Auto-cancel if empty on blur

---

## Data Model

### Project
```javascript
{
  id: string (UUID),
  name: string,                    // Required
  description: string,             // Optional
  funded: boolean,                 // Default: false
  archived: boolean,               // Default: false
  isPersonal: boolean,             // Default: false (special "Personal" project)
  createdAt: number (timestamp),
  updatedAt: number (timestamp)
}
```

### Task
```javascript
{
  id: string (UUID),
  name: string,                    // Required
  projectId: string,               // Required, foreign key to Project
  completed: boolean,              // Default: false
  dueDate: number | null,          // Timestamp or null
  parentTaskId: string | null,     // For future hierarchy support
  createdAt: number (timestamp),
  updatedAt: number (timestamp)
}
```

### Person
```javascript
{
  id: string (UUID),
  name: string,                    // Required
  role: string | null,             // Optional
  projectId: string,               // Foreign key to Project
  createdAt: number (timestamp),
  updatedAt: number (timestamp)
}
```

### Note
```javascript
{
  id: string (UUID),
  content: string,                 // Required
  link: string | null,             // Optional URL
  projectId: string,               // Foreign key to Project
  createdAt: number (timestamp),
  updatedAt: number (timestamp)
}
```

---

## Key Interactions & Behaviors

### Task Due Date Handling
- Smart parsing: `+5` (5 days from now), `tomorrow`, `2025-02-25`
- Display formats:
  - "due in 2 days"
  - "due tomorrow"
  - "due today"
  - "overdue"
- Urgency color-coding (Overview page):
  - **Red** (due-1day): Task due today or tomorrow
  - **Orange** (due-2days): Task due in 2 days
  - **Yellow** (due-3days): Task due in 3 days
  - Gray otherwise

### Inline Editing
- Single click to enter edit mode
- Show input fields with current values
- Save buttons (✓) and cancel buttons (✕)
- Esc to cancel
- Enter to save (or Shift+Enter for textareas)
- Auto-cancel on blur if field is empty
- Debounced auto-save for project name/description (500ms)

### Archived Projects
- Cannot create/edit/delete tasks, people, notes
- Cannot toggle funded status
- Read-only view
- Still appear in main content if not hidden

### Personal Project
- Special project (likely auto-created on first load)
- Cannot be archived or deleted
- No People or Notes sections (tasks only)
- Used for personal task tracking

### Suppressed People
- Modal to manage people who should not appear in autocomplete
- Prevents duplicate entries for common names
- Persisted in a separate store

---

## State Shape (UI State Only)

The app tracks ephemeral UI state (routing, editing modes, modal visibility):

```javascript
{
  // Navigation
  currentPage: 'overview' | 'project',
  currentProjectId: string | null,

  // View preferences
  showArchivedProjects: boolean,
  showSuppressedPeopleModal: boolean,

  // Editing state (tracked to prevent multiple editors)
  editingTaskId: string | null,
  editingTaskName: string,
  editingTaskDueDate: string,

  editingPersonId: string | null,
  editingPersonName: string,
  editingPersonRole: string,

  editingNoteId: string | null,
  editingNoteContent: string,
  editingNoteLink: string,

  // Creating state
  creatingTask: boolean,
  creatingPerson: boolean,
  creatingNote: boolean,
  creatingProject: boolean
}
```

**Important:** Projects, tasks, people, and notes are NOT stored in UI state. They are persisted locally and retrieved as needed for display.

---

## Edge Cases & Error Handling

### Network/Persistence Failures
- Display error toast with retry option
- Maintain UI state to allow retry
- Don't clear form until confirmed saved

### Concurrent Edits
- Last write wins (simple timestamp comparison)
- Show warning if data changed since user opened edit

### Empty States
- "No Projects Yet" on Overview with empty project list
- "All tasks complete ✓" on Overview for projects with no open tasks
- Hide People/Notes sections if empty (on Project page)

### Rapid Navigation
- Cancel previous page's data fetches when navigating away
- Abort any in-flight mutations for unmounted pages

---

## Accessibility

- Semantic HTML (buttons, links, forms)
- ARIA labels for icon buttons
- Keyboard navigation: Tab through form fields
- Focus management: Auto-focus name input when editing
- Color not sole indicator of status (use labels)
- Respects `prefers-reduced-motion` for animations

---

## Future Extensibility

### Planned (not MVP)
- Task subtasks/hierarchy
- Task dependencies (blocking)
- Recurring tasks
- Project templates
- Time tracking
- Notifications for due tasks
- Collaboration (sharing, permissions)
- Attachment/file storage
- Rich text for notes (currently markdown links only)
- Tags/labels for tasks and projects

