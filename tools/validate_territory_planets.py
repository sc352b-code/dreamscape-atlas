from pathlib import Path
import hashlib,numpy as np
from PIL import Image
EXPECTED={'hearthlands': '169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43', 'roadlands': '169a847fe13461136e7421ff87ccb15315e34cb98e71d3e305e0e31a5a603f43', 'littoral': '343e4dc6db20507a3d1861c284fa2fac4c70e5833812bb9016b4effef5079a93', 'institutional': 'db1db179f380f3004d6f93ae33b1d32885ca33103462abf60f092f2e3a6b4055', 'river': '2a0c30b949f3128a7ff1e3a8f788f3d2e8dae464aded8731eeeea2e43063d83f'}
root=Path('assets/territory-planets')
for name,expected in EXPECTED.items():
 p=root/f'{name}-path2-test.png'; raw=p.read_bytes(); assert hashlib.sha256(raw).hexdigest()==expected
 with Image.open(p) as im:
  assert im.format=='PNG' and im.size==(1774,887); arr=np.asarray(im.convert('RGB'),dtype=np.float32)
 assert arr.std()>8
 sectors=np.array_split(arr,24,axis=1); assert min(float(x.mean()) for x in sectors)>20
 g=arr.mean(axis=2); gx=np.abs(np.diff(g,axis=1,prepend=g[:,:1])); gy=np.abs(np.diff(g,axis=0,prepend=g[:1,:])); profile=(gx+gy).mean(axis=0); r=max(3,len(profile)//72); pad=np.r_[profile[-r:],profile,profile[:r]]; smooth=np.convolve(pad,np.ones(2*r+1)/(2*r+1),mode='same')[r:-r]; ratio=float(np.percentile(smooth,10)/np.median(smooth)); seam=float(np.abs(arr[:,0,:]-arr[:,-1,:]).mean()); print(f'{name}: p10/median={ratio:.3f}, seam={seam:.2f}')
print('Validated Path 2 temporary full-surface textures.')
