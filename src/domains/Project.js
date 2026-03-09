// Conditional import for idb - only available in browser
let openDB;
if (typeof window !== 'undefined') {
  // Browser environment - import from CDN
  import('https://cdn.jsdelivr.net/npm/idb@7/+esm').then(module => {
    openDB = module.openDB;
  });
}

const projectCache = new Map();
const writeQueue = new Map(); // Tracks queued IDs to prevent concurrent writes
let nextId = 1;
let db = null;

const ERROR_PROJECT_NOT_FOUND = 'Project not found';

async function getDB() {
  // Skip IDB in Node.js test environment
  if (!openDB) return null;

  if (db) return db;
  db = await openDB('projector', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
    },
  });
  return db;
}

// Fetch a project from IDB. Returns undefined if not found.
// In Node.js test environment where IDB is unavailable, returns undefined.
export async function getItem(id) {
  const database = await getDB();
  if (!database) return undefined;
  return database.get('projects', id);
}

// Queue a write to IDB. If already queued, replaces the previous write.
// This ensures deduplication: rapid mutations to the same ID result in one final write.
// Skips IDB in Node.js test environment where it's unavailable.
function serialize(project, operation) {
  const id = project.id;

  // If this ID is already queued, just mark for requeue on completion
  // The next microtask will handle the final state
  if (writeQueue.has(id)) {
    writeQueue.set(id, { project, operation });
    return;
  }

  // Mark this ID as queued
  writeQueue.set(id, { project, operation });

  // Schedule the actual write as a microtask
  queueMicrotask(async () => {
    const queued = writeQueue.get(id);
    if (!queued) return; // Should not happen, but safe guard

    writeQueue.delete(id);

    try {
      const database = await getDB();
      if (!database) return; // IDB not available (Node.js test environment)

      if (queued.operation === 'delete') {
        await database.delete('projects', id);
      } else {
        await database.put('projects', queued.project);
      }
    } catch (error) {
      console.error(`Failed to persist project ${id}:`, error.message);
      // Cache is already correct; silent failure acceptable for routine mutations
    }
  });
}

export function createProject(overrides = {}) {
  const name = overrides.name || '';

  if (!name.trim()) {
    throw new Error('Project name cannot be empty');
  }

  const trimmedName = name.trim();
  const allProjects = getAllProjects();

  if (allProjects.some(p => p.name === trimmedName)) {
    throw new Error('Project name already exists');
  }

  const project = {
    id: nextId++,
    name: trimmedName,
    description: overrides.description || '',
    createdAt: overrides.createdAt || new Date().toISOString(),
  };

  projectCache.set(project.id, project);
  serialize(project, 'put');
  return project;
}

export function getProject(id) {
  return projectCache.get(id);
}

export function getAllProjects() {
  return Array.from(projectCache.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function renameProject(id, newName) {
  if (!newName?.trim()) {
    throw new Error('Project name cannot be empty');
  }

  const trimmedName = newName.trim();
  const allProjects = getAllProjects();

  if (allProjects.some(p => p.id !== id && p.name === trimmedName)) {
    throw new Error('Project name already exists');
  }

  const project = getProject(id);
  if (!project) {
    throw new Error(ERROR_PROJECT_NOT_FOUND);
  }

  project.name = trimmedName;
  serialize(project, 'put');
  return project;
}

export function updateDescription(id, description) {
  const project = getProject(id);
  if (!project) {
    throw new Error(ERROR_PROJECT_NOT_FOUND);
  }

  project.description = description || '';
  serialize(project, 'put');
  return project;
}

export function deleteProject(id) {
  const project = getProject(id);
  if (!project) {
    throw new Error(ERROR_PROJECT_NOT_FOUND);
  }

  projectCache.delete(id);
  serialize(project, 'delete');
  return true;
}

// Test utility - clears cache and resets ID counter
export function _resetCacheForTesting() {
  projectCache.clear();
  nextId = 1;
}
