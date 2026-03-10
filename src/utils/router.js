import { dispatch } from '../state.js';

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

function handleRouteChange() {
  const hash = window.location.hash;

  // Parse #project/projectId/{id} as per UI-SPEC
  if (hash.startsWith('#project/projectId/')) {
    const projectId = hash.replace('#project/projectId/', '');
    if (projectId) {
      dispatch({ type: 'SELECT_PROJECT', payload: { projectId } });
      return;
    }
  }

  // Navigate to overview for anything else
  dispatch({ type: 'SELECT_PROJECT', payload: { projectId: null } });
}

export function navigateToProject(projectId) {
  window.location.hash = `#project/projectId/${projectId}`;
}

export function navigateToList() {
  window.location.hash = '';
}
