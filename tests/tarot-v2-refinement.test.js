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

test('Water is the single gold-standard artefact exemplar',()=>{
  const gold=Object.entries(cards).filter(([,card])=>card.goldStandardExemplar);
  assert.equal(gold.length,1);
  assert.equal(gold[0][0],'water');
  assert.equal(cards.water.presentation?.mode,'artefact-scroll');
  assert.equal(cards.water.presentation?.evidenceFirst,true);
  assert.equal(cards.water.presentation?.fullArtworkOpening,true);
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
  assert.match(cards.water.interpretiveBoundary,/hypotheses|fixed translations/i);
});

test('renderer uses framing metadata and an evidence-first Water structure',()=>{
  assert.match(js,/applyFraming\(img,data,'preview'\)/);
  assert.match(js,/applyFraming\(img,data,'full'\)/);
  assert.match(js,/ensureWaterV3Structure/);
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.match(js,/dreamscape-open-dream-records/);
  assert.doesNotMatch(js,/\\n\s+target\.innerHTML/);
  assert.doesNotMatch(css,/object-position:center 38%/);
  assert.match(css,/WATER TAROT v3/);
  assert.match(css,/object-fit:contain!important/);
  assert.match(css,/attr\(data-layer-label\)/);
});
