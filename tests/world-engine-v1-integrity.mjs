import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORLD_META,WORLDS,MOBILE_POSITIONS} from '../src/world-runtime-config.js';

const world=JSON.parse(fs.readFileSync('worlds/reference-world/world-manifest.json','utf8'));
const scene=JSON.parse(fs.readFileSync('worlds/reference-world/runtime-scene.json','utf8'));
const worldSchema=JSON.parse(fs.readFileSync('dreamscape-engine/schemas/world-manifest.schema.json','utf8'));
const sceneSchema=JSON.parse(fs.readFileSync('dreamscape-engine/schemas/runtime-scene.schema.json','utf8'));

assert.equal(world.engineVersion,'1.0.0');
assert.equal(scene.engineVersion,'1.0.0');
assert.equal(WORLD_META.engineVersion,'1.0.0');
assert.equal(world.worldId,scene.worldId);
assert.equal(world.worldId,WORLD_META.worldId);
assert.equal(world.privacy.rawCorpusPublic,false);
assert.equal(world.privacy.identifiableSourceMaterialPublic,false);
assert.equal(world.territories.length,5);
assert.equal(scene.planets.length,5);
assert.equal(WORLDS.length,5);
assert.equal(new Set(world.territories.map(t=>t.id)).size,5);
assert.equal(new Set(scene.planets.map(t=>t.id)).size,5);
assert.deepEqual(new Set(WORLDS.map(t=>t.id)),new Set(world.territories.map(t=>t.id)));
assert.deepEqual(new Set(Object.keys(MOBILE_POSITIONS)),new Set(world.territories.map(t=>t.id)));
assert.equal(world.corpus.totalDreams,362);
const hearth=world.territories.find(t=>t.id==='hearthlands');
assert.equal(hearth.associationCount,213);
assert.equal(hearth.flatMap.status,'pilot');
assert.deepEqual(hearth.flatMap.keyPlaces,['family-home']);
for(const territory of world.territories){
  assert.equal(territory.approved,true);
  assert.match(territory.planetTextureSha256,/^[0-9a-f]{64}$/);
  if(territory.id!=='hearthlands') assert.equal(territory.associationCount,null);
}
assert.equal(scene.renderer.texture.wrapS,'RepeatWrapping');
assert.equal(scene.renderer.texture.wrapT,'ClampToEdgeWrapping');
assert.equal(scene.renderer.texture.generateMipmaps,false);
assert.deepEqual(scene.renderer.sphereSegments,[128,96]);
assert.ok(worldSchema.required.includes('territories'));
assert.ok(sceneSchema.required.includes('planets'));
assert.ok(fs.existsSync('dreamscape-engine/docs/engine-v1-overview.md'));
assert.ok(fs.existsSync('dreamscape-engine/docs/privacy-boundaries.md'));
console.log('Dreamscape World Engine v1 integrity: reference world, runtime config, privacy boundary and schemas are coherent.');
