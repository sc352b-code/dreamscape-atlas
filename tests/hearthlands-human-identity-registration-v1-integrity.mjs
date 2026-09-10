import fs from 'node:fs';
import assert from 'node:assert/strict';

const readJSON=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const registration=readJSON('worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json');
const lock=readJSON('worlds/reference-world/territories/hearthlands/validation/nonperson-artwork-lock.json');
const js=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');

assert.equal(registration.schemaVersion,'1.0.0');
assert.equal(registration.territoryId,'hearthlands');
assert.equal(registration.entries.length,15,'13 humans + 2 companion animals must be technically registered');
assert.equal(new Set(registration.entries.map(x=>x.id)).size,15);
assert.equal(registration.entries.filter(x=>x.entityType==='companion-animal').length,2);
assert.equal(registration.entries.filter(x=>x.entityType==='human'||x.entityType==='historical-public-person').length,13);

for(const entry of registration.entries){
  assert.match(entry.id,/^person-\d{2}$/);
  assert.equal(entry.registrationStatus,'registered-private-label-required');
  assert.equal(entry.labelSource,'private-profile');
  assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1);
  assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1);
  assert(entry.hitArea?.width>0&&entry.hitArea?.height>0);
  assert(entry.activeFromZoom>=1);
  assert(entry.paintedObject);
  assert(entry.tarotCardRef===`tarot/symbol/${entry.id}`);
}
const publicText=JSON.stringify(registration);
for(const forbidden of ['Alex','Alice','Carl Jung','Dad','George','Grandma','Lily','Max','Mum','Natalie','Percy','Sister','Stephen Coarse','Wayne']){
  assert(!publicText.includes(forbidden),`Private semantic label leaked into public identity registration: ${forbidden}`);
}
assert.equal(lock.locked,true);
assert.equal(lock.assetRole,'final-nonperson-hearthlands-artwork');
assert.equal(lock.sha256,'b7be292766f9bf0774c1fc358154adf522006ac9933b05a3a5469d29a8d917b3');
assert.deepEqual(lock.dimensions,[1536,1024]);
assert.match(lock.rule,/No further non-person artwork edits/);

assert(js.includes('human-identity-registration.json'));
assert(js.includes('__dreamscapePrivateIdentityMap'));
assert(js.includes('resolveHearthlandsPrivateIdentities'));
assert(js.includes('private-label-required'));
assert(js.includes('privateLabelResolved'));
for(const forbidden of ['Natalie','Alex','Alice','Stephen Coarse','Wayne']){
  assert(!js.includes(forbidden),`Private label leaked into public registration runtime: ${forbidden}`);
}

console.log('Hearthlands Human Identity Registration v1 integrity: 13 human identities + 2 companion animals are pixel-registered to the locked artwork; semantic labels remain private until profile resolution.');
