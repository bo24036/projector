const state = {
  currentProjectId: null,
  isCreatingProject: false,
};

const watchers = new Map();

export function getState() {
  return state;
}

export function setState(updates) {
  Object.assign(state, updates);
  notifyWatchers();
}

export function watch(key, callback) {
  if (!watchers.has(key)) {
    watchers.set(key, new Set());
  }
  watchers.get(key).add(callback);

  return () => {
    watchers.get(key).delete(callback);
  };
}

function notifyWatchers() {
  for (const [key, callbacks] of watchers.entries()) {
    callbacks.forEach(callback => callback(state[key]));
  }
}

export function dispatch(action) {
  const handler = handlers[action.type];
  if (!handler) {
    console.error(`Unknown action type: ${action.type}`);
    return;
  }

  const { state: nextState, effects } = handler(state, action);
  setState(nextState);

  effects?.forEach(effect => {
    queueMicrotask(effect);
  });
}

const handlers = {};

export function registerHandler(actionType, handler) {
  handlers[actionType] = handler;
}
