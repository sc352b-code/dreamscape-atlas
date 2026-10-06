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
  assert.equal(companions.overview.pages.length,3);
  assert.equal(companions.geography.pages.length,2);
  assert.equal(companions.patterns.pages.length,3);
  assert.equal(companions.alongside.pages.length,2);
  assert.equal(companions.chronology.pages.length,1);
  assert.equal(companions.sources.pages.length,1);
  assert.equal(companions.meanings.pages.length,4);
  assert.deepEqual(companions.overview.pages[0].blocks,['heroMetric','grounding','metrics']);
  assert.deepEqual(companions.overview.pages[1].blocks,['behaviour']);
  assert.deepEqual(companions.overview.pages[2].blocks,['behaviourPoles']);
  assert.deepEqual(companions.geography.pages[0].blocks,['geographyLogic','geographyRows']);
  assert.deepEqual(companions.geography.pages[1].blocks,['geographyNote']);
  assert.deepEqual(companions.patterns.pages[1].blocks,['function:0','function:1']);
  assert.deepEqual(companions.patterns.pages[2].blocks,['function:2','function:3']);
  assert.deepEqual(companions.meanings.pages[0].blocks,['meaning:0','meaning:1']);
  assert.deepEqual(companions.meanings.pages[1].blocks,['meaning:2','meaning:3']);
  assert.deepEqual(companions.meanings.pages[2].blocks,['lens:0']);
  assert.deepEqual(companions.meanings.pages[3].blocks,['lens:1','lens:2','boundary']);
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

test('multi-page tabs use one stable Tarot shell and capture-phase controls',()=>{
  assert.match(overlay,/tarot-companion-page-nav/);
  assert.match(overlay,/data-page-step="-1"/);
  assert.match(overlay,/data-page-step="1"/);
  assert.match(overlay,/tarot-page-dot/);
  assert.match(overlay,/setPage/);
  assert.match(overlay,/__dreamscapeSetCompanionPage/);
  assert.match(overlay,/pager\.addEventListener\('click',[\s\S]*true\)/);
  assert.doesNotMatch(overlay,/pages\.forEach\(\(pageConfig,index\)=>/);
  assert.doesNotMatch(overlay,/button\.onclick=/);
});

test('page state survives observer refreshes but a newly selected tab starts at page one',()=>{
  assert.match(overlay,/const previous=info\.dataset\.activeChapter\|\|null/);
  assert.match(overlay,/const changed=previous!==valid/);
  assert.match(overlay,/if\(activeDeck&&changed\)/);
});

test('exact subject Tarot edge remains the frame source for every companion page',()=>{
  assert.match(overlay,/--tarot-deck-image/);
  assert.match(overlay,/data\.companionFrameImage\|\|data\.cardImage\|\|data\.previewImage/);
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
  const transition=basePreview.match(/transition:([^;]+)/)?.[1]||'';
  assert.match(transition,/opacity/);
  assert.match(transition,/transform/);
  assert.doesNotMatch(transition,/width|height|padding|left|top/gi);
});

test('Water count semantics remain correct',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
});


test('pagination refreshes do not duplicate Overview anchors or overwrite chronology headers',()=>{
  assert.match(overlay,/behaviour\.querySelector\(':scope > small'\)/);
  assert.match(overlay,/grounding\.querySelector\('\.tarot-overview-poles'\)/);
  assert.match(overlay,/tarot-chronology-copy/);
  assert.doesNotMatch(overlay,/section\.querySelector\('p'\)\.textContent=data\.chronologySummary/);
});


test('refreshed data replaces page blocks instead of duplicating them',()=>{
  assert.match(overlay,/data-companion-block/);
  assert.match(overlay,/if\(previous&&previous!==node\) previous\.remove\(\)/);
});


