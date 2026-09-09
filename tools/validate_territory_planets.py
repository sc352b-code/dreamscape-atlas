from pathlib import Path
import hashlib
import numpy as np
from PIL import Image

EXPECTED={
    'hearthlands':'45df38c01f03a99f2b5bb7d88754011e33fba063ebb021d2b66bbf8411b8299c',
    'roadlands':'a0288bd86c4c6f3ec844d3c078d6ab5dadbbc8d65a07b660bd10d02020b0eccd',
    'littoral':'33b9c65a3d77921e613c0230f4b2579dd6ecc5988eb07e7f03f9fcf0461d0cf3',
    'institutional':'43d9bbc6a4c65676418abc3a21ad9a4facd2ba2e9d1c9333f27c6844fb02e8f3',
    'river':'091ad36ab28c5f2548f45aa92674c3388a3c8f45f20b8b0b01c709fdc08e67a7',
}
root=Path('assets/territory-planets')
seen=set()
for name,expected_hash in EXPECTED.items():
    path=root/f'{name}.jpg'
    if not path.exists(): raise SystemExit(f'MISSING {path}')
    raw=path.read_bytes(); got=hashlib.sha256(raw).hexdigest()
    if got != expected_hash: raise SystemExit(f'HASH FAIL {name}: {got}')
    if got in seen: raise SystemExit(f'DUPLICATE texture hash: {name}')
    seen.add(got)
    with Image.open(path) as im:
        if im.format != 'JPEG': raise SystemExit(f'FORMAT FAIL {name}: {im.format}')
        if im.size != (768,384): raise SystemExit(f'SIZE FAIL {name}: {im.size}')
        arr=np.asarray(im.convert('RGB'),dtype=np.float32)
    if float(arr.std()) < 8: raise SystemExit(f'LOW VARIANCE {name}')
    sector_means=[]
    for sector in np.array_split(arr,24,axis=1): sector_means.append(float(sector.mean()))
    if min(sector_means) < 20: raise SystemExit(f'BLACK/EMPTY LONGITUDE SECTOR {name}: {min(sector_means):.2f}')
    for idx,view in enumerate(np.array_split(arr,4,axis=1)):
        if float(view.std()) < 6 or float(view.mean()) < 20:
            raise SystemExit(f'INVALID 90-DEGREE VIEW {name} #{idx+1}')
    seam=float(np.abs(arr[:,0,:]-arr[:,-1,:]).mean())
    if seam > 25: raise SystemExit(f'EXCESSIVE HORIZONTAL SEAM {name}: {seam:.2f}')
    print(f'{name}: 768x384 JPEG sha256={got[:12]}… min-sector={min(sector_means):.2f} seam-MAE={seam:.2f}')
print('Validated five distinct exact q18 territory JPEGs across the full 360-degree surface.')
