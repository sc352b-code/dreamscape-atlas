from pathlib import Path
import hashlib, json, urllib.request, zipfile, shutil
from PIL import Image

SHARE='cOnNBk3CJhOJ'
API='https://api.firestorage.ai/dev/file'
ZIP_HASH='ff979dfaea595c8ef8b9f83cdc9acffefab2e78c518ec236454e980dbfd0095e'
EXPECTED={
'hearthlands':'169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43',
'roadlands':'169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43',
'littoral':'343e4dc6db20507a3d1861c284fa2fac4c70e5833812bb9016b4effef5079a93',
'institutional':'db1db179f380f3004d6f93ae33b1d32885ca33103462abf60f092f2e3a6b4055',
'river':'2a0c30b949f3128a7ff1e3a8f788f3d2e8dae464aded8731eeeea2e43063d83f'}

def get_json(url, data=None):
    req=urllib.request.Request(url, data=data, method='POST' if data is not None else 'GET')
    with urllib.request.urlopen(req, timeout=30) as r: return json.load(r)

files=get_json(f'{API}/shares/{SHARE}/files?maxResults=1000')['files']
item=next(x for x in files if x['fileName']=='path2-territory-test-textures.zip')
d=get_json(f"{API}/shares/{SHARE}/files/{item['fileId']}/download", b'')
zip_path=Path('/tmp/path2.zip')
urllib.request.urlretrieve(d['downloadUrl'], zip_path)
assert hashlib.sha256(zip_path.read_bytes()).hexdigest()==ZIP_HASH
work=Path('/tmp/path2'); shutil.rmtree(work,ignore_errors=True); work.mkdir()
with zipfile.ZipFile(zip_path) as z: z.extractall(work)
out=Path('assets/territory-planets'); out.mkdir(parents=True,exist_ok=True)
for name,h in EXPECTED.items():
    src=work/f'{name}-path2-test.png'
    assert hashlib.sha256(src.read_bytes()).hexdigest()==h
    with Image.open(src) as im:
        assert im.format=='PNG' and im.size==(1774,887)
    shutil.copy2(src,out/src.name)

p=Path('src/territory-cosmos.js'); s=p.read_text()
for name in EXPECTED:
    s=s.replace(f'/assets/territory-planets/{name}-q18-clean.jpg',f'/assets/territory-planets/{name}-path2-test.png')
    s=s.replace(f'/assets/territory-planets/{name}.jpg',f'/assets/territory-planets/{name}-path2-test.png')
p.write_text(s)

test="""import assert from 'node:assert/strict';\nimport fs from 'node:fs';\nimport crypto from 'node:crypto';\nconst source=fs.readFileSync('src/territory-cosmos.js','utf8');\nconst expected=%s;\nfor(const [id,hash] of Object.entries(expected)){const rel=`assets/territory-planets/${id}-path2-test.png`;assert.ok(fs.existsSync(rel));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex'),hash);assert.ok(source.includes(`/assets/territory-planets/${id}-path2-test.png`));}\nassert.match(source,/new THREE\\.SphereGeometry\\(1,128,96\\)/);assert.match(source,/mesh\\.rotation\\.y\\s*\\+=/);assert.match(source,/texture\\.wrapS=THREE\\.RepeatWrapping/);assert.match(source,/texture\\.wrapT=THREE\\.ClampToEdgeWrapping/);assert.match(source,/emissiveMap:texture/);assert.match(source,/totalDreams:362/);assert.match(source,/hearthlands:213/);console.log('Path 2 technical mount verified.');\n""" % json.dumps(EXPECTED)
Path('tests/territory-cosmos-integrity.mjs').write_text(test)

validator="""from pathlib import Path\nimport hashlib,numpy as np\nfrom PIL import Image\nEXPECTED=%r\nroot=Path('assets/territory-planets')\nfor name,expected in EXPECTED.items():\n p=root/f'{name}-path2-test.png'; raw=p.read_bytes(); assert hashlib.sha256(raw).hexdigest()==expected\n with Image.open(p) as im:\n  assert im.format=='PNG' and im.size==(1774,887); arr=np.asarray(im.convert('RGB'),dtype=np.float32)\n assert arr.std()>8\n sectors=np.array_split(arr,24,axis=1); assert min(float(x.mean()) for x in sectors)>20\n g=arr.mean(axis=2); gx=np.abs(np.diff(g,axis=1,prepend=g[:,:1])); gy=np.abs(np.diff(g,axis=0,prepend=g[:1,:])); profile=(gx+gy).mean(axis=0); r=max(3,len(profile)//72); pad=np.r_[profile[-r:],profile,profile[:r]]; smooth=np.convolve(pad,np.ones(2*r+1)/(2*r+1),mode='same')[r:-r]; ratio=float(np.percentile(smooth,10)/np.median(smooth)); seam=float(np.abs(arr[:,0,:]-arr[:,-1,:]).mean()); print(f'{name}: p10/median={ratio:.3f}, seam={seam:.2f}')\nprint('Validated Path 2 temporary full-surface textures.')\n""" % EXPECTED
Path('tools/validate_territory_planets.py').write_text(validator)

Path('.github/workflows/import-path2-test-textures.yml').unlink(missing_ok=True)
Path('tools/path2_import.py').unlink(missing_ok=True)
print('Path 2 assets installed and renderer rewired.')
