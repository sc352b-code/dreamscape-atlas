import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTarotCard,validateTarotOverlayPackage} from '../scripts/validate-tarot-engine.mjs';
import {planCompanionCards} from '../dreamscape-engine/tarot/companion-plan.js';
import {buildTarotCardV1} from '../dreamscape-engine/tarot/build-card.js';

const contract=JSON.parse(fs.readFileSync('dreamscape-engine/contracts/tarot-engine-contract.v1.json','utf8'));
const overlays=JSON.parse(fs.readFileSync('worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json','utf8'));
const runtime=fs.readFileSync('src/hearthlands-tarot-v2-overlays.js','utf8');
const baseRuntime=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
const css=fs.readFileSync('src/hearthlands-territory-v1.css','utf8');
const migration=JSON.parse(fs.readFileSync('dreamscape-engine/contracts/tarot-migration-status.json','utf8'));

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


test('public Tarot packages require private-evidence provenance',()=>{
  const card=clone(overlays.water);
  delete card.provenance;
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/provenance\.corpusVersion is required/);
  assert.match(messages(errors),/theoryNeutralExtraction must be true/);
});

test('raw dream payload keys are forbidden in the public Tarot package',()=>{
  const card=clone(overlays.water);
  card.rawDreams=[{dreamText:'private text must never be public'}];
  const errors=validateTarotCard(card,{id:'broken',contract});
  assert.match(messages(errors),/forbidden private key "rawDreams"/);
  assert.match(messages(errors),/forbidden private key "dreamText"/);
});


test('generic page planner reproduces Water page structure without Water-specific logic',()=>{
  const planned=planCompanionCards(overlays.water);
  const actual=overlays.water.companionCards;
  for(const chapter of Object.keys(actual)){
    assert.deepEqual(
      planned[chapter].pages.map(page=>page.blocks),
      actual[chapter].pages.map(page=>page.blocks),
      chapter
    );
  }
});

test('generic planner paginates dense related items and lenses instead of overpacking',()=>{
  const card=clone(overlays.water);
  card.title='Example';
  card.relatedItems=Array.from({length:7},(_,index)=>({id:`item-${index}`,label:`Item ${index}`}));
  card.interpretiveLenses=[
    {name:'Lens A',summary:'A '.repeat(30),caveat:'Context matters.'},
    {name:'Lens B',summary:'B '.repeat(20)},
    {name:'Lens C',summary:'C '.repeat(20)}
  ];
  const planned=planCompanionCards(card);
  assert.equal(planned.alongside.pages.length,2);
  assert.ok(planned.meanings.pages.length>=3);
  assert.ok(planned.meanings.pages.every(page=>page.blocks.length<=3));
});


test('canonical builder turns public-safe derived analysis into a contract-valid Tarot',()=>{
  const source=clone(overlays.water);
  delete source.tarotEngineContractVersion;
  delete source.companionCards;
  const built=buildTarotCardV1({...source,subjectId:'water'});
  const errors=validateTarotCard(built,{id:'water',contract});
  assert.deepEqual(errors,[],messages(errors));
  assert.equal(built.tarotEngineContractVersion,'1.0');
  assert.equal(built.presentation.mode,'docked-workspace');
  assert.equal(built.presentation.previewMode,'image-led');
  assert.equal(built.privateCorpusAccess.expectedDreamCount,42);
});

test('canonical builder refuses raw/private dream payloads',()=>{
  const source=clone(overlays.water);
  delete source.tarotEngineContractVersion;
  delete source.companionCards;
  assert.throws(
    ()=>buildTarotCardV1({...source,subjectId:'water',dreamRecords:[{dreamText:'private'}]}),
    /forbidden private key/
  );
});


test('only Water is currently allowed as the v1 engine exemplar',()=>{
  assert.equal(migration.canonicalExemplar,'water');
  assert.equal(migration.records.water.status,'canonical-v1');
  assert.equal(migration.records.water.mayBeUsedAsEngineTemplate,true);
  for(const [id,status] of Object.entries(migration.records)){
    if(id==='water') continue;
    assert.equal(status.mayBeUsedAsEngineTemplate,false,id);
    assert.match(status.status,/pending-migration/);
  }
});

test('fixed companion pages have a runtime overflow audit',()=>{
  assert.equal(contract.layout.runtimeFitAuditRequired,true);
  assert.match(runtime,/dreamscape-tarot-fit-failure/);
  assert.match(runtime,/body\.scrollHeight>body\.clientHeight/);
  assert.match(runtime,/ResizeObserver/);
  assert.match(runtime,/card\.dataset\.fit=/);
});


test('every recurring function and possible meaning is explicitly paginated',()=>{
  const patternBlocks=overlays.water.companionCards.patterns.pages.flatMap(page=>page.blocks);
  const meaningBlocks=overlays.water.companionCards.meanings.pages.flatMap(page=>page.blocks);
  overlays.water.recurringFunctions.forEach((_,index)=>{
    assert.ok(patternBlocks.includes(`function:${index}`),`function:${index}`);
  });
  overlays.water.possibleMeanings.forEach((_,index)=>{
    assert.ok(meaningBlocks.includes(`meaning:${index}`),`meaning:${index}`);
  });
});

test('validator rejects an unpaginated recurring function or possible meaning',()=>{
  const card=clone(overlays.water);
  card.companionCards.patterns.pages=card.companionCards.patterns.pages.map(page=>({
    ...page,
    blocks:page.blocks.filter(block=>block!=='function:3')
  }));
  card.companionCards.meanings.pages=card.companionCards.meanings.pages.map(page=>({
    ...page,
    blocks:page.blocks.filter(block=>block!=='meaning:3')
  }));
  const errors=validateTarotCard(card,{id:'water',contract});
  assert.match(messages(errors),/recurring function 3 is not paginated/);
  assert.match(messages(errors),/possible meaning 3 is not paginated/);
});

test('canonical chapter titles are literal navigation labels',()=>{
  assert.equal(overlays.water.companionCards.overview.title,'Overview');
  assert.equal(overlays.water.companionCards.geography.title,'Where it appears');
  assert.equal(overlays.water.companionCards.patterns.title,'Recurring patterns');
  assert.equal(overlays.water.companionCards.alongside.title,'Appears alongside');
  assert.equal(overlays.water.companionCards.chronology.title,'How it changes');
  assert.equal(overlays.water.companionCards.sources.title,'Source dreams');
  assert.equal(overlays.water.companionCards.meanings.title,'Possible meanings');
});
