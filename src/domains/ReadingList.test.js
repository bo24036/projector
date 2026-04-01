import * as ReadingList from './ReadingList.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  } else {
    console.log(`✓ ${message}`);
    testsPassed++;
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

// --- Factory Tests ---
console.log('\n=== Factory Tests ===');

const item1 = ReadingList.createReadingListItem('https://example.com', 'Example Article');
const item2 = ReadingList.createReadingListItem('https://youtube.com/watch?v=abc', 'Great Video');

assert(item1.id !== item2.id, 'createReadingListItem generates unique IDs');
assert(item1.id.startsWith('rl_'), 'createReadingListItem id has rl_ prefix');
assertEqual(item1.url, 'https://example.com', 'Item has correct url');
assertEqual(item1.title, 'Example Article', 'Item has correct title');
assertEqual(item1.notes, '', 'Item notes defaults to empty string');
assertEqual(item1.recommendedBy, '', 'Item recommendedBy defaults to empty string');
assert(Array.isArray(item1.tags), 'Item tags defaults to an array');
assertEqual(item1.tags.length, 0, 'Item tags defaults to empty array');
assertEqual(item1.read, false, 'Item read defaults to false');
assert(typeof item1.createdAt === 'string', 'Item has createdAt string');
assert(typeof item1.updatedAt === 'string', 'Item has updatedAt string');

// URL normalization
const bareUrl = ReadingList.createReadingListItem('example.com', 'Bare URL');
assertEqual(bareUrl.url, 'https://example.com', 'createReadingListItem normalizes bare URL with https://');

const httpUrl = ReadingList.createReadingListItem('http://example.com', 'HTTP URL');
assertEqual(httpUrl.url, 'http://example.com', 'createReadingListItem preserves http:// protocol');

const httpsUrl = ReadingList.createReadingListItem('https://example.com/path', 'HTTPS URL');
assertEqual(httpsUrl.url, 'https://example.com/path', 'createReadingListItem preserves https:// protocol');

// Whitespace trimming
const trimmed = ReadingList.createReadingListItem('  https://trim.com  ', '  Trimmed Title  ');
assertEqual(trimmed.url, 'https://trim.com', 'createReadingListItem trims url whitespace');
assertEqual(trimmed.title, 'Trimmed Title', 'createReadingListItem trims title whitespace');

// Overrides
const withOverrides = ReadingList.createReadingListItem('https://example.com', 'Overrides', {
  notes: 'Great read',
  recommendedBy: 'Alice',
  tags: ['javascript', 'web'],
});
assertEqual(withOverrides.notes, 'Great read', 'createReadingListItem accepts notes override');
assertEqual(withOverrides.recommendedBy, 'Alice', 'createReadingListItem accepts recommendedBy override');
assertEqual(withOverrides.tags.length, 2, 'createReadingListItem accepts tags override');
assertEqual(withOverrides.tags[0], 'javascript', 'createReadingListItem stores first tag');
assertEqual(withOverrides.tags[1], 'web', 'createReadingListItem stores second tag');

// Validation: missing url
try {
  ReadingList.createReadingListItem('', 'Title');
  assert(false, 'createReadingListItem throws when url is empty');
} catch (e) {
  assertEqual(e.message, 'URL is required', 'createReadingListItem throws correct message for empty url');
}

try {
  ReadingList.createReadingListItem('   ', 'Title');
  assert(false, 'createReadingListItem throws when url is whitespace-only');
} catch (e) {
  assertEqual(e.message, 'URL is required', 'createReadingListItem throws for whitespace-only url');
}

// Validation: missing title
try {
  ReadingList.createReadingListItem('https://example.com', '');
  assert(false, 'createReadingListItem throws when title is empty');
} catch (e) {
  assertEqual(e.message, 'Title is required', 'createReadingListItem throws correct message for empty title');
}

try {
  ReadingList.createReadingListItem('https://example.com', '   ');
  assert(false, 'createReadingListItem throws when title is whitespace-only');
} catch (e) {
  assertEqual(e.message, 'Title is required', 'createReadingListItem throws for whitespace-only title');
}

