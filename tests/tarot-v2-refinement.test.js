import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');

test('Water keeps seven companion Tarot chapters',()=>{
  assert.deepEqual(Object.keys(cards.water.companionCards||{}),[
    'overview','geography','patterns','alongside','chronology','sources','meanings'
  ]);
});

test('companion cards derive their visible deck edge from the actual subject Tarot artwork',()=>{
  assert.match(js,/--tarot-deck-image/);
  assert.match(js,/data\.cardImage\|\|data\.previewImage/);
  assert.match(css,/COMPANION TAROT V4/);
  assert.match(css,/var\(--tarot-deck-image/);
  assert.match(css,/water-v2\.png/);
  assert.match(css,/-webkit-mask:/);
  assert.match(css,/top\/100% 11\.5%/);
  assert.doesNotMatch(css,/ORNATE TAROT COMPANION CARDS/);
  assert.doesNotMatch(css,/DREAMSCAPE COMPANION TAROT CARDS/);
  assert.doesNotMatch(css,/EXACT WATER-DECK FRAME \+ LEGIBILITY HOTFIX/);
});

test('companion card layout cannot clip the lower content behind the frame',()=>{
  assert.match(js,/tarot-companion-body/);
  assert.match(css,/\.tarot-companion-body/);
  assert.match(css,/overflow-y:auto/);
  assert.match(css,/flex:1 1 auto/);
  assert.match(css,/height:min\(72vh,660px\)/);
});

test('render helpers use stable data containers after decorative headers are added',()=>{
  assert.match(js,/territory-v1-geo-list/);
  assert.match(js,/territory-v1-function-list/);
  assert.match(js,/territory-v1-lens-list/);
  assert.match(js,/stableArticleTarget/);
});

test('selected companion card remains fully crisp',()=>{
  assert.doesNotMatch(js,/is-companion-entering/);
  assert.doesNotMatch(js,/blur\(3px\)/);
  assert.match(css,/\.tarot-companion-card\.is-active-companion/);
  assert.match(css,/opacity:1!important/);
  assert.match(css,/filter:none!important/);
  assert.match(css,/animation:none!important/);
});

test('Overview remains composed as a knowledge Tarot',()=>{
  assert.match(js,/of \$\{escapeHTML\(total\)\} dreams/);
  assert.match(js,/tarot-overview-poles/);
  assert.match(css,/tarot-overview-lead/);
  assert.match(css,/tarot-behaviour-summary/);
});

test('all seven chapters keep distinct interior composition while sharing one outer frame',()=>{
  for(const chapter of ['overview','geography','patterns','alongside','chronology','sources','meanings']){
    assert.equal(typeof cards.water.companionCards[chapter].title,'string');
  }
  assert.match(css,/tarot-territory-logic/);
  assert.match(css,/tarot-confidence-legend/);
  assert.match(css,/tarot-constellation-core/);
  assert.match(css,/tarot-time-river/);
  assert.match(css,/tarot-private-dream-row/);
  assert.match(css,/tarot-companion-subsection/);
});

test('private Water source-dream access remains enabled',()=>{
  assert.equal(cards.water.privateCorpusAccess?.enabled,true);
  assert.equal(cards.water.privateCorpusAccess?.expectedDreamCount,42);
  assert.match(js,/button\.disabled=false/);
  assert.match(profile,/async getOrLoadDreamRecords/);
  assert.match(profile,/async openDreamRecord/);
  assert.match(profile,/async importProfileFile/);
});

test('Water count semantics remain correct',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
});


test('tab controller is the sole owner of companion-card visibility',()=>{
  assert.match(js,/info\.dataset\.activeChapter=valid/);
  assert.doesNotMatch(js,/section\.hidden=false/);
  assert.doesNotMatch(js,/section\?\.removeAttribute\('hidden'\)/);
  assert.match(css,/COMPANION TAB ISOLATION \+ CARD-FIT CORRECTION/);
  for(const chapter of ['overview','geography','patterns','alongside','chronology','sources','meanings']){
    assert.match(css,new RegExp(`data-active-chapter="${chapter}"`));
  }
  assert.match(css,/\.tarot-triptych-info > \[data-chapter\]\{[\s\S]*display:none!important/);
});

test('all companion content stays inside one bounded card',()=>{
  assert.match(js,/tarot-companion-body/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/overscroll-behavior:contain/);
  assert.match(css,/overflow:hidden!important/);
  assert.match(css,/position:sticky/);
});
