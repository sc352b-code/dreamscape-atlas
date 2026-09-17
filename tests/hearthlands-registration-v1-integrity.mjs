import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const readJSON=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const ledger=readJSON('worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json');
const humanLedger=readJSON('worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json');
const places=readJSON('worlds/reference-world/territories/hearthlands/places.json');
const symbols=readJSON('worlds/reference-world/territories/hearthlands/symbols.json');
const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');
const css=fs.readFileSync('src/hearthlands-registration-v1.css','utf8');
const territoryJS=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
const territoryCSS=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const seamlessCSS=fs.readFileSync('src/hearthlands-seamless-entry.css','utf8');
const transitionJS=fs.readFileSync('src/hearthlands-transition-fix.js','utf8');

assert.equal(ledger.schemaVersion,'2.0.0');
assert.equal(ledger.territoryId,'hearthlands');
const lockedArtwork=fs.readFileSync('worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png');
const lockedArtworkSha=createHash('sha256').update(lockedArtwork).digest('hex');
assert.equal(lockedArtworkSha,'b7be292766f9bf0774c1fc358154adf522006ac9933b05a3a5469d29a8d917b3');
assert.equal(ledger.artworkBasis.lockedImageSha256,lockedArtworkSha);
assert.equal(ledger.entries.length,67);
assert.equal(places.length,6);
assert.equal(symbols.length,76);

assert.equal(humanLedger.schemaVersion,'1.1.0');
assert.equal(humanLedger.entries.length,15);
for(const entry of humanLedger.entries){
  assert.match(entry.id,/^person-\d{2}$/);
  assert.equal(entry.registrationStatus,'registered');
  assert.equal(entry.labelSource,'public-approved');
  assert(entry.label&&entry.label!=='Person');
  assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1);
  assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1);
  assert(entry.hitArea?.width>0&&entry.hitArea?.height>0);
  assert.equal(entry.tarotCardRef,`tarot/symbol/${entry.id}`);
}

const placeIds=new Set(places.map(x=>x.id));
const symbolIds=new Set(symbols.map(x=>x.id));
const keys=new Set();
let registeredPlaces=0,registeredSymbols=0;
for(const entry of ledger.entries){
  const key=`${entry.kind}:${entry.id}`;
  assert(!keys.has(key),`duplicate registration entry ${key}`);keys.add(key);
  if(entry.kind==='place') assert(placeIds.has(entry.id));
  else {assert.equal(entry.kind,'symbol');assert(symbolIds.has(entry.id));}
  assert.equal(entry.registrationStatus,'registered');
  assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1);
  assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1);
  assert(entry.hitArea?.width>0&&entry.hitArea?.height>0);
  if(entry.kind==='place') registeredPlaces++;else registeredSymbols++;
}
assert.equal(registeredPlaces,6);
assert.equal(registeredSymbols,61);

assert(index.includes('/src/hearthlands-registration-v1.css'));
assert(index.includes('/src/hearthlands-registration-v1.js'));
assert(index.includes('/src/hearthlands-seamless-entry.css'));
assert(!index.includes('/src/dreamscape-private-profile-loader.js'));
assert(js.includes("button.dataset.visibleFrom='1'"));
assert(js.includes('precisionPriority'));
assert(js.includes('identityEntry.label'));
assert(!js.includes("activate(button,entry,'Person')"));
assert(css.includes('.territory-hotspot--unregistered{display:none!important'));
assert(css.includes('.territory-hotspot--registered span::after'));
assert(css.includes('width:10px'));
assert(!css.includes('position:absolute;inset:0;border-radius:inherit'));

assert(seamlessCSS.includes('.territory-cosmos__blackout'));
assert(seamlessCSS.includes('.descent-copy'));
assert(seamlessCSS.includes('transition:opacity 1.18s'));
assert(seamlessCSS.includes('transform:none!important'));
assert(transitionJS.includes('hearthlands-seamless-entry'));
assert(transitionJS.includes('hearthlands-map-takeover'));

assert(territoryJS.includes('territory-v1-preview'));
assert(territoryJS.includes('Open tarot'));
assert(territoryJS.includes('getDreamRecords'));
assert(territoryJS.includes('recurringFunctions'));
assert(territoryJS.includes('interpretiveLenses'));
assert(territoryJS.includes('possibleLesson'));
assert(territoryCSS.includes('Art-first arrival'));
assert(territoryCSS.includes('Anchored evidence preview'));
assert(territoryCSS.includes('Tarot v2 surface'));

console.log('Hearthlands registration integrity: exact locked art + 6 places + 61 non-person symbols + 15 approved named identities feed invisible precise hotspots, seamless entry, anchored previews and Tarot v2.');
