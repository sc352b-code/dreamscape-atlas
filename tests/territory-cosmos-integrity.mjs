import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {WORLD_META,WORLDS,MOBILE_POSITIONS} from '../src/world-runtime-config.js';

const source=fs.readFileSync('src/territory-cosmos.js','utf8');
const manifest=JSON.parse(fs.readFileSync('worlds/reference-world/world-manifest.json','utf8'));
const manifestById=new Map(manifest.territories.map(item=>[item.id,item]));
const ids=['hearthlands','roadlands','littoral','institutional','river'];

assert.equal(WORLD_META.worldId,manifest.worldId);
assert.equal(WORLD_META.totalDreams,362);
assert.equal(WORLD_META.territoryDreams.hearthlands,213);
assert.equal(WORLD_META.territoryDreams.roadlands,null);
assert.equal(WORLD_META.territoryDreams.littoral,null);
assert.equal(WORLD_META.territoryDreams.institutional,null);
assert.equal(WORLD_META.territoryDreams.river,null);
assert.equal(WORLDS.length,5);
assert.equal(Object.keys(MOBILE_POSITIONS).length,5);

for(const id of ids){
  const world=WORLDS.find(item=>item.id===id);
  const entry=manifestById.get(id);
  assert.ok(world,`${id} runtime world missing`);
  assert.ok(entry,`${id} manifest entry missing`);
  assert.equal(world.texture,entry.planetTexture,`${id} runtime texture must come from approved manifest mapping`);
  assert.equal(world.cue,entry.subtitle,`${id} runtime cue must match manifest subtitle`);
  const rel=entry.planetTexture.replace(/^\//,'');
  assert.ok(fs.existsSync(rel),`${rel} must exist`);
  const sha=crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex');
  assert.equal(sha,entry.planetTextureSha256,`${id} final texture hash changed from approved planetary baseline`);
}

const sizes=ids.map(id=>fs.statSync(manifestById.get(id).planetTexture.replace(/^\//,'')).size);
assert.equal(new Set(sizes).size,5,'final territory assets should be five distinct files');
assert.doesNotMatch(source,/path2-test\.png/,'temporary Path 2 texture reference must be gone');
assert.doesNotMatch(source,/q18-clean\.(?:png|jpg)/,'q18-clean texture references must not be active');
assert.match(source,/from ['"]\.\/world-runtime-config\.js['"]/,'territory renderer must consume World Engine runtime config');
assert.match(source,/new THREE\.SphereGeometry\(1,128,96\)/);
assert.match(source,/mesh\.rotation\.y\s*\+=/);
assert.match(source,/texture\.wrapS=THREE\.RepeatWrapping/);
assert.match(source,/texture\.wrapT=THREE\.ClampToEdgeWrapping/);
assert.match(source,/texture\.minFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.magFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.generateMipmaps=false/);

console.log('Territory cosmos integrity: approved planets are config-driven and hash-locked one-to-one.');
