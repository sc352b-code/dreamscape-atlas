import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cards=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const js=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');

test('Water keeps the responsive docked workspace and image-led preview',()=>{
  assert.equal(cards.water.presentation?.mode,'docked-workspace');
  assert.equal(cards.water.presentation?.previewMode,'image-led');
  assert.equal(cards.water.imageFraming?.full?.objectFit,'contain');
  assert.match(cards.water.presentation?.responsiveStrategy||'',/mobile-full-height-drawer/);
});

test('Water count semantics distinguish unique dreams from overlapping memberships',()=>{
  const counts=cards.water.corpusOverview?.territoryCounts||{};
  const memberships=Object.values(counts).reduce((sum,value)=>sum+Number(value||0),0);
  assert.equal(cards.water.corpusOverview?.wholeSeriesCount,42);
  assert.equal(memberships,69);
  assert.equal(cards.water.geographyCountMode,'overlapping-memberships');
  assert.match(js,/unique dreams ·/);
  assert.match(js,/not supposed to add up/);
});

test('Water replaces reflection with corpus-grounded behaviour synthesis',()=>{
  assert.equal(cards.water.reflectionPrompt,null);
  assert.match(cards.water.behaviorSummary||'',/crossing/i);
  assert.match(cards.water.behaviorSummary||'',/care/i);
  assert.match(js,/WHAT YOU TEND TO BE DOING AROUND WATER/);
});

test('confidence labels are explained rather than left implicit',()=>{
  assert.match(cards.water.confidenceScale?.note||'',/not percentages/i);
  assert.ok(cards.water.confidenceScale?.levels?.high);
  assert.ok(cards.water.confidenceScale?.levels?.['medium-high']);
  assert.ok(cards.water.confidenceScale?.levels?.medium);
  assert.match(js,/HOW TO READ EVIDENCE STRENGTH/);
});

test('tab state is re-applied after render helpers so sections cannot leak between tabs',()=>{
  assert.match(js,/activate\(reader\.dataset\.activeChapter\|\|'overview'\)/);
  assert.match(css,/\[data-chapter\]\[hidden\]/);
  assert.match(css,/display:none!important/);
});

test('dock refinement enlarges Tarot and ornaments the reading fields',()=>{
  assert.match(css,/TAROT DOCK REFINEMENT/);
  assert.match(css,/width:min\(100%,390px\)/);
  assert.match(css,/width:min\(100%,410px\)/);
  assert.match(css,/tarot-territory-logic/);
  assert.match(css,/tarot-confidence-legend/);
  assert.match(css,/tarot-behaviour-summary/);
  assert.match(css,/linear-gradient\(90deg,\s*rgba\(74,150,174/);
});

test('evidence and interpretation boundaries remain intact',()=>{
  assert.match(js,/INTERPRETATION · NOT CORPUS FACT/);
  assert.match(js,/dreamscape-open-dream-records/);
  assert.match(js,/related-not-cooccurrence/);
  assert.match(js,/does not yet support a strong chronology claim/);
  assert.doesNotMatch(css,/object-position:center 38%/);
});
