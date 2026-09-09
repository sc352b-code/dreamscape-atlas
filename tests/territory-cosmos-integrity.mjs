import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const source=fs.readFileSync('src/territory-cosmos.js','utf8');
const expected={
  hearthlands:'45df38c01f03a99f2b5bb7d88754011e33fba063ebb021d2b66bbf8411b8299c',
  roadlands:'a0288bd86c4c6f3ec844d3c078d6ab5dadbbc8d65a07b660bd10d02020b0eccd',
  littoral:'33b9c65a3d77921e613c0230f4b2579dd6ecc5988eb07e7f03f9fcf0461d0cf3',
  institutional:'43d9bbc6a4c65676418abc3a21ad9a4facd2ba2e9d1c9333f27c6844fb02e8f3',
  river:'091ad36ab28c5f2548f45aa92674c3388a3c8f45f20b8b0b01c709fdc08e67a7',
};
for(const [id,hash] of Object.entries(expected)){
  const rel=`assets/territory-planets/${id}.jpg`;
  assert.ok(fs.existsSync(rel),`${rel} must exist`);
  const bytes=fs.readFileSync(rel);
  assert.equal(bytes[0],0xff); assert.equal(bytes[1],0xd8); assert.equal(bytes[2],0xff);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash,`${id} must be the exact q18 JPEG`);
  assert.ok(source.includes(`/assets/territory-planets/${id}.jpg`),`${id} renderer JPEG path missing`);
  assert.ok(!source.includes(`/assets/territory-planets/${id}.webp`),`${id} must not use old WebP`);
}
assert.equal(new Set(Object.keys(expected)).size,5);
assert.match(source,/new THREE\.SphereGeometry\(1,128,96\)/,'real high-resolution sphere geometry required');
assert.match(source,/mesh\.rotation\.y\s*\+=/,'each world must rotate as a 3D mesh');
assert.match(source,/texture\.wrapS=THREE\.RepeatWrapping/,'horizontal texture repeat required');
assert.match(source,/texture\.wrapT=THREE\.ClampToEdgeWrapping/,'vertical clamp required');
assert.match(source,/texture\.anisotropy=renderer\.capabilities\.getMaxAnisotropy\(\)/,'anisotropic filtering required');
assert.match(source,/emissiveMap:texture/,'texture-backed emissive visibility floor required');
assert.match(source,/new THREE\.AmbientLight\(0xffffff,1\.45\)/,'ambient geography visibility floor required');
assert.match(source,/MOBILE_POSITIONS/,'mobile five-world layout must remain');
for(const id of Object.keys(expected)) assert.match(source,new RegExp(`${id}:\\[`),`${id} mobile position missing`);
assert.match(source,/totalDreams:362/,'corpus total must remain 362');
assert.match(source,/hearthlands:213/,'Hearthlands corpus count must remain 213');
console.log('Territory cosmos integrity: exact q18 JPEGs + five rotating Three.js worlds verified.');
