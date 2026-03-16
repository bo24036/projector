import * as Project from '../domains/Project.js';
import { registerHandler } from '../state.js';
import { createToggleCreateHandler, createNoOpLoadedHandler } from '../utils/handlerFactory.js';

// Factory for simple domain mutation handlers with error handling
function createMutationHandler(actionName, domainFn) {
  return registerHandler(actionName, (state, action) => {
    try {
      domainFn(action.payload);
      return { state };
    } catch (error) {
      // Dispatch error action to notify user
      return {
        state: {
          ...state,
          lastError: {
            actionType: actionName,
            message: error.message,
            entityId: action.payload.projectId,
            timestamp: Date.now(),
          },
        },
      };
    }
  });
}

registerHandler('CREATE_PROJECT', (state, action) => {
  const { name } = action.payload;

  try {
    const project = Project.createProject({ name });
    return { state: { ...state, currentProjectId: project.id, isCreatingProject: false } };
  } catch (error) {
    return {
      state: {
        ...state,
        lastError: {
          actionType: 'CREATE_PROJECT',
          message: error.message,
          timestamp: Date.now(),
        },
      },
    };
  }
});

registerHandler('SELECT_PROJECT', (state, action) => {
  const { projectId } = action.payload;

  // Check if project is archived and auto-expand archived section if needed
  const project = Project.getProject(projectId);
  const showArchived = project?.archived && !state.showArchivedProjects
    ? true
    : state.showArchivedProjects;

  // Update state in single atomic operation
  const nextState = {
    ...state,
    currentPage: 'project',
    currentProjectId: projectId,
    showArchivedProjects: showArchived,
  };

  return { state: nextState };
});

registerHandler('SELECT_OVERVIEW', (state) => {
  return { state: { ...state, currentPage: 'overview', currentProjectId: null } };
});

createMutationHandler('RENAME_PROJECT', ({ projectId, newName }) => {
  Project.renameProject(projectId, newName);
});

createMutationHandler('UPDATE_DESCRIPTION', ({ projectId, description }) => {
  Project.updateDescription(projectId, description);
});

createMutationHandler('UPDATE_NOTES', ({ projectId, notes }) => {
  Project.updateNotes(projectId, notes);
});

createMutationHandler('UPDATE_LINK', ({ projectId, link }) => {
  Project.updateLink(projectId, link);
});

createMutationHandler('DELETE_PROJECT', ({ projectId }) => {
  Project.deleteProject(projectId);
});

registerHandler('ARCHIVE_PROJECT', (state, action) => {
  const { projectId } = action.payload;

  try {
    Project.archiveProject(projectId);
    // Keep project selected and expand archived section to show it
    return { state: { ...state, showArchivedProjects: true } };
  } catch (error) {
    return {
      state: {
        ...state,
        lastError: {
          actionType: 'ARCHIVE_PROJECT',
          message: error.message,
          entityId: projectId,
          timestamp: Date.now(),
        },
      },
    };
  }
});

createMutationHandler('UNARCHIVE_PROJECT', ({ projectId }) => {
  Project.unarchiveProject(projectId);
});

registerHandler('TOGGLE_ARCHIVED_PROJECTS', (state) => {
  return { state: { ...state, showArchivedProjects: !state.showArchivedProjects } };
});

createMutationHandler('TOGGLE_FUNDED', ({ projectId }) => {
  Project.toggleFunded(projectId);
});

// Create START_CREATE_PROJECT and CANCEL_CREATE_PROJECT handlers
createToggleCreateHandler('PROJECT', 'isCreatingProject');

registerHandler('START_EDIT_NOTES', (state) => {
  return { state: { ...state, editingNotes: true } };
});

registerHandler('CANCEL_EDIT_NOTES', (state) => {
  return { state: { ...state, editingNotes: false } };
});

// Create no-op handlers that trigger re-renders when projects are loaded
createNoOpLoadedHandler('PROJECT_LOADED');
createNoOpLoadedHandler('PROJECTS_LOADED');