// --- Cache Tests ---
console.log('\n=== Cache Tests ===');

const cached = ReadingList.getReadingListItem(item1.id);
assert(cached !== undefined, 'getReadingListItem returns item for known id');
assertEqual(cached.id, item1.id, 'getReadingListItem returns correct item');

const miss = ReadingList.getReadingListItem('rl_nonexistent_000');
assertEqual(miss, undefined, 'getReadingListItem returns undefined for unknown id');

// --- getAllReadingListItems Tests ---
console.log('\n=== getAllReadingListItems Tests ===');

ReadingList._resetCacheForTesting();

const itemA = ReadingList.createReadingListItem('https://a.com', 'Item A');
// Force different createdAt by mutating (simulates items added at different times)
itemA.createdAt = '2024-01-01T00:00:00.000Z';
const itemB = ReadingList.createReadingListItem('https://b.com', 'Item B');
itemB.createdAt = '2024-06-01T00:00:00.000Z';

const all = ReadingList.getAllReadingListItems();
assert(Array.isArray(all), 'getAllReadingListItems returns an array');
assertEqual(all.length, 2, 'getAllReadingListItems returns all items');
// Newest-first: itemB (June) before itemA (January)
assert(
  all.findIndex(i => i.id === itemB.id) < all.findIndex(i => i.id === itemA.id),
  'getAllReadingListItems sorts newest-first'
);

// --- markRead / markUnread Tests ---
console.log('\n=== markRead / markUnread Tests ===');

ReadingList._resetCacheForTesting();

const readItem = ReadingList.createReadingListItem('https://read.com', 'Read Me');
assertEqual(readItem.read, false, 'Item starts as unread');

const afterRead = ReadingList.markRead(readItem.id);
assertEqual(afterRead.read, true, 'markRead sets read to true');
assertEqual(ReadingList.getReadingListItem(readItem.id).read, true, 'markRead updates cache');

const afterUnread = ReadingList.markUnread(readItem.id);
assertEqual(afterUnread.read, false, 'markUnread sets read to false');
assertEqual(ReadingList.getReadingListItem(readItem.id).read, false, 'markUnread updates cache');

// markRead/markUnread throw for unknown id
try {
  ReadingList.markRead('rl_nonexistent');
  assert(false, 'markRead throws for unknown id');
} catch (e) {
  assertEqual(e.message, 'Reading list item not found', 'markRead throws correct message');
}

try {
  ReadingList.markUnread('rl_nonexistent');
  assert(false, 'markUnread throws for unknown id');
} catch (e) {
  assertEqual(e.message, 'Reading list item not found', 'markUnread throws correct message');
}

// --- Update Tests ---
console.log('\n=== Update Tests ===');

ReadingList._resetCacheForTesting();

const toUpdate = ReadingList.createReadingListItem('https://original.com', 'Original Title', {
  notes: 'Original notes',
  recommendedBy: 'Bob',
  tags: ['tag1'],
});

const updated = ReadingList.updateReadingListItem(toUpdate.id, { title: 'Updated Title' });
assertEqual(updated.title, 'Updated Title', 'updateReadingListItem updates title');
assertEqual(updated.url, 'https://original.com', 'updateReadingListItem preserves url when not in updates');
assertEqual(updated.notes, 'Original notes', 'updateReadingListItem preserves notes when not in updates');

const updatedUrl = ReadingList.updateReadingListItem(toUpdate.id, { url: 'new.com' });
assertEqual(updatedUrl.url, 'https://new.com', 'updateReadingListItem normalizes updated url');

const updatedNotes = ReadingList.updateReadingListItem(toUpdate.id, { notes: 'New notes' });
assertEqual(updatedNotes.notes, 'New notes', 'updateReadingListItem updates notes');

const updatedRecommender = ReadingList.updateReadingListItem(toUpdate.id, { recommendedBy: 'Carol' });
assertEqual(updatedRecommender.recommendedBy, 'Carol', 'updateReadingListItem updates recommendedBy');

