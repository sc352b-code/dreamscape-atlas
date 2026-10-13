import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server.js';
async function fixture(t){const dir=await mkdtemp(path.join(tmpdir(),'dreamscape-test-')),origin='http://localhost:4173',server=createApp({database:path.join(dir,'test.sqlite'),origin});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});});
 const request=async(p,method='GET',data,cookie,extra={})=>{const r=await fetch(base+p,{method,headers:{Origin:origin,...(data!==undefined?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...extra},body:data!==undefined?JSON.stringify(data):undefined});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],body:(r.headers.get('content-type')||'').includes('json')?await r.json():await r.text()};};return request;}
const record=(id,date,text,kind='dream')=>({id,kind,date,title:id,text,tags:[],flags:{}});
test('private corpus isolation, source links, evidence counts, saved history, edit versions and favourites',async t=>{
 const req=await fixture(t),a=await req('/api/register','POST',{email:'a@example.test',password:'a strong test password'}),b=await req('/api/register','POST',{email:'b@example.test',password:'a strong test password'});assert.equal(a.status,200);assert.equal(b.status,200);
 for(const d of [record('one','2025-04-01','I entered a house.'),record('two','2025-04-30','I saw my kitchen.'),record('unrelated','2025-04-15','I heard music.'),record('outside','2025-05-01','I visited a house.'),record('waking','2025-04-01','I went home.','waking')])assert.equal((await req('/api/entries','POST',d,a.cookie)).status,201);
 assert.equal((await req('/api/entries/one','GET',undefined,b.cookie)).status,404);
 assert.equal((await req('/api/entries/one','PUT',{...record('one','2025-04-01','Changed'),revision:1},b.cookie)).status,404);
 assert.equal((await req('/api/entries/one','DELETE',undefined,b.cookie)).status,404);
 assert.equal((await req('/api/state','GET',undefined,b.cookie)).body.entries.length,0);
 const reading=await req('/api/readings','POST',{type:'monthly',anchor:'2025-04-01'},a.cookie);assert.equal(reading.status,201);assert.equal(reading.body.reading.analysedCount,3);assert.equal(reading.body.reading.evidence.length,2);
 for(const e of reading.body.reading.evidence){const source=await req('/api/entries/'+e.dreamId,'GET',undefined,a.cookie);assert.ok(source.body.entry.text.includes(e.excerpt));}
 const duplicate=await req('/api/readings','POST',{type:'monthly',anchor:'2025-04-28'},a.cookie);assert.equal(duplicate.body.reading.id,reading.body.reading.id);assert.equal(duplicate.body.reused,true);
 assert.equal((await req('/api/favourites','POST',{kind:'reading',id:reading.body.reading.id,saved:true},b.cookie)).status,404);
 assert.equal((await req('/api/favourites','POST',{kind:'reading',id:reading.body.reading.id,saved:true},a.cookie)).status,200);
 const stats=await req('/api/statistics?type=monthly&anchor=2025-04-01','GET',undefined,a.cookie);assert.equal(stats.body.total,3);
 const edited=await req('/api/entries/one','PUT',{...record('one','2025-04-01','I entered a different house.'),revision:1},a.cookie);assert.equal(edited.status,200);assert.equal(edited.body.entry.originalText,'I entered a house.');assert.equal(edited.body.entry.history.length,1);
 assert.equal((await req('/api/entries/one','PUT',{...record('one','2025-04-01','Stale overwrite'),revision:1},a.cookie)).status,409);
 const state=await req('/api/state','GET',undefined,a.cookie);assert.equal(state.body.readings[0].stale,true);assert.equal(state.body.readings[0].evidence[0].excerpt,'I entered a house.');assert.equal(state.body.favourites.length,1);
});
test('offline creation retries are idempotent, invalid imports atomic and dates validated',async t=>{
 const req=await fixture(t),a=await req('/api/register','POST',{email:'a@example.test',password:'a strong test password'}),d=record('retry','2025-04-01','At home.');
 assert.equal((await req('/api/entries','POST',d,a.cookie)).status,201);assert.equal((await req('/api/entries','POST',d,a.cookie)).status,200);
 assert.equal((await req('/api/import','POST',{entries:[d,{...d,date:'2025-02-29'}]},a.cookie)).status,400);
 assert.equal((await req('/api/state','GET',undefined,a.cookie)).body.entries.length,1);
 assert.equal((await req('/api/entries','POST',{...d,id:'x',tags:'invalid'},a.cookie)).status,400);
});
test('authentication, origin protection, export, deletion and session revocation',async t=>{
 const req=await fixture(t);assert.equal((await req('/api/state')).status,401);
 assert.equal((await req('/api/register','POST',{email:'a@example.test',password:'a strong test password'},undefined,{Origin:'https://other.example'})).status,403);
 const a=await req('/api/register','POST',{email:'a@example.test',password:'a strong test password'});assert.ok(a.cookie);await req('/api/entries','POST',record('one','2025-04-01','My private dream.'),a.cookie);
 assert.equal((await req('/api/login','POST',{email:'a@example.test',password:'wrong test password'})).status,401);
 assert.equal((await req('/api/export','GET',undefined,a.cookie)).body.entries.length,1);
 const a2=await req('/api/login','POST',{email:'a@example.test',password:'a strong test password'});assert.equal(a2.status,200);
 await req('/api/logout','POST',{},a2.cookie);assert.equal((await req('/api/state','GET',undefined,a2.cookie)).status,401);
 assert.equal((await req('/api/account','DELETE',{confirm:'DELETE'},a.cookie)).status,200);assert.equal((await req('/api/state','GET',undefined,a.cookie)).status,401);
 const newAccount=await req('/api/register','POST',{email:'a@example.test',password:'a strong test password'});assert.equal((await req('/api/state','GET',undefined,newAccount.cookie)).body.entries.length,0);
});
test('static server blocks private database, Git metadata and encoded traversal; world assets and vendored renderer load',async t=>{
 const req=await fixture(t);for(const p of ['/.git/config','/server.js','/backend/store.js','/package.json','/assets/%2e%2e%2fbackend/store.js','/.dreamscape-data/app.sqlite'])assert.ok((await req(p)).status>=400,p);
 for(const p of ['/','/src/app/app.js','/assets/cosmos/original-cosmic.avif','/vendor/three.module.js','/vendor/three.core.js','/dream-world-reference'])assert.equal((await req(p)).status,200,p);
});
