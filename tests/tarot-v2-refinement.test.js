import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const overlay=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const territory=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');

test('Water companion tabs have explicit fixed-card pagination plans',()=>{
  const companions=cards.water.companionCards||{};
  assert.equal(companions.overview.pages.length,2);
  assert.equal(companions.geography.pages.length,1);
  assert.equal(companions.patterns.pages.length,2);
  assert.equal(companions.alongside.pages.length,1);
  assert.equal(companions.chronology.pages.length,1);
  assert.equal(companions.sources.pages.length,1);
  assert.equal(companions.meanings.pages.length,2);
  assert.deepEqual(companions.overview.pages[0].blocks,['heroMetric','grounding','metrics']);
  assert.deepEqual(companions.overview.pages[1].blocks,['behaviour']);
  assert.deepEqual(companions.meanings.pages[1].blocks,['lenses','boundary']);
});

test('companion pages are fixed Tarot objects whose height is not content-driven',()=>{
  assert.match(css,/COMPANION TAROT V5/);
  assert.match(css,/\.tarot-companion-page\{/);
  assert.match(css,/aspect-ratio:2\/3/);
  assert.match(css,/overflow:hidden!important/);
  assert.match(css,/\.tarot-companion-page-body/);
  assert.match(css,/overflow:hidden!important/);
  assert.doesNotMatch(css,/\.tarot-companion-page-body[\s\S]{0,250}overflow-y:auto/);
});

test('multi-page tabs use integrated arrows and page dots',()=>{
  assert.match(overlay,/tarot-companion-page-nav/);
  assert.match(overlay,/data-page-step="-1"/);
  assert.match(overlay,/data-page-step="1"/);
  assert.match(overlay,/tarot-page-dots/);
  assert.match(overlay,/setPage/);
});

test('page state survives observer refreshes but a newly selected tab starts at page one',()=>{
  assert.match(overlay,/const previous=info\.dataset\.activeChapter\|\|null/);
  assert.match(overlay,/const changed=previous!==valid/);
  assert.match(overlay,/if\(activeDeck&&changed\)/);
});

test('exact subject Tarot edge remains the frame source for every companion page',()=>{
  assert.match(overlay,/--tarot-deck-image/);
  assert.match(overlay,/data\.cardImage\|\|data\.previewImage/);
  assert.match(css,/var\(--tarot-deck-image/);
  assert.match(css,/water-v2\.png/);
  assert.match(css,/-webkit-mask:/);
});

test('tab controller shows exactly one chapter deck',()=>{
  assert.match(overlay,/info\.dataset\.activeChapter=valid/);
  for(const chapter of ['overview','geography','patterns','alongside','chronology','sources','meanings']){
    assert.match(css,new RegExp(`data-active-chapter="${chapter}"`));
  }
  assert.match(css,/\.tarot-triptych-info > \[data-chapter\][\s\S]*display:none!important/);
});

test('source dreams remain a doorway card and private library opens separately',()=>{
  assert.equal(cards.water.privateCorpusAccess?.enabled,true);
  assert.equal(cards.water.privateCorpusAccess?.expectedDreamCount,42);
  assert.deepEqual(cards.water.companionCards.sources.pages[0].blocks,['sourceIntro','sourceButton']);
  assert.match(css,/territory-v1-source-fragments[\s\S]*display:none!important/);
  assert.match(css,/territory-v1-private-record-browser[\s\S]*position:absolute/);
  assert.match(profile,/async getOrLoadDreamRecords/);
});

test('preview is fully composed and positioned before it becomes visible',()=>{
  assert.match(territory,/dreamscape-preview-will-open/);
  assert.match(territory,/positionPreview\(button,true\)/);
  assert.match(territory,/void preview\.offsetWidth/);
  assert.match(territory,/preview\.classList\.add\('open'\)/);
  assert.match(territory,/preview\.offsetWidth/);
  assert.match(overlay,/dreamscape-preview-will-open/);
  assert.match(overlay,/composePreview\(preview,data\)/);
  assert.match(css,/tarot-preview-precomposed/);
});

test('preview transition is not allowed to animate dimensions or position',()=>{
  const basePreview=css.match(/\.territory-v1-preview\{[^}]+\}/)?.[0]||'';
  assert.match(basePreview,/transition:opacity[^;]*,transform/);
  assert.doesNotMatch(basePreview,/width|height|padding|left|top/gi);
});

test('Water count semantics remain correct',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
});
