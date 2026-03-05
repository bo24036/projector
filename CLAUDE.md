# Projector - Antigravity Architecture

**Functional, not OOP. Strict UDF. Write-through cache. No build steps.**

See [UI-SPEC.md](UI-SPEC.md) for complete UI design and feature specs.

---

## Data Flow

```
Dispatch intent (past-tense: TASK_TOGGLED)
  ↓ PHASE 1: Sync reducer → nextState + effects
  ↓ PHASE 2: requestAnimationFrame → render
  ↓ PHASE 3: queueMicrotask → effects run
     - Fetch from cache/IDB
     - Apply domain logic
     - Persist (auto-dispatches ENTITY_UPDATED)
  ↓ Cache notifies → smart components re-render
```

---

## Factories (src/domain/*.js)

```javascript
export function createTask(id, overrides = {}) {
  return {
    id, name: '', projectId: null, completed: false, dueDate: null,
    parentTaskId: null, createdAt: Date.now(), updatedAt: Date.now(),
    ...overrides
  };
}

// Pure consequence functions - return new objects
export function toggleCompletion(task) {
  return { ...task, completed: !task.completed, updatedAt: Date.now() };
}

export function updateName(task, name) {
  if (!name?.trim()) throw new Error('Name required');
  return { ...task, name: name.trim(), updatedAt: Date.now() };
}
```

---

## Repositories (src/data/repositories.js)

```javascript
const cache = { tasks: new Map(), projects: new Map(), ... };

export const Tasks = {
  async create(data) {
    const task = createTask(generateId(), data);
    cache.tasks.set(task.id, task);
    await db.tasks.put(task);
    dispatch({ type: 'ENTITY_UPDATED', collection: 'tasks' });
    return task;
  },

  async get(id) {
    if (cache.tasks.has(id)) return cache.tasks.get(id);
    const task = await db.tasks.get(id);
    if (task) cache.tasks.set(id, task);
    return task;
  },

  async set(id, task) {
    cache.tasks.set(id, task);
    await db.tasks.put(task);
    dispatch({ type: 'ENTITY_UPDATED', collection: 'tasks' });
  },

  async delete(id) {
    cache.tasks.delete(id);
    await db.tasks.delete(id);
    dispatch({ type: 'ENTITY_UPDATED', collection: 'tasks' });
  }
};
```

---

## Dispatcher (src/state/dispatcher.js)

```javascript
export function dispatch(action) {
  const { nextState, effects } = reduce(action);
  uiState = nextState;

  requestAnimationFrame(() => notifySubscribers());
  effects.forEach(e => queueMicrotask(() => runEffect(e)));
}

function reduce(action) {
  switch (action.type) {
    case 'TASK_TOGGLED':
      return { nextState: uiState, effects: [{ type: 'TOGGLE_TASK_EFFECT', taskId: action.taskId }] };
    case 'TASK_CREATE_SUBMITTED':
      return { nextState: { ...uiState, creatingTask: false }, effects: [{ type: 'CREATE_TASK_EFFECT', name: action.name, dueDate: action.dueDate }] };
    // ...
    default: return { nextState: uiState, effects: [] };
  }
}

async function runEffect(effect) {
  switch (effect.type) {
    case 'TOGGLE_TASK_EFFECT': await toggleTaskOrchestrator(effect.taskId); break;
    case 'CREATE_TASK_EFFECT': await createTaskOrchestrator(effect); break;
  }
}

export function getState() { return uiState; }
export function subscribe(cb) { subscribers.add(cb); return () => subscribers.delete(cb); }
```

---

## Orchestrators (src/orchestration/*.js)

```javascript
export async function toggleTaskOrchestrator(taskId) {
  const task = await Tasks.get(taskId);
  if (!task) return;

  const updated = toggleCompletion(task);
  await Tasks.set(taskId, updated);
  // Cache dispatch ENTITY_UPDATED automatically
}

export async function createTaskOrchestrator(effect) {
  const projectId = getState().currentProjectId;
  if (!projectId) return;

  const dueDate = effect.dueDate ? parseSmartDate(effect.dueDate) : null;
  await Tasks.create({ name: effect.name, projectId, dueDate });
}
```

