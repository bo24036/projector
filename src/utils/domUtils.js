// DOM utility functions for components

/**
 * Generates a unique datalist ID suitable for HTML5 list attribute.
 * Uses random component to ensure uniqueness across component instances.
 *
 * @param {string} prefix - Prefix for the ID (e.g., 'person-names-list')
 * @returns {string} Unique ID like 'person-names-list-abc123def'
 *
 * @example
 * const nameListId = makeDatalistId('person-names-list');
 * // Returns: 'person-names-list-a7b2c9e1' (different each call)
 */
export function makeDatalistId(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
