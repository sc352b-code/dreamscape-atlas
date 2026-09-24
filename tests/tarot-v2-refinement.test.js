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

test('Water is the single gold-standard side-panel exemplar',()=>{
  const gold=Object.entries(cards).filter(([,card])=>card.goldStandardExemplar);
  assert.equal(gold.length,1);
  assert.equal(gold[0][0],'water');
  assert.equal(cards.water.presentation?.mode,'side-panel');
  assert.equal(cards.water.presentation?.evidenceFirst,true);
  assert.equal(cards.water.presentation?.fullArtworkOpening,true);
  assert.equal(cards.water.corpusOverview?.totalCorpusDreams,362);
  assert.equal(cards.water.relationshipStatus,'related-not-cooccurrence');
  assert.match(cards.water.interpretiveBoundary,/hypotheses|fixed translations/i);
});

test('side-panel shell preserves map context and chapter navigation',()=>{
  assert.match(js,/ensureSidePanelShell/);
  assert.match(js,/tarot-chapter-nav/);
  assert.match(js,/data-chapter-id/);
  assert.match(js,/tarot-dream-medallion/);
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.match(js,/dreamscape-open-dream-records/);
  assert.match(js,/does not yet support a strong chronology claim/);
  assert.doesNotMatch(js,/ensureWaterV3Structure/);
  assert.doesNotMatch(css,/object-position:center 38%/);
  assert.match(css,/TAROT SIDE-PANEL SHELL/);
  assert.match(css,/width:clamp\(430px,37vw,640px\)/);
  assert.match(css,/background:rgba\(3,5,12,.18\)/);
});

test('Water keeps complete portrait artwork and avoids unverified co-occurrence claims',()=>{
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
  assert.match(js,/related-not-cooccurrence/);
  assert.match(js,/does not yet claim that each one repeatedly occurs in the same dreams/);
});
