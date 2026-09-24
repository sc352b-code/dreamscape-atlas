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

test('one card establishes the gold-standard pattern',()=>{
  const gold=Object.values(cards).filter(card=>card.goldStandardExemplar);
  assert.equal(gold.length,1);
  assert.match(gold[0].interpretiveBoundary,/hypotheses|fixed translations/i);
});

test('renderer uses metadata and distinguishes evidence from interpretation',()=>{
  assert.match(js,/applyFraming\(img,data,'preview'\)/);
  assert.match(js,/applyFraming\(img,data,'full'\)/);
  assert.doesNotMatch(css,/object-position:center 38%/);
  assert.match(css,/EVIDENCE/);
  assert.match(css,/INTERPRETATION/);
});
