import { dispatch, getState } from '../state.js';

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingContext() {
  const el = document.activeElement;
  return INPUT_TAGS.has(el?.tagName) || el?.isContentEditable;
}

export function initKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (isTypingContext()) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const state = getState();
    if (state.currentPage !== 'project') return;

    switch (event.key.toLowerCase()) {
      case 't':
        event.preventDefault();
        dispatch({ type: 'START_CREATE_TASK' });
        break;
      case 'n':
        event.preventDefault();
        dispatch({ type: 'START_CREATE_NOTE' });
        break;
      case 'p':
        event.preventDefault();
        dispatch({ type: 'START_CREATE_PERSON' });
        break;
    }
  });
}
