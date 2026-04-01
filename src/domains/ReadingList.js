/**
 * ReadingList Domain
 *
 * CACHE LOADING STRATEGY: EAGER (all items loaded at startup)
 * Rationale: Reading list is a global (non-project-scoped) list. Like Projects,
 * it must be available immediately for sidebar unread count and page rendering.
 * preloadAll() is called in main.js before router init.
 */

import { dispatch } from '../state.js';
import {
  getAllReadingListItemsFromIdb,
  putReadingListItemToIdb,
  deleteReadingListItemFromIdb,
} from '../utils/IdbService.js';
import { createPersistenceQueue } from '../utils/PersistenceQueue.js';
import { generateId } from '../utils/idGenerator.js';

const cache = new Map();

const ERROR_ITEM_NOT_FOUND = 'Reading list item not found';
const ERROR_URL_REQUIRED = 'URL is required';
const ERROR_TITLE_REQUIRED = 'Title is required';

function normalizeUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

const serialize = createPersistenceQueue(
  {
    put: putReadingListItemToIdb,
    delete: deleteReadingListItemFromIdb,
  },
  'readingList'
);

// Load all items from IDB into the cache at startup.
export async function preloadAll() {
  const items = await getAllReadingListItemsFromIdb();
  for (const item of items) {
    cache.set(item.id, item);
  }
}

// Factory: create and persist a new reading list item.
// url and title are required. overrides may include notes, recommendedBy, tags.
export function createReadingListItem(url, title, overrides = {}) {
  const trimmedUrl = url?.trim();
  const trimmedTitle = title?.trim();

  if (!trimmedUrl) throw new Error(ERROR_URL_REQUIRED);
  if (!trimmedTitle) throw new Error(ERROR_TITLE_REQUIRED);

  const now = new Date().toISOString();
  const item = {
    id: generateId('rl'),
    url: normalizeUrl(trimmedUrl),
    title: trimmedTitle,
    notes: overrides.notes?.trim() ?? '',
    recommendedBy: overrides.recommendedBy?.trim() ?? '',
    tags: Array.isArray(overrides.tags) ? overrides.tags.map(t => t.trim()).filter(Boolean) : [],
    read: false,
    createdAt: now,
    updatedAt: now,
  };

  cache.set(item.id, item);
  serialize(item, 'put');
  return item;
}

// Synchronous cache lookup. Returns undefined if not found.
export function getReadingListItem(id) {
  return cache.get(id);
}

// Returns all items sorted newest-first by createdAt.
export function getAllReadingListItems() {
  return [...cache.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Update an existing item. Allowed fields: url, title, notes, recommendedBy, tags.
export function updateReadingListItem(id, updates) {
  const item = cache.get(id);
  if (!item) throw new Error(ERROR_ITEM_NOT_FOUND);

  const updated = { ...item, updatedAt: new Date().toISOString() };

  if (updates.url !== undefined) updated.url = normalizeUrl(updates.url.trim());
  if (updates.title !== undefined) {
    const t = updates.title.trim();
    if (!t) throw new Error(ERROR_TITLE_REQUIRED);
    updated.title = t;
  }
  if (updates.notes !== undefined) updated.notes = updates.notes.trim();
  if (updates.recommendedBy !== undefined) updated.recommendedBy = updates.recommendedBy.trim();
  if (updates.tags !== undefined) {
    updated.tags = Array.isArray(updates.tags)
      ? updates.tags.map(t => t.trim()).filter(Boolean)
      : [];
  }

  cache.set(id, updated);
  serialize(updated, 'put');
  return updated;
}

// Mark an item as read.
export function markRead(id) {
  const item = cache.get(id);
  if (!item) throw new Error(ERROR_ITEM_NOT_FOUND);
  const updated = { ...item, read: true, updatedAt: new Date().toISOString() };
  cache.set(id, updated);
  serialize(updated, 'put');
  return updated;
}

// Mark an item as unread.
export function markUnread(id) {
  const item = cache.get(id);
  if (!item) throw new Error(ERROR_ITEM_NOT_FOUND);
  const updated = { ...item, read: false, updatedAt: new Date().toISOString() };
  cache.set(id, updated);
  serialize(updated, 'put');
  return updated;
}

// Delete an item from cache and IDB.
export function deleteReadingListItem(id) {
  if (!cache.has(id)) throw new Error(ERROR_ITEM_NOT_FOUND);
  const item = cache.get(id);
  cache.delete(id);
  serialize(item, 'delete');
}

// Returns a sorted, deduplicated list of all past recommendedBy values (non-empty).
export function getRecommenderOptions() {
  const seen = new Set();
  for (const item of cache.values()) {
    if (item.recommendedBy) seen.add(item.recommendedBy);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

// Returns a sorted, deduplicated list of all tags used across all items.
export function getTagOptions() {
  const seen = new Set();
  for (const item of cache.values()) {
    for (const tag of item.tags) {
      if (tag) seen.add(tag);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

// Testing utility only.
export function _resetCacheForTesting() {
  cache.clear();
}
