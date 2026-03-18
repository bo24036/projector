# ADR 0001: Eager Project Loading, Lazy Task Loading

## Context

The app uses an in-memory cache backed by IndexedDB for all domain data. On startup, the app must decide which data to load eagerly (before rendering) versus lazily (on demand via cache-miss).

Two key domain types have different access patterns:

- **Projects** are needed immediately by the sidebar (to render the project list) and by the router (to determine if a navigated-to project is archived). Without projects, the sidebar renders nothing and routing decisions cannot be made.
- **Tasks** are only needed when a specific project is selected. They are never required during initial load.

## Decision

**Projects are eagerly loaded** at startup via `getAllProjectsAsync()`, which blocks the router initialization until all projects are in cache. All subsequent project reads are synchronous.

**Tasks are lazily loaded** via a cache-miss pattern: `getTasksByProjectId(projectId)` returns an empty array synchronously on first call, queues an async IDB fetch, and dispatches `TASK_LOADED` when complete — triggering a re-render with the real data. Once loaded, a project's tasks stay in cache.

## Rationale

- The sidebar and router require the full project list synchronously on every render and navigation. Lazy loading projects would require skeletons for the sidebar and deferred routing decisions, adding complexity for data that is always needed.
- Tasks per project are accessed only when that project is open. Eager-loading all tasks at startup would increase startup time proportionally to the number of projects and tasks, with no benefit on pages that don't need them.
- The two-step render (skeleton → real data) is acceptable for tasks because the task list is a secondary UI element that appears after the user has already navigated to a project.

## Consequences

- Startup cost is bounded by the number of projects (typically small), not by the total number of tasks.
- The first time a project's tasks are viewed, there is a brief skeleton state while IDB is queried.
- Sidebar task counts and urgency indicators (which call `getTasksByProjectId`) will show zero/gray initially for projects not yet visited, then update automatically as `TASK_LOADED` dispatches trigger re-renders.
- If the task count in the sidebar is important to show correctly at startup, a preload step could be added in future — but is not warranted now.
