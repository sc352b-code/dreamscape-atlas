import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');

test('Water defines seven reusable companion Tarot cards',()=>{
  const companions=cards.water.companionCards||{};
  assert.deepEqual(Object.keys(companions),[
    'overview','geography','patterns','alongside','chronology','sources','meanings'
  ]);
  assert.equal(companions.overview.title,'The Water Record');
  assert.equal(companions.geography.title,'The Geography of Water');
  assert.equal(companions.patterns.title,'The Forms of Water');
  assert.equal(companions.alongside.title,'The Constellation of Water');
  assert.equal(companions.chronology.title,'Water Through Time');
  assert.equal(companions.sources.title,'The Book of Waters');
  assert.equal(companions.meanings.title,'The Mirror of Water');
});

test('companion cards reuse the exact Water Tarot artwork as their deck edge',()=>{
  const exactWaterAsset="/worlds/reference-world/territories/hearthlands/tarot/art/water-v2.png";
  assert.ok(css.includes(exactWaterAsset));
  assert.match(css,/EXACT WATER-DECK FRAME \+ LEGIBILITY HOTFIX/);
  assert.match(css,/aspect-ratio:2\/3/);
  assert.match(css,/--tarot-deck-image/);
  assert.match(js,/setProperty\('--tarot-deck-image'/);
  assert.match(css,/background:[\s\S]*water-v2\.png/);
});

test('failed fade and blur behaviour is removed',()=>{
  assert.doesNotMatch(js,/is-companion-entering/);
  assert.doesNotMatch(js,/filter:'blur\(3px\)'/);
  assert.match(css,/\.tarot-companion-card\.is-active-companion/);
  assert.match(css,/animation:none!important/);
  assert.match(css,/opacity:1!important/);
  assert.match(css,/filter:none!important/);
});

test('renderer treats each selected tab as one companion card',()=>{
  assert.match(js,/ensureCompanionCard/);
  assert.match(js,/tarot-companion-card/);
  assert.match(js,/companionGlyph/);
  assert.match(js,/consolidateMeaningsCard/);
  assert.match(js,/tarot-constellation-core/);
  assert.match(js,/tarot-time-river/);
  assert.match(js,/:scope > h3/);
});

test('Overview remains composed as a knowledge Tarot',()=>{
  assert.match(js,/of \$\{escapeHTML\(total\)\} dreams/);
  assert.match(js,/tarot-overview-poles/);
  assert.match(css,/font-size:57px!important/);
  assert.match(css,/tarot-behaviour-summary/);
  assert.match(css,/color:#eee3df!important/);
});

test('all seven chapters keep distinct interior composition while sharing one frame',()=>{
  for(const chapter of ['overview','geography','patterns','alongside','chronology','sources','meanings']){
    assert.match(css,new RegExp(`tarot-companion-${chapter}`));
  }
  assert.match(css,/tarot-overview-poles/);
  assert.match(css,/territory-v1-geo-row/);
  assert.match(css,/tarot-constellation-core/);
  assert.match(css,/tarot-time-river/);
  assert.match(css,/tarot-private-dream-row/);
  assert.match(css,/tarot-companion-subsection/);
});

test('Water private corpus access remains enabled and unblocked',()=>{
  assert.equal(cards.water.privateCorpusAccess?.enabled,true);
  assert.equal(cards.water.privateCorpusAccess?.expectedDreamCount,42);
  assert.match(js,/button\.disabled=false/);
  assert.match(js,/getOrLoadDreamRecords/);
  assert.match(profile,/async getOrLoadDreamRecords/);
  assert.match(profile,/async openDreamRecord/);
  assert.match(profile,/async importProfileFile/);
});

test('count semantics and evidence boundaries remain intact',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
  assert.match(js,/INTERPRETIVE CARD · NOT CORPUS FACT/);
  assert.doesNotMatch(css,/object-position:center 38%/);
});
