import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { ROOMS } from '../src/app/rooms.js';
import { periodBounds, validDate, selectDreams, validateRecord, importDreams, observations, createEvidenceStudy, validateEvidence, corpusVersion } from '../src/app/evidence.js';
import { deriveKey, encrypt, decrypt } from '../src/app/vault.js';

const make = (id, date, text, tags = [], kind = 'dream') => validateRecord({ id, date, text, title: id, tags }, kind);
const records = [make('home-a', '2025-04-01', 'I walked into my home. A window was open.', ['home']), make('home-b', '2025-04-30', 'The kitchen in the house was warm.', ['home']), make('unrelated', '2025-04-15', 'A bird flew across the sky.', ['bird']), make('outside', '2025-05-01', 'I returned to the house.', ['home']), make('waking', '2025-04-20', 'I cleaned the house.', ['home'], 'waking')];

test('the exact nine approved room labels are preserved with unique routes', () => {
  assert.equal(ROOMS.length, 9); assert.equal(new Set(ROOMS.map(r => r.id)).size, 9);
  assert.deepEqual(ROOMS.map(r => r.name), ['STATISTICAL ANALYSIS', 'PODCAST OVERVIEW', 'ORACLE CARDS', 'DREAM JOURNAL', 'WAKING JOURNAL', 'MY COLLECTIONS/ MY FAVE COLLECTIONS', 'LUMINOUS MESSAGES', 'DREAM WORLD', 'DREAM INSIGHTS/ COLLECTIVE DREAM INSIGHTS']);
});
test('calendar periods handle leap dates, inclusive ends, quarter/half boundaries and Monday weeks', () => {
  assert.deepEqual(periodBounds('monthly', '2024-02-20'), { type: 'monthly', start: '2024-02-01', end: '2024-02-29' });
  assert.equal(periodBounds('quarterly', '2025-04-22').end, '2025-06-30');
  assert.equal(periodBounds('six-monthly', '2025-07-01').end, '2025-12-31');
  assert.equal(periodBounds('yearly', '2025-01-01').start, '2025-01-01');
  assert.equal(periodBounds('weekly', '2025-01-01').start, '2024-12-30');
  assert.equal(validDate('2025-02-29'), false); assert.equal(validDate('2024-02-29'), true);
  assert.throws(() => periodBounds('monthly', '2025-13-01'));
});
test('date selection excludes waking records and out-of-period dreams', () => {
  assert.deepEqual(selectDreams(records, periodBounds('monthly', '2025-04-01')).map(d => d.id), ['home-a', 'unrelated', 'home-b']);
});
test('oracle checks all period dreams but cites only matching original passages', async () => {
  const reading = await createEvidenceStudy(records, periodBounds('monthly', '2025-04-01'));
  assert.equal(reading.analysedCount, 3); assert.equal(reading.evidence.length, 2);
  assert.deepEqual(reading.evidence.map(e => e.dreamId), ['home-a', 'home-b']);
  assert.equal(validateEvidence(reading, records), true);
  assert.equal(reading.mode, 'deterministic-evidence-study');
  assert.equal(reading.artworkStatus.includes('not generated'), true);
  assert.throws(() => validateEvidence({ ...reading, evidence: [{ ...reading.evidence[0], excerpt: 'invented quotation' }] }, records));
  assert.throws(() => validateEvidence(reading, records.filter(r => r.id !== 'home-a')));
  assert.throws(() => validateEvidence({ ...reading, evidence: [reading.evidence[0], reading.evidence[0]] }, records));
});
test('insufficient and competing evidence are explained, not turned into confident readings', async () => {
  assert.equal((await createEvidenceStudy([records[0]], periodBounds('monthly', '2025-04-01'))).status, 'insufficient');
  const mixed = [make('a', '2025-04-03', 'There was a house beside the river.'), make('b', '2025-04-04', 'My home was near the water.')];
  assert.match((await createEvidenceStudy(mixed, periodBounds('monthly', '2025-04-01'))).confidence, /equally supported/);
});
test('each supplied corpus produces its own sources, not another corpus’s reading', async () => {
  const other = [make('x', '2025-04-03', 'A river flowed.'), make('y', '2025-04-04', 'Water rose.')];
  const reading = await createEvidenceStudy(other, periodBounds('monthly', '2025-04-01'));
  assert.equal(reading.threadId, 'water'); assert.deepEqual(reading.evidence.map(e => e.dreamId), ['x', 'y']);
  assert.throws(() => validateEvidence(reading, records));
});
test('statistics count unique tags per dream and state their denominator', () => {
  const stats = observations([make('a', '2025-04-01', 'A home.', ['home', 'home']), make('b', '2025-04-02', 'A bird.', ['bird'])]);
  assert.equal(stats.total, 2); assert.equal(stats.tags.find(t => t.label === 'home').count, 1); assert.equal(stats.tags.find(t => t.label === 'home').percent, 50);
});
test('imports reject an invalid batch atomically and skip duplicate IDs and narratives', () => {
  assert.throws(() => importDreams([records[0], { id: 'bad', date: 'April', text: 'Bad' }], []));
  assert.equal(importDreams([records[0], records[0]], []).added, 1);
  const imported = importDreams([records[0], { ...records[0], id: 'same-text' }], [records[0]]);
  assert.equal(imported.added, 0); assert.equal(imported.skipped, 2);
  const edited = validateRecord({ ...records[0], text: 'Edited.', originalText: records[0].text });
  assert.equal(edited.originalText, records[0].text);
});
test('corpus versions change with narrative edits and remain stable on reorder', async () => {
  const version = await corpusVersion(records); assert.equal(await corpusVersion([...records].reverse()), version);
  assert.notEqual(await corpusVersion([{ ...records[0], text: 'Changed.' }, ...records.slice(1)]), version);
});
test('local encryption rejects the wrong passphrase and tampered ciphertext', async () => {
  const salt = new Uint8Array(16).fill(7), key = await deriveKey('a-long-test-passphrase', salt);
  const input = { dreams: records, longNarrative: 'a'.repeat(200000) }; const encrypted = await encrypt(input, key);
  assert.equal(JSON.stringify(encrypted).includes('window was open'), false);
  assert.deepEqual(await decrypt(encrypted, key), input);
  const otherKey = await deriveKey('another-long-passphrase', salt); await assert.rejects(decrypt(encrypted, otherKey));
  const bad = { ...encrypted, ciphertext: (encrypted.ciphertext[0] === 'A' ? 'B' : 'A') + encrypted.ciphertext.slice(1) }; await assert.rejects(decrypt(bad, key));
  await assert.rejects(deriveKey('short', salt));
});
test('canonical background is an unchanged decoding of all four original chunks', () => {
  const original = Buffer.from([0, 1, 2, 3].map(n => fs.readFileSync(new URL(`../assets/generated/cosmic-0${n}.b64`, import.meta.url), 'utf8').trim()).join(''), 'base64');
  const asset = fs.readFileSync(new URL('../assets/cosmos/original.avif', import.meta.url));
  assert.deepEqual(asset, original); assert.equal(createHash('sha256').update(asset).digest('hex'), 'fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537');
});