test('every companion page owns a real frame element immune to article pseudo-element collisions',()=>{
  assert.match(overlay,/tarot-companion-frame/);
  assert.match(overlay,/page\.prepend\(frame\)/);
  assert.match(css,/\.tarot-companion-frame\{/);
  assert.match(css,/background-image:var\(--tarot-deck-image/);
  assert.match(css,/\.tarot-companion-page::before,[\s\S]*content:none!important/);
});

test('Recurring Patterns uses the same physical frame layer as every other page',()=>{
  assert.equal(cards.water.companionCards.patterns.pages.length,3);
  assert.match(css,/article\[data-companion-block\^="function:"\]/);
  assert.match(overlay,/card\.className='tarot-companion-card tarot-companion-page'/);
});


test('page turns swap content inside one permanent physical card',()=>{
  assert.match(overlay,/moveBodyToStash/);
  assert.match(overlay,/card\.dataset\.pageId=pageConfig\.id/);
  assert.match(overlay,/body\.appendChild\(node\)/);
  assert.match(overlay,/__dreamscapeSetCompanionPage/);
  assert.match(css,/\.tarot-companion-stash/);
  assert.match(css,/\.tarot-page-dot\[aria-current="page"\]/);
});


test('companion pagination uses exactly one physical page shell per tab',()=>{
  assert.match(overlay,/let card=pager\.querySelector\(':scope > \.tarot-companion-page'\)/);
  assert.match(overlay,/if\(!card\)/);
  assert.doesNotMatch(overlay,/querySelectorAll\(':scope > \.tarot-companion-page'\)\.forEach/);
});


test('interpretive pagination is generic rather than Water-specific',()=>{
  assert.match(overlay,/\^lens:\\d\+\$/);
  assert.doesNotMatch(overlay,/lensJungian|lensStory|lensLife/);
  assert.deepEqual(cards.water.companionCards.meanings.pages.flatMap(page=>page.blocks).filter(block=>block.startsWith('lens:')),['lens:0','lens:1','lens:2']);
});

test('pattern and meaning detail paginate by indexed block rather than overflowing one card',()=>{
  assert.match(overlay,/\^function:\\d\+\$/);
  assert.match(overlay,/\^meaning:\\d\+\$/);
  assert.match(css,/article\[data-companion-block\^="function:"\]/);
  assert.match(css,/article\[data-companion-block\^="meaning:"\]/);
});

test('all authored chapter blocks are primed into the hidden stash before rendering',()=>{
  assert.match(overlay,/const allPageBlocks=\[\.\.\.new Set\(pages\.flatMap/);
  assert.match(overlay,/blockNodes\.forEach\(node=>/);
  assert.match(overlay,/stash\.appendChild\(node\)/);
  assert.match(css,/\.tarot-companion-deck > :not\(\.tarot-companion-pager\)/);
});

test('visible card heading mirrors the literal tab label',()=>{
  assert.match(overlay,/const label=chapterLabel\(chapterId\)/);
  assert.match(overlay,/<h3>\$\{escapeHTML\(label\)\}<\/h3>/);
  assert.equal(cards.water.companionCards.patterns.title,'Recurring patterns');
  assert.equal(cards.water.companionCards.geography.title,'Where it appears');
  assert.equal(cards.water.companionCards.meanings.title,'Possible meanings');
});


test('chapter strip is horizontally reachable and active tabs scroll into view',()=>{
  assert.match(overlay,/activeChapterButton\?\.scrollIntoView/);
  assert.match(overlay,/chapterStrip\?\.addEventListener\('wheel'/);
  assert.match(css,/\.tarot-triptych-nav-arrows\{[\s\S]*display:block!important/);
  assert.match(css,/touch-action:pan-x/);
});

test('dead navigation arrows are hidden rather than looking broken',()=>{
  assert.match(overlay,/prev\.hidden=atStart/);
  assert.match(overlay,/next\.hidden=atEnd/);
  assert.match(overlay,/chapterPrev\.hidden=chapterIndex<=0/);
  assert.match(overlay,/chapterNext\.hidden=chapterIndex>=chapters\.length-1/);
  assert.match(css,/\.tarot-companion-page-nav button\[hidden\]/);
});

test('geography prose has its own card page and cannot clip under the chart',()=>{
  assert.equal(cards.water.companionCards.geography.pages.length,2);
  assert.deepEqual(cards.water.companionCards.geography.pages[0].blocks,['geographyLogic','geographyRows']);
  assert.deepEqual(cards.water.companionCards.geography.pages[1].blocks,['geographyNote']);
  assert.match(css,/data-page-id="distribution-note"/);
});


test('companion frame supports a dedicated ornament-only asset with artwork fallback',()=>{
  assert.match(overlay,/data\.companionFrameImage\|\|data\.cardImage\|\|data\.previewImage/);
  assert.match(overlay,/companionFrameSource=data\.companionFrameImage\?'dedicated-frame':'artwork-fallback'/);
});
