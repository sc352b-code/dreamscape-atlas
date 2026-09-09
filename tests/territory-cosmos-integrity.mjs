import fs from 'node:fs';

const js=fs.readFileSync('src/territory-cosmos.js','utf8');
const css=fs.readFileSync('src/territory-cosmos.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const ids=['hearthlands','littoral','roadlands','institutional','river'];

for(const id of ids)assert(js.includes(`id:'${id}'`),`missing ${id}`);
assert(js.includes('import * as THREE'),'territory cosmos is not using Three.js');
assert(js.includes('new THREE.WebGLRenderer'),'territory cosmos has no WebGL renderer');
assert(js.includes('new THREE.SphereGeometry(1,128,96)'),'territory worlds are not real sphere meshes');
assert(js.includes('mesh.rotation.y+=dt*world.spin'),'territory spheres are not independently rotating');
assert(js.includes('group.position.x=base.x+')&&js.includes('group.position.y=base.y+'),'territory worlds do not have independent drift');

for(const id of ids){
  const rel=`assets/territory-planets/${id}.webp`;
  assert(fs.existsSync(rel),`missing planet texture ${rel}`);
  assert(js.includes(`/assets/territory-planets/${id}.webp`),`${id} is not wired to its own texture`);
}
assert(js.includes('loader.load(world.texture)'),'planet renderer is not loading each world texture directly');
assert(!js.includes('world.hearth?sourceHearth:sourceWorld'),'legacy shared texture selector is still active');
assert(!js.includes('/assets/world-equirectangular-hd.webp'),'territory planets still depend on the old shared texture');
assert(!js.includes('/assets/hearthlands-globe-4k.webp'),'Hearthlands still depends on the old partial globe texture');

assert(js.includes('texture.wrapS=THREE.RepeatWrapping'),'equirectangular horizontal wrap is missing');
assert(js.includes('texture.wrapT=THREE.ClampToEdgeWrapping'),'vertical globe texture clamp is missing');
assert(js.includes('texture.anisotropy=renderer.capabilities.getMaxAnisotropy()'),'anisotropic texture filtering is missing');
assert(js.includes('new THREE.AmbientLight(0xffffff,1.45)'),'minimum map-light floor is missing');
assert(js.includes('emissive:new THREE.Color(0xffffff)')&&js.includes('emissiveMap:texture'),'full-turn geography visibility floor is missing');
assert(js.includes('baseEmissive=world=>world.hearth?.17:.15'),'planet geography is still allowed to become too dark');

assert(js.includes('totalDreams:362'),'whole-corpus dream count is not recorded correctly');
assert(js.includes('hearthlands:213'),'Hearthlands territory count is not kept separate from the corpus total');
for(const id of ['roadlands','littoral','institutional','river'])assert(js.includes(`${id}:null`),`${id} count is being fabricated instead of marked unknown`);
assert(js.includes('allTerritoryCountsKnown')&&js.includes('if(!allTerritoryCountsKnown())return world.radius'),'planet sizes are being treated as proportional before all five counts are known');

assert(js.includes('MOBILE_POSITIONS')&&js.includes('isPortraitMobile')&&js.includes('applyResponsiveLayout'),'portrait mobile does not have a dedicated five-world layout');
for(const id of ids)assert(js.includes(`${id}:[`),`mobile layout missing ${id}`);
assert(js.includes('mobile?.47')&&js.includes('mobile?.28'),'portrait worlds are not compact enough for one-screen system visibility');
assert(js.includes('camera.fov=mobile?46:34')&&js.includes('initialCamera.z=mobile?9.15:7.55'),'portrait camera is not widened/pulled back enough');
assert(css.includes('.territory-world__cue{display:none}'),'mobile secondary labels are not simplified');

assert(js.includes('camera.position.lerp')&&js.includes("rendered.get('hearthlands')"),'Hearthlands entry no longer uses a real 3D camera approach');
assert(js.includes('new THREE.LineSegments')&&js.includes('updateTunnel(dt,p,now)'),'cosmic star corridor is missing');
assert(js.includes("dreamscape:cosmic-tunnel")&&css.includes('.territory-cosmos__tunnel-vignette'),'cosmic transition event is missing');
assert(js.includes("cosmosReturn.textContent='← Back to Worlds'")&&css.includes('.territory-cosmos-return'),'persistent return path is missing');
assert(js.includes("e.key==='Escape'")&&js.includes('returnToCosmos'),'keyboard return path is missing');
assert(index.includes('/src/territory-cosmos.js')&&index.includes('/src/territory-cosmos.css'),'territory cosmos is not loaded');

assert(fs.existsSync('tools/upgrade_territory_planets.py'),'matched-resolution planet upgrader is missing');
assert(fs.existsSync('tools/validate_territory_planets.py'),'360-degree planet validator is missing');
console.log('Territory cosmos integrity: ALL TESTS PASSED');
