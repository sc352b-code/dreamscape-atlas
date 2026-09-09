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
assert(js.includes('group.position.x=base.x+driftX')&&js.includes('group.position.y=base.y+driftY'),'territory worlds do not have independent orbital drift');

// Every territory must own a separate full-surface texture; there is no shared-map normal path.
for(const id of ids){
  const rel=`assets/territory-planets/${id}.webp`;
  assert(fs.existsSync(rel),`missing distinct planet texture ${rel}`);
  assert(js.includes(`/assets/territory-planets/${id}.webp`),`${id} is not wired to its own planet texture`);
}
assert(js.includes('loader.load(world.texture)'),'planet renderer is not loading each world texture directly');
assert(!js.includes('world.hearth?sourceHearth:sourceWorld'),'legacy shared texture selector is still active');
assert(!js.includes('/assets/world-equirectangular-hd.webp'),'territory planets still depend on the old shared world texture');
assert(!js.includes('/assets/hearthlands-globe-4k.webp'),'Hearthlands still depends on the old partial globe texture');

// Texture rendering must preserve the authored palettes instead of tinting every map into sameness.
assert(js.includes('color:new THREE.Color(0xffffff)'),'planet material is still over-tinting authored territory art');
assert(js.includes('texture.wrapS=THREE.RepeatWrapping'),'planet textures are not configured for equirectangular wrap');
assert(js.includes('texture.anisotropy=renderer.capabilities.getMaxAnisotropy()'),'planet textures are missing anisotropic filtering');

// Hearthlands count remains meaningful but cannot dominate the system visually.
assert(js.includes('function radiusFor(world)')&&js.includes('Math.sqrt(world.dreams)/90'),'territory radius is not using the restrained corpus-count scale');
assert(js.includes("dreams:213"),'authoritative Hearthlands count is not retained');

// Portrait mobile has its own compact five-world orrery and camera framing.
assert(js.includes('MOBILE_POSITIONS')&&js.includes('isPortraitMobile')&&js.includes('applyResponsiveLayout'),'portrait mobile does not have a dedicated five-world layout');
for(const id of ids)assert(js.includes(`${id}:[`),`mobile layout missing ${id}`);
assert(js.includes('mobile?.50')&&js.includes('mobile?.34'),'portrait worlds are not scaled/drift-limited for one-screen visibility');
assert(js.includes('camera.fov=mobile?42:34')&&js.includes('initialCamera.z=mobile?8.65:7.55'),'portrait camera is not widened/pulled back for all five worlds');
assert(css.includes('display:none!important')&&css.includes('.territory-world__cue{display:none}'),'mobile atlas chrome/labels are not simplified for portrait layout');

// Preserve the working Hearthlands journey and return route while the planet art changes.
assert(js.includes('camera.position.lerp')&&js.includes("rendered.get('hearthlands')"),'Hearthlands entry does not use a real 3D camera approach');
assert(js.includes('new THREE.LineSegments')&&js.includes('updateTunnel(dt,p,now)'),'Hearthlands entry has no real 3D cosmic star corridor');
assert(js.includes("dreamscape:cosmic-tunnel")&&css.includes('.territory-cosmos__tunnel-vignette'),'cosmic tunnel visual/audio event is not mounted');
assert(js.includes('elapsed>160')&&js.includes('elapsed>1120'),'Hearthlands entry timing changed unexpectedly');
assert(js.includes('14+50*p')&&js.includes('1+10*p'),'cosmic tunnel acceleration changed unexpectedly');
assert(js.includes("root.classList.add('fast-hearth-reveal')")&&css.includes('.atlas.fast-hearth-reveal .flatmap-scene'),'short passage does not reveal the flatmap immediately');
assert(js.includes("cosmosReturn.textContent='← Back to Worlds'")&&css.includes('.territory-cosmos-return'),'Hearthlands has no persistent return path to the territory cosmos');
assert(js.includes("event.key==='Escape'")&&js.includes('returnToCosmos'),'keyboard return path is missing');
assert(js.includes("document.querySelector('.focus-panel .enter')?.click()"),'3D approach does not bridge into the existing Hearthlands descent');

assert(css.includes('.territory-cosmos__gl'),'3D territory canvas is not styled');
assert(css.includes('WebGL planet is the artwork'),'DOM circle has not been demoted to an invisible hit target');
assert(index.includes('/src/territory-cosmos.js')&&index.includes('/src/territory-cosmos.css'),'territory cosmos is not loaded');

console.log('Territory cosmos integrity: ALL TESTS PASSED');
