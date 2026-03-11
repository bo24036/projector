// Factory for creating common handler patterns
import { registerHandler } from '../state.js';

/**
 * Creates START and CANCEL handlers for a creation toggle state.
 * Automatically registers both handlers with naming convention:
 * - START_CREATE_{entityType}
 * - CANCEL_CREATE_{entityType}
 *
 * @param {string} entityType - Entity type (Task, Person, Project) for action name
 * @param {string} stateKey - State key to toggle (creatingTask, creatingPerson, isCreatingProject)
 *
 * @example
 * createToggleCreateHandler('TASK', 'creatingTask');
 * // Registers: START_CREATE_TASK and CANCEL_CREATE_TASK
 */
export function createToggleCreateHandler(entityType, stateKey) {
  registerHandler(`START_CREATE_${entityType}`, (state) => {
    return { state: { ...state, [stateKey]: true } };
  });

  registerHandler(`CANCEL_CREATE_${entityType}`, (state) => {
    return { state: { ...state, [stateKey]: false } };
  });
}
