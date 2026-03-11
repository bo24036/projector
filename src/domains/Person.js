// Import dispatch from local module (always available)
import { dispatch } from '../state.js';

// Import IDB operations from service layer
import { getPersonFromIdb, getPeopleByProjectIdFromIdb, getAllPeopleFromIdb, putPersonToIdb, deletePersonFromIdb } from '../services/IdbService.js';
import { createPersistenceQueue } from '../utils/PersistenceQueue.js';

const personCache = new Map();
const projectIdIndex = new Map(); // Map of projectId -> Set of personIds
let _allPeopleLoaded = false;

const ERROR_PERSON_NOT_FOUND = 'Person not found';

// Generate a GUID for unique person IDs
function generateId() {
  return 'person_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Create persistence queue for write-through IDB operations
const serialize = createPersistenceQueue(
  {
    put: putPersonToIdb,
    delete: deletePersonFromIdb,
  },
  'person'
);

export function createPerson(projectId, name, role, overrides) {
  if (!projectId) {
    throw new Error('projectId is required');
  }

  const personName = (name || '').trim();
  if (!personName) {
    throw new Error('Person name cannot be empty');
  }

  const personRole = (role || '').trim();

  const person = {
    id: generateId(),
    projectId,
    name: personName,
    role: personRole,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };

  personCache.set(person.id, person);

  // Index by projectId
  if (!projectIdIndex.has(projectId)) {
    projectIdIndex.set(projectId, new Set());
  }
  projectIdIndex.get(projectId).add(person.id);

  serialize(person, 'put');
  return person;
}

export function getPerson(id) {
  const cached = personCache.get(id);
  if (cached !== undefined) {
    return cached;
  }

  // Cache miss: queue async fetch from IDB (fire-and-forget)
  queueMicrotask(async () => {
    try {
      const person = await getPersonFromIdb(id);
      if (person) {
        personCache.set(id, person);
        if (!projectIdIndex.has(person.projectId)) {
          projectIdIndex.set(person.projectId, new Set());
        }
        projectIdIndex.get(person.projectId).add(id);
        if (dispatch) {
          dispatch({ type: 'PERSON_LOADED', payload: { person } });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch person ${id}:`, error.message);
    }
  });

  return undefined;
}

export function getPeopleByProjectId(projectId) {
  const personIds = projectIdIndex.get(projectId) || new Set();
  const people = Array.from(personIds)
    .map(id => personCache.get(id))
    .filter(person => person !== undefined);

  // Cache miss: queue async fetch from IDB (fire-and-forget)
  if (people.length === 0 && !projectIdIndex.has(projectId)) {
    queueMicrotask(async () => {
      try {
        const projectPeople = await getPeopleByProjectIdFromIdb(projectId);
        if (projectPeople && projectPeople.length > 0) {
          // Load people into cache
          if (!projectIdIndex.has(projectId)) {
            projectIdIndex.set(projectId, new Set());
          }
          const personIdSet = projectIdIndex.get(projectId);
          for (const person of projectPeople) {
            personCache.set(person.id, person);
            personIdSet.add(person.id);
          }
          if (dispatch) {
            dispatch({ type: 'PERSON_LOADED', payload: { people: projectPeople } });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch people for project ${projectId}:`, error.message);
      }
    });
  }

  // Sort by name alphabetically
  return people.sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllPeopleForAutocomplete() {
  const allPeople = Array.from(personCache.values());

  // If cache is empty and all people haven't been loaded, trigger cache-miss fetch
  if (allPeople.length === 0 && !_allPeopleLoaded) {
    queueMicrotask(async () => {
      try {
        const people = await getAllPeopleFromIdb();
        if (people && people.length > 0) {
          // Load all people into cache
          for (const person of people) {
            personCache.set(person.id, person);
            if (!projectIdIndex.has(person.projectId)) {
              projectIdIndex.set(person.projectId, new Set());
            }
            projectIdIndex.get(person.projectId).add(person.id);
          }
        }
        _allPeopleLoaded = true;
        if (dispatch) {
          dispatch({ type: 'PERSON_LOADED', payload: { people } });
        }
      } catch (error) {
        console.error('Failed to fetch all people for autocomplete:', error.message);
      }
    });
  }

  // Extract unique names and roles from current cache
  const names = [...new Set([...personCache.values()].map(p => p.name))];
  const roles = [...new Set([...personCache.values()].map(p => p.role).filter(r => r))];

  return { names, roles };
}

export async function preloadAllPeople() {
  if (_allPeopleLoaded) return;

  try {
    const people = await getAllPeopleFromIdb();
    if (people && people.length > 0) {
      for (const person of people) {
        personCache.set(person.id, person);
        if (!projectIdIndex.has(person.projectId)) {
          projectIdIndex.set(person.projectId, new Set());
        }
        projectIdIndex.get(person.projectId).add(person.id);
      }
    }
    _allPeopleLoaded = true;
  } catch (error) {
    console.error('Failed to preload all people:', error.message);
  }
}

export function updatePerson(id, updates) {
  const person = getPerson(id);
  if (!person) {
    throw new Error(ERROR_PERSON_NOT_FOUND);
  }

  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) {
      throw new Error('Person name cannot be empty');
    }
    person.name = trimmed;
  }

  if (updates.role !== undefined) {
    person.role = (updates.role || '').trim();
  }

  person.updatedAt = new Date().toISOString();
  serialize(person, 'put');
  return person;
}

export function deletePerson(id) {
  const person = getPerson(id);
  if (!person) {
    throw new Error(ERROR_PERSON_NOT_FOUND);
  }

  personCache.delete(id);
  const projectPeople = projectIdIndex.get(person.projectId);
  if (projectPeople) {
    projectPeople.delete(id);
  }

  serialize(person, 'delete');
  return true;
}

// Test utility - clears cache and resets state
export function _resetCacheForTesting() {
  personCache.clear();
  projectIdIndex.clear();
  _allPeopleLoaded = false;
}
