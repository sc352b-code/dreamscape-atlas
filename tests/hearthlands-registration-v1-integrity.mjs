import fs from 'node:fs';
import assert from 'node:assert/strict';

const readJSON=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const ledger=readJSON('worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json');
const humanLedger=readJSON('worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json');
const places=readJSON('worlds/reference-world/territories/hearthlands/places.json');
const symbols=readJSON('worlds/reference-world/territories/hearthlands/symbols.json');
const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');
const css=fs.readFileSync('src/hearthlands-registration-v1.css','utf8');

assert.equal(ledger.schemaVersion,'1.0.0');
assert.equal(ledger.territoryId,'hearthlands');
assert.equal(ledger.entries.length,82,'registration ledger must cover 6 places + 76 symbols');
assert.equal(places.length,6);
assert.equal(symbols.length,76);
assert.equal(humanLedger.schemaVersion,'1.0.0');
assert.equal(humanLedger.territoryId,'hearthlands');
assert.equal(humanLedger.entries.length,15,'identity registration must contain 13 humans plus Max and Percy');
for(const entry of humanLedger.entries){
  assert(entry.id.startsWith('person-'));
  assert.equal(entry.registrationStatus,'registered-private-label-required');
  assert.equal(entry.labelSource,'private-profile');
  assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1);
  assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1);
  assert(entry.hitArea?.width>0&&entry.hitArea?.height>0);
  assert(entry.activeFromZoom>0);
  assert(entry.paintedObject);
  assert.equal(entry.tarotCardRef,`tarot/symbol/${entry.id}`);
}
assert.equal(humanLedger.entries.filter(x=>x.entityType==='companion-animal').length,2);
assert.equal(humanLedger.entries.filter(x=>x.entityType==='historical-public-person').length,1);
assert.equal(humanLedger.entries.filter(x=>x.entityType==='human').length,12);

const personSymbols=symbols.filter(x=>x.id.startsWith('person-'));
assert.equal(personSymbols.length,15,'15 private person symbols must remain present as technical records');
for(const person of personSymbols){
  assert.equal(person.semanticIdentity?.kind,'person');
  assert.equal(person.semanticIdentity?.labelSource,'private-profile');
  assert.equal(person.semanticIdentity?.labelResolvedInPublicRuntime,false);
  assert.equal(person.interaction.clickable,false);
  assert.equal(person.interaction.hoverable,false);
  assert.equal(person.interaction.hoverLabel,false);
}

const placeIds=new Set(places.map(x=>x.id));
const symbolIds=new Set(symbols.map(x=>x.id));
const keys=new Set();
let registeredPlaces=0, registeredSymbols=0, artCorrection=0, identityPaused=0;
for(const entry of ledger.entries){
  const key=`${entry.kind}:${entry.id}`;
  assert(!keys.has(key),`duplicate registration entry ${key}`); keys.add(key);
  if(entry.kind==='place') assert(placeIds.has(entry.id),`unknown place ${entry.id}`);
  else if(entry.kind==='symbol') assert(symbolIds.has(entry.id),`unknown symbol ${entry.id}`);
  else assert.fail(`unknown registration kind ${entry.kind}`);
  assert(entry.tarotCardRef,'every registration entry keeps its tarot destination');
  if(entry.registrationStatus==='registered'){
    assert(Number.isFinite(entry.x)&&entry.x>=0&&entry.x<=1,`${key} x out of bounds`);
    assert(Number.isFinite(entry.y)&&entry.y>=0&&entry.y<=1,`${key} y out of bounds`);
    assert(entry.hitArea&&entry.hitArea.width>0&&entry.hitArea.height>0,`${key} missing precise hit area`);
    assert(entry.activeFromZoom>0,`${key} missing zoom activation`);
    assert(entry.paintedObject,`${key} must identify the painted subject`);
    if(entry.kind==='place') registeredPlaces++; else registeredSymbols++;
  }else if(entry.registrationStatus==='needs-art-correction'){
    assert.equal(entry.x,null); assert.equal(entry.y,null); assert.equal(entry.hitArea,null);
    assert(entry.correctionReason,'unregistered items require an explicit correction reason');
    artCorrection++;
  }else if(entry.registrationStatus==='identity-resolution-required'){
    assert.equal(entry.kind,'symbol');
    assert(entry.id.startsWith('person-'));
    assert.equal(entry.x,null); assert.equal(entry.y,null); assert.equal(entry.hitArea,null);
    identityPaused++;
  }else assert.fail(`unexpected registration status ${entry.registrationStatus}`);
}
assert.equal(registeredPlaces,2);
assert.equal(registeredSymbols,31);
assert.equal(identityPaused,15,'all people stay paused until private semantic identity is deliberately resolved in art/runtime');
assert.equal(artCorrection,34,'4 places + 30 non-person symbols remain in the visual correction queue');
assert.equal(ledger.summary.personSymbolsAwaitingPrivateIdentity,15);
assert.equal(ledger.summary.placesNeedingArtCorrection,4);
assert.equal(ledger.summary.symbolsNeedingArtCorrection,30);

const publicText=[
  fs.readFileSync('worlds/reference-world/territories/hearthlands/symbols.json','utf8'),
  fs.readFileSync('worlds/reference-world/territories/hearthlands/territory-manifest.json','utf8'),
  fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-cards.json','utf8'),
  fs.readFileSync('worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json','utf8'),
  fs.readFileSync('worlds/reference-world/territories/hearthlands/validation/artwork-coverage.json','utf8'),
  fs.readFileSync('worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json','utf8')
].join('\n');
assert(!publicText.includes('Recurring Figure'));
assert(!publicText.includes('recurring-figure-'));
for(const privateName of ['Alex','Alice','George','Grandma','Lily','Mum','Natalie','Percy','Stephen Coarse','Wayne']){
  assert(!publicText.includes(privateName),`private semantic label leaked into public runtime: ${privateName}`);
}

assert(index.includes('/src/hearthlands-registration-v1.css'));
assert(index.includes('/src/hearthlands-registration-v1.js'));
assert(js.includes("territory-hotspot--unregistered"));
assert(js.includes("button.disabled=true"));
assert(js.includes("entry.hitArea.width"));
assert(js.includes('IDENTITY_REGISTRATION_URL'));
assert(js.includes('resolveHearthlandsPrivateIdentities'));
assert(js.includes('__dreamscapePrivateIdentityMap'));
assert(js.includes('private-label-required'));
const territoryJS=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
assert(territoryJS.includes('__dreamscapePrivateIdentityMap'));
assert(territoryJS.includes('providerLabel||mapLabel||card.title'));
assert(js.includes('data-territory-action="zoom-in"'));
assert(js.includes('data-territory-action="zoom-out"'));
assert(css.includes('.territory-hotspot--unregistered{display:none!important'));
assert(css.includes('.territory-v1-controls'));

console.log('Hearthlands registration integrity: person symbols use private semantic labels, never Recurring Figure aliases; 15 people are paused for identity-aware artwork, with 4 places + 30 non-person symbols still awaiting art correction.');
