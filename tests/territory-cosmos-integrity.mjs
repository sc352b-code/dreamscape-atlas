import fs from 'node:fs';

const js=fs.readFileSync('src/territory-cosmos.js','utf8');
const css=fs.readFileSync('src/territory-cosmos.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

for(const id of ['hearthlands','littoral','roadlands','institutional','river'])assert(js.includes(`id:'${id}'`),`missing ${id}`);
assert(js.includes('import * as THREE'),'territory cosmos is not using Three.js');
assert(js.includes('new THREE.WebGLRenderer'),'territory cosmos has no WebGL renderer');
assert(js.includes('new THREE.SphereGeometry(1,128,96)'),'territory worlds are not real sphere meshes');
assert(js.includes('mesh.rotation.y+=dt*world.spin'),'territory spheres are not independently rotating');
assert(js.includes('group.position.x=base.x+driftX')&&js.includes('group.position.y=base.y+driftY'),'territory worlds do not have independent orbital drift');
assert(js.includes('camera.position.lerp')&&js.includes("rendered.get('hearthlands')"),'Hearthlands entry does not use a real 3D camera approach');
assert(js.includes("document.querySelector('.focus-panel .enter')?.click()"),'3D approach does not bridge into the existing Hearthlands descent');
assert(css.includes('.territory-cosmos__gl'),'3D territory canvas is not styled');
assert(css.includes('The WebGL planet is the artwork')||css.includes('WebGL planet is the artwork'),'DOM circle has not been demoted to an invisible hit target');
assert(index.includes('/src/territory-cosmos.js')&&index.includes('/src/territory-cosmos.css'),'territory cosmos is not loaded');
console.log('Territory cosmos integrity: ALL TESTS PASSED');
