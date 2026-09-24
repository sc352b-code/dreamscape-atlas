from pathlib import Path
import numpy as np
from PIL import Image

IDS=('hearthlands','roadlands','littoral','institutional','river')
root=Path('assets/territory-planets')
fingerprints=set()
for name in IDS:
    path=root/f'{name}-final.png'
    with Image.open(path) as im:
        if im.mode not in ('RGB','RGBA'):
            raise SystemExit(f'MODE FAIL {name}: {im.mode}')
        if im.size != (2048,1024):
            raise SystemExit(f'SIZE FAIL {name}: {im.size}')
        arr=np.asarray(im.convert('RGB'),dtype=np.float32)
    fp=hash(path.read_bytes())
    if fp in fingerprints: raise SystemExit(f'DUPLICATE FILE {name}')
    fingerprints.add(fp)
    if float(arr.std()) < 8: raise SystemExit(f'LOW VARIANCE {name}')
    sectors=np.array_split(arr,24,axis=1)
    min_sector=min(float(s.mean()) for s in sectors)
    if min_sector < 20: raise SystemExit(f'BLACK/EMPTY LONGITUDE {name}: {min_sector:.2f}')
    seam=float(np.abs(arr[:,0,:]-arr[:,-1,:]).mean())
    if seam > 25: raise SystemExit(f'SEAM FAIL {name}: {seam:.2f}')
    g=arr.mean(axis=2)
    gx=np.abs(np.diff(g,axis=1,prepend=g[:,:1])); gy=np.abs(np.diff(g,axis=0,prepend=g[:1,:]))
    detail=(gx+gy).mean(axis=0)
    # Detect an abrupt broad vertical blur strip relative to its local flanks,
    # without penalising naturally smoother deserts, water or wetlands.
    w=64
    worst=1.0
    for x in range(w*2, len(detail)-w*2, 16):
        c=float(detail[x-w//2:x+w//2].mean())
        l=float(detail[x-w*2:x-w].mean())
        r=float(detail[x+w:x+w*2].mean())
        flank=min(l,r)
        if flank>0: worst=min(worst,c/flank)
    if worst < 0.48: raise SystemExit(f'ABRUPT LONGITUDE BLUR STRIP {name}: ratio={worst:.3f}')
    print(f'{name}: 2048x1024 RGB, seam={seam:.2f}, min-sector={min_sector:.1f}, blur-strip-ratio={worst:.3f}')
print('Validated five distinct final full-surface territory textures.')
