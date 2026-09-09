from pathlib import Path
import hashlib
import numpy as np
from PIL import Image

EXPECTED={
    'hearthlands':'fe18c3e4b4eddd20a027f409e03f9249b27100c7e48c292973f2f12e57143cf3',
    'roadlands':'bc8d6dd6fa0f1650d9915819580d92ecf7c7277e5b135733e052f50b977c3b29',
    'littoral':'707e5d1eb41f65750cfd8baa1a890ff5f6a535177306a75cbfd52616528a3e85',
    'institutional':'fb7b0ba4ef6e0ca0d5d24e19f1d2c3d5d5cace95a8c06cd9c199654727e10871',
    'river':'dbab882b84c498577200cd90c7379a915a00ee1ffbe6afd61eba31077800e8b0',
}
root=Path('assets/territory-planets')
hashes=set()
for name,expected in EXPECTED.items():
    path=root/f'{name}-q18-clean.jpg'
    raw=path.read_bytes(); got=hashlib.sha256(raw).hexdigest()
    if got != expected: raise SystemExit(f'HASH FAIL {name}: {got}')
    if got in hashes: raise SystemExit(f'DUPLICATE HASH {name}')
    hashes.add(got)
    with Image.open(path) as im:
        if im.format != 'JPEG': raise SystemExit(f'FORMAT FAIL {name}: {im.format}')
        if im.size != (2048,1024): raise SystemExit(f'SIZE FAIL {name}: {im.size}')
        arr=np.asarray(im.convert('RGB'),dtype=np.float32)
    if float(arr.std()) < 8: raise SystemExit(f'LOW VARIANCE {name}')
    sectors=np.array_split(arr,24,axis=1)
    if min(float(s.mean()) for s in sectors) < 20: raise SystemExit(f'BLACK/EMPTY LONGITUDE {name}')
    quarters=np.array_split(arr,4,axis=1)
    qdetail=[]
    for q in quarters:
        g=q.mean(axis=2)
        gx=np.abs(np.diff(g,axis=1,prepend=g[:,:1]))
        gy=np.abs(np.diff(g,axis=0,prepend=g[:1,:]))
        qdetail.append(float((gx+gy).mean()))
    if min(qdetail)/max(qdetail) < 0.62: raise SystemExit(f'BROAD DETAIL IMBALANCE {name}: {qdetail}')
    g=arr.mean(axis=2)
    gx=np.abs(np.diff(g,axis=1,prepend=g[:,:1])); gy=np.abs(np.diff(g,axis=0,prepend=g[:1,:]))
    profile=(gx+gy).mean(axis=0)
    r=max(3,len(profile)//72)
    pad=np.r_[profile[-r:],profile,profile[:r]]
    smooth=np.convolve(pad,np.ones(2*r+1)/(2*r+1),mode='same')[r:-r]
    p10=float(np.percentile(smooth,10)); med=float(np.median(smooth))
    if p10/med < 0.78: raise SystemExit(f'LONGITUDE SOFTNESS FAIL {name}: p10/median={p10/med:.3f}')
    seam=float(np.abs(arr[:,0,:]-arr[:,-1,:]).mean())
    if seam > 20: raise SystemExit(f'SEAM FAIL {name}: {seam:.2f}')
    print(f'{name}: 2048x1024 clean JPEG, quarter-detail-ratio={min(qdetail)/max(qdetail):.3f}, p10/median={p10/med:.3f}, seam={seam:.2f}')
print('Validated five distinct cleaned q18 sphere-ready textures.')
