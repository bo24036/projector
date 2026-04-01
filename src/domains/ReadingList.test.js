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

const item1 = ReadingList.createReadingListItem('Great article about JS');
const item2 = ReadingList.createReadingListItem('Interesting YouTube video');

assert(item1.id !== item2.id, 'createReadingListItem generates unique IDs');
assert(item1.id.startsWith('rl_'), 'createReadingListItem id has rl_ prefix');
assertEqual(item1.content, 'Great article about JS', 'Item has correct content');
assertEqual(item1.link, '', 'Item link defaults to empty string');
assertEqual(item1.recommendedBy, '', 'Item recommendedBy defaults to empty string');
assert(Array.isArray(item1.tags), 'Item tags defaults to an array');
assertEqual(item1.tags.length, 0, 'Item tags defaults to empty array');
assertEqual(item1.read, false, 'Item read defaults to false');
assert(typeof item1.createdAt === 'string', 'Item has createdAt string');
assert(typeof item1.updatedAt === 'string', 'Item has updatedAt string');

// Whitespace trimming
const trimmed = ReadingList.createReadingListItem('  Trimmed Content  ');
assertEqual(trimmed.content, 'Trimmed Content', 'createReadingListItem trims content whitespace');

// Overrides
const withOverrides = ReadingList.createReadingListItem('Full item', {
  link: 'https://example.com',
  recommendedBy: 'Alice',
  tags: ['javascript', 'web'],
});
assertEqual(withOverrides.link, 'https://example.com', 'createReadingListItem accepts link override');
assertEqual(withOverrides.recommendedBy, 'Alice', 'createReadingListItem accepts recommendedBy override');
assertEqual(withOverrides.tags.length, 2, 'createReadingListItem accepts tags override');
assertEqual(withOverrides.tags[0], 'javascript', 'createReadingListItem stores first tag');
assertEqual(withOverrides.tags[1], 'web', 'createReadingListItem stores second tag');

// Validation: missing content
try {
  ReadingList.createReadingListItem('');
  assert(false, 'createReadingListItem throws when content is empty');
} catch (e) {
  assertEqual(e.message, 'Content is required', 'createReadingListItem throws correct message for empty content');
}

try {
  ReadingList.createReadingListItem('   ');
  assert(false, 'createReadingListItem throws when content is whitespace-only');
} catch (e) {
  assertEqual(e.message, 'Content is required', 'createReadingListItem throws for whitespace-only content');
}

// --- Link normalization Tests ---
console.log('\n=== Link Normalization Tests ===');

ReadingList._resetCacheForTesting();

const bareUrl = ReadingList.createReadingListItem('Bare URL item', { link: 'example.com' });
assertEqual(bareUrl.link, 'https://example.com', 'createReadingListItem normalizes bare URL with https://');

const httpUrl = ReadingList.createReadingListItem('HTTP item', { link: 'http://example.com' });
assertEqual(httpUrl.link, 'http://example.com', 'createReadingListItem preserves http:// protocol');

const httpsUrl = ReadingList.createReadingListItem('HTTPS item', { link: 'https://example.com/path' });
assertEqual(httpsUrl.link, 'https://example.com/path', 'createReadingListItem preserves https:// protocol');

const noLink = ReadingList.createReadingListItem('No link item');
assertEqual(noLink.link, '', 'createReadingListItem stores empty string for no link');

const mdLink = ReadingList.createReadingListItem('Markdown item', { link: '[Google](google.com)' });
assertEqual(mdLink.link, '[Google](https://google.com)', 'createReadingListItem normalizes URL inside markdown syntax');

const mdFull = ReadingList.createReadingListItem('Markdown full', { link: '[Google](https://google.com)' });
assertEqual(mdFull.link, '[Google](https://google.com)', 'createReadingListItem preserves https:// inside markdown syntax');

// --- parseLinkField Tests ---
console.log('\n=== parseLinkField Tests ===');

assertEqual(ReadingList.parseLinkField(''), null, 'parseLinkField returns null for empty string');
assertEqual(ReadingList.parseLinkField('   '), null, 'parseLinkField returns null for whitespace-only');
assertEqual(ReadingList.parseLinkField(null), null, 'parseLinkField returns null for null');

const plainResult = ReadingList.parseLinkField('https://example.com');
assertEqual(plainResult.url, 'https://example.com', 'parseLinkField plain URL: url correct');
assertEqual(plainResult.label, null, 'parseLinkField plain URL: label is null');

const mdResult = ReadingList.parseLinkField('[Google](https://google.com)');
assertEqual(mdResult.url, 'https://google.com', 'parseLinkField markdown: url correct');
assertEqual(mdResult.label, 'Google', 'parseLinkField markdown: label correct');

const mdTrimResult = ReadingList.parseLinkField('[  My Label  ](https://example.com)');
assertEqual(mdTrimResult.label, 'My Label', 'parseLinkField markdown: label trimmed');

