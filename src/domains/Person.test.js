import * as Person from './Person.js';

// Test utilities
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
  assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
}

function assertDeepEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

function assertIncludes(arr, value, message) {
  assert(arr.includes(value), `${message} (expected array to include ${value}, got ${JSON.stringify(arr)})`);
}

// Factory Tests
console.log('\n=== Factory Tests ===');

const projectId1 = 'project_123';
const projectId2 = 'project_456';

// Test: createPerson generates unique IDs
const person1 = Person.createPerson(projectId1, 'Alice', 'Developer');
const person2 = Person.createPerson(projectId1, 'Bob', 'Designer');
assert(person1.id !== person2.id, 'createPerson generates unique IDs');
assert(person1.id.startsWith('person_'), 'Person IDs are prefixed with "person_"');

// Test: createPerson with empty name throws
try {
  Person.createPerson(projectId1, '   ', 'Role');
  assert(false, 'createPerson throws on empty name');
} catch (e) {
  assert(e.message === 'Person name cannot be empty', 'createPerson throws on empty name');
}

// Test: createPerson with missing projectId throws
try {
  Person.createPerson(null, 'Alice', 'Developer');
  assert(false, 'createPerson throws on missing projectId');
} catch (e) {
  assert(e.message === 'projectId is required', 'createPerson throws on missing projectId');
}

// Test: createPerson initializes required fields
assert(person1.projectId === projectId1, 'Person has correct projectId');
assert(person1.name === 'Alice', 'Person has correct name');
assert(person1.role === 'Developer', 'Person has correct role');
assert(person1.createdAt !== undefined, 'Person has createdAt');
assert(person1.updatedAt !== undefined, 'Person has updatedAt');

// Test: createPerson with empty role
const personNoRole = Person.createPerson(projectId1, 'Charlie', '');
assert(personNoRole.role === '', 'Person role defaults to empty string');

// Test: createPerson trims whitespace
const personTrimmed = Person.createPerson(projectId1, '  Alice  ', '  Developer  ');
assertEqual(personTrimmed.name, 'Alice', 'createPerson trims name');
assertEqual(personTrimmed.role, 'Developer', 'createPerson trims role');

// Cache and Index Tests
console.log('\n=== Cache and Index Tests ===');

// Test: getPerson returns created person
const retrieved = Person.getPerson(person1.id);
assertEqual(retrieved.id, person1.id, 'getPerson returns created person');
assertEqual(retrieved.name, person1.name, 'getPerson returns person with correct name');

// Test: getPeopleByProjectId returns people from that project
const project1People = Person.getPeopleByProjectId(projectId1);
assert(project1People.length >= 3, 'getPeopleByProjectId returns people from the project');
assertIncludes(project1People.map(p => p.id), person1.id, 'getPeopleByProjectId includes created person');
assertIncludes(project1People.map(p => p.id), person2.id, 'getPeopleByProjectId includes both created people');

// Test: people are sorted by name alphabetically
const p1 = Person.createPerson(projectId2, 'Zara', 'Engineer');
const p2 = Person.createPerson(projectId2, 'Alice', 'Manager');
const p3 = Person.createPerson(projectId2, 'Bob', 'Developer');
const sorted = Person.getPeopleByProjectId(projectId2);
assertEqual(sorted[0].name, 'Alice', 'First person is sorted first');
assertEqual(sorted[1].name, 'Bob', 'Second person is sorted second');
assertEqual(sorted[2].name, 'Zara', 'Third person is sorted last');

// Test: getPeopleByProjectId returns empty array for unknown project
const emptyPeople = Person.getPeopleByProjectId('unknown_project');
assertDeepEqual(emptyPeople, [], 'getPeopleByProjectId returns empty array for unknown project');

// CRUD Operations Tests
console.log('\n=== CRUD Operations Tests ===');

// Test: updatePerson changes name
const updated = Person.updatePerson(person1.id, { name: 'Alicia' });
assertEqual(updated.name, 'Alicia', 'updatePerson changes name');
assertEqual(updated.id, person1.id, 'updatePerson preserves ID');

