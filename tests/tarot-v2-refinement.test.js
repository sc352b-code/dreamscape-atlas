import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');

test('exemplar cards support independent preview and full framing',()=>{
  const exemplars=Object.values(cards).filter(card=>card.imageFraming);
  assert.ok(exemplars.length>=3);
  for(const card of exemplars){
    assert.ok(card.imageFraming.preview?.objectPosition);
    assert.ok(card.imageFraming.full?.objectPosition);
  }
});

test('Water is the single gold-standard triptych exemplar',()=>{
  const gold=Object.entries(cards).filter(([,card])=>card.goldStandardExemplar);
  assert.equal(gold.length,1);
  assert.equal(gold[0][0],'water');
  assert.equal(cards.water.presentation?.mode,'triptych');
  assert.equal(cards.water.presentation?.previewMode,'image-led');
  assert.equal(cards.water.presentation?.evidenceFirst,true);
  assert.equal(cards.water.presentation?.fullArtworkOpening,true);
  assert.equal(cards.water.corpusOverview?.totalCorpusDreams,362);
  assert.equal(cards.water.relationshipStatus,'related-not-cooccurrence');
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
});

test('triptych shell makes the Tarot the central object',()=>{
  assert.match(js,/ensureTriptychShell/);
  assert.match(js,/tarot-triptych-shell/);
  assert.match(js,/tarot-triptych-nav/);
  assert.match(js,/tarot-triptych-center/);
  assert.match(js,/tarot-triptych-info/);
  assert.match(js,/tarot-dream-medallion/);
  assert.match(js,/data-chapter-id/);
  assert.doesNotMatch(js,/ensureSidePanelShell/);
  assert.match(css,/CANONICAL TAROT TRIPTYCH/);
  assert.match(css,/grid-template-columns:minmax\(170px,.72fr\) minmax\(360px,1.28fr\) minmax\(300px,1fr\)/);
  assert.match(css,/aspect-ratio:2\/3/);
});

test('preview is image-led rather than a mini information page',()=>{
  assert.match(js,/tarot-preview-image-led/);
  assert.match(js,/tarot-preview-caption/);
  assert.match(css,/territory-v1-preview\.tarot-preview-image-led/);
  assert.match(css,/aspect-ratio:4\/5/);
  assert.match(css,/display:none!important/);
});

test('evidence remains separate from interpretation and privacy is preserved',()=>{
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.match(js,/dreamscape-open-dream-records/);
  assert.match(js,/related-not-cooccurrence/);
  assert.match(js,/does not yet support a strong chronology claim/);
  assert.doesNotMatch(css,/object-position:center 38%/);
});
