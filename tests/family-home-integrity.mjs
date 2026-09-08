import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const importSource=async(p)=>{const code=read(p);return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)};
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const pass=(message)=>console.log(`PASS: ${message}`);

const data=await importSource('src/family-home-pilot-data.js');
const readings=await importSource('src/v57-family-home-readings.js');
const manifest=JSON.parse(read('assets/family-home-pilot/manifest.json'));
const pilotSource=read('src/family-home-pilot.js');
const approachSource=read('src/family-home-approach.js');
const sceneV2Css=read('src/family-home-scene-v2.css');
const routeFixSource=read('src/family-home-route-fix.js');
const indexSource=read('index.html');
const audioSource=read('src/cosmos-ambience.js');
const polishSource=read('src/atlas-polish.css');
const preludeSource=read('src/buildpass-prelude.js');

const expectedIds=['house','mum','water','garden','cat','dog','window','bed','light','sea','fish','egg','octopus'];
assert(data.FAMILY_HOME_SYMBOLS.length===13,`Expected 13 Family Home symbols, got ${data.FAMILY_HOME_SYMBOLS.length}`);
assert(JSON.stringify(data.FAMILY_HOME_SYMBOLS.map(s=>s.id))===JSON.stringify(expectedIds),'Family Home symbol IDs/order differ from authoritative pilot set');
pass('exactly 13 authoritative Family Home symbols');

for(const symbol of data.FAMILY_HOME_SYMBOLS){
  assert(symbol.familyHomeDreams>0,`${symbol.id} has no Family Home intersection`);
  assert((symbol.places?.['Family Home']??0)===symbol.familyHomeDreams,`${symbol.id} Family Home count mismatch`);
  const reading=readings.getV57Reading(symbol.id);
  assert(reading,`${symbol.id} does not resolve to a v57 reading record`);
  assert(reading.complete?.id===symbol.id,`${symbol.id} completeSymbolData extract mismatch`);
  assert(reading.complete?.art===symbol.tarotArt,`${symbol.id} tarot filename mismatch`);
}
pass('all 13 symbols retain non-zero Family Home evidence and v57 reading identity');

const expectedTierIds={territory:['house','mum','water','garden','cat'],place:['house','mum','water','garden','cat','dog','window','bed','light'],close:expectedIds};
for(const [tier,ids] of Object.entries(expectedTierIds)){
  const actual=data.FAMILY_HOME_SYMBOLS.filter(s=>data.visibleAtZoom(s,tier)).map(s=>s.id);
  assert(JSON.stringify(actual)===JSON.stringify(ids),`${tier} semantic zoom exposes ${actual.join(',')} instead of ${ids.join(',')}`);
}
pass('territory/place/close semantic zoom exposes the intended records');

assert(manifest.symbols.length===13,'Asset manifest must contain exactly 13 symbols');
assert(JSON.stringify(manifest.symbols.map(s=>s.id))===JSON.stringify(expectedIds),'Asset manifest IDs do not match Family Home pilot IDs');
assert(manifest.placeScene?.octopusAsset==='family-home-octopus-tile.webp','Approved Family Home painterly asset is not registered');
assert(fs.existsSync(path.join(root,'assets/family-home-pilot',manifest.placeScene.octopusAsset)),'Approved Family Home painterly asset is missing');
assert(sceneV2Css.includes("family-home-octopus-tile.webp"),'Dedicated Family Home scene does not use the approved painterly asset');
assert(sceneV2Css.includes('data-family-home-focus="close"')||sceneV2Css.includes('[data-family-home-focus="close"]'),'Dedicated Family Home scene has no close semantic framing');
assert(routeFixSource.includes("root.dataset.familyHomeFocus='place'")&&routeFixSource.includes("[data-place=\"Family Home\"]"),'Family Home marker does not route directly into the dedicated place scene');
assert(indexSource.includes('/src/family-home-route-fix.js')&&indexSource.includes('/src/family-home-scene-v2.css'),'Corrected Family Home route/scene files are not loaded');
assert(approachSource.includes('.painted-symbol-hotspot[data-symbol="octopus"]')&&approachSource.includes('readerBridge.click()'),'Octopus scene hotspot is not bridged to the existing v57 symbol reader');
pass('dedicated Family Home place scene, direct route and Octopus-to-reader bridge are mounted');

assert(/hit\.disabled=true/.test(pilotSource),'Pilot must create hotspots disabled');
assert(/img\.addEventListener\('load'[\s\S]*hit\.disabled=false/.test(pilotSource),'Pilot may enable a hotspot only after its painted asset loads');
assert(/img\.addEventListener\('error'[\s\S]*hit\.disabled=true/.test(pilotSource),'Pilot must keep/return hotspot disabled when painted asset is absent');
assert(/img\.remove\(\)/.test(pilotSource),'Absent painted assets must be removed from the visible layer');
pass('absent painted assets cannot create visible/clickable hotspots');

assert(!indexSource.includes('/src/hearthlands-symbols.js'),'Legacy hearthlands-symbols.js glyph overlay is still loaded');
assert(!indexSource.includes('/src/hearthlands-symbols.css'),'Legacy hearthlands-symbols.css glyph overlay is still loaded');
assert(!pilotSource.includes('corpus-symbol-glyph'),'Pilot source still contains corpus glyph markup');
pass('legacy glyph-overlay system is not loaded by the pilot');

assert(indexSource.includes('/src/atlas-polish.css'),'Planet visual-polish layer is not loaded');
assert(polishSource.includes('.globe-stage canvas'),'Planet visual-polish layer does not target globe presentation');
assert(preludeSource.includes('canvas.width=4096')&&preludeSource.includes('canvas.height=2048')&&preludeSource.includes('world-equirectangular.png'),'Authored world texture is not promoted to a 4K runtime texture');
assert(sceneV2Css.includes('transform:scale(.93)'),'Orbit globe is not framed to remain fully visible');
pass('planet presentation uses 4K runtime promotion and full-sphere framing');

assert(audioSource.includes('bowlBloom')&&audioSource.includes('bedFreqs'),'Cosmic ambience is not using continuous meditation bed plus bowl resonance');
assert(audioSource.includes('15500+Math.random()*9000'),'Bowl blooms are not irregular/spacious');
assert(!audioSource.includes('createBufferSource'),'Cosmic ambience must not reintroduce broadband noise');
pass('cosmic ambience uses a sustained tonal meditation bed with irregular resonant bowl blooms and no broadband noise');

const authored=['house','water','mum','cat','dog'];
for(const id of authored)assert(readings.getV57Reading(id)?.profile,`${id} authored v57 profile is not mounted`);
pass('authored v57 interpretive profiles are mounted for House, Water, Mum, Cat and Dog');

async function imageExists(url){
  try{let response=await fetch(url,{method:'HEAD',redirect:'follow'});if(response.ok)return true;response=await fetch(url,{method:'GET',redirect:'follow',headers:{Range:'bytes=0-32'}});return response.ok}catch{return false}
}
const tarotFailures=[];
for(const symbol of data.FAMILY_HOME_SYMBOLS){
  const reading=readings.getV57Reading(symbol.id);
  const remote=reading.tarotCandidates.find(url=>url.startsWith('https://'));
  assert(remote,`${symbol.id} has no remote v57 tarot fallback`);
  if(!await imageExists(remote))tarotFailures.push(`${symbol.id}: ${remote}`);
}
assert(tarotFailures.length===0,`Referenced v57 tarot images were not reachable:\n${tarotFailures.join('\n')}`);
pass('all 13 referenced v57 tarot images exist and are reachable');

console.log('\nFamily Home integrity suite: ALL TESTS PASSED');