// Test: getPerson returns updated data
const retrievedUpdated = Person.getPerson(person1.id);
assertEqual(retrievedUpdated.name, 'Alicia', 'getPerson returns updated name');

// Test: updatePerson changes role
const updatedRole = Person.updatePerson(person1.id, { role: 'Senior Developer' });
assertEqual(updatedRole.role, 'Senior Developer', 'updatePerson changes role');

// Test: updatePerson with empty name throws
try {
  Person.updatePerson(person1.id, { name: '   ' });
  assert(false, 'updatePerson throws on empty name');
} catch (e) {
  assert(e.message === 'Person name cannot be empty', 'updatePerson throws on empty name');
}

// Test: updatePerson throws on missing person
try {
  Person.updatePerson('unknown_person_id', { name: 'Test' });
  assert(false, 'updatePerson throws on missing person');
} catch (e) {
  assert(e.message === 'Person not found', 'updatePerson throws on missing person');
}

// Test: deletePerson removes person
const personToDelete = Person.createPerson(projectId1, 'ToDelete', 'Temp');
const personToDeleteId = personToDelete.id;
Person.deletePerson(personToDeleteId);
const deletedPerson = Person.getPerson(personToDeleteId);
// getPerson returns undefined on first call but loads from IDB if available
// On deletion, the person should not be in cache anymore
const peopleAfterDelete = Person.getPeopleByProjectId(projectId1);
assert(!peopleAfterDelete.map(p => p.id).includes(personToDeleteId), 'deletePerson removes person from project index');

// Test: deletePerson throws on missing person
try {
  Person.deletePerson('unknown_person_id');
  assert(false, 'deletePerson throws on missing person');
} catch (e) {
  assert(e.message === 'Person not found', 'deletePerson throws on missing person');
}

// Autocomplete Tests
console.log('\n=== Autocomplete Tests ===');

// Reset cache for clean autocomplete test
Person._resetCacheForTesting();

// Create test people
Person.createPerson(projectId1, 'Alice', 'Developer');
Person.createPerson(projectId1, 'Bob', 'Developer');
Person.createPerson(projectId1, 'Charlie', 'Designer');
Person.createPerson(projectId2, 'David', 'Developer');
Person.createPerson(projectId2, 'Eve', 'Manager');

// Test: getAllPeopleForAutocomplete returns unique names
const autocomplete1 = Person.getAllPeopleForAutocomplete();
assertIncludes(autocomplete1.names, 'Alice', 'Autocomplete includes Alice');
assertIncludes(autocomplete1.names, 'Bob', 'Autocomplete includes Bob');
assertIncludes(autocomplete1.names, 'Charlie', 'Autocomplete includes Charlie');
assertIncludes(autocomplete1.names, 'David', 'Autocomplete includes David');
assertIncludes(autocomplete1.names, 'Eve', 'Autocomplete includes Eve');

// Test: getAllPeopleForAutocomplete returns unique roles
assertIncludes(autocomplete1.roles, 'Developer', 'Autocomplete includes Developer role');
assertIncludes(autocomplete1.roles, 'Designer', 'Autocomplete includes Designer role');
assertIncludes(autocomplete1.roles, 'Manager', 'Autocomplete includes Manager role');

// Test: empty roles are filtered out
const personNoRoleForAutocomplete = Person.createPerson(projectId1, 'Frank', '');
const autocomplete2 = Person.getAllPeopleForAutocomplete();
assert(!autocomplete2.roles.includes(''), 'Empty roles are filtered from autocomplete');

// Reset and Utility Tests
console.log('\n=== Reset and Utility Tests ===');

// Test: _resetCacheForTesting clears cache
Person._resetCacheForTesting();
const emptyAfterReset = Person.getPeopleByProjectId(projectId1);
assertDeepEqual(emptyAfterReset, [], '_resetCacheForTesting clears cache for first query');

// Test Summary
console.log(`\n=== Test Summary ===`);
console.log(`✓ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
}
