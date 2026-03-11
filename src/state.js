const state = {
  currentPage: 'overview',
  currentProjectId: null,
  isCreatingProject: false,
  showArchivedProjects: false,
  creatingTask: false,
  editingTaskId: null,
  editingTaskName: '',
  editingTaskDueDate: '',
};

let renderScheduled = false;
let pendingStateUpdates = {};
let rootRenderer = null;

export function getState() {
  return state;
}

export function setRootRenderer(fn) {
  rootRenderer = fn;
}

function setState(updates) {
  // Synchronously apply updates to state so effects and subsequent handlers see updated values
  console.log('[setState] Applying updates to state:', updates);
  Object.assign(state, updates);
  console.log('[setState] State after sync update:', state);

  // Collect updates for batched render scheduling
  Object.assign(pendingStateUpdates, updates);

  // If render already scheduled, all pending updates will be applied in the next frame
  if (renderScheduled) {
    console.log('[setState] Render already scheduled, just collected updates');
    return;
  }

  // Schedule render for next animation frame
  renderScheduled = true;
  console.log('[setState] Scheduling rAF');
  requestAnimationFrame(() => {
    console.log('[setState] rAF callback executing, clearing tracked updates and calling renderer');
    pendingStateUpdates = {};
    renderScheduled = false;

    // Call root renderer after state is updated
    if (rootRenderer) {
      rootRenderer();
    }
  });
}

export function dispatch(action) {
  console.log('[dispatch] Action:', action.type, 'Current renderScheduled:', renderScheduled);
  const handler = handlers[action.type];
  if (!handler) {
    console.error(`Unknown action type: ${action.type}`);
    return;
  }

  const { state: nextState, effects } = handler(state, action);
  console.log('[dispatch] Handler returned state:', nextState);
  setState(nextState);

  effects?.forEach(effect => {
    console.log('[dispatch] Queueing microtask effect for:', action.type);
    queueMicrotask(effect);
  });
}

const handlers = {};

export function registerHandler(actionType, handler) {
  handlers[actionType] = handler;
}
