import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
const source=fs.readFileSync('src/territory-cosmos.js','utf8');
const expected={
  hearthlands:'f82fa882827a2313df3c65960634d94d9dce2490a34926e9ddbd67d1a2f204e6',
  roadlands:'15fba2314fe53f12ed3078b24163ad5be3b0398cb811b1fd3f560ceafb39abb0',
  littoral:'a43e24323ed7cd949f080648868c9dfa5934a3ba81b8f5e374e628bb94d91021',
  institutional:'3e1d4577ec4b42d678d9fdc1846cd365cfabb875a32945043842d7707f53d4e8',
  river:'337636d9da2bc8f13e1d0489aac62335e9fb3112d844994b1508e385a49f18bc',
};
const ids=Object.keys(expected);
for(const id of ids){
  const rel=`assets/territory-planets/${id}-final.png`;
  assert.ok(fs.existsSync(rel),`${rel} must exist`);
  assert.ok(source.includes(`/assets/territory-planets/${id}-final.png`),`${id} final texture path missing`);
  const sha=crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex');
  assert.equal(sha,expected[id],`${id} final texture hash changed from visually approved planetary baseline`);
}
const sizes=ids.map(id=>fs.statSync(`assets/territory-planets/${id}-final.png`).size);
assert.equal(new Set(sizes).size,5,'final territory assets should be five distinct files');
assert.doesNotMatch(source,/path2-test\.png/,'temporary Path 2 texture reference must be gone');
assert.doesNotMatch(source,/q18-clean\.(?:png|jpg)/,'q18-clean texture references must not be active');
assert.match(source,/new THREE\.SphereGeometry\(1,128,96\)/);
assert.match(source,/mesh\.rotation\.y\s*\+=/);
assert.match(source,/texture\.wrapS=THREE\.RepeatWrapping/);
assert.match(source,/texture\.wrapT=THREE\.ClampToEdgeWrapping/);
assert.match(source,/texture\.minFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.magFilter=THREE\.LinearFilter/);
assert.match(source,/texture\.generateMipmaps=false/);
assert.match(source,/MOBILE_POSITIONS/);
assert.match(source,/totalDreams:362/);
assert.match(source,/hearthlands:213/);
assert.match(source,/roadlands:null,littoral:null,institutional:null,river:null/);
assert.match(source,/Home · gardens · belonging/);
assert.match(source,/Journeys · crossings · movement/);
assert.match(source,/Shorelines · tides · thresholds/);
assert.match(source,/Structure · order · public life/);
assert.match(source,/Waterways · bridges · flow/);
console.log('Territory cosmos integrity: visually approved final territory textures are hash-locked one-to-one.');
