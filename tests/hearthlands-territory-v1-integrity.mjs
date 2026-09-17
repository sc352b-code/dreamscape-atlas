import assert from 'node:assert/strict';
import fs from 'node:fs';

const base='worlds/reference-world/territories/hearthlands';
const manifest=JSON.parse(fs.readFileSync(`${base}/territory-manifest.json`,'utf8'));
const tarot=JSON.parse(fs.readFileSync(`${base}/tarot/tarot-cards.json`,'utf8'));
const coverage=JSON.parse(fs.readFileSync(`${base}/validation/artwork-coverage.json`,'utf8'));
const asset=JSON.parse(fs.readFileSync(`${base}/assets/hearthlands-flat-map.asset.json`,'utf8'));
const runtime=fs.readFileSync('src/hearthlands-territory-v1.js','utf8');
const transition=fs.readFileSync('src/hearthlands-transition-fix.js','utf8');
const transitionCSS=fs.readFileSync('src/hearthlands-seamless-entry.css','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.equal(manifest.id,'hearthlands');
assert.equal(manifest.worldId,'dreamscape-reference-world');
assert.equal(manifest.sourceCorpusSummary.associatedDreamCount,213);
assert.equal(manifest.sourceCorpusSummary.associatedDreamCountStatus,'known');
assert.equal(manifest.flatMap.status,'approved');
assert.equal(manifest.flatMap.interactiveArtwork,true);
assert.equal(manifest.flatMap.labelsPolicy,'minimal');
assert.equal(manifest.zoom.pan.enabled,true);
assert.equal(manifest.zoom.pan.clampToArtwork,true);
assert.equal(manifest.zoom.preserveViewState,true);
assert.equal(manifest.zoom.controls.wheel,true);
assert.equal(manifest.zoom.controls.pinch,true);
assert.equal(manifest.zoom.controls.doubleTap,true);
assert.equal(manifest.zoom.controls.dragPan,true);
assert.equal(manifest.places.length,6);
assert.equal(manifest.symbols.length,76);
assert.equal(new Set(manifest.places.map(x=>x.id)).size,6);
assert.equal(new Set(manifest.symbols.map(x=>x.id)).size,76);

const expectedPlaces=['childhood-house','family-home','current-present-house','large-many-roomed-house','unfamiliar-house','haunted-17-bedroom-mansion'];
assert.deepEqual(new Set(manifest.places.map(x=>x.id)),new Set(expectedPlaces));

for(const item of [...manifest.places,...manifest.symbols]){
  assert.ok(item.tarotCardRef in tarot,`Missing tarot: ${item.tarotCardRef}`);
  assert.equal(item.corpusEvidence.privacyClass,'public-safe-derived');
  if(item.id.startsWith('person-')){
    assert.equal(item.semanticIdentity?.labelSource,'private-profile');
    assert.equal(item.semanticIdentity?.labelResolvedInPublicRuntime,false);
    assert.equal(item.interaction.clickable,false);
    assert.equal(item.interaction.hoverable,false);
  }else{
    assert.ok(item.interaction.clickable);
  }
}
for(const p of manifest.places) assert.ok(p.map.x>=0&&p.map.x<=1&&p.map.y>=0&&p.map.y<=1);
for(const s of manifest.symbols){
  assert.ok(s.map.placements.length>=1);
  for(const p of s.map.placements) assert.ok(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);
  for(const related of s.corpusEvidence.relatedPlaceIds??[]) assert.ok(expectedPlaces.includes(related),`Invalid place evidence ${related}`);
}
assert.equal(manifest.symbols.filter(x=>x.id.startsWith('person-')).length,15);
assert.equal(coverage.requirements.canonicalPlaces,6);
assert.equal(coverage.requirements.spatialMotifs,23);
assert.equal(coverage.requirements.symbols,76);
assert.equal(coverage.requirements.visualRequirements,105);
assert.equal(coverage.approvalGate.runtimeCoverageComplete,true);
assert.equal(coverage.approvalGate.visualArtworkAuditComplete,false);
assert.equal(coverage.symbols.filter(x=>x.visualAuditVerified).length,0);

assert.equal(asset.mime,'image/png');
assert.equal(asset.width,6144);
assert.equal(asset.height,4096);
assert.equal(asset.aspectRatio,1.5);
assert.match(asset.sha256,/^[0-9a-f]{64}$/);
assert.equal(asset.file,'./hearthlands-flat-map.png');
assert.match(asset.sourceTreatment,/composition-preserving/);
assert.ok(fs.existsSync(`${base}/assets/hearthlands-flat-map.png`),'Missing approved Hearthlands flat-map PNG');

const serialized=JSON.stringify(manifest);
for(const forbidden of ['Natalie','Alex','Alice','Stephen Coarse','Wayne','Carl Jung','Recurring Figure','recurring-figure-']) assert.ok(!serialized.includes(forbidden),`Manifest still intentionally contains technical identity records only: ${forbidden}`);
assert.match(runtime,/territoryZoomStage/);
assert.match(runtime,/wheel/);
assert.match(runtime,/pointer/);
assert.match(runtime,/enterDreamscapeFamilyHome/);

assert(index.includes('rel="preload" as="image" href="/worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png"'));
assert(index.includes('/src/hearthlands-transition-fix.js'));
assert(index.includes('/src/hearthlands-seamless-entry.css'));
assert(transition.includes("FINAL_HEARTHLANDS_ART='/worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png'"));
assert(transition.includes('hearthlands-seamless-entry'));
assert(transition.includes('hearthlands-map-takeover'));
assert(!transition.includes("dispatchEvent(new Event('resize'))"));
assert(transitionCSS.includes('.territory-cosmos__blackout'));
assert(transitionCSS.includes('.descent-copy'));
assert(transitionCSS.includes('display:none!important'));
assert(transitionCSS.includes('transition:opacity 1.18s'));
assert(transitionCSS.includes('transform:none!important'));
assert(transitionCSS.includes('width:min(100vw,150vh)!important'));

console.log('Hearthlands Territory Layer v1 integrity: 6 places, 76 symbols, semantic zoom/pan, tarot routing and a preloaded direct planet-to-map crossfade are coherent.');
