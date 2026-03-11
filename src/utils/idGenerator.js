// Generate globally unique IDs with semantic prefixes
// Algorithm: prefix_randomChars_timestamp
// Ensures uniqueness and debuggability (can identify entity type by ID prefix)

export function generateId(prefix) {
  return prefix + '_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
