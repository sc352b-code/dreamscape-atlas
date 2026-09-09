import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const source=fs.readFileSync('src/territory-cosmos.js','utf8');
const expected={
  hearthlands:'fe18c3e4b4eddd20a027f409e03f9249b27100c7e48c292973f2f12e57143cf3',
  roadlands:'bc8d6dd6fa0f1650d9915819580d92ecf7c7277e5b135733e052f50b977c3b29',
  littoral:'707e5d1eb41f65750cfd8baa1a890ff5f6a535177306a75cbfd52616528a3e85',
  institutional:'fb7b0ba4ef6e0ca0d5d24e19f1d2c3d5d5cace95a8c06cd9c199654727e10871',
  river:'dbab882b84c498577200cd90c7379a915a00ee1ffbe6afd61eba31077800e8b0',
};
for(const [id,hash] of Object.entries(expected)){
  const rel=`assets/territory-planets/${id}-q18-clean.jpg`;
  assert.ok(fs.existsSync(rel),`${rel} must exist`);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex'),hash,`${id} clean texture hash mismatch`);
  assert.ok(source.includes(`/assets/territory-planets/${id}-q18-clean.jpg`),`${id} clean renderer path missing`);
}
assert.match(source,/new THREE\.SphereGeometry\(1,128,96\)/);
assert.match(source,/mesh\.rotation\.y\s*\+=/);
assert.match(source,/texture\.wrapS=THREE\.RepeatWrapping/);
assert.match(source,/texture\.wrapT=THREE\.ClampToEdgeWrapping/);
assert.match(source,/texture\.anisotropy=renderer\.capabilities\.getMaxAnisotropy\(\)/);
assert.match(source,/texture\.minFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.magFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.generateMipmaps=false/);
assert.match(source,/emissiveMap:texture/);
assert.match(source,/MOBILE_POSITIONS/);
assert.match(source,/totalDreams:362/);
assert.match(source,/hearthlands:213/);
console.log('Territory cosmos integrity: cleaned q18 sphere-ready textures verified.');