---

## Components

**Dumb (presentational):** Pure lit-html functions. Dispatch intents.

```javascript
export function TaskItem({ task, isEditing, editName, editDueDate, onDelete }) {
  if (isEditing) {
    return html`<div class="task-item editing">
      <input @input=${e => dispatch({ type: 'TASK_EDIT_CHANGE', name: e.target.value, dueDate: editDueDate })} />
      <button @click=${() => dispatch({ type: 'TASK_EDIT_SAVED', taskId: task.id, name: editName, dueDate: editDueDate })}>✓</button>
    </div>`;
  }
  return html`<div class="task-item">
    <input type="checkbox" .checked=${task.completed} @change=${() => dispatch({ type: 'TASK_TOGGLED', taskId: task.id })} />
    <span>${task.name}</span>
  </div>`;
}
```

**Smart (containers):** Read state, fetch data, render dumb components.

```javascript
export function TaskListContainer(container) {
  let tasks = [];

  async function loadTasks() {
    tasks = await Tasks.getByProject(getState().currentProjectId);
    renderList();
  }

  function renderList() {
    const state = getState();
    const template = html`<section>
      ${state.creatingTask ? html`<div><input id="task-name" /><button @click=${submit}>✓</button></div>` : html`<div @click=${() => dispatch({ type: 'TASK_CREATE_START' })}>Click to add</div>`}
      ${tasks.filter(t => !t.completed).map(t => TaskItem({ task: t, ... }))}
    </section>`;
    render(template, container);
  }

  return {
    onMount() { subscribe(loadTasks); loadTasks(); },
    onUnmount() { /* unsubscribe */ }
  };
}
```

---

## File Structure

```
src/
├── domain/
│   ├── tasks.js (factories + consequence functions)
│   ├── projects.js
│   ├── people.js
│   └── notes.js
├── data/
│   ├── db.js (IndexedDB setup)
│   └── repositories.js (Tasks, Projects, People, Notes)
├── state/
│   └── dispatcher.js (UDF dispatch + reducer)
├── orchestration/
│   ├── taskOrchestrators.js
│   ├── projectOrchestrators.js
│   ├── personOrchestrators.js
│   └── noteOrchestrators.js
├── components/
│   ├── TaskItem.js (dumb)
│   ├── TaskListContainer.js (smart)
│   ├── Sidebar.js (smart)
│   └── ...
├── pages/
│   ├── OverviewPage.js (smart container)
│   └── ProjectPage.js (smart container)
├── utils/
│   ├── uuid.js
│   ├── date.js
│   └── dom.js
└── styles/
```

---

## DO's and DON'Ts

✅ Factories + consequence functions (pure, immutable)
✅ Dispatch intents from components (past-tense: TASK_TOGGLED)
✅ Orchestrators handle cross-entity logic
✅ Access data via repositories only
✅ Guard clauses everywhere

❌ OOP classes
❌ Store domain data in UI state
❌ Mutate entities directly
❌ Call orchestrators from components
❌ Access IndexedDB directly

---

## Entities

**Project:** id, name, description, funded, archived, isPersonal, createdAt, updatedAt
**Task:** id, name, projectId, completed, dueDate, parentTaskId, createdAt, updatedAt
**Person:** id, name, role, projectId, createdAt, updatedAt
**Note:** id, content, link, projectId, createdAt, updatedAt

---

## Implementation Order

1. IndexedDB setup + domain modules + repositories + dispatcher
2. OverviewPage + ProjectPage + Sidebar
3. Task orchestrators (toggle, create, update, delete)
4. Project orchestrators (rename, archive, toggle funded)
5. People + Notes sections
6. Polish (error handling, loading states)

---

**Start small. Each piece testable. Trust the pattern.**
