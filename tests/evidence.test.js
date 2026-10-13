import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validDate,periodRange,evidenceReflection,statistics,corpusVersion } from '../engine/evidence.js';
import { rooms } from '../src/app/rooms.js';
const sample=[
 {id:'a',date:'2025-04-01',title:'At home',text:'I was in a house. It was warm.',tags:['house'],flags:{numinous:true}},
 {id:'b',date:'2025-04-30',title:'A kitchen',text:'I entered a kitchen and saw bread.',tags:['house'],flags:{lucid:true}},
 {id:'c',date:'2025-04-15',title:'A concert',text:'I listened to music in a theatre.',tags:['music'],flags:{}},
 {id:'d',date:'2025-05-01',title:'Next month',text:'I found my house.',tags:['house'],flags:{}}
];
test('date ranges use inclusive dream dates, Monday weeks, quarters, half years and leap years',()=>{
 assert.equal(validDate('2025-02-29'),false);assert.equal(validDate('2024-02-29'),true);
 assert.deepEqual(periodRange('monthly','2025-04-17'),{start:'2025-04-01',end:'2025-04-30'});
 assert.deepEqual(periodRange('monthly','2024-02-10'),{start:'2024-02-01',end:'2024-02-29'});
 assert.deepEqual(periodRange('weekly','2025-01-01'),{start:'2024-12-30',end:'2025-01-05'});
 assert.deepEqual(periodRange('quarterly','2025-05-14'),{start:'2025-04-01',end:'2025-06-30'});
 assert.deepEqual(periodRange('six-monthly','2025-08-10'),{start:'2025-07-01',end:'2025-12-31'});
 assert.deepEqual(periodRange('yearly','2025-08-10'),{start:'2025-01-01',end:'2025-12-31'});
});
test('reflection excludes unrelated and out-of-period dreams, and preserves exact excerpts',()=>{
 const r=evidenceReflection(sample,periodRange('monthly','2025-04-01'));assert.equal(r.mode,'evidence-reflection');assert.equal(r.analysedCount,3);assert.deepEqual(r.evidence.map(e=>e.dreamId),['a','b']);
 for(const e of r.evidence)assert.ok(sample.find(d=>d.id===e.dreamId).text.includes(e.excerpt));assert.equal(r.artwork,null);
 assert.throws(()=>evidenceReflection([sample[0]],periodRange('monthly','2025-04-01')),/not enough/);
 assert.throws(()=>evidenceReflection([{...sample[0],text:'A watermelon.'},{...sample[1],text:'A watering can.'}],periodRange('monthly','2025-04-01')),/not enough/);
});
test('statistics count each tagged dream once and versions change on narrative edits',()=>{
 assert.equal(statistics([{...sample[0],tags:['house','house']},sample[1]]).tags[0].count,2);
 assert.notEqual(corpusVersion(sample),corpusVersion([{...sample[0],text:'Edited text'},...sample.slice(1)]));
});
test('room registry contains exactly the approved nine rooms',()=>{
 assert.equal(rooms.length,9);assert.equal(new Set(rooms.map(r=>r.id)).size,9);
 assert.deepEqual(rooms.map(r=>r.label),['STATISTICAL ANALYSIS','PODCAST OVERVIEW','ORACLE CARDS','DREAM JOURNAL','WAKING JOURNAL','MY COLLECTIONS/ MY FAVE COLLECTIONS','LUMINOUS MESSAGES','DREAM WORLD','DREAM INSIGHTS/ COLLECTIVE DREAM INSIGHTS']);
});
test('canonical cosmos is the exact original decoded artwork',()=>{
 const chunks=Array.from({length:4},(_,i)=>readFileSync(new URL(`../assets/generated/cosmic-0${i}.b64`,import.meta.url),'utf8').trim()).join('');
 const decoded=Buffer.from(chunks,'base64'),asset=readFileSync(new URL('../assets/cosmos/original-cosmic.avif',import.meta.url));assert.deepEqual(asset,decoded);
 assert.equal(createHash('sha256').update(asset).digest('hex'),'fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537');
});
