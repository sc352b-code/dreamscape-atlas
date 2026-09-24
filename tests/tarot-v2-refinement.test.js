import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');

test('Water is the single gold-standard docked-workspace exemplar',()=>{
  const gold=Object.entries(cards).filter(([,card])=>card.goldStandardExemplar);
  assert.equal(gold.length,1);
  assert.equal(gold[0][0],'water');
  assert.equal(cards.water.presentation?.mode,'docked-workspace');
  assert.equal(cards.water.presentation?.previewMode,'image-led');
  assert.equal(cards.water.presentation?.evidenceFirst,true);
  assert.match(cards.water.presentation?.responsiveStrategy||'',/wide-desktop-mini-triptych/);
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
});

test('docked workspace keeps Hearthlands beside Tarot on desktop',()=>{
  assert.match(js,/ensureDockedWorkspace/);
  assert.match(js,/tarot-docked-workspace/);
  assert.match(js,/canonicalShell:'docked-workspace'/);
  assert.match(css,/CANONICAL TAROT DOCK/);
  assert.match(css,/right:var\(--tarot-dock-width\)!important/);
  assert.match(css,/--tarot-dock-width:clamp\(560px,42vw,720px\)/);
  assert.match(css,/background:rgba\(3,5,11,.07\)/);
});

test('responsive dock has distinct wide desktop, compact desktop and mobile modes',()=>{
  assert.match(css,/@media\(min-width:1600px\)/);
  assert.match(css,/@media\(min-width:900px\) and \(max-width:1199px\)/);
  assert.match(css,/@media\(max-width:899px\)/);
  assert.match(css,/--tarot-dock-width:100vw/);
  assert.match(css,/grid-template-columns:132px minmax\(300px,1.1fr\) minmax\(245px,.9fr\)/);
});

test('preview remains image-led and lightweight',()=>{
  assert.match(js,/tarot-preview-image-led/);
  assert.match(js,/tarot-preview-caption/);
  assert.match(css,/territory-v1-preview\.tarot-preview-image-led/);
  assert.match(css,/Open tarot/);
});

test('evidence and interpretation boundaries remain intact',()=>{
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.match(js,/dreamscape-open-dream-records/);
  assert.match(js,/related-not-cooccurrence/);
  assert.match(js,/does not yet support a strong chronology claim/);
  assert.doesNotMatch(css,/object-position:center 38%/);
});
