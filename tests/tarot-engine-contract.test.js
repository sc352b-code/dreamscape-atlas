import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTarotCard,validateTarotOverlayPackage} from '../scripts/validate-tarot-engine.mjs';

const contract=JSON.parse(fs.readFileSync('dreamscape-engine/contracts/tarot-engine-contract.v1.json','utf8'));
const overlays=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const runtime=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const baseRuntime=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');

const clone=value=>structuredClone(value);
const messages=errors=>errors.join('\n');

test('Water passes the canonical Tarot engine contract',()=>{
  const errors=validateTarotCard(overlays.water,{id:'water',contract});
  assert.deepEqual(errors,[],messages(errors));
});

test('overlay package contract validator finds the docked gold-standard Tarot',()=>{
  const result=validateTarotOverlayPackage();
  assert.ok(result.checked>=1);
  assert.deepEqual(result.errors,[],messages(result.errors));
});

test('canonical chapter omissions are rejected',()=>{
  const card=clone(overlays.water);
  delete card.companionCards.patterns;
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/missing canonical companion chapter: patterns/);
});

test('overpacked pages are rejected instead of shrinking content',()=>{
  const card=clone(overlays.water);
  card.companionCards.overview.pages[0].blocks=['heroMetric','grounding','metrics','behaviour'];
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/exceeds page budget/);
});

test('territory-count semantics must be explicit and mathematically coherent',()=>{
  const card=clone(overlays.water);
  card.geographyCountMode='exclusive-dream-counts';
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/exclusive territory counts must tally/);
});

test('confidence labels require an explicit qualitative scale',()=>{
  const card=clone(overlays.water);
  delete card.confidenceScale.levels['medium-high'];
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/medium-high.*lacks a definition/);
});

test('related elements require explicit relationship semantics',()=>{
  const card=clone(overlays.water);
  card.relationshipStatus='pending';
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/relationshipStatus must be explicit/);
});

test('every interpretive lens must be paginated generically',()=>{
  const card=clone(overlays.water);
  card.companionCards.meanings.pages=card.companionCards.meanings.pages.filter(page=>page.id!=='lens-1');
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/interpretive lens 0 is not paginated/);
});

test('source-dream records cannot be packed into the fixed Tarot card',()=>{
  const card=clone(overlays.water);
  card.companionCards.sources.pages[0].blocks.push('dreamRecords');
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/unknown block "dreamRecords"|forbidden inside the fixed Tarot/);
});

test('private source count must agree with unique corpus count',()=>{
  const card=clone(overlays.water);
  card.privateCorpusAccess.expectedDreamCount=41;
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/expectedDreamCount must match unique dream count/);
});

test('new docked Tarots must declare the engine contract version',()=>{
  const card=clone(overlays.water);
  delete card.tarotEngineContractVersion;
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/tarotEngineContractVersion must be 1\.0/);
});

test('runtime uses one permanent companion Tarot shell per tab',()=>{
  assert.match(runtime,/let card=pager\.querySelector\(':scope > \.tarot-companion-page'\)/);
  assert.match(runtime,/__dreamscapeSetCompanionPage/);
  assert.match(runtime,/moveBodyToStash/);
  assert.doesNotMatch(runtime,/pages\.forEach\(\(pageConfig,index\)=>/);
});

test('page controls are stable and independent of observer refreshes',()=>{
  assert.match(runtime,/pager\.addEventListener\('click',[\s\S]*?\},true\);/);
  assert.match(runtime,/target\.closest\('\.tarot-companion-pager'\)/);
  assert.match(css,/\.tarot-page-dot/);
});

test('compact preview is composed and positioned before reveal',()=>{
  const dispatchIndex=baseRuntime.indexOf('dreamscape-preview-will-open');
  const positionIndex=baseRuntime.indexOf('positionPreview(button,true)');
  const revealIndex=baseRuntime.indexOf("preview.classList.add('open')");
  assert.ok(dispatchIndex>=0&&positionIndex>dispatchIndex&&revealIndex>positionIndex);
  assert.match(runtime,/composePreview\(preview,data\)/);
});