const updatedTags = ReadingList.updateReadingListItem(toUpdate.id, { tags: ['a', 'b', 'c'] });
assertEqual(updatedTags.tags.length, 3, 'updateReadingListItem updates tags');
assertEqual(updatedTags.tags[0], 'a', 'updateReadingListItem stores first updated tag');

// Empty title throws
try {
  ReadingList.updateReadingListItem(toUpdate.id, { title: '' });
  assert(false, 'updateReadingListItem throws when title becomes empty');
} catch (e) {
  assertEqual(e.message, 'Title is required', 'updateReadingListItem throws correct message for empty title');
}

// Unknown id throws
try {
  ReadingList.updateReadingListItem('rl_nonexistent', { title: 'x' });
  assert(false, 'updateReadingListItem throws for unknown id');
} catch (e) {
  assertEqual(e.message, 'Reading list item not found', 'updateReadingListItem throws correct message for unknown id');
}

// --- Delete Tests ---
console.log('\n=== Delete Tests ===');

ReadingList._resetCacheForTesting();

const delA = ReadingList.createReadingListItem('https://a.com', 'Item A');
const delB = ReadingList.createReadingListItem('https://b.com', 'Item B');

ReadingList.deleteReadingListItem(delA.id);
assertEqual(ReadingList.getReadingListItem(delA.id), undefined, 'deleteReadingListItem removes item from cache');
assertEqual(ReadingList.getAllReadingListItems().length, 1, 'deleteReadingListItem does not affect other items');
assertEqual(ReadingList.getAllReadingListItems()[0].id, delB.id, 'Remaining item is correct after delete');

try {
  ReadingList.deleteReadingListItem('rl_nonexistent');
  assert(false, 'deleteReadingListItem throws for unknown id');
} catch (e) {
  assertEqual(e.message, 'Reading list item not found', 'deleteReadingListItem throws correct message');
}

// --- Autocomplete Tests ---
console.log('\n=== Autocomplete Tests ===');

ReadingList._resetCacheForTesting();

ReadingList.createReadingListItem('https://a.com', 'Item A', { recommendedBy: 'Alice', tags: ['js', 'web'] });
ReadingList.createReadingListItem('https://b.com', 'Item B', { recommendedBy: 'Bob', tags: ['web', 'css'] });
ReadingList.createReadingListItem('https://c.com', 'Item C', { recommendedBy: 'Alice', tags: ['js'] });
ReadingList.createReadingListItem('https://d.com', 'Item D', { recommendedBy: '' });

const recommenders = ReadingList.getRecommenderOptions();
assert(Array.isArray(recommenders), 'getRecommenderOptions returns array');
assertEqual(recommenders.length, 2, 'getRecommenderOptions deduplicates recommenders');
assertEqual(recommenders[0], 'Alice', 'getRecommenderOptions sorted: Alice first');
assertEqual(recommenders[1], 'Bob', 'getRecommenderOptions sorted: Bob second');
assert(!recommenders.includes(''), 'getRecommenderOptions excludes empty strings');

const tags = ReadingList.getTagOptions();
assert(Array.isArray(tags), 'getTagOptions returns array');
assertEqual(tags.length, 3, 'getTagOptions deduplicates tags across items');
assertEqual(tags[0], 'css', 'getTagOptions sorted: css first');
assertEqual(tags[1], 'js', 'getTagOptions sorted: js second');
assertEqual(tags[2], 'web', 'getTagOptions sorted: web third');

// --- _resetCacheForTesting Tests ---
console.log('\n=== Reset Tests ===');

ReadingList._resetCacheForTesting();
assertEqual(ReadingList.getAllReadingListItems().length, 0, '_resetCacheForTesting clears all items');
assertEqual(ReadingList.getRecommenderOptions().length, 0, '_resetCacheForTesting clears autocomplete options');

// --- Summary ---
console.log(`\n=== Test Summary ===`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
}
