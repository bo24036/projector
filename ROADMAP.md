# Development Roadmap

This document tracks implementation phases and deferred work, clarifying which architectural patterns in CLAUDE.md are active now vs. reserved for future iterations.

---

## Iteration 1: In-Memory Project CRUD ✅ Complete

**Scope:**
- Project CRUD (Create, Read, Update, Delete) operations
- In-memory cache (synchronous mutations only)
- Single root render pattern with rAF batching
- Hash-based routing (#project/{id})
- Dumb components + smart connectors architecture
- Basic styling with CSS Grid/Flexbox

---

## Iteration 2: IndexedDB Persistence ✅ Complete

**Scope:**
- Write-through cache: mutations update RAM + trigger async IDB saves
- Per-ID write-queue deduplication (prevent "last write wins")
- Cache-miss fetch pattern: synchronous getProject/getAllProjects return undefined + queue async fetch
- Fulfillment dispatch (PROJECT_LOADED, PROJECTS_LOADED) to re-render when IDB data arrives
- Two-step render process (skeleton while loading)
- ID counter initialization on app startup (prevent ID collisions after refresh)

**Implemented:**
- `Project.serialize()` with writeQueue per-ID deduplication
- `Project.getProject(id)` and `Project.getAllProjects()` with cache-miss async fetch
- `Project.initializeIdCounter()` reads max ID from IDB on startup
- `Project.getItem(id)` export for IDB reads
- Fulfillment handlers: PROJECT_LOADED, PROJECTS_LOADED

---

## Iteration 3: Tasks (Planned)

**Scope:**
- Task domain: factory, CRUD operations, persistence via IDB
- Task queries: completion status, due date parsing, urgency calculation
- Inline task list in project detail (create/edit/delete/complete inline)
- Task filtering by completion status
- Due date parsing: natural language (+5 days, tomorrow, 2025-02-25)
- Color-coded due date urgency (red = today/tomorrow)

**Dependencies:**
- Iteration 2 (persistence layer)

**Deferred to later:**
- Task scheduling/reminders
- Task ordering/prioritization
- Task subtasks

---

## Iteration 4: Notes (Planned)

**Scope:**
- Note domain: factory, CRUD operations, persistence via IDB
- Markdown content support (preview optional)
- Inline note list in project detail (create/edit/delete inline)
- Optional links between notes

**Dependencies:**
- Iteration 2 (persistence layer)

**Deferred to later:**
- Note search/filtering
- Note linking UI
- Note templates

---

## Iteration 5: People (Planned)

**Scope:**
- Person domain: factory, CRUD operations, persistence via IDB
- Role assignment (optional, or simple string)
- Inline people list in project detail (create/edit/delete inline, but NOT in Personal project)
- Suppressed autocomplete modal (prevent duplicate people entries)

**Dependencies:**
- Iteration 2 (persistence layer)

**Deferred to later:**
- Person skills/expertise
- Team view
- People search

---

## Iteration 6: Project Archive (Planned)

**Scope:**
- Archive action on project (soft-delete pattern)
- Archived projects: read-only in UI (no edit/delete)
- Toggle to show/hide archived projects in sidebar
- Archived state persisted in IDB

**Dependencies:**
- Iteration 2 (persistence layer)

---

## Iteration 7: Overview Page (Planned)

**Scope:**
- New page: #overview showing all projects in grid or list
- Project cards: name, description, task/note/people count
- Filter/search by project name
- Archive toggle applies here too
- Sidebar link to Overview

**Dependencies:**
- Iteration 2 (persistence layer)
- Iteration 3-5 (to show task/note/people counts)

---

## Iteration 8: Service Worker & Offline (Planned - Last)

**Scope:**
- Service Worker registration & caching
- NetworkFirst cache strategy for JS/CSS
- Offline-first data access (read from IDB, write to IDB)
- Cache invalidation via SW_VERSION in main.js

**Why Last:**
- Service Worker is purely a performance/offline optimization
- It depends on all data entities being stable (Projects, Tasks, Notes, People)
- No new architecture patterns needed; existing IDB write-through works offline

**CLAUDE.md Sections That Will Activate:**
- Service Worker & Cache Strategy

---

## Architectural Notes

**Cache Behavior (Iterations 2+):**
- `Domain.get(id)` synchronous, returns undefined on cache miss
- Cache miss queues async IDB fetch via `queueMicrotask`
- Fetch completes, populates cache, dispatches fulfillment action
- Component re-renders with fresh data from cache

**State Structure (All Iterations):**
- UI state only: routing, creating/editing flags, selections
- NO domain data in state (projects/tasks/notes/people live in IDB + domain cache)

**Persistence (Iterations 2+):**
- Mutations synchronously update cache
- Async microtask writes to IDB (fire-and-forget)
- Per-ID write queue prevents concurrent writes to same entity
- On page refresh: initializeIdCounter() + cache-miss fetches reload data from IDB

---

## How to Use This Document

**When starting a new iteration:**
1. Update the status line (✅ Complete, 🚀 In Progress, or ⏳ Planned)
2. Review scope—don't implement deferred items
3. Refer to CLAUDE.md for architecture guidance
4. Add domain folder (e.g., `src/domains/Task.js`) following the Projects pattern

**When deferring a feature:**
1. Add it to the "Deferred to later" section with rationale
2. Document any architectural decisions that depend on it
3. Link from CLAUDE.md sections if relevant
