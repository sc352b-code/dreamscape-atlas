import fs from 'node:fs';
import assert from 'node:assert/strict';

const readJSON=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const ledger=readJSON('worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json');
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

const placeIds=new Set(places.map(x=>x.id));
const symbolIds=new Set(symbols.map(x=>x.id));
const keys=new Set();
let registeredPlaces=0, registeredSymbols=0, unresolved=0;
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
  }else{
    assert.equal(entry.registrationStatus,'needs-art-correction');
    assert.equal(entry.x,null); assert.equal(entry.y,null); assert.equal(entry.hitArea,null);
    assert(entry.correctionReason,'unregistered items require an explicit correction reason');
    unresolved++;
  }
}
assert.equal(registeredPlaces,2,'current painting supports exactly two defensible place registrations');
assert.equal(registeredSymbols,31,'current painting supports exactly 31 defensible symbol registrations');
assert.equal(unresolved,49,'4 places + 45 symbols must remain suppressed pending art correction');
assert.equal(ledger.summary.registeredPlaces,registeredPlaces);
assert.equal(ledger.summary.registeredSymbols,registeredSymbols);
assert.equal(ledger.summary.placesNeedingArtCorrection,4);
assert.equal(ledger.summary.symbolsNeedingArtCorrection,45);

assert(index.includes('/src/hearthlands-registration-v1.css'));
assert(index.includes('/src/hearthlands-registration-v1.js'));
assert(js.includes("territory-hotspot--unregistered"));
assert(js.includes("button.disabled=true"));
assert(js.includes("entry.hitArea.width"));
assert(js.includes('data-territory-action="zoom-in"'));
assert(js.includes('data-territory-action="zoom-out"'));
assert(css.includes('.territory-hotspot--unregistered{display:none!important'));
assert(css.includes('.territory-v1-controls'));

console.log('Hearthlands registration integrity: 2 places + 31 symbols precisely registered; 49 unresolved targets suppressed pending controlled artwork correction.');
