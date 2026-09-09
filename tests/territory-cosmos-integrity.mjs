import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const source=fs.readFileSync('src/territory-cosmos.js','utf8');
const expected={"hearthlands": "169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43", "roadlands": "169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43", "littoral": "343e4dc6db20507a3d1861c284fa2fac4c70e5833812bb9016b4effef5079a93", "institutional": "db1db179f380f3004d6f93ae33b1d32885ca33103462abf60f092f2e3a6b4055", "river": "2a0c30b949f3128a7ff1e3a8f788f3d2e8dae464aded8731eeeea2e43063d83f"};
for(const [id,hash] of Object.entries(expected)){const rel=`assets/territory-planets/${id}-path2-test.png`;assert.ok(fs.existsSync(rel));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex'),hash);assert.ok(source.includes(`/assets/territory-planets/${id}-path2-test.png`));}
assert.match(source,/new THREE\.SphereGeometry\(1,128,96\)/);assert.match(source,/mesh\.rotation\.y\s*\+=/);assert.match(source,/texture\.wrapS=THREE\.RepeatWrapping/);assert.match(source,/texture\.wrapT=THREE\.ClampToEdgeWrapping/);assert.match(source,/emissiveMap:texture/);assert.match(source,/totalDreams:362/);assert.match(source,/hearthlands:213/);console.log('Path 2 technical mount verified.');
