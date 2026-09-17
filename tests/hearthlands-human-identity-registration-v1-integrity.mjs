import fs from 'node:fs';
import assert from 'node:assert/strict';

const readJSON=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const registration=readJSON('worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json');
const lock=readJSON('worlds/reference-world/territories/hearthlands/validation/nonperson-artwork-lock.json');
const js=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');

assert.equal(registration.schemaVersion,'1.1.0');
assert.equal(registration.territoryId,'hearthlands');
assert.equal(registration.privacyClass,'public-approved-labels');
assert.equal(registration.entries.length,15,'13 humans + 2 companion animals must be registered');
assert.equal(new Set(registration.entries.map(x=>x.id)).size,15);
assert.equal(registration.entries.filter(x=>x.entityType==='companion-animal').length,2);
assert.equal(registration.entries.filter(x=>x.entityType==='human'||x.entityType==='historical-public-person').length,13);

for(const entry of registration.entries){
  assert.match(entry.id,/^person-\d{2}$/);
  assert.equal(entry.registrationStatus,'registered');
  assert.equal(entry.labelSource,'public-approved');
  assert(entry.label&&entry.label!=='Person');
  assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1);
  assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1);
  assert(entry.hitArea?.width>0&&entry.hitArea?.height>0);
  assert(entry.activeFromZoom>=1);
  assert(entry.paintedObject);
  assert(entry.tarotCardRef===`tarot/symbol/${entry.id}`);
}
assert.equal(new Set(registration.entries.map(x=>x.label)).size,15);

assert.equal(lock.locked,true);
assert.equal(lock.assetRole,'final-nonperson-hearthlands-artwork');
assert.equal(lock.sha256,'b7be292766f9bf0774c1fc358154adf522006ac9933b05a3a5469d29a8d917b3');
assert.deepEqual(lock.dimensions,[1536,1024]);

assert(js.includes('human-identity-registration.json'));
assert(js.includes('button.dataset.publicIdentity'));
assert(js.includes('button.dataset.publicLabel'));
assert(js.includes('identityEntry.label'));
assert(!js.includes("activate(button,entry,'Person')"));

console.log('Hearthlands identity integrity: all 15 painted identities use user-approved public labels at their registered coordinates; no generic Person fallback remains.');