// --- Cache Tests ---
console.log('\n=== Cache Tests ===');

ReadingList._resetCacheForTesting();
const cacheItem = ReadingList.createReadingListItem('Cache test item');

const cached = ReadingList.getReadingListItem(cacheItem.id);
assert(cached !== undefined, 'getReadingListItem returns item for known id');
assertEqual(cached.id, cacheItem.id, 'getReadingListItem returns correct item');

const miss = ReadingList.getReadingListItem('rl_nonexistent_000');
assertEqual(miss, undefined, 'getReadingListItem returns undefined for unknown id');

// --- getAllReadingListItems Tests ---
console.log('\n=== getAllReadingListItems Tests ===');

ReadingList._resetCacheForTesting();

const itemA = ReadingList.createReadingListItem('Item A');
itemA.createdAt = '2024-01-01T00:00:00.000Z';
const itemB = ReadingList.createReadingListItem('Item B');
itemB.createdAt = '2024-06-01T00:00:00.000Z';

const all = ReadingList.getAllReadingListItems();
assert(Array.isArray(all), 'getAllReadingListItems returns an array');
assertEqual(all.length, 2, 'getAllReadingListItems returns all items');
assert(
  all.findIndex(i => i.id === itemB.id) < all.findIndex(i => i.id === itemA.id),
  'getAllReadingListItems sorts newest-first'
);

// --- markRead / markUnread Tests ---
console.log('\n=== markRead / markUnread Tests ===');

ReadingList._resetCacheForTesting();

const readItem = ReadingList.createReadingListItem('Read me');
assertEqual(readItem.read, false, 'Item starts as unread');

const afterRead = ReadingList.markRead(readItem.id);
assertEqual(afterRead.read, true, 'markRead sets read to true');
assertEqual(ReadingList.getReadingListItem(readItem.id).read, true, 'markRead updates cache');

const afterUnread = ReadingList.markUnread(readItem.id);
assertEqual(afterUnread.read, false, 'markUnread sets read to false');
assertEqual(ReadingList.getReadingListItem(readItem.id).read, false, 'markUnread updates cache');

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

const toUpdate = ReadingList.createReadingListItem('Original content', {
  link: 'https://original.com',
  recommendedBy: 'Bob',
  tags: ['tag1'],
});

const updated = ReadingList.updateReadingListItem(toUpdate.id, { content: 'Updated content' });
assertEqual(updated.content, 'Updated content', 'updateReadingListItem updates content');
assertEqual(updated.link, 'https://original.com', 'updateReadingListItem preserves link when not in updates');

const updatedLink = ReadingList.updateReadingListItem(toUpdate.id, { link: 'new.com' });
assertEqual(updatedLink.link, 'https://new.com', 'updateReadingListItem normalizes updated link');

const updatedRecommender = ReadingList.updateReadingListItem(toUpdate.id, { recommendedBy: 'Carol' });
assertEqual(updatedRecommender.recommendedBy, 'Carol', 'updateReadingListItem updates recommendedBy');

const updatedTags = ReadingList.updateReadingListItem(toUpdate.id, { tags: ['a', 'b', 'c'] });
assertEqual(updatedTags.tags.length, 3, 'updateReadingListItem updates tags');
assertEqual(updatedTags.tags[0], 'a', 'updateReadingListItem stores first updated tag');

const clearedLink = ReadingList.updateReadingListItem(toUpdate.id, { link: '' });
assertEqual(clearedLink.link, '', 'updateReadingListItem can clear link to empty string');

const mdUpdated = ReadingList.updateReadingListItem(toUpdate.id, { link: '[Updated](updated.com)' });
assertEqual(mdUpdated.link, '[Updated](https://updated.com)', 'updateReadingListItem normalizes URL inside markdown syntax');

try {
  ReadingList.updateReadingListItem(toUpdate.id, { content: '' });
  assert(false, 'updateReadingListItem throws when content becomes empty');
} catch (e) {
  assertEqual(e.message, 'Content is required', 'updateReadingListItem throws correct message for empty content');
}

try {
  ReadingList.updateReadingListItem('rl_nonexistent', { content: 'x' });
  assert(false, 'updateReadingListItem throws for unknown id');
} catch (e) {
  assertEqual(e.message, 'Reading list item not found', 'updateReadingListItem throws correct message for unknown id');
}

// --- Delete Tests ---
console.log('\n=== Delete Tests ===');

ReadingList._resetCacheForTesting();

const delA = ReadingList.createReadingListItem('Item A');
const delB = ReadingList.createReadingListItem('Item B');

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

ReadingList.createReadingListItem('Item A', { recommendedBy: 'Alice', tags: ['js', 'web'] });
ReadingList.createReadingListItem('Item B', { recommendedBy: 'Bob', tags: ['web', 'css'] });
ReadingList.createReadingListItem('Item C', { recommendedBy: 'Alice', tags: ['js'] });
ReadingList.createReadingListItem('Item D', { recommendedBy: '' });

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
