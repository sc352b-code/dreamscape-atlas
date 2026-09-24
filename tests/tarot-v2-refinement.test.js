import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');

test('Water keeps the responsive docked workspace and image-led preview',()=>{
  assert.equal(cards.water.presentation?.mode,'docked-workspace');
  assert.equal(cards.water.presentation?.previewMode,'image-led');
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
});

test('Water private corpus access is explicitly enabled',()=>{
  assert.equal(cards.water.privateCorpusAccess?.enabled,true);
  assert.equal(cards.water.privateCorpusAccess?.subjectId,'water');
  assert.equal(cards.water.privateCorpusAccess?.expectedDreamCount,42);
  assert.match(cards.water.privateCorpusAccess?.accessMode||'',/authenticated-provider/);
});

test('source dreams are no longer blocked when records are not preloaded',()=>{
  assert.match(js,/button\.disabled=false/);
  assert.match(js,/getOrLoadDreamRecords/);
  assert.match(js,/dreamscape-request-dream-records/);
  assert.match(js,/Load private corpus profile/);
  assert.match(profile,/async getOrLoadDreamRecords/);
  assert.match(profile,/async openDreamRecord/);
  assert.match(profile,/async importProfileFile/);
});

test('private corpus remains outside the public repository payload',()=>{
  assert.match(profile,/sessionStorage/);
  assert.match(profile,/loadDreamRecords/);
  assert.match(profile,/privateRecordRef/);
  assert.doesNotMatch(cards.water.corpusGrounding||'',/New dream \d+/i);
});

test('active tab uses the same ornate Tarot companion frame',()=>{
  assert.match(css,/ORnATE TAROT COMPANION CARDS/i);
  assert.match(css,/url\('\/assets\/tarot-ornate-frame\.svg'\)/);
  assert.match(css,/--tarot-display/);
  assert.match(css,/--tarot-text/);
  assert.match(css,/tarot-private-record-browser/);
});

test('count semantics and evidence boundaries remain intact',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.doesNotMatch(css,/object-position:center 38%/);
});
